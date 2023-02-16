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

data "template_file" "init_db" {
  template = "${file("./modules/ec2/userdata_db.sh")}"
  vars = {
    db_name                       = var.db_name
    db_username                   = var.db_username
    db_password                   = var.db_password
    queue_username                = var.queue_username
    queue_password                = var.queue_password
  }
}


resource "aws_instance" "ec2_db" {
  ami                         = data.aws_ami.ubuntu-linux-2204.id
  associate_public_ip_address = true
  instance_type               = "t2.medium"
  key_name                    = var.key_name
  subnet_id                   = var.vpc.public_subnets[0]
  vpc_security_group_ids      = [var.sg_pub_id]
  tags = {
    "Name" = "${var.namespace}-EC2-DB"
  }

  # root disk
  root_block_device {
    volume_size           = var.db_root_volume_size
    volume_type           = var.db_root_volume_type
    delete_on_termination = true
    encrypted             = true
  }

  user_data              = data.template_file.init_db.rendered

}


data "template_file" "init_app" {
  template = "${file("./modules/ec2/userdata_app.sh")}"
  vars = {
    prefix                      = data.template_file.env.rendered
    efs_dns_name                = var.efs_dns_name
    db_connection_string        = "mysql://${var.db_username}:${var.db_password}@${aws_instance.ec2_db.public_ip}/${var.db_name}"
    rabbit_mq_connection_string = "amqp://${var.queue_username}:${var.queue_password}@${aws_instance.ec2_db.public_ip}"
    redis_connection_string     = "redis://${aws_instance.ec2_db.public_ip}:6379"
    lb_dns_name                 = var.lb_dns_name
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
