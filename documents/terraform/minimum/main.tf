terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

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

resource "tls_private_key" "key" {
  algorithm = "RSA"
}

resource "local_file" "private_key" {
  filename          = "${var.namespace}-key.pem"
  sensitive_content = tls_private_key.key.private_key_pem
  file_permission   = "0400"
}

resource "aws_key_pair" "key_pair" {
  key_name   = "${var.namespace}-key"
  public_key = tls_private_key.key.public_key_openssh
}


data "template_file" "init" {
  template = "${file("./userdata.sh")}"
  vars = {
    efs_dns_name = "test"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name                             = "${var.namespace}-vpc"
  cidr                             = "10.0.0.0/16"
  #azs                              = ["${var.retion}a","${var.retion}b"]
  azs                              = data.aws_availability_zones.available.names
  private_subnets                  = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets                   = ["10.0.101.0/24", "10.0.102.0/24"]
  database_subnets                 = ["10.0.3.0/24","10.0.4.0/24"]
  elasticache_subnets              = ["10.0.5.0/24", "10.0.6.0/24"]
  #assign_generated_ipv6_cidr_block = true
  create_database_subnet_group     = true
  enable_nat_gateway               = true
  single_nat_gateway               = true
  enable_dns_hostnames             = true
  enable_dns_support               = true
}


// SG to allow SSH connections from anywhere
resource "aws_security_group" "allow_pub" {
  name        = "${var.namespace}-allow_ssh"
  description = "Allow SSH inbound traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "SSH from the internet"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from the internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from the internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Redis"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.namespace}-allow_pub"
  }
}

# resource "aws_mq_broker" "main" {
#   broker_name = "main"

#   engine_type        = "RabbitMQ"
#   engine_version     = "3.8.22"
#   host_instance_type = "mq.t3.micro" 
#   subnet_ids         = [module.vpc.private_subnets[0]]
#   security_groups    = [aws_security_group.allow_pub.id]

#   user {
#     username = "username"
#     password = "asuasnfJSsdfiuaf"
#   }
# }

# resource "aws_elasticache_cluster" "test" {
#   cluster_id          = "mycluster"
#   engine              = "redis"
#   node_type           = "cache.t3.micro"
#   num_cache_nodes     = 1
#   port                = 6379
#   apply_immediately   = true
#   subnet_group_name   = module.vpc.elasticache_subnet_group_name
#   security_group_ids  = [aws_security_group.allow_pub.id]
# }


# // Configure the EC2 instance in a public subnet
resource "aws_instance" "ec2_public" {
  ami                         = data.aws_ami.ubuntu-linux-2204.id
  associate_public_ip_address = true
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.key_pair.key_name
  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.allow_pub.id]
  
  tags = {
    "Name" = "${var.namespace}-EC2-PUBLIC"
  }

}


module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 8.0"

  name = "my-alb"

  load_balancer_type = "application"

  vpc_id             = module.vpc.vpc_id
  subnets            = [module.vpc.public_subnets[0],module.vpc.public_subnets[1]]
  security_groups    = [aws_security_group.allow_pub.id]

  target_groups = [
    {
      name_prefix      = "pref-"
      backend_protocol = "HTTP"
      backend_port     = 8080
      target_type      = "instance"
      targets = {
        my_other_target = {
          target_id = aws_instance.ec2_public.id
          port = 8080
        }
      }
    }
  ]

  # https_listeners = [
  #   {
  #     port               = 443
  #     protocol           = "HTTPS"
  #     certificate_arn    = "arn:aws:iam::123456789012:server-certificate/test_cert-123456789012"
  #     target_group_index = 0
  #   }
  # ]

  http_tcp_listeners = [
    {
      port               = 80
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]

  tags = {
    Environment = "Test"
  }
}