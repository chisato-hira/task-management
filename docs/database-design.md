# データベース設計書

## 1. ER図

```mermaid
erDiagram
    TASKS {
        int id PK "主キー（自動採番）"
        varchar title "タイトル（必須）"
        text description "説明文（任意）"
        varchar priority "優先度（HIGH / MEDIUM / LOW）"
        date due_date "期限日（任意）"
        varchar status "ステータス（TODO / IN_PROGRESS / DONE）"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }
```

---

## 2. テーブル定義

### tasks テーブル

| カラム名 | データ型 | NULL | 初期値 | 説明 |
|----------|---------|------|--------|------|
| id | INT | 不可 | 自動採番 | 主キー |
| title | VARCHAR(255) | 不可 | なし | タスクのタイトル |
| description | TEXT | 可 | NULL | タスクの説明文 |
| priority | VARCHAR(10) | 可 | NULL | 優先度：`HIGH` / `MEDIUM` / `LOW` |
| due_date | DATE | 可 | NULL | 期限日 |
| status | VARCHAR(20) | 不可 | `TODO` | ステータス：`TODO` / `IN_PROGRESS` / `DONE` |
| created_at | DATETIME | 不可 | 現在日時 | レコード作成日時（内部管理用・画面には表示しない） |
| updated_at | DATETIME | 不可 | 現在日時 | レコード更新日時（内部管理用・画面には表示しない） |
