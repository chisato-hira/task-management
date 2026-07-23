#!/bin/bash
set -euo pipefail

# --- リポジトリのルートディレクトリを基準にする ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TF_DIR="$REPO_ROOT/terraform"
SSH_KEY="$HOME/.ssh/task-management-key"
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=accept-new"

# --- Terraformの出力からEC2のIPとRDSのエンドポイントを取得 ---
EC2_IP=$(terraform -chdir="$TF_DIR" output -raw ec2_public_ip)
RDS_ENDPOINT=$(terraform -chdir="$TF_DIR" output -raw rds_endpoint)
RDS_HOST="${RDS_ENDPOINT%%:*}"

# --- terraform.tfvarsからDB認証情報を読み取る(gitignore済み・コミットされないファイル) ---
DB_USERNAME=$(grep '^db_username' "$TF_DIR/terraform.tfvars" | sed -E 's/.*"(.*)".*/\1/')
DB_PASSWORD=$(grep '^db_password' "$TF_DIR/terraform.tfvars" | sed -E 's/.*"(.*)".*/\1/')

echo "==> デプロイ先EC2: $EC2_IP"
echo "==> 接続先RDS: $RDS_HOST"

# --- 1. application-prod.ymlを生成(gitignore対象。RDS接続情報を含む) ---
echo "==> application-prod.ymlを生成中..."
cat > "$REPO_ROOT/backend/src/main/resources/application-prod.yml" <<EOF
spring:
  datasource:
    url: jdbc:postgresql://${RDS_HOST}:5432/taskmanagement
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  sql:
    init:
      mode: always
  jpa:
    defer-datasource-initialization: true
    hibernate:
      ddl-auto: update
    show-sql: false
EOF

# --- 2. backendをローカルでビルド(実行可能jarを作成) ---
echo "==> backendをビルド中..."
(cd "$REPO_ROOT/backend" && ./gradlew bootJar)
JAR_PATH="$REPO_ROOT/backend/build/libs/task-management-0.0.1-SNAPSHOT.jar"
[ -f "$JAR_PATH" ] || { echo "jarが見つかりません: $JAR_PATH" >&2; exit 1; }

# --- 3. jarとapplication-prod.ymlをEC2にコピー ---
echo "==> jarと設定ファイルをEC2へ転送中..."
scp $SSH_OPTS "$JAR_PATH" "ec2-user@$EC2_IP:/opt/app/task-management.jar"
scp $SSH_OPTS "$REPO_ROOT/backend/src/main/resources/application-prod.yml" "ec2-user@$EC2_IP:/opt/app/application-prod.yml"

# --- 4. systemdユニットを配置 ---
echo "==> systemdユニットを配置中..."
scp $SSH_OPTS "$REPO_ROOT/deploy/systemd/task-management-backend.service" "ec2-user@$EC2_IP:/tmp/task-management-backend.service"
ssh $SSH_OPTS "ec2-user@$EC2_IP" "sudo mv /tmp/task-management-backend.service /etc/systemd/system/task-management-backend.service && sudo systemctl daemon-reload"

# --- 5. サービスを起動・自動起動を有効化 ---
echo "==> backendサービスを(再)起動中..."
ssh $SSH_OPTS "ec2-user@$EC2_IP" "sudo systemctl enable task-management-backend && sudo systemctl restart task-management-backend"

# --- 6. 起動確認(Spring Bootの起動に10数秒かかるため、固定sleepではなくリトライする) ---
echo "==> 起動確認中(最大60秒、5秒間隔でリトライ)..."
for i in $(seq 1 12); do
  if curl -sf "http://$EC2_IP:8080/api/tasks" > /dev/null; then
    echo "✅ backend起動確認OK: http://$EC2_IP:8080/api/tasks"
    exit 0
  fi
  sleep 5
done

echo "❌ backend起動確認に失敗(60秒待っても応答なし)。ログ確認コマンド:"
echo "   ssh $SSH_OPTS ec2-user@$EC2_IP 'sudo journalctl -u task-management-backend -n 50 --no-pager'"
exit 1
