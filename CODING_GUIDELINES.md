# はじまりの家そら コーディング規約

## 1. このリポジトリの扱い

- `src/` が唯一の編集元です。ルート直下のHTML、`css/`、`js/`、`images/` は GitHub Pages確認用の生成物なので直接編集しません。
- 変更後は必ず `npm run check` を実行します。これは確認用HTMLの生成と、未展開テンプレート・ローカルアセット参照の検証を行います。
- 生成物を確認したうえで、`git diff --check` とPC・SPの表示確認を行います。

## 2. ディレクトリの責務

```text
src/
├─ data/                 共通ナビゲーションなどの設定値
├─ layouts/              head、body開始などページ共通の外枠
├─ components/           複数ページで使うHTML部品
├─ pages/<page>/         ページ固有の本文とメタデータ
└─ assets/               CSS、JavaScript、画像の編集元
```

- `src/data/site.json` はヘッダー、3点リーダー、フッターのメニューを正とします。リンクやラベルはHTMLに重複記述しません。
- `src/pages/<page>/page.json` には出力先、title、description、canonical、必要なpreload設定を置きます。
- `main.html` はページの主要本文、`after-contact.html` は共通お問い合わせ後に続くページ固有要素だけを置きます。

## 3. HTML

- 意味に合うHTML要素を優先します。見出しはページ内で順番に使用し、見た目だけのために見出し要素を使いません。
- 画像には内容に応じた `alt` を付けます。装飾画像は空の `alt` とし、必要に応じて `aria-hidden="true"` を使います。
- `id` はページ内で一意にし、アンカーの `href`、`data-target`、対象要素の `id` を必ず一致させます。
- 共通部品を変更するときは、まず `components/` と `data/site.json` に同じ役割がないか確認します。

## 4. class名とJavaScriptフック

- class名はBEMを基本とします。`block`、`block__element`、`block--modifier` を使います。
- 状態は `is-*` を使います。例：`is-open`、`is-active`。
- JavaScriptが要素を参照するための新規フックは `data-*` を使います。見た目のclassをJavaScript専用の識別子にしません。
- 既存の共通classを流用できる場合は、新しい似たclassを増やしません。

## 5. CSS

- 色、書体、余白、画面幅は `:root` のデザイントークンを優先します。新しい固定値は、既存トークンで表現できない場合だけ追加します。
- CSSの追加先は `src/assets/css/` です。`style.css` は読み込み順だけを管理し、直接ルールを書きません。全ページ共通は `base.css`、下層共通は `subpages.css`、アクセス固有は `access.css`、ご関係別案内固有は `target.css`、追従CTAは `floating-cta.css` に置きます。
- 同じセレクタを別の場所で再定義しません。状態・画面幅別の例外は、基本ルールの近くにまとめます。
- `!important`、過度に深い子孫セレクタ、HTML構造に強く依存するセレクタを避けます。
- 新規の画面幅対応は、PC・タブレット・SPで確認します。既存のブレークポイントを優先し、同じ目的の新しい閾値を増やしません。

## 6. JavaScript

- 機能ごとに初期化し、対象要素がないページでは何もしない実装にします。
- スクロール処理は `requestAnimationFrame` または `IntersectionObserver` を使い、重い処理を直接連続実行しません。
- `prefers-reduced-motion` を尊重し、動きを必須の情報伝達に使いません。
- フォームの送信先や認証情報を確認用コードへ固定しません。`auth-gate.js` は確認環境専用であり、本番WordPressテーマには移植しません。

## 7. 新規ページ・部品の追加

1. 近い既存ページと `DESIGN_SYSTEM.md` を確認する。
2. ページ固有のHTMLを `src/pages/` に追加し、`page.json` にメタデータを設定する。
3. 共通化できる内容は `components/`、ナビゲーションは `data/site.json` に置く。
4. CSS・JavaScriptを編集する。
5. `npm run check`、`git diff --check`、PC・SP表示確認を行う。

## 8. WordPress移行時

確認用サイトの構造をWordPressテーマへ移す際は、以下を目安にします。

| このリポジトリ | WordPressテーマ |
| --- | --- |
| `layouts/document-start.html` | `header.php` |
| `components/header.html` | `template-parts/header.php` |
| `components/overlay-menu.html` | `template-parts/overlay-menu.php` |
| `components/contact.html` | `template-parts/contact.php` |
| `components/footer.html` | `footer.php` または `template-parts/footer.php` |
| `data/site.json` | WordPressメニュー、カスタム設定 |

移植後はWordPress側を正とし、GitHub Pages確認用の静的データと二重に更新しない運用へ切り替えます。
