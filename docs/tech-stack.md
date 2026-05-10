# 技術スタック

## 1. 使用技術一覧

### フロントエンド

| 役割 | 使用技術 |
|------|---------|
| UI フレームワーク | React + TypeScript |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS |
| ドラッグ＆ドロップ | @dnd-kit/core |
| HTTP クライアント | axios |
| パッケージ管理 | npm |

### バックエンド

| 役割 | 使用技術 |
|------|---------|
| 言語 / フレームワーク | Java 21 / Spring Boot 3.x |
| ビルドツール | Gradle (Groovy DSL) |
| REST API | Spring Web |
| DB アクセス | Spring Data JPA |
| バリデーション | Spring Boot Validation |
| DB ドライバ | PostgreSQL Driver |
| コード省力化 | Lombok |

### データベース・開発環境

| 役割 | 使用技術 |
|------|---------|
| データベース | PostgreSQL |
| ローカル DB 起動 | Docker / Docker Compose |
| バージョン管理 | Git + GitHub |

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
