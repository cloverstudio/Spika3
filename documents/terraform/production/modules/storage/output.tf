output "efs_dns_name" {
  value = aws_efs_file_system.efs.dns_name
}

output "db_endpoint" {
  value = aws_db_instance.master_db.endpoint
}

output "redis_address" {
  value = aws_elasticache_cluster.redis_cache.cache_nodes[0].address

}


