output "public_connection_string_app" {
  description = "APP server"
  value       = "ssh -i ${module.ssh-key.key_name}.pem ubuntu@${module.ec2.public_ip_app}"
}

output "public_connection_string_db" {
  description = "DB server"
  value       = "ssh -i ${module.ssh-key.key_name}.pem ubuntu@${module.ec2.public_ip_db}"
}

output "database_connection_string" {
  description = "Database connection string"
  value       = "mysql://${var.db_username}:${random_password.db_master_pass.result}@${module.ec2.public_ip_db}/${var.db_name}"
  sensitive   = true
}

output "ELB_DNS_name" {
  description = "Public domain name of ELB"
  value       = module.elb.dns_name
}
