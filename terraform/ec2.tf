# --- 最新のAmazon Linux 2023 AMIを検索 ---
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --- SSH用のキーペア(公開鍵をAWSに登録。秘密鍵はローカルの~/.sshに残したまま) ---
resource "aws_key_pair" "deploy" {
  key_name   = "${var.project_name}-key"
  public_key = file("~/.ssh/task-management-key.pub")
}

# --- EC2インスタンス(nginx:80 + Spring Boot:8080 を同居) ---
resource "aws_instance" "app" {
  # t2.microはこのアカウントでは無料利用枠対象外だったため、対象のt3.microを使用
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.deploy.key_name
  subnet_id              = aws_subnet.public_1a.id
  vpc_security_group_ids = [aws_security_group.ec2.id]

  # --- ルートボリューム(AMIスナップショットが30GB以上を要求するため30GBに設定。無料枠上限と一致) ---
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  # user_data変更時にインスタンスを再作成する(変更を反映するため)
  user_data_replace_on_change = true

  # --- 起動時セットアップ: Java25 / Node.js22 / nginx ---
  user_data = <<-EOF
    #!/bin/bash
    set -ex
    dnf update -y

    # --- 前提パッケージ ---
    dnf install -y unzip zip tar gzip nginx

    # --- Java 25 (SDKMAN経由、/opt配下にインストールしec2-user等からも参照できるようにする) ---
    export SDKMAN_DIR="/opt/sdkman"
    curl -s "https://get.sdkman.io" | bash
    source "$SDKMAN_DIR/bin/sdkman-init.sh"
    sdk install java 25-open
    ln -sf "$SDKMAN_DIR/candidates/java/current/bin/java" /usr/local/bin/java
    ln -sf "$SDKMAN_DIR/candidates/java/current/bin/javac" /usr/local/bin/javac

    # --- Node.js 22 (fnm経由、/opt配下にインストール) ---
    export FNM_DIR="/opt/fnm"
    mkdir -p "$FNM_DIR"
    curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir "$FNM_DIR" --skip-shell
    export PATH="$FNM_DIR:$PATH"
    eval "$(fnm env)"
    fnm install 22
    FNM_NODE_DIR=$(find "$FNM_DIR" -type d -name "bin" | head -1)
    ln -sf "$FNM_NODE_DIR/node" /usr/local/bin/node
    ln -sf "$FNM_NODE_DIR/npm" /usr/local/bin/npm
    ln -sf "$FNM_NODE_DIR/npx" /usr/local/bin/npx

    # --- nginx起動 ---
    systemctl enable nginx
    systemctl start nginx

    # --- アプリ配置用ディレクトリ ---
    mkdir -p /opt/app
    chown ec2-user:ec2-user /opt/app
  EOF

  tags = {
    Name = "${var.project_name}-app"
  }

  # AMIはmost_recent=trueで検索しているため、AWSが新しいAMIを公開するたびに
  # 「作り直し」が計画されてしまう。動作確認済みのインスタンスを意図せず
  # 再作成しないよう、AMIの変更を無視する
  lifecycle {
    ignore_changes = [ami]
  }
}
