-- テストデータ投入（べき等：何度実行しても重複しない）
INSERT INTO tasks (title, description, priority, due_date, status, position, created_at, updated_at)
SELECT 'ログイン画面の作成', 'ユーザー認証用のログインフォームを実装する', 'HIGH', '2026-03-15', 'TODO', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'ログイン画面の作成');

INSERT INTO tasks (title, description, priority, due_date, status, position, created_at, updated_at)
SELECT 'README更新', 'プロジェクトのセットアップ手順を記述する', 'LOW', NULL, 'TODO', 2, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'README更新');

INSERT INTO tasks (title, description, priority, due_date, status, position, created_at, updated_at)
SELECT 'API設計書の作成', 'REST APIのエンドポイント一覧を作成する', 'MEDIUM', NULL, 'IN_PROGRESS', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'API設計書の作成');

INSERT INTO tasks (title, description, priority, due_date, status, position, created_at, updated_at)
SELECT 'データベース設計', 'ERDとテーブル定義書を作成する', 'HIGH', '2026-03-15', 'IN_PROGRESS', 2, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'データベース設計');

INSERT INTO tasks (title, description, priority, due_date, status, position, created_at, updated_at)
SELECT '環境構築', 'Docker Composeで開発環境を構築する', 'MEDIUM', '2026-03-01', 'DONE', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = '環境構築');

INSERT INTO tasks (title, description, priority, due_date, status, position, created_at, updated_at)
SELECT '技術スタック選定', '使用する技術を選定して決定する', 'HIGH', '2026-03-01', 'DONE', 2, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = '技術スタック選定');
