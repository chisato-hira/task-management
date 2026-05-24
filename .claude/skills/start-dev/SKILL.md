---
description: タスク管理アプリの開発サーバーを起動する手順を案内する。DB・バックエンド・フロントエンドの起動順序と確認方法を提示する。
---

以下の手順でサービスを順番に起動してください。

## 起動前チェック

まず、ポートが空いているか確認します：

```bash
lsof -i :5432 | grep LISTEN
lsof -i :8080 | grep LISTEN
lsof -i :5173 | grep LISTEN
```

出力があればそのポートは使用中です。出力がなければ空きです。

ポートが使用中の場合は `kill -9 <PID>` で停止してから次へ進んでください。

---

## ステップ1：DB起動（ターミナル1）

```bash
docker compose up -d
```

起動確認：
```bash
docker compose ps
```
`task-db` が `Up` になっていれば OK。

---

## ステップ2：バックエンド起動（ターミナル1のまま）

```bash
cd backend
./gradlew bootRun
```

起動確認：ターミナルに `Started TaskManagementApplication` が表示されれば OK。

---

## ステップ3：フロントエンド起動（ターミナル2を新しく開く）

```bash
cd /Users/chisatohirabayashi/Documents/cursor-projects/task-management/frontend
npm run dev
```

起動確認：`Local: http://localhost:5173/` が表示されれば OK。

---

## 動作確認

ブラウザで `http://localhost:5173` を開き、カンバンボードが表示されることを確認してください。

---

## ポート番号ルール（変更禁止）

| サービス | ポート |
|----------|--------|
| フロントエンド | 5173 |
| バックエンド | 8080 |
| DB | 5432 |

- **別ポートでの一時起動は禁止。** ポート競合が発生した場合は、競合しているプロセスを停止してから指定ポートで起動すること。
- ポート番号を恒久的に変更する場合は `docker-compose.yml` と `application.yml` の両方を更新すること。
