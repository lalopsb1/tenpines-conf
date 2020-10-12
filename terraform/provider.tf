terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  access_key = "AKIAUPE3ZKPMGSIFSKQS"
  secret_key = "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"
}
