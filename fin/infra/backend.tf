terraform {
  backend "s3" {
    bucket = "gustavo-bordin-fin-terraform-state"
    key    = "fin-webhooks/terraform.tfstate"
    region = "sa-east-1"
  }
}
