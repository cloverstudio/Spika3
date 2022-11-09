terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

resource "random_password" "db_master_pass" {
  length            = 16
  special           = false
  keepers           = {
    pass_version  = 1
  }
}

resource "random_password" "queue_pass" {
  length            = 16
  special           = false
  keepers           = {
    pass_version  = 1
  }
}

module "networking" {
  source    = "./modules/networking"
  namespace = var.namespace
  region    = var.region
}

module "ssh-key" {
  source    = "./modules/ssh-key"
  namespace = var.namespace
}

module "ec2" {
  source                      = "./modules/ec2"
  namespace                   = var.namespace
  vpc                         = module.networking.vpc
  sg_pub_id                   = module.networking.sg_pub_id
  sg_priv_id                  = module.networking.sg_priv_id
  key_name                    = module.ssh-key.key_name
  linux_root_volume_size      = 256
  linux_root_volume_type      = "gp2"
  db_name                     = var.db_name
  db_username                 = var.db_username
  db_password                 = random_password.db_master_pass.result
  queue_username              = var.queue_username
  queue_password              = random_password.queue_pass.result
}
