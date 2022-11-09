output "public_connection_string_app" {
  description = "APP server"
  value       = "ssh -i ${module.ssh-key.key_name}.pem ubuntu@${module.ec2.public_ip}"
}

