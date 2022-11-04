output "endpoint" {
  value = aws_mq_broker.main.instances.0.endpoints.0 
}

output "arn" {
  value = aws_mq_broker.main.arn
}
