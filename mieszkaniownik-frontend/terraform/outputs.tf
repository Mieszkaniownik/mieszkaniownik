output "production_cluster_name" {
  description = "Name of the production GKE cluster"
  value       = google_container_cluster.production.name
}

output "production_cluster_endpoint" {
  description = "Endpoint of the production GKE cluster"
  value       = google_container_cluster.production.endpoint
  sensitive   = true
}

output "development_cluster_name" {
  description = "Name of the development GKE cluster"
  value       = google_container_cluster.development.name
}

output "development_cluster_endpoint" {
  description = "Endpoint of the development GKE cluster"
  value       = google_container_cluster.development.endpoint
  sensitive   = true
}

output "frontend_ip_address" {
  description = "IP address for the production frontend"
  value       = google_compute_global_address.frontend_ip.address
}

output "frontend_dev_ip_address" {
  description = "IP address for the development frontend"
  value       = google_compute_global_address.frontend_dev_ip.address
}

output "dns_name_servers" {
  description = "Name servers for the DNS zone"
  value       = google_dns_managed_zone.mieszkaniownik.name_servers
}

output "cdn_backend_bucket" {
  description = "CDN backend bucket name"
  value       = google_compute_backend_bucket.frontend_cdn.name
}

output "vpc_network" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}
