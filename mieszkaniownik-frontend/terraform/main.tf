terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  backend "gcs" {
    bucket = "mieszkaniownik-terraform-state"
    prefix = "frontend/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_container_cluster" "production" {
  name     = "mieszkaniownik-prod-cluster"
  location = var.zone

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  release_channel {
    channel = "REGULAR"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    network_policy_config {
      disabled = false
    }
  }

  network_policy {
    enabled = true
  }

  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }

  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }
}

resource "google_container_node_pool" "production_nodes" {
  name       = "production-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.production.name
  node_count = var.prod_node_count

  autoscaling {
    min_node_count = var.prod_min_node_count
    max_node_count = var.prod_max_node_count
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    preemptible  = false
    machine_type = var.prod_machine_type

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      environment = "production"
      app         = "mieszkaniownik"
    }

    tags = ["mieszkaniownik", "production"]

    metadata = {
      disable-legacy-endpoints = "true"
    }

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }
}

resource "google_container_cluster" "development" {
  name     = "mieszkaniownik-dev-cluster"
  location = var.zone

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  release_channel {
    channel = "REGULAR"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
  }

  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }
}

resource "google_container_node_pool" "development_nodes" {
  name       = "development-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.development.name
  node_count = var.dev_node_count

  autoscaling {
    min_node_count = var.dev_min_node_count
    max_node_count = var.dev_max_node_count
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    preemptible  = true
    machine_type = var.dev_machine_type

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      environment = "development"
      app         = "mieszkaniownik"
    }

    tags = ["mieszkaniownik", "development"]

    metadata = {
      disable-legacy-endpoints = "true"
    }

    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }
}

resource "google_compute_network" "vpc" {
  name                    = "mieszkaniownik-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "mieszkaniownik-subnet"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.name

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = var.pods_cidr
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = var.services_cidr
  }
}

resource "google_compute_backend_bucket" "frontend_cdn" {
  name        = "mieszkaniownik-frontend-cdn"
  bucket_name = google_storage_bucket.frontend_assets.name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }
}

resource "google_storage_bucket" "frontend_assets" {
  name          = "${var.project_id}-frontend-assets"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_compute_security_policy" "frontend_policy" {
  name = "mieszkaniownik-frontend-policy"

  rule {
    action   = "rate_based_ban"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      ban_duration_sec = 600
    }
    description = "Rate limit rule"
  }

  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default rule"
  }
}

resource "google_dns_managed_zone" "mieszkaniownik" {
  name        = "mieszkaniownik-zone"
  dns_name    = "${var.domain}."
  description = "DNS zone for Mieszkaniownik"

  dnssec_config {
    state = "on"
  }
}

resource "google_dns_record_set" "production_a" {
  name         = google_dns_managed_zone.mieszkaniownik.dns_name
  managed_zone = google_dns_managed_zone.mieszkaniownik.name
  type         = "A"
  ttl          = 300

  rrdatas = [google_compute_global_address.frontend_ip.address]
}

resource "google_dns_record_set" "www_a" {
  name         = "www.${google_dns_managed_zone.mieszkaniownik.dns_name}"
  managed_zone = google_dns_managed_zone.mieszkaniownik.name
  type         = "A"
  ttl          = 300

  rrdatas = [google_compute_global_address.frontend_ip.address]
}

resource "google_dns_record_set" "dev_a" {
  name         = "dev.${google_dns_managed_zone.mieszkaniownik.dns_name}"
  managed_zone = google_dns_managed_zone.mieszkaniownik.name
  type         = "A"
  ttl          = 300

  rrdatas = [google_compute_global_address.frontend_dev_ip.address]
}

resource "google_compute_global_address" "frontend_ip" {
  name = "mieszkaniownik-frontend-ip"
}

resource "google_compute_global_address" "frontend_dev_ip" {
  name = "mieszkaniownik-frontend-dev-ip"
}
