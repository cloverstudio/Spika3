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

# Database
resource "aws_db_instance" "master_db" {
    allocated_storage     = 50
    max_allocated_storage = 1000
    identifier = "${var.namespace}db"
    storage_type = "gp2"
    engine = "mysql"
    engine_version = "8.0.27"
    instance_class = "db.t2.medium"
    name = var.db_name
    username = var.db_username
    password = var.db_password
    publicly_accessible    = true
    skip_final_snapshot    = true
    db_subnet_group_name   = var.db_subnet_group_name
    vpc_security_group_ids = [var.sg_id]

    tags = {
        Name = "${var.namespace}-database"
    }
}

# Redis
resource "aws_elasticache_cluster" "redis_cache" {
  cluster_id          = "${var.namespace}redis"
  engine              = "redis"
  node_type           = "cache.t3.micro"
  num_cache_nodes     = 1
  port                = 6379
  apply_immediately   = true
  subnet_group_name   = var.cache_subnet_group_name
  security_group_ids  = [var.sg_id]
}

