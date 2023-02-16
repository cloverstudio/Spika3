variable "namespace" {
  type = string
}

variable "sg_id" {
  type = any
}

variable "subnets" {
  type = list
}

variable "db_subnet_group_name" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}


variable "db_password" {
  type = string
}

variable "cache_subnet_group_name" {
  type = string
}
