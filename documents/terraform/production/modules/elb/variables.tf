variable "namespace" {
  type = string
}

variable "vpc" {
  type = any
}

variable "sg_pub_id" {
  type = string
}

variable instances {
  type = list
}

variable "environment" {
  type = string
}
