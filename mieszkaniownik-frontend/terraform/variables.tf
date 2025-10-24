variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-central2"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "europe-central2-a"
}

variable "domain" {
  description = "Domain name for the application"
  type        = string
  default     = "mieszkaniownik.wsparcie.dev"
}

variable "subnet_cidr" {
  description = "CIDR for the subnet"
  type        = string
  default     = "10.0.0.0/24"
}

variable "pods_cidr" {
  description = "CIDR for pods"
  type        = string
  default     = "10.1.0.0/16"
}

variable "services_cidr" {
  description = "CIDR for services"
  type        = string
  default     = "10.2.0.0/16"
}

variable "prod_node_count" {
  description = "Initial number of nodes in production"
  type        = number
  default     = 3
}

variable "prod_min_node_count" {
  description = "Minimum number of nodes in production"
  type        = number
  default     = 3
}

variable "prod_max_node_count" {
  description = "Maximum number of nodes in production"
  type        = number
  default     = 10
}

variable "prod_machine_type" {
  description = "Machine type for production nodes"
  type        = string
  default     = "e2-standard-2"
}

variable "dev_node_count" {
  description = "Initial number of nodes in development"
  type        = number
  default     = 2
}

variable "dev_min_node_count" {
  description = "Minimum number of nodes in development"
  type        = number
  default     = 1
}

variable "dev_max_node_count" {
  description = "Maximum number of nodes in development"
  type        = number
  default     = 4
}

variable "dev_machine_type" {
  description = "Machine type for development nodes"
  type        = string
  default     = "e2-medium"
}
