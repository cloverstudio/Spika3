# Creating EFS file system

resource "aws_mq_broker" "main" {
  broker_name = "main"

  engine_type        = "RabbitMQ"
  engine_version     = "3.8.22"
  host_instance_type = "mq.t3.micro" 
  subnet_ids         = [var.subnets[0]]
  security_groups    = [var.sg_id]

  user {
    username = var.username
    password = var.password
  }
}
