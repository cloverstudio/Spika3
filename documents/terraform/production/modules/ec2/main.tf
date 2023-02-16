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

data "template_file" "init" {
  template = "${file("./modules/ec2/userdata_app.sh")}"
  vars = {
    prefix                      = data.template_file.env.rendered
    efs_dns_name                = var.efs_dns_name
    db_connection_string        = var.db_connection_string
    rabbit_mq_connection_string = var.rabbit_mq_connection_string
    redis_connection_string     = var.redis_connection_string
    lb_dns_name                 = var.lb_dns_name
  }
}

// Configure the EC2 instance in a public subnet
resource "aws_instance" "ec2_public1" {
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

  user_data              = data.template_file.init.rendered

}

resource "aws_instance" "ec2_public2" {
  ami                         = data.aws_ami.ubuntu-linux-2204.id
  associate_public_ip_address = true
  instance_type               = "t2.medium"
  key_name                    = var.key_name
  subnet_id                   = var.vpc.public_subnets[0]
  vpc_security_group_ids      = [var.sg_pub_id]
  tags = {
    "Name" = "${var.namespace}-EC2-PUBLIC2"
  }

  # root disk
  root_block_device {
    volume_size           = var.linux_root_volume_size
    volume_type           = var.linux_root_volume_type
    delete_on_termination = true
    encrypted             = true
  }

  user_data              = data.template_file.init.rendered

}

resource "aws_instance" "ec2_public3" {
  ami                         = data.aws_ami.ubuntu-linux-2204.id
  associate_public_ip_address = true
  instance_type               = "t2.medium"
  key_name                    = var.key_name
  subnet_id                   = var.vpc.public_subnets[0]
  vpc_security_group_ids      = [var.sg_pub_id]
  tags = {
    "Name" = "${var.namespace}-EC2-PUBLIC3"
  }

  # root disk
  root_block_device {
    volume_size           = var.linux_root_volume_size
    volume_type           = var.linux_root_volume_type
    delete_on_termination = true
    encrypted             = true
  }

  user_data              = data.template_file.init.rendered

}


# // Configure the EC2 instance in a private subnet
# resource "aws_instance" "ec2_private" {
#   ami                         = data.aws_ami.ubuntu-linux-2204.id
#   associate_public_ip_address = false
#   instance_type               = "t2.micro"
#   key_name                    = var.key_name
#   subnet_id                   = var.vpc.private_subnets[1]
#   vpc_security_group_ids      = [var.sg_priv_id]

#   tags = {
#     "Name" = "${var.namespace}-EC2-PRIVATE"
#   }

# }