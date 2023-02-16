# module "elb_http" {
#   source  = "terraform-aws-modules/elb/aws"
#   version = "~> 2.0"

#   name = "${var.namespace}-elb"

#   subnets         = var.vpc.public_subnets
#   security_groups = [var.sg_pub_id]
#   internal        = false


#   listener = [
#     {
#       instance_port     = 8080
#       instance_protocol = "HTTP"
#       lb_port           = 80
#       lb_protocol       = "HTTP"
#     }
#   ]

#   health_check = {
#     target              = "HTTP:8080/"
#     interval            = 30
#     healthy_threshold   = 2
#     unhealthy_threshold = 2
#     timeout             = 5
#   }

#   # access_logs = {
#   #   bucket = "${var.namespace}-accesslog"
#   # }

#   // ELB attachments
#   number_of_instances = length(var.instances)
#   instances           = var.instances

#   tags = {
#     Owner       = "user"
#     Environment = var.environment
#   }
# }


module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 8.0"

  name = "${var.namespace}-alb"

  load_balancer_type = "application"

  vpc_id              = var.vpc.vpc_id
  subnets             = var.vpc.public_subnets
  security_groups     = [var.sg_pub_id]

  target_groups = [
    {
      name_prefix      = "pref-"
      backend_protocol = "HTTP"
      backend_port     = 8080
      target_type      = "instance"
      targets = {
        instance_1 = {
          target_id = var.instances.0
          port = 8080
        },
        instance_2 = {
          target_id = var.instances.1
          port = 8080
        },
        instance_3 = {
          target_id = var.instances.2
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
    Environment = var.environment
  }
}
