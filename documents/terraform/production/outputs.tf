output "public_connection_string1" {
  description = "App server 1"
  value       = "ssh -i ${module.ssh-key.key_name}.pem ubuntu@${module.ec2.public_ip1}"
}

output "public_connection_string2" {
  description = "App server 2"
  value       = "ssh -i ${module.ssh-key.key_name}.pem ubuntu@${module.ec2.public_ip2}"
}

output "public_connection_string3" {
  description = "App server 3"
  value       = "ssh -i ${module.ssh-key.key_name}.pem ubuntu@${module.ec2.public_ip3}"
}

output "database_connection_string" {
  description = "Database connection string"
  value       = "mysql://${var.db_username}:${random_password.db_master_pass.result}@${module.storage.db_endpoint}/${var.db_name}"
  sensitive   = true
}

output "database_subnet_group_name" {
  description = "Database subnet group name of vpc"
  value       = module.networking.database_subnet_group_name
}

# output "private_connection_string" {
#   description = "Copy/Paste/Enter - You are in the private ec2 instance"
#   value       = "ssh -i ${module.ssh-key.key_name}.pem ec2-user@${module.ec2.private_ip}"
# }

output "ELB_DNS_name" {
  description = "Public domain name of ELB"
  value       = module.elb.dns_name
}

output "queue_connection_string" {
  description = "RabbitMQ connection string"
  value       = "amqps://${var.queue_username}:${random_password.queue_pass.result}@${replace(module.queue.endpoint,"amqps://","")}"
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = "redis://${module.storage.redis_address}:6379"
}
