# 技術スタック

## 1. 使用技術一覧

### 1-1. フロントエンド

| 役割 | 技術 | バージョン | 備考 |
|------|------|-----------|------|
| UI ライブラリ | React | 19.2.6 | |
| 言語 | TypeScript | 6.0.3 | |
| ビルドツール | Vite | 8.0.14 | |
| スタイリング | Tailwind CSS | 4.3.0 | |
| React プラグイン | @vitejs/plugin-react | 6.0.2 | Vite と合わせて使用 |
| ドラッグ＆ドロップ | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities | 6.3.1 / 10.0.0 / 3.2.2 | タスク移動・並び替え機能で使用 |
| HTTP クライアント | fetch API | ブラウザ標準 | 外部ライブラリ不要 |
| パッケージ管理 | npm | 11.11.0 | |

### 1-2. バックエンド

| 役割 | 技術 | バージョン | 備考 |
|------|------|-----------|------|
| 言語 | Java | 25 | |
| フレームワーク | Spring Boot | 4.0.3 | |
| ビルドツール | Gradle（Kotlin DSL） | 9.4.1 | build.gradle.kts で管理 |
| REST API | Spring Web MVC | Spring Boot 管理 | |
| DB アクセス | Spring Data JPA | Spring Boot 管理 | |
| バリデーション | Spring Boot Validation | Spring Boot 管理 | |
| DB ドライバ | PostgreSQL Driver | Spring Boot 管理 | |
| コード省力化 | Lombok | Spring Boot 管理 | ボイラープレート削減 |
| 静的解析 | Checkstyle | 10.21.1 | `./gradlew build` の `check` タスクで実行。設定は `backend/config/checkstyle/checkstyle.xml` |

> Spring Boot 管理：Spring Boot の BOM（部品表）によって自動的にバージョンが決まるため、個別指定不要。

### 1-3. データベース

| 役割 | 技術 | バージョン | 備考 |
|------|------|-----------|------|
| RDBMS | PostgreSQL | 17 | Docker で起動（ポート 5432） |

### 1-4. 開発ツール・インフラ

| 役割 | 技術 | バージョン | 備考 |
|------|------|-----------|------|
| ローカル DB 起動 | Docker / Docker Compose | — | docker-compose.yml で定義 |
| バージョン管理 | Git | — | |
| リモートリポジトリ | GitHub | — | PR・Issue でチーム開発管理 |

---

## 2. API エンドポイント一覧

| メソッド | URL | 処理内容 |
|---------|-----|---------|
| GET | `/api/tasks` | 全タスクを取得する |
| GET | `/api/tasks/{id}` | 指定した ID のタスクを取得する |
| GET | `/api/tasks/status/{status}` | 指定したステータスのタスクを表示順に取得する |
| POST | `/api/tasks` | 新しいタスクを作成する |
| PUT | `/api/tasks/{id}` | 指定した ID のタスクを更新する |
| PATCH | `/api/tasks/reorder` | タスクの並び順・ステータスを一括更新する |
| DELETE | `/api/tasks/{id}` | 指定した ID のタスクを削除する |
| DELETE | `/api/tasks/status/{status}` | 指定したステータスのタスクを一括削除する |

---

## 3. API リクエスト・レスポンス詳細

### GET /api/tasks（全タスク取得）

リクエスト：なし

レスポンス：
```json
[
  {
    "id": 1,
    "title": "買い物をする",
    "description": "牛乳・卵・パン",
    "priority": "HIGH",
    "dueDate": "2026-05-10",
    "status": "TODO",
    "position": 0,
    "createdAt": "2026-05-01T10:00:00",
    "updatedAt": "2026-05-01T10:00:00"
  }
]
```

---

### GET /api/tasks/{id}（ID指定取得）

リクエスト：なし

レスポンス：200 OK（上記と同形式の単一オブジェクト）。存在しない ID の場合は 404 Not Found

---

### GET /api/tasks/status/{status}（ステータス絞り込み）

リクエスト：なし（`status` は `TODO` / `IN_PROGRESS` / `DONE` のいずれか）

レスポンス：該当ステータスのタスク配列（`position` 昇順）。形式は GET /api/tasks と同じ

---

### POST /api/tasks（タスク作成）

リクエスト：
```json
{
  "title": "買い物をする",
  "description": "牛乳・卵・パン",
  "priority": "HIGH",
  "dueDate": "2026-05-10",
  "status": "TODO"
}
```

- `title` は必須・255文字以内。それ以外の項目は省略可能
- `status` を省略した場合は `TODO` として作成される
- `position` はサーバー側で自動採番される（同一ステータス内の末尾に追加）

レスポンス：201 Created
```json
{
  "id": 1,
  "title": "買い物をする",
  "description": "牛乳・卵・パン",
  "priority": "HIGH",
  "dueDate": "2026-05-10",
  "status": "TODO",
  "position": 0,
  "createdAt": "2026-05-01T10:00:00",
  "updatedAt": "2026-05-01T10:00:00"
}
```

---

### PUT /api/tasks/{id}（タスク更新）

リクエスト：
```json
{
  "title": "買い物をする",
  "description": "牛乳・卵・パン",
  "priority": "MEDIUM",
  "dueDate": "2026-05-12",
  "status": "IN_PROGRESS"
}
```

- `title`・`status` は必須
- `description`・`priority`・`dueDate` を未設定にする場合は `null` を指定する

レスポンス：200 OK（更新後のタスク。形式は POST のレスポンスと同じ）。存在しない ID の場合は 404 Not Found

---

### PATCH /api/tasks/reorder（並び替え）

リクエスト：
```json
[
  { "id": 1, "status": "IN_PROGRESS", "position": 0 },
  { "id": 2, "status": "IN_PROGRESS", "position": 1 }
]
```

レスポンス：200 OK（ボディなし）

---

### DELETE /api/tasks/{id}（タスク個別削除）

リクエスト：なし

レスポンス：204 No Content（内容なし・削除成功）。存在しない ID の場合は 404 Not Found

---

### DELETE /api/tasks/status/{status}（ステータス指定一括削除）

リクエスト：なし（`status` は `TODO` / `IN_PROGRESS` / `DONE` のいずれか）

レスポンス：204 No Content（内容なし・削除成功）

---

## 4. インフラ・デプロイ

| カテゴリ | 技術 | バージョン |
|---|---|---|
| クラウド | AWS（EC2 + RDS） | — |
| IaC | Terraform | 1.15.8（aws provider ~> 5.0） |
| Webサーバー | Nginx | 1.30.3 |
| プロセス管理 | systemd | 252 |

詳細は [AWSインフラ構成](aws-infrastructure.md) を参照。
