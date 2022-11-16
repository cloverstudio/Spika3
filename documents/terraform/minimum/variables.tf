variable "namespace" {
  description = "The project namespace to use for unique resource naming"
  default     = "spikademo"
  type        = string
}

variable "region" {
  description = "AWS region"
  default     = "us-west-2"
  type        = string
}

variable "db_name" {
  description = "Mysql database name"
  default     = "spikadb"
  type        = string
}

variable "db_username" {
  description = "Mysql user name"
  default     = "spikadb_user"
  type        = string
}

variable "queue_username" {
  description = "RabbitMQ username"
  default     = "spikaqueue"
  type        = string
}

