terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

resource "random_password" "db_master_pass" {
  length            = 16
  special           = true
  min_special       = 3
  override_special  = "-_="
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

module "storage" {
  source                    = "./modules/storage"
  namespace                 = var.namespace
  sg_id                     = module.networking.sg_pub_id
  subnets                   = module.networking.subnets_pub
  db_subnet_group_name      = module.networking.database_subnet_group_name
  db_name                   = var.db_name
  db_username               = var.db_username
  db_password               = random_password.db_master_pass.result
  cache_subnet_group_name   = module.networking.elasticache_subnet_group_name
}

module "queue" {
  source                 = "./modules/queue"
  namespace              = var.namespace
  sg_id                 = module.networking.sg_pub_id
  subnets               = module.networking.subnets_pub
  username              = var.queue_username
  password              = random_password.queue_pass.result
}

module "ec2" {
  source                      = "./modules/ec2"
  namespace                   = var.namespace
  vpc                         = module.networking.vpc
  sg_pub_id                   = module.networking.sg_pub_id
  sg_priv_id                  = module.networking.sg_priv_id
  key_name                    = module.ssh-key.key_name
  linux_root_volume_size      = 20
  linux_root_volume_type      = "gp2"
  efs_dns_name                = module.storage.efs_dns_name
  db_connection_string        = "mysql://${var.db_username}:${random_password.db_master_pass.result}@${module.storage.db_endpoint}/${var.db_name}"
  rabbit_mq_connection_string = "amqps://${var.queue_username}:${random_password.queue_pass.result}@${replace(module.queue.endpoint,"amqps://","")}"
  redis_connection_string     = "redis://${module.storage.redis_address}:6379"
  lb_dns_name                 = module.elb.dns_name
}

module "elb" {
  source      = "./modules/elb"
  namespace   = var.namespace
  vpc         = module.networking.vpc
  sg_pub_id   = module.networking.sg_pub_id
  instances   = module.ec2.public_instances
  environment = "production"
}

