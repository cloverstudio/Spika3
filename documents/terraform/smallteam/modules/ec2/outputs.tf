output "public_ip_app" {
 value = aws_instance.ec2_app.public_ip
}

output "public_ip_db" {
 value = aws_instance.ec2_db.public_ip
}

output "public_instances" {
 value = [aws_instance.ec2_app.id,aws_instance.ec2_db.id]
}
