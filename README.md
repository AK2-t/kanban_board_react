# カンバンボード

シンプルで使いやすいカンバンボード形式のタスク管理ツール。

## 機能

- 複数のボードを管理
- カスタムカラムの追加・編集・削除
- タスクの作成、編集、削除
- ドラッグ＆ドロップでタスクを移動
- カスタムラベル管理
- タスクの詳細表示
- タスクのフィルタリングと検索
- ダークモード/ライトモード切替
- ローカルストレージによるデータ保存
- データのエクスポート/インポート
- シンプルな統計表示

## 使用技術

- React
- TypeScript
- Material UI
- Styled Components
- React Beautiful DnD
- React Color

## 開発環境

### ローカルで実行

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

### Dockerで実行

```bash
# Dockerイメージのビルドと実行
docker-compose up
```

## 保存データについて

すべてのデータはブラウザのローカルストレージに保存されます。
必要に応じてデータをエクスポート/インポートすることができます。

## 基本操作

1. ヘッダーの「新規ボード」ボタンからボードを作成します
2. 「新規カラム」ボタンからカラムを追加します
3. カラム内の「タスクを追加」からタスクを作成します
4. タスクはドラッグ＆ドロップで移動できます
5. タスクをクリックすると詳細表示・編集ができます
6. ダッシュボードからラベル管理やフィルター機能を利用できます