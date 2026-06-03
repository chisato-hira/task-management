# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# タスク管理アプリ 開発ルール

> このファイルに定義されたルールは Claude Code が**必ず守る**規約です。
> 例外なく適用し、違反する操作は行わないでください。

---

## 1. ワークフロー（開発の手順）

すべての作業は以下の順序で進めること：

1. GitHub に Issue を作成する
2. Issue 番号をもとにブランチを作成する
3. ブランチ上で実装・コミットを行う
4. PR を作成して main へマージする
5. Issue を閉じる

---

## 2. Issue（必須）

- **作業開始前に必ず Issue を作成すること**
- タイトル形式：`[種別] 内容`
  - 例：`[feat] タスク一覧画面を実装する`
- 種別一覧：

  | 種別 | 用途 |
  |------|------|
  | feat | 新機能の追加 |
  | fix | バグ修正 |
  | docs | ドキュメントの変更 |
  | refactor | リファクタリング |
  | test | テストの追加・修正 |
  | chore | ビルド・設定・雑務 |

---

## 3. ブランチ命名規則

- **形式**：`{種別}/#{Issue番号}-{内容（英語・ケバブケース）}`
- 例：
  - `feature/#12-add-task-list`
  - `fix/#34-fix-login-error`
  - `docs/#5-update-readme`
- 種別は Issue の種別と同じものを使う
- `feature` は `feat` ではなく `feature` を使う

---

## 4. main への直接 push 禁止

- **main ブランチへの直接 push は絶対に禁止**
- 必ずブランチを切って作業し、PR 経由でマージすること
- GitHub のブランチ保護ルールでも強制設定済み

---

## 5. PR（プルリクエスト）必須

- main へのマージは**必ず PR を通して**行うこと
- PR タイトル形式：`[種別] 内容 (#Issue番号)`
  - 例：`[feat] タスク一覧APIを実装する (#12)`
- PR 本文に以下を記載すること：
  - 関連 Issue（例：`Closes #12`）
  - 変更内容（箇条書き）
  - 確認手順

---

## 6. コミットメッセージ規則

- **形式**：`{種別}: {内容（日本語）}`
- 例：
  - `feat: タスク一覧取得APIを実装する`
  - `fix: ログイン時のNullPointerExceptionを修正する`
  - `docs: READMEにセットアップ手順を追記する`
- 種別は Issue・ブランチと同じものを使う
- 内容は日本語で書くこと
- 1行目は体言止めではなく「〜する」形で書くこと

---

## 7. ポート番号ルール

開発環境で使用するポート番号は以下に固定すること：

| サービス | ポート番号 | 備考 |
|---------|-----------|------|
| フロントエンド（Vite） | **5173** | Vite デフォルト |
| バックエンド（Spring Boot） | **8080** | Spring Boot デフォルト |
| データベース（PostgreSQL） | **5432** | docker-compose.yml で設定済み |

- 他のアプリとポートが衝突する場合は必ずチームに確認すること
- ポート番号を変更する場合は docker-compose.yml と application.yml の両方を更新すること

---

## 8. 開発環境の起動コマンド

### 全サービス起動手順（毎回この順序で）

```bash
# 1. DB 起動（初回・再起動時）
docker compose up -d

# 2. バックエンド起動
cd backend
./gradlew bootRun

# 3. フロントエンド起動（別ターミナル）
cd frontend
npm run dev
```

### バックエンド単体操作

```bash
cd backend
./gradlew build          # ビルド（テスト含む）
./gradlew test           # テストのみ実行
./gradlew bootRun        # 起動（ポート 8080）
```

### DB 操作

```bash
docker compose up -d     # 起動
docker compose down      # 停止（データは保持）
docker compose down -v   # 停止＋データ削除（初期化したいとき）
```

### 案内時のルール

- 起動手順・ブラウザ確認が必要な場面では、**必ず毎回**以下を両方提示すること
  1. 必要なターミナルコマンド（DB → バックエンド → フロントエンドの順）
  2. ブラウザで確認するURL（例：`http://localhost:5173`）
- コマンドやURLを省略してはいけない

---

## 10. PR作成前の確認ルール

- 実装が完了したら、**必ず `create-pr` スキルを呼び出してチェックリストを実行してから PR を作成すること**
- 確認なしに自動で PR を作成してはいけない
- Issue作成・ブランチ作成・コミット・プッシュは確認なしで進めてよい

---

## 9. アーキテクチャ概要

```
task-management/
├── backend/          # Spring Boot REST API（ポート 8080）
├── frontend/         # React + TypeScript（ポート 5173）
├── docs/             # 要件・設計ドキュメント
├── prototype/        # Vanilla JS の試作UI（参照用。本番実装ではない）
└── docker-compose.yml  # PostgreSQL のみ定義
```

### バックエンド層構成

```
controller → service → repository → DB
```

- **controller**: HTTP リクエストを受け取り、service を呼ぶ。パスパラメータ型は Enum を直接受け取る（Spring が自動変換）
- **service**: ビジネスロジック。現状は repository の薄いラッパー
- **repository**: Spring Data JPA。カスタムメソッドは `findByStatusOrderByPositionAsc(TaskStatus)` のみ
- **entity**: `Task.java` — status は `TaskStatus` Enum、priority は `TaskPriority` Enum で管理。`@Enumerated(EnumType.STRING)` により DB には文字列で保存

### Enum 型

| フィールド | 型 | 値 |
|---|---|---|
| status | `TaskStatus` | `TODO` / `IN_PROGRESS` / `DONE` |
| priority | `TaskPriority` | `HIGH` / `MEDIUM` / `LOW` |

### フロントエンド構成

```
App.tsx
└── components/
    ├── Header.tsx     # タイトルバー
    ├── Board.tsx      # データ取得・状態管理（useEffect + useState）
    ├── Column.tsx     # カラム（未着手 / 進行中 / 完了）
    └── TaskCard.tsx   # タスクカード1枚
```

- `src/api/taskApi.ts` — `/api/tasks` へのリクエスト（fetch ベース）
- `src/types/Task.ts` — バックエンド Entity に対応する TypeScript 型
- CORS は `vite.config.ts` の `server.proxy` で回避（バックエンド変更不要）

### 現在実装済みの API エンドポイント

| メソッド | URL | 内容 |
|---|---|---|
| GET | `/api/tasks` | 全タスク取得 |
| GET | `/api/tasks/{id}` | ID 指定取得 |
| GET | `/api/tasks/status/{status}` | ステータス絞り込み |
