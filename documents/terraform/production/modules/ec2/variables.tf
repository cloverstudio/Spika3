variable "namespace" {
  type = string
}

variable "vpc" {
  type = any
}

variable key_name {
  type = string
}

variable "sg_pub_id" {
  type = any
}

variable "sg_priv_id" {
  type = any
}

variable linux_root_volume_size {
  type = string
}

variable linux_root_volume_type {
  type = string
}

variable efs_dns_name {
  type = string
}

variable "db_connection_string" {
 type = string
}

variable "rabbit_mq_connection_string" {
 type = string
}

variable "redis_connection_string" {
 type = string
}

variable "lb_dns_name" {
 type = string
}

