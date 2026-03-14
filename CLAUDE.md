# モノピタ（MonoPita）- 暮らしの便利グッズ＆ガジェット アフィリエイトブログ

## 基本原則
> 「シンプルさは究極の洗練である」

- **最小性**: 不要なコードは一文字も残さない。必要最小限を超えない
- **単一性**: 真実の源は常に一つ（型: types/index.ts、要件: requirements.md、進捗: SCOPE_PROGRESS.md）
- **刹那性**: 役目を終えたコード・ドキュメントは即座に削除する
- **実証性**: 推測しない。ログ・DB・APIレスポンスで事実を確認する
- **潔癖性**: エラーは隠さない。フォールバックで問題を隠蔽しない

## プロジェクト設定

技術スタック:
  フレームワーク: Astro（最新安定版）+ TypeScript 5
  スタイリング: Tailwind CSS v4
  ホスティング: Cloudflare Pages
  CI/CD: GitHub Actions
  AI記事生成: Google Gemini 2.5 Flash API
  コード管理: GitHub（パブリック）

ポート設定:
  dev: 4321（Astroデフォルト）

## 環境変数

- .env.local（GEMINI_API_KEY等）
- GitHub Secrets（CI/CD用: GEMINI_API_KEY, CLOUDFLARE_API_TOKEN等）
- ハードコード禁止: 環境変数はconfig経由のみ
- **絶対禁止**: .env, .env.test, .env.development, .env.example は作成しない

## 命名規則

- コンポーネント: PascalCase.astro / その他: camelCase.ts
- 変数・関数: camelCase / 定数: UPPER_SNAKE_CASE / 型: PascalCase
- 記事ファイル: YYYY-MM-DD-slug.md

## コード品質

- 関数: 100行以下 / ファイル: 700行以下 / 複雑度: 10以下 / 行長: 120文字

## 開発ルール

### サーバー起動
- サーバーは1つのみ維持。別ポートでの重複起動禁止
- 起動前に既存プロセスを確認

### エラー対応
- 環境変数エラー → 全タスク停止、即報告（試行錯誤禁止）
- 同じエラー3回 → Web検索で最新情報を収集

### デプロイ
- デプロイはユーザーの明示的な承認を得てから実行する

### ドキュメント管理
許可されたドキュメントのみ作成可能:
- docs/SCOPE_PROGRESS.md（実装計画・進捗）
- docs/requirements.md（要件定義）
- docs/DEPLOYMENT.md（デプロイ情報）
上記以外のドキュメント作成はユーザー許諾が必要。
実装済みの記載は積極的に削除する。

## Playwright

スクリーンショット保存先: /tmp/bluelamp-screenshots/

## 最新技術情報

- PA-API 5.0は2026年4〜5月に廃止予定。Amazon Creators APIに移行が必要だが、本プロジェクトではURL構成方式（`?tag=`）を使うためAPI不要で影響なし
- Vercel Hobbyプランは商用利用不可のため、Cloudflare Pagesを採用
- GitHub Actions cronは60日間アクティビティがないと無効化される（毎日実行なら問題なし）
- Google AdSense審査にはAI生成コンテンツの品質が問われる。体験ベースの記述・独自性の追加が重要
