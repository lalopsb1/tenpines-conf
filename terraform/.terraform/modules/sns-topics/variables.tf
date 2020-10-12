
// Standard Variables

variable "names" {
  description = "List of SNS Topic Names"
  type        = list(string)
}
variable "environment" {
  description = "Environment (ex: dev, qa, stage, prod)"
}
variable "namespaced" {
  description = "Namespace all resources (prefixed with the environment)?"
  default     = false
}
