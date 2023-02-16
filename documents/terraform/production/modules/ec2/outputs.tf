output "public_ip1" {
 value = aws_instance.ec2_public1.public_ip
}

output "public_ip2" {
 value = aws_instance.ec2_public2.public_ip
}

output "public_ip3" {
 value = aws_instance.ec2_public3.public_ip
}

output "public_instances" {
 value = [aws_instance.ec2_public1.id,aws_instance.ec2_public2.id,aws_instance.ec2_public3.id]
}
