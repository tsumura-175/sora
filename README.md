# はじまりの家そら - 確認用サイトの編集方法

GitHub Pagesに公開するHTMLは、`src/` から生成します。公開用の `index.html` や各ページの `index.html` を直接編集しないでください。詳細なルールは `CODING_GUIDELINES.md` を参照してください。

## 共通パーツ

- `src/layouts/document-start.html`: head、body開始、SVG定義
- `src/data/site.json`: ヘッダー・3点リーダー・フッターのナビゲーション
- `src/components/header.html`: ヘッダー
- `src/components/overlay-menu.html`: 3点リーダーメニュー
- `src/components/contact.html`: 共通お問い合わせセクション
- `src/components/floating-cta.html`: 追従CTA
- `src/components/footer.html`: フッター
- `src/components/page-kv.html`: 下層ページのKVとパンくず
- `src/components/page-anchors.html`: ページ内アンカーとPC左追従ナビ
- `src/components/page-related.html`: 関連ページ

`{{root}}` はビルド時に、トップページでは `./`、下層ページでは `../` に置き換わります。共通パーツ内のサイト内リンクや画像参照には、この記法を使います。

## ページ固有の内容

各ページ固有のHTMLは `src/pages/<page>/main.html` にあります。お問い合わせの後にページ固有の要素が続く場合のみ `after-contact.html` を置きます。タイトル、description、canonical、preloadに加え、下層ページのKV・関連ページ・アンカー情報も `page.json` にあります。CSS、JavaScript、画像は `src/assets/` を編集します。

## 反映手順

1. `src/` 内を編集する
2. `npm run check` を実行する
3. 生成されたHTMLをGitHub Pagesへ反映する

将来WordPressへ移すときは、`src/components/` のHTMLを `header.php`、`footer.php`、`template-parts/` に分け、`src/assets/` のCSS・JavaScript・画像をテーマへ移します。
