# Creating EFS file system

resource "aws_efs_file_system" "efs" {
    creation_token = "${var.namespace}-efs"
    tags = {
        Name = "${var.namespace}-filestorage"
    }
}

# Creating Mount target of EFS
resource "aws_efs_mount_target" "mount" {
    file_system_id      = aws_efs_file_system.efs.id
    subnet_id           = var.subnets[0]
    security_groups     = [var.sg_id]
}

