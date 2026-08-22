# `src/` source map

公開用のHTML・CSS・JavaScriptは `npm run build` で生成します。ルート直下の生成物は直接編集しません。

## Pages and shared HTML

- `pages/**/page.json`: ページ情報、KV、アンカー、関連ページ
- `pages/**/main.html`: ページ固有の本文
- `components/`: ヘッダー、メニュー、フォーム、フッターなどの共通HTML
- `layouts/`: HTML文書の外枠
- `data/site.json`: サイト全体のナビゲーションと連絡先

共通HTMLの描画処理は `scripts/lib/renderers.mjs` にまとめています。ページ固有のHTML変換は `scripts/lib/page-transforms.mjs` に限定します。

## CSS

- `assets/css/base-parts/`: 共通CSSの編集元。ファイル名順に結合されます
- `assets/css/*.css`: ページまたは機能単位のスタイル
- 生成先: `css/base.css` と `css/*.css`

`base-parts/` の番号はカスケード順を固定するためのものです。見た目を変えない整理では、番号順とルール順を変更しません。

## JavaScript

- `assets/js/script-parts/`: 共通スクリプトの編集元。ファイル名順に結合されます
- `assets/js/auth-gate.js`: 認証ゲート用の独立スクリプト
- 生成先: `js/script.js` と `js/auth-gate.js`

`script-parts/` は単一の即時実行関数を機能境界で分けたものです。読み込み方法と実行順を維持するため、公開時は従来どおり1ファイルへ結合します。

## Verification

```sh
npm run check
npm run test:structure
npm run test:behavior
npm run test:responsive
git diff --check
```

- `test:structure`: 24ページの生成HTMLを比較
- `test:behavior`: メニュー、フォーム、KV、追従CTAなどの主要操作を確認
- `test:responsive`: 24ページを5種類の画面幅で確認し、PC/SPの画像差分と横スクロールを検出
