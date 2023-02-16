output "vpc" {
  value = module.vpc
}

output "sg_pub_id" {
  value = aws_security_group.allow_pub.id
}

output "sg_priv_id" {
  value = aws_security_group.allow_ssh_priv.id
}

output "subnets_priv" {
  value = module.vpc.private_subnets
}

output "subnets_pub" {
  value = module.vpc.public_subnets
}

