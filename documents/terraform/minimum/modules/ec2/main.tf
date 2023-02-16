// Create aws_ami filter to pick up the ami available in your region
data "aws_ami" "ubuntu-linux-2204" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "template_file" "env" {
  template = "${file("./.env")}"
}

resource "aws_eip" "global_ip" {
  vpc = true
}

data "template_file" "init_app" {
  template = "${file("./modules/ec2/userdata.sh")}"
  vars = {
    prefix                        = data.template_file.env.rendered
    db_name                       = var.db_name
    db_username                   = var.db_username
    db_password                   = var.db_password
    queue_username                = var.queue_username
    queue_password                = var.queue_password
    db_connection_string          = "mysql://${var.db_username}:${var.db_password}@localhost/${var.db_name}"
    rabbit_mq_connection_string   = "amqp://${var.queue_username}:${var.queue_password}@localhost"
    redis_connection_string       = "redis://localhost:6379"
    ip_address                    = aws_eip.global_ip.public_ip
    nginx_settings                = file("./modules/ec2/nginx_settings")
  }
}

// Configure the EC2 instance in a public subnet
resource "aws_instance" "ec2_app" {
  ami                         = data.aws_ami.ubuntu-linux-2204.id
  associate_public_ip_address = true
  instance_type               = "t2.medium"
  key_name                    = var.key_name
  subnet_id                   = var.vpc.public_subnets[0]
  vpc_security_group_ids      = [var.sg_pub_id]
  tags = {
    "Name" = "${var.namespace}-EC2-PUBLIC1"
  }

  # root disk
  root_block_device {
    volume_size           = var.linux_root_volume_size
    volume_type           = var.linux_root_volume_type
    delete_on_termination = true
    encrypted             = true
  }

  user_data              = data.template_file.init_app.rendered

}

resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.ec2_app.id
  allocation_id = aws_eip.global_ip.id
}
