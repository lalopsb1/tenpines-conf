variable "region" {
  description = "The name of the region"
}
variable "access_key" {
  description = "AWS access key"
}
variable "secret_key" {
  description = "AWS private key"
}

variable "environment" {
  description = "AWS app environment"
}

variable "environment_prefix" {
  description = "Environment prefix for SNS topic name"
}
