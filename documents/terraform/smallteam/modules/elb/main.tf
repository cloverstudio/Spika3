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
          path      = "/api/test"
          port      = 8080
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
