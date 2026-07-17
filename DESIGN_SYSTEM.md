# はじまりの家そら デザインシステム

このドキュメントは、コンテキストをリセットしてもページごとのデザインがぶれないようにするための制作ルールです。新しいページを作る前に、必ずこのファイルと `css/style.css` の該当セクションを確認してください。

## 目的

- 「はじまりの家そら」らしい、やわらかく静かな信頼感を保つ。
- トップページ、下層ページ、追加ページの見出し・余白・番号・導線の扱いを統一する。
- 新規ページ作成時に、既存classを優先して使い回せる状態にする。
- 主要導線と補助導線を分け、情報の優先順位を崩さない。

## 基本トーン

- 施設・看取り・相談という文脈に合わせ、落ち着き、安心感、余白、読みやすさを優先する。
- 過度な装飾、強いグラデーション、派手なカード表現は避ける。
- 写真・淡い青・白背景・罫線・控えめな番号で、静かに情報を整理する。
- 下層ページは「想い・理念」ページの構造を基本形にする。

## デザイントークン

CSS変数は `src/assets/css/base.css` の `:root` を正とする。`src/assets/css/style.css` は読み込み順だけを管理するエントリーファイルであり、ルート直下の `css/` は確認用サイトの生成物なので直接編集しない。

### 色

- メイン: `--color-main` `#2E7DD1`
- ライト: `--color-light` `#4A9EE8`
- ディープ: `--color-deep` `#1B4F8E`
- アクセント: `--color-accent` `#5BB3F0`
- 背景: `--color-bg` `#FAFCFE`
- 薄青背景: `--color-pale` `#EEF5FB`
- 紙色背景: `--color-paper` `#F4F8FC`
- 本文: `--color-text` `#222222`
- 補助本文: `--color-sub` `#6B7280`
- 罫線: `--color-border` `#E2E8F0`

フッターとハンバーガーメニューは `--gradient-footer` を使う。

### 書体

- 和文本文: `--font-jp-sans`
- 和文見出し: `--font-jp-serif`
- 英字・番号: `--font-en`

見出しは和文セリフ体、本文は読みやすいサンセリフを基本にする。

### レイアウト

- 標準横幅: `--max-content`
- 狭め本文: `--max-narrow`
- PCセクション余白: `--section-py-pc`
- SPセクション余白: `--section-py-sp`

新規に固定pxの大きな余白を作らず、既存の `clamp()` とCSS変数に合わせる。

## ページ構成ルール

### 下層ページの基本構造

下層ページは原則として以下の順序で構成する。

```html
<body class="is-subpage">
  <header class="site-header">...</header>
  <nav class="overlay-menu">...</nav>
  <main id="top">
    <section class="page-kv">...</section>
    <div class="divider divider--brush">...</div>
    <nav class="page-anchor-nav">...</nav>
    <aside class="page-side-nav">...</aside>
    <section class="about-section about-section--01" id="...">...</section>
    <section class="about-section about-section--02" id="...">...</section>
    <section class="about-section about-section--03" id="...">...</section>
    <section class="page-related">...</section>
    <section class="contact">...</section>
  </main>
  <div class="floating-cta">...</div>
  <footer class="site-footer">...</footer>
</body>
```

4セクション未満でも `about-section--01` から順番に使う。背景グラデーションの接続が崩れる場合のみCSSを追加する。

### 下層ページKV

- 使用class: `page-kv`
- 英字: `page-kv__en`
- ページ名: `page-kv__title`
- パンくず: `breadcrumb breadcrumb--on-kv`
- 背景画像は既存KV画像を流用し、ページ固有画像がある場合のみ差し替える。

### ページ内ナビ

- KV直下: `page-anchor-nav`
- PC左追従: `page-side-nav`
- 表記は英字ラベル + 日本語ラベル。
- アンカーIDと `data-target` は必ず一致させる。

## 見出しルール

### `en-sub reveal-sub`

- 下層ページ本文セクションでは英語表記にする。
  - 例: `ABOUT US`, `PHILOSOPHY`, `MESSAGE`, `VALUES`, `LOCATION`, `BY BUS`, `BY CAR`, `VISIT NOTE`
- トップページは既存表現を優先し、日本語の `en-sub` も許容する。
- 問い合わせセクションの `ご相談・お問い合わせ` は共通パーツとして維持してよい。

### `section-title`

- ページの主見出しは `section-title` を使う。
- 下層ページ内では `about-section .section-title` の鳥アイコン付き表現を基本にする。
- タイトル内で極端な改行を入れない。必要な場合は `<br>` を最小限にする。

### `section-lead`

- 1から2文程度に抑える。
- 長い説明は本文ブロックに回す。
- 最大幅は既存の `about-section .section-lead` に合わせる。

## 番号デザイン

番号はトップページの `promises__num` を基準にする。

基本方針:

- 薄い青の `01 / 02 / 03` 表記。
- 丸囲み番号は原則使わない。
- 大きすぎる装飾番号やアウトライン番号は、ページ間で強弱が出るため避ける。
- 番号は「順序を示す補助情報」として扱い、主役にしない。

推奨CSSの方向:

```css
font-family: var(--font-en);
font-weight: 500;
font-size: clamp(1.6rem, 3.2vw, 2.6rem);
line-height: 1;
letter-spacing: 0.04em;
color: rgba(46,125,209,0.32);
```

