# output "public_connection_string" {
#   description = "Copy/Paste/Enter - You are in the matrix"
#   value       = "ssh -i ${aws_key_pair.key_pair.key_name}.pem ubuntu@${aws_instance.ec2_public.public_ip}"
# }

# output "host_address" {
#   value = aws_mq_broker.main.instances.0.ip_address 
# }

# output "web_console" {
#   value = aws_mq_broker.main.instances.0.console_url 
# }


# output "endpoint" {
#   value = "amqps://test:test@${replace(aws_mq_broker.main.instances.0.endpoints.0,"amqps://","")}"
# }

# output "elasticache_subnet_group_name" {
#   value = module.vpc.elasticache_subnet_group_name
# }


# output "redis_host1" {
#   value = aws_elasticache_cluster.test.cache_nodes[0].address
# }

