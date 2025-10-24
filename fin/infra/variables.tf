variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "service_name" {
  description = "Service name"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
}

variable "memory_mb" {
  description = "Lambda memory in MB (128-10240)"
  type        = number
}

variable "belvo_api_url" {
  description = "Belvo API URL"
  type        = string
}

variable "log_level" {
  description = "Application log level"
  type        = string
}

variable "belvo_secret_id" {
  description = "Belvo Secret ID"
  type        = string
  sensitive   = true
}

variable "belvo_secret_password" {
  description = "Belvo Secret Password"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase URL"
  type        = string
}

variable "supabase_key" {
  description = "Supabase Publishable Key"
  type        = string
  sensitive   = true
}
