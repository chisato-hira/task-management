# --- EC2のパブリックIP ---
output "ec2_public_ip" {
  description = "EC2のパブリックIPアドレス"
  value       = aws_instance.app.public_ip
}

# --- アプリのアクセスURL ---
output "app_url" {
  description = "アプリへのアクセスURL"
  value       = "http://${aws_instance.app.public_ip}:8080"
}

# --- RDSのエンドポイント(接続先ホスト名:ポート) ---
output "rds_endpoint" {
  description = "RDSの接続先エンドポイント"
  value       = aws_db_instance.main.endpoint
}
