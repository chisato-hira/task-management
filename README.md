# タスク管理アプリ（Task Board）

Trello 風のカンバンボード形式でタスクを視覚的に管理できる Web アプリケーション。  
バックエンドに Spring Boot、フロントエンドに React + TypeScript、データベースに PostgreSQL を採用したフルスタック構成。

---

## 機能一覧

| No | 機能名 | 概要 |
|----|--------|------|
| 1 | ボード表示 | 未着手 / 進行中 / 完了 の 3 カラムでタスクを一覧表示する |
| 2 | タスク作成 | タイトル・説明文・優先度・期限を入力してタスクを新規作成する |
| 3 | タスク編集 | 作成済みタスクの各項目を編集する |
| 4 | タスク削除 | 確認ダイアログを経てタスクを削除する |
| 5 | タスク移動 | ドラッグ＆ドロップでカラム間・カラム内の順番を変更する |
| 6 | 並び替え | カラムごとに「登録順 / 優先度順 / 期限順」を切り替える |
| 7 | 完了タスク一括削除 | 完了カラムのタスクをまとめて削除する |

---

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| **フロントエンド** | React | 19.2.6 |
| | TypeScript | 6.0.3 |
| | Vite | 8.0.14 |
| | Tailwind CSS | 4.3.0 |
| | @dnd-kit/core | 6.3.1 |
| | @dnd-kit/sortable | 10.0.0 |
| | @dnd-kit/utilities | 3.2.2 |
| | npm | 11.11.0 |
| **バックエンド** | Java | 25 |
| | Spring Boot | 4.0.3 |
| | Gradle（Kotlin DSL） | 9.4.1 |
| **データベース** | PostgreSQL | 17 |

詳細は [技術スタック](docs/tech-stack.md) を参照。

---

## ディレクトリ構成

```
task-management/
├── backend/                  # Spring Boot REST API（ポート 8080）
│   ├── src/main/java/
│   │   └── com/taskmanagement/
│   │       ├── controller/   # HTTP リクエスト受付
│   │       ├── service/      # ビジネスロジック
│   │       ├── repository/   # Spring Data JPA
│   │       └── entity/       # Task エンティティ
│   └── build.gradle.kts
├── frontend/                 # React + TypeScript（ポート 5173）
│   ├── src/
│   │   ├── api/              # taskApi.ts（fetch ベース）
│   │   ├── components/       # Header / Board / Column / TaskCard / CreateTaskModal / TaskDetailModal
│   │   ├── types/            # Task.ts
│   │   └── utils/            # date.ts（日付フォーマット）
│   └── package.json
├── docs/                     # 要件・設計ドキュメント
├── prototype/                # Vanilla JS の試作 UI（参照用）
└── docker-compose.yml        # PostgreSQL 定義
```

---

## セットアップ

### 前提条件

- Docker Desktop がインストール済みであること
- Java 25 がインストール済みであること
- Node.js（npm）がインストール済みであること

### 起動手順

サービスは以下の順で起動すること。

**1. データベース起動**

```bash
docker compose up -d
```

**2. バックエンド起動**

```bash
cd backend
./gradlew bootRun
```

起動確認：http://localhost:8080/api/tasks にアクセスして JSON が返ることを確認する。

**3. フロントエンド起動（別ターミナル）**

```bash
cd frontend
npm install   # 初回のみ
npm run dev
```

起動確認：http://localhost:5173 をブラウザで開く。

---

## API エンドポイント

| メソッド | URL | 処理内容 |
|---------|-----|---------|
| GET | `/api/tasks` | 全タスクを取得する |
| GET | `/api/tasks/{id}` | 指定 ID のタスクを取得する |
| GET | `/api/tasks/status/{status}` | ステータスでタスクを絞り込む |
| POST | `/api/tasks` | 新しいタスクを作成する |
| PUT | `/api/tasks/{id}` | 指定 ID のタスクを更新する |
| PATCH | `/api/tasks/reorder` | タスクの並び順・ステータスを一括更新する |
| DELETE | `/api/tasks/{id}` | 指定 ID のタスクを削除する |
| DELETE | `/api/tasks/status/{status}` | 指定ステータスのタスクを一括削除する |

### リクエスト例（タスク作成）

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "買い物をする",
    "description": "牛乳・卵・パン",
    "priority": "HIGH",
    "dueDate": "2026-06-01"
  }'
```

### ステータス・優先度の値

| フィールド | 値 |
|-----------|-----|
| status | `TODO` / `IN_PROGRESS` / `DONE` |
| priority | `HIGH` / `MEDIUM` / `LOW` |

---

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [要件定義書](docs/requirements.md) | プロジェクト概要・非機能要件 |
| [機能要件定義書](docs/functional-requirements.md) | 機能詳細・バリデーション・ユースケース |
| [画面設計書](docs/screen-design.md) | 画面一覧・遷移図・ワイヤーフレーム |
| [データベース設計書](docs/database-design.md) | ER 図・テーブル定義・インデックス |
| [技術スタック](docs/tech-stack.md) | 使用技術バージョン・API 詳細仕様 |
