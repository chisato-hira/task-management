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
| ドラッグ＆ドロップ | @dnd-kit/core | 未導入 | タスク移動機能で使用予定 |
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
| POST | `/api/tasks` | 新しいタスクを作成する |
| PUT | `/api/tasks/{id}` | 指定した ID のタスクを更新する |
| DELETE | `/api/tasks/{id}` | 指定した ID のタスクを削除する |

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
    "due_date": "2026-05-10",
    "status": "TODO"
  }
]
```

---

### POST /api/tasks（タスク作成）

リクエスト：
```json
{
  "title": "買い物をする",
  "description": "牛乳・卵・パン",
  "priority": "HIGH",
  "due_date": "2026-05-10"
}
```

レスポンス：
```json
{
  "id": 1,
  "title": "買い物をする",
  "description": "牛乳・卵・パン",
  "priority": "HIGH",
  "due_date": "2026-05-10",
  "status": "TODO"
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
  "due_date": "2026-05-12",
  "status": "IN_PROGRESS"
}
```

レスポンス：
```json
{
  "id": 1,
  "title": "買い物をする",
  "description": "牛乳・卵・パン",
  "priority": "MEDIUM",
  "due_date": "2026-05-12",
  "status": "IN_PROGRESS"
}
```

---

### DELETE /api/tasks/{id}（タスク削除）

リクエスト：なし

レスポンス：204 No Content（内容なし・削除成功）