適用済み:

- トップページ: `promises__num`
- 想い・理念ページ: `values-flow .flow__num`
- アクセスページ: `access-steps__num`

## コンポーネントルール

### 写真カード

使用候補:

- `target-card`
- `target-card__media`
- `target-card__body`
- `target-card__title`
- `target-card__desc`

用途:

- ご関係別案内のような、遷移先を持つカード。
- 画像 + タイトル + 短文で情報を比較させたい場合。

注意:

- カードを入れ子にしない。
- 角丸は基本8px前後。写真のみ既存に合わせて12pxから18px程度まで許容する。

### 文章を読ませるセクション

使用候補:

- `about-lead`
- `about-statement`
- `message-block`
- `flow`
- `values-flow`

用途:

- 想いや理念など、しっかり読ませる文章。
- 装飾は控えめにし、行間と余白で読みやすさを作る。

### 写真 + 一文の道順

アクセスページで使用。

使用class:

- `access-route`
- `access-steps`
- `access-steps__item`
- `access-steps__photo`
- `access-steps__caption`
- `access-steps__num`
- `access-steps__text`

ルール:

- 1ステップにつき、画像1枚 + 一文。
- タイトルと説明文に分けすぎない。
- カーナビ設定など強い情報ブロックは、必要になるまで追加しない。

### チェックリスト

使用候補:

- `contact-support`
- `contact-support__title`
- `contact-support__list`

用途:

- 「このような方を支えています」のような、相談対象者を安心させるリスト。
- 1列表示を基本にし、読み落としを防ぐ。

## グローバル導線

### ハンバーガーメニュー

主要メニュー:

- 想い・理念
- 事業案内
- ご関係別案内
- 法人情報
- 採用情報
- お知らせ

補助導線:

- お問い合わせ
- 見学・ご相談予約
- ご寄付のお願い
- アクセス・所在地を見る
- SNS
- 電話番号

アクセスは主要メニューとして扱わず、`overlay-menu__utility` で控えめに置く。

### フッター

主要カテゴリは `site-footer__nav` に置く。

補助リンクは `site-footer__legal` に置く。

- プライバシーポリシー
- サイトマップ
- アクセス

アクセスは独立カラムにしない。

### フローティングCTA

PC追従CTAは問い合わせ・相談予約の2本を基本にする。

- お問い合わせ
- 見学・ご相談予約

アクセスや寄付をここに追加しない。

## 関連ページ

下層ページ末尾は `page-related` を使う。

ルール:

- 3件までを基本にする。
- 遷移先はユーザーの次行動に近いものを優先する。
- 同じページへのリンクは避ける。

## 画像ルール

- ダミー画像は既存の `images/` から選ぶ。
- 画像の意味が後で変わる可能性がある場合、`alt` は「イメージ」として控えめに書く。
- 実写差し替え予定がある場合でも、レイアウトが崩れないよう `width` と `height` は入れる。
- 道順画像は横長 `16 / 9` を基本にする。

## レスポンシブルール

- PCでは情報密度を上げすぎず、余白を保つ。
- SPでは1カラムに落とす。
- ボタン、カード、番号、写真はコンテンツ量で高さが暴れないよう、`aspect-ratio` や `min-height` を使う。
- テキストがボタンやカードからはみ出さないよう、長い単語や長いラベルは改行を許容する。

## 新規ページ作成手順

1. `DESIGN_SYSTEM.md` を読む。
2. 近い既存ページを選ぶ。
   - 下層ページ全般: `about/index.html`
   - アクセス系: `access/index.html`
   - トップ導線やセクション構成: `index.html`
3. 既存classを優先してHTMLを組む。
4. 新規CSSは `src/assets/css/` の役割別ファイルに追加する。全ページ共通は `base.css`、下層共通は `subpages.css`、アクセス固有は `access.css`、ご関係別案内固有は `target.css` を使う。
5. `rg` でリンク、ID、旧文言の残りを確認する。
6. `git diff --check` を実行する。
7. 可能なら公開前にローカル表示を確認する。

## 実装チェックリスト

- `page-kv` とパンくずがある。
- `page-anchor-nav` と `page-side-nav` のIDが一致している。
- 下層ページの `en-sub reveal-sub` は英語になっている。
- 番号表現は薄い青の `01 / 02 / 03` に寄っている。
- 主要導線と補助導線が混ざっていない。
- フッターのアクセスは `site-footer__legal` にある。
- 画像参照切れがない。
- ページ内アンカー切れがない。
- `git diff --check` が通る。

## 避けること

- 新規ページごとに独自の見出しデザインを作る。
- 番号を丸囲み、巨大アウトライン、濃色などでページごとに変える。
- 補助リンクを主要メニューと同じ強さで置く。
- カードの中にカードを入れる。
- 1ページだけ余白や背景色のルールを変える。
- SVGや装飾を増やして、本文の読みやすさを下げる。

## 判断に迷った場合

- まずトップページの表現に寄せる。
- 下層ページ構造は「想い・理念」ページに寄せる。
- 情報の見せ方は、読み物なら余白重視、道順なら写真 + 一文、比較ならカードにする。
- 強く見せる必要がない導線は、ボタンではなくテキストリンクにする。
