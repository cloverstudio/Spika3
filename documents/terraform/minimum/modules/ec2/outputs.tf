output "public_ip_instance" {
 value = aws_instance.ec2_app.public_ip
}

output "public_ip" {
 value = aws_eip.global_ip.public_ip
}
