# --- AWSリージョン(東京) ---
variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

# --- プロジェクト名(リソース名の接頭辞) ---
variable "project_name" {
  description = "プロジェクト名(リソース名のプレフィックスに使用)"
  type        = string
  default     = "task-management"
}

# --- 自分のIP(SSH/80/8080の許可用。必須・0.0.0.0/0にしない) ---
variable "my_ip_cidr" {
  description = "SSH接続を許可する自分のグローバルIP。例: 203.0.113.5/32 (terraform.tfvarsで設定すること)"
  type        = string
}

# --- RDSのデータベース名 ---
variable "db_name" {
  description = "RDSに作成するデータベース名"
  type        = string
  default     = "taskmanagement"
}

# --- RDSのマスターユーザー名(docker-compose.ymlのPOSTGRES_USERと合わせる。terraform.tfvarsで設定) ---
variable "db_username" {
  description = "RDSのマスターユーザー名"
  type        = string
}

# --- RDSのマスターパスワード(docker-compose.ymlのPOSTGRES_PASSWORDと合わせる。terraform.tfvarsで設定) ---
variable "db_password" {
  description = "RDSのマスターパスワード"
  type        = string
  sensitive   = true
}
