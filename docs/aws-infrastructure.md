# AWS インフラ構成

このドキュメントは、本プロジェクトをAWS上にデプロイする際のインフラ構成・運用方針をまとめたものです。TerraformとAWS CLIを使ったコードベースでのデプロイを前提としています。

> **このドキュメントの位置づけ**
> 現時点では、AWSアカウント側の準備（認証・権限まわり）のみが完了しています。EC2・RDS・VPCなどの実際のインフラや、Terraformコード（`terraform/`配下）はまだ作成していません。それらを実装した際に、このドキュメントに追記していきます。

## 1. 方向性（決定済み・未実装）

- 学習目的のため、まずは最小構成（EC2インスタンス1台＋RDS）でAWSとTerraformの基本を理解することを優先する
- リージョンは東京リージョン（`ap-northeast-1`）を使用する
- AWS無料枠（Free Tier）内での運用を目指す

具体的なリソース構成・ディレクトリ構成・認証情報の受け渡し方法などは、実装時にあらためて追記する。

## 2. 現在のAWSアカウントの状態（実施済み）

- **rootユーザーにはアクセスキーを一切発行していない**。プログラムからの操作は必ずIAMユーザー（またはIAMロール）経由で行う
- Terraform/AWS CLI専用のIAMユーザーに **AdministratorAccess** を付与している
  - 本来は必要な権限のみに絞った最小権限ポリシーが望ましいが、個人の学習用途であるため現時点ではAdministratorAccessを許容している
- ルートユーザー・IAMユーザーともに**MFA（パスキー／セキュリティキー方式）を設定済み**
- AWS Budgets（予算アラート）を設定済み（想定外の課金を検知するため）
- Access Key ID / Secret Access Keyは、発行直後にパスワードマネージャー（Macの「パスワード」アプリ）へ保存済み。ダウンロードした`.csv`ファイルや一時保存したメモは削除済み（ゴミ箱を空にする含む）
- アクセスキー・tfstate・`.tfvars` は**チャットやチケット、Gitリポジトリなど、いかなる場所にも平文で記載・コミットしない**という方針
- ローカルの認証情報は `aws configure` で設定済み（リージョン: `ap-northeast-1`）。`~/.aws/credentials` に保存されている
- ローカルにAWS CLI・Terraformをインストール済み

## 3. 機密情報の漏洩防止の仕組み（実施済み）

本リポジトリはGitHub上でPublic設定のため、Terraformコードを書き始める前に以下の多層的な対策を整備している。

- `terraform/.gitignore` で、tfstate・tfvars・SSHキーペア（`.pem`）などを追跡対象から除外
- [gitleaks](https://github.com/gitleaks/gitleaks) をインストールし、`git commit` のたびに機密情報らしき文字列が含まれていないか自動スキャンするpre-commitフックを設定
  - フック本体は `terraform/hooks/pre-commit` としてリポジトリに含めている
  - `.git/hooks/pre-commit` は各自のローカル環境でGit管理外のため、新しい環境でクローンした際は以下のコマンドで手動リンクし直す必要がある
    ```bash
    ln -s ../../terraform/hooks/pre-commit .git/hooks/pre-commit
    chmod +x terraform/hooks/pre-commit
    ```
- GitHub側の secret scanning / push protection も有効（Publicリポジトリでは自動有効）。ただしAWSキーなど既知の形式のみ対象のため、tfstateの中身のような自由形式の機密情報はgitleaks側での検知が主な防衛線となる
