# モック管理画面ダッシュボード

FastAPI + Jinja2 + SQLite を使用したモック管理画面のデモプロジェクトです。

## 機能

- **ダッシュボード** - 統計カード（ユーザー数・商品数・在庫数）と最近のユーザー一覧
- **ユーザー管理** - 一覧表示・作成・編集・削除（CRUD）
- **商品管理** - 一覧表示・作成・編集・削除（CRUD）
- **REST API** - Swagger UI / ReDoc 付き

## 技術スタック

| 項目             | 技術                      |
|----------------|---------------------------|
| バックエンド     | FastAPI 0.104.1           |
| テンプレート     | Jinja2 3.1.2              |
| データベース     | SQLite + SQLAlchemy 2.0   |
| バリデーション   | Pydantic 2.5.0            |
| フロントエンド   | HTML / CSS / Vanilla JS   |
| サーバー         | Uvicorn                   |

## セットアップ

### 通常起動

```bash
# 仮想環境の作成とパッケージインストール
python -m venv venv
source venv/bin/activate  # Windows の場合: venv\Scripts\activate
pip install -r requirements.txt

# サーバー起動
uvicorn app.main:app --reload --port 8000
```

### Docker で起動

```bash
docker-compose up --build
```

## アクセス先

| URL                              | 説明                         |
|----------------------------------|------------------------------|
| http://localhost:8000/           | ダッシュボード（リダイレクト） |
| http://localhost:8000/dashboard  | ダッシュボード                |
| http://localhost:8000/users      | ユーザー管理                  |
| http://localhost:8000/products   | 商品管理                      |
| http://localhost:8000/api/docs   | Swagger UI                   |
| http://localhost:8000/api/redoc  | ReDoc                        |

## プロジェクト構造

```
mock-admin-dashboard/
├── app/
│   ├── main.py                  # FastAPI アプリケーション
│   ├── database/
│   │   └── database.py          # SQLite 設定
│   ├── models/
│   │   ├── models.py            # User / Product ORM モデル
│   │   └── schemas.py           # Pydantic スキーマ
│   ├── routes/
│   │   ├── pages.py             # HTML ページルート
│   │   ├── users.py             # ユーザー REST API
│   │   └── products.py          # 商品 REST API
│   └── templates/
│       ├── base.html            # 共通レイアウト
│       ├── dashboard.html       # ダッシュボードページ
│       ├── users.html           # ユーザー管理ページ
│       └── products.html        # 商品管理ページ
├── static/
│   ├── css/style.css            # スタイルシート
│   └── js/main.js               # フロントエンド JS
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

## API エンドポイント

### ユーザー

| メソッド | パス                  | 説明           |
|---------|----------------------|----------------|
| GET     | `/api/users`         | ユーザー一覧    |
| POST    | `/api/users`         | ユーザー作成    |
| GET     | `/api/users/{id}`    | ユーザー取得    |
| PUT     | `/api/users/{id}`    | ユーザー更新    |
| DELETE  | `/api/users/{id}`    | ユーザー削除    |

### 商品

| メソッド | パス                    | 説明        |
|---------|------------------------|-------------|
| GET     | `/api/products`        | 商品一覧     |
| POST    | `/api/products`        | 商品作成     |
| GET     | `/api/products/{id}`   | 商品取得     |
| PUT     | `/api/products/{id}`   | 商品更新     |
| DELETE  | `/api/products/{id}`   | 商品削除     |
