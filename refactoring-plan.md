# リファクタリング計画｜はじまりの家そら TOP（05_コーディング）

> 対象：`05_コーディング/` 配下
> - `index.html`（789行）
> - `css/style.css`（2,068行・361セレクタ・15 keyframes・5 media queries）
> - `js/script.js`（296行）
> - `images/`（計 約3.6MB、うち image.jpg 1.28MB / image1.jpg 1.38MB）
>
> ゴール：**公開準備フェーズへの橋渡し**。①表示の速度／②保守のしやすさ／③アクセシビリティ／④SEOを一段引き上げる。機能・ビジュアルは原則維持。

---

## 0. サマリ（先に結論）

現在のコードは「1ページ完結のモック」としては完成度が高いが、**公開運用に載せる前に以下3点の底上げが必要**：

1. **画像（合計3.6MB、うちKV単独で2.5MB超）が重い** — LCPが1.5〜2秒悪化する規模。最優先で圧縮＋WebP化＋`srcset`化。
2. **1ファイル2,068行のCSS／789行のHTMLは属人化リスク**が高い — パーツCSS分割・HTMLコンポーネント化で「後で新人でも触れる」状態に。
3. **インラインSVGの雲パスが19回重複**／アイコンも複数箇所に直書き — `<defs><symbol>` + `<use>` で一元化し、HTMLを300行以上削減可能。

加えて、軽微だがJS防御コード・アクセシビリティのスキップリンク・構造化データ（JSON-LD）など、**「やっておくと後から効く」施策**を6項目。

作業量の目安：**合計 1.5〜2日（本気で全部やる場合）**。本プランは優先度別にPhase 1〜4に分割しているので、Phase 1 だけでも実施推奨。

---

## 1. 現状診断（Findings）

### 1-1. パフォーマンス

| 項目 | 現状 | 影響 |
|---|---|---|
| `images/image.jpg` | **1.28MB / JPEG** | KVの初期読み込みで致命的。LCP悪化 |
| `images/image1.jpg` | **1.38MB / JPEG** | KVスライダー2枚目。初期表示外だが合計負荷大 |
| `images/image2.jpeg` | 467KB | カード用にしては重い |
| WebP/AVIF | 未対応 | モダンブラウザで30〜50%削減可能 |
| `srcset` / `sizes` | 未対応（単一画像を全サイズに使い回し） | モバイルでも1.3MBをDL |
| `<img>` に `width`/`height` | 未指定 | CLS（レイアウトシフト）の原因 |
| `loading="lazy"` | 一部のみ（カード画像）。KV・overlay icon・footer logoは即時 | OK |
| Google Fonts | 9バリアント（Noto Serif JP×3 + Noto Sans JP×2 + Cormorant×4） | FCP遅延。日本語フォントは特に重い |
| `preconnect` | あり（ただしpreloadなし） | 改善余地 |
| KV画像 `preload` | なし | LCP候補なのに未preload |
| CSS/JS 圧縮 | 未minify | サーバー側Brotli前提ならOKだが、念のため |

### 1-2. HTML

| 項目 | 現状 | 問題 |
|---|---|---|
| 雲SVGの重複 | **同じpathが19回コピー**（`M30 60 Q10 60 10 40 ...`） | 保守性悪・ファイルサイズ肥大 |
| アイコンSVG重複 | News右矢印×3、Instagram×2、LINE×2、voice-card__wave×5 | 同上 |
| Voice card アバター | 5枚ともほぼ同じSVG構造（circle+path、fill色だけ違い） | 属性抽出できる |
| `style="clip-path: url(#target-mask-N)"` | 3箇所にインラインstyle | 一貫性がない／CSS側に寄せるべき |
| Google Maps iframe | 常時埋め込み | 外部リクエスト重い。クリックして展開方式も検討 |
| 構造化データ（JSON-LD） | 未設置 | 「NPO法人」「LocalBusiness」のスキーマを入れるとSEO改善 |
| `<meta name="theme-color">` | なし | Chromeアドレスバー色付け不可 |
| Skip Link | なし | キーボードユーザーが毎回ヘッダーナビを抜けないと本文に行けない |
| 存在しないアンカー（`href="#"`） | SNS×2、news「もっと読む」 | TODOコメントあり。公開前に差替え必須 |
| hardcoded news / voices | HTML直書き3〜5件 | CMS化or JSONロード化を後で検討したい |
| lang属性 | `<html lang="ja">` | OK |

### 1-3. CSS

| 項目 | 現状 | 問題 |
|---|---|---|
| 1ファイル | 2,068行 | 巻物状態。どこで何が効いてるか追跡が辛い |
| `:root` 変数 | 整備済み（色・フォントサイズTokens等） | 設計は良い |
| BEM命名 | 概ね遵守 | ただし `--modifier` と `__element` の混在チェック要 |
| Responsive | `@media` 5つ（1024 / 768 / max-height 800 / max-height 680 / reduce-motion） | タブレット寄り（iPad Mini 820px）で崩れないか未検証 |
| `will-change: transform` | 常時複数セレクタに付与 | メモリ常時占有。本来はホバー中など一時的が望ましい |
| `.marquee__item` | 参照あり（l.1999）だがHTML側に該当要素なし | **デッドコード** |
| `@keyframes ken-burns` | 定義あり、呼び出しも確認要 | `.service-card__media img` への animation指定があるか要確認 |
| DRY違反 | `.bg-decor__cloud--{tl,tr,bl,br}` ×4セクションで同じ配置値を繰り返し | mixin化したい（Sass化前提） |
| 印刷スタイル | なし | `@media print` で最低限（URL非表示・地図非表示など） |
| ダークモード | なし | 介護サイト上、優先度低。**未対応でOK** |
| セレクタ詳細度 | 低〜中で健全 | OK |

### 1-4. JavaScript

| 項目 | 現状 | 問題 |
|---|---|---|
| モジュール化 | 単一IIFE 296行 | 将来セクション追加時に肥大化 |
| 防御コード | `document.getElementById('siteHeader')` → null時に `.classList` でエラー | `if (!header) return;` 入れるだけで堅牢 |
| KVスライダー | `setInterval` で永続実行（非表示時も動作） | `IntersectionObserver` で**KV画面外時は停止**が望ましい |
| KVパララックス | `scroll` リスナー常時実行 | 同上、KV可視時のみ |
| フォーム送信 | `action="#"` のまま | エンドポイント未設定（TODO済み） |
| honeypot（時間トラップ） | 実装済み | OK |
| tel: 難読化 | コメントのみで未実装 | 必須ではないが将来対応 |
| 分析タグ（GA4/Plausible等） | なし | 公開時に追加 |
| エラーロギング | なし | `window.addEventListener('error', ...)` でSentry等連携の余地 |
| formLoadedAt | `let` でスコープ内OK | OK |

### 1-5. アクセシビリティ

- ✅ `aria-hidden`・`aria-expanded`・`aria-controls`・`aria-label`・`role="status"`・`aria-live="polite"` は適切
- ✅ focus trap 実装済み（overlay）
- ✅ `prefers-reduced-motion` 対応済み
- ❌ **スキップリンクなし**（`<a href="#top" class="skip-link">本文へ</a>` を最上部に）
- ❌ ハンバーガー以外のボタンに `aria-label` 付いていないケース（`.overlayCloseBtn` はOK）
- ⚠️ フッターの `rgba(255,255,255,0.55)` on `#0F2E54` は **コントラスト比 約3.9:1（AA基準4.5:1未満）** — 本文ではないコピーライトだが、念のため `0.7` に
- ⚠️ フォーム各フィールドに `aria-describedby` でエラーメッセージを紐づけると改善

### 1-6. SEO

- ✅ OGP設定あり
- ✅ description設定あり
- ❌ **JSON-LD未設定**（`NonprofitOrganization` / `LocalBusiness` / `BreadcrumbList`）
- ❌ `<link rel="canonical">` なし
- ❌ Twitter Cards（`twitter:card`）なし
- ❌ `sitemap.xml` `robots.txt` の存在確認（別PJで管理なら不要）
- ⚠️ `<h1>` はKVの「人生の旅立ちを、はじまりに。」 — 理念としては良いが、**事業名「はじまりの家そら」がh1の方がSEO強度が高い**（要議論）

### 1-7. セキュリティ・運用

- ✅ `rel="noopener noreferrer"` 外部リンクに付与
- ✅ `referrerpolicy` on Google Maps
- ❌ Google Maps iframe に `sandbox` 属性なし（厳密には `sandbox="allow-scripts allow-same-origin allow-popups"`）
- ❌ `<meta http-equiv="Content-Security-Policy">` なし（サーバーヘッダで対応する想定ならOK）
- ❌ フォームCSRF対策（バックエンド実装時に必須）

---

## 2. リファクタリング方針（4フェーズ）

### 🟥 Phase 1：公開前に必ず対応（最優先・合計 4〜6時間）

公開前に**絶対やるべき**もの。パフォーマンス改善の寄与が大きい順。

#### 1-A. 画像最適化（最大効果）

- `image.jpg` / `image1.jpg` を **WebP変換＋長辺1600pxに縮小**（現状はおそらくカメラ原寸）
  - 想定：1.28MB → **180〜260KB**（約85%削減）
- すべての `<img>` に **`width`/`height` 属性を明示**（CLS対策）
- KVスライダー画像は `<picture>` + `srcset` で 1600w / 1024w / 640w を用意：
  ```html
  <picture>
    <source type="image/avif" srcset="./images/image.avif 1600w, ./images/image-1024.avif 1024w" sizes="(max-width: 768px) 100vw, 60vw">
    <source type="image/webp" srcset="./images/image.webp 1600w, ./images/image-1024.webp 1024w" sizes="...">
    <img src="./images/image.jpg" alt="" width="1600" height="1066" class="kv__img is-active" loading="eager" fetchpriority="high">
  </picture>
  ```
- KV最初の画像に `fetchpriority="high"` と `preload`：
  ```html
  <link rel="preload" as="image" href="./images/image.webp" imagesrcset="./images/image-1024.webp 1024w, ./images/image.webp 1600w">
  ```
- `icon.png` (121KB) は **SVG化**を検討。ブランドロゴは縮尺依存しないSVGが理想

**所要：1.5h**／ **効果：LCP 1.5〜2.5s 改善**

#### 1-B. Google Fonts 軽量化

- 現状9バリアント → **必要最小構成に削る**
  - Noto Serif JP: 500/700 の2ウェイトに
  - Noto Sans JP: 400/500 のまま（既に最小）
  - Cormorant Garamond: italic 400 と regular 500 の2つだけ
- `&display=swap` は維持
- 日本語のサブセット化（文字セット絞り込み）は Google Fonts 側で自動なので不要だが、**日本語のWebfontは重いため、重要な箇所以外は `system-ui` フォールバック**も検討

**所要：0.5h**／ **効果：FCP 300〜600ms 改善**

#### 1-C. 雲SVGとアイコンの一元化（SVG Sprite化）

HTML上部の `<svg><defs>` ブロックに以下を登録：

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <!-- 既存のclipPath群 -->
    <clipPath id="kv-mask">...</clipPath>
    ...

    <!-- 新規：雲シンボル -->
    <symbol id="icon-cloud" viewBox="0 0 200 80">
      <path d="M30 60 Q10 60 10 40 Q10 20 30 22 Q40 5 60 12 Q80 0 95 18 Q120 12 125 35 Q145 38 145 55 Q145 70 125 70 L40 70 Q30 70 30 60 Z"/>
    </symbol>

    <!-- 新規：右矢印 -->
    <symbol id="icon-arrow-right" viewBox="0 0 24 24">
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
    </symbol>

    <!-- Instagram/LINE/波線/電話 も同様に -->
  </defs>
</svg>
```

呼び出し側：

```html
<svg class="cloud cloud--kv1" aria-hidden="true"><use href="#icon-cloud" fill="rgba(255,255,255,0.6)"/></svg>
```

**削減効果：HTML約300行減**／ **効果：転送サイズ約8KB減／メンテ大幅向上**

**所要：1.5h**

#### 1-D. `style="clip-path: url(#...)"` をCSSへ

`.target-card:nth-child(N) .target-card__media img` に寄せる：

```css
.target__grid > .target-card:nth-child(1) img { clip-path: url(#target-mask-1); }
.target__grid > .target-card:nth-child(2) img { clip-path: url(#target-mask-2); }
.target__grid > .target-card:nth-child(3) img { clip-path: url(#target-mask-3); }
```

**所要：10分**

#### 1-E. デッドコード削除

- `.marquee__item` 参照（l.1999）削除 — 対応するHTML要素がない
- `// 7. tel: リンク 簡易難読化` コメントブロック（l.209-213）— 将来実装予定ならTODOに格上げ、不要なら削除
- `TODO:` コメントの棚卸し：
  - `href="#"`（SNS×2）
  - `href="#"`（お知らせもっと読む）
  - `action="#"`（フォーム）
  - `href="/donation/"` など下層別PJ
  - → 未確定URLは **`data-coming-soon` 属性** に置き換え、JSでクリック時「準備中です」トースト表示する方法も検討

**所要：30分**

#### 1-F. JS 防御コード

`script.js` 冒頭の各要素取得に null ガード：

```js
const header = document.getElementById('siteHeader');
if (!header) return;
```

同様に `hamburger` / `overlay` / `contactForm` / `kvMedia` 等すべて。

**所要：20分**

---

### 🟧 Phase 2：保守性の底上げ（中優先・合計 4〜5時間）

#### 2-A. CSS ファイル分割

`style.css` (2,068行) を **役割別に8ファイルに分割**し、`style.css` は `@import` のみにする（または build tool を導入）。

```
css/
├── style.css            （エントリーポイント・@importのみ）
├── _variables.css       （:root, tokens）
├── _reset.css           （reset, body, utility）
├── _components.css      （.en-sub, .section-title, .link-arrow, .btn）
├── _header.css          （site-header, hamburger, overlay-menu）
├── _sections.css        （kv, philosophy, numbers, services, target, voices, news, contact, access）
├── _marquee-cta.css     （marquee, cta）
├── _footer.css
└── _responsive.css      （@media 全部）
```

**注意**：HTTP/2前提ならファイル分割のリクエストコストは小さいが、**HTTP/1.1 / 古いサーバーの場合はbuild toolで結合**（postcss-import等）すべき。

**所要：1.5h**

#### 2-B. HTML セクションのパーシャル化

現状はすべて `index.html` 内。静的サイトジェネレータ（11ty/Astro）や PHP include を使えるなら、セクション単位に分割：

```
partials/
├── head.html
├── header.html
├── overlay-menu.html
├── kv.html
├── philosophy.html
├── numbers.html
├── services.html    ← データは JSON に分離
├── target.html
├── voices.html      ← 同上
├── news.html        ← 同上
├── contact.html
├── access.html
├── cta.html
└── footer.html
```

static HTMLのみで運用する場合は、**VSCode のカスタムスニペット**で分離するだけでも可。

**所要：2h（分離のみ／ビルド構築なら+2h）**

#### 2-C. コンテンツのデータ駆動化

`services` `target` `voices` `news` の4セクションは**繰り返し構造**。以下のJSONを用意し、JSでテンプレートレンダー：

```json
// data/services.json
[
  {
    "num": "01",
    "title": "みんなのホームそら",
    "label": "コミュニティ",
    "desc": "地域・多世代が集う開かれた場。...",
    "image": "./images/image.jpg",
    "link": "/services/community/"
  },
  ...
]
```

News は特に更新頻度が高いので、このデータ化が**後で最もROIが高い**。

**所要：2h（4セクション）**

#### 2-D. 画像命名の見直し

現状：`image.jpg`, `image1.jpg`, `image2.jpeg`, ... **何の画像か分からない**。

```
提案：
  image.jpg   → kv-01.jpg（KV 1枚目）
  image1.jpg  → kv-02.jpg
  image6.jpeg → kv-03.jpg
  image4.jpeg → service-visiting-nursing.jpg
  image5.jpeg → service-care.jpg
  image2.jpeg → service-home.jpg
  image3.jpeg → target-medical.jpg
```

HTMLのsrc書換えが伴うのでPhase 1と同時実施が効率的。

**所要：30分**

---

### 🟨 Phase 3：アクセシビリティ・SEO強化（中優先・合計 2〜3時間）

#### 3-A. Skip Link 追加

`<body>` 直後に：

```html
<a href="#top" class="skip-link">本文へスキップ</a>
```

CSS：
```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--color-deep);
  color: #fff;
  padding: 12px 16px;
  z-index: 9999;
}
.skip-link:focus { left: 16px; top: 16px; }
```

#### 3-B. JSON-LD（構造化データ）

`</head>` 手前に追加：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["NGO", "LocalBusiness"],
  "name": "NPO法人コミュニティケア・ライフ",
  "alternateName": "はじまりの家そら",
  "url": "https://example.jp/",
  "logo": "https://example.jp/images/icon.png",
  "telephone": "+81-42-403-5850",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "前沢5-5-11",
    "addressLocality": "東久留米市",
    "addressRegion": "東京都",
    "postalCode": "203-0032",
    "addressCountry": "JP"
  },
  "openingHours": "Mo-Fr 09:00-17:30"
}
</script>
```

#### 3-C. h1見直し議論

- 現状：KV「人生の旅立ちを、はじまりに。」が h1
- 案：KVを h1 のまま維持し、`<meta name="title">` に事業名を明示 → 検索結果タイトルに影響大（既に `<title>` で対応済みなので現状でOK）
- **判断：現状維持でOK**。ただしKV h1に `aria-describedby` で事業名を補足するとベター

#### 3-D. フォーム UX 強化

- `<input>` に `aria-describedby` でエラーメッセージ要素を紐づけ
- submit時にエラーのあるフィールドへスクロール＆フォーカス
- `aria-invalid="true"` をエラーフィールドに付与
- 成功メッセージに `role="status"` は既にあり

#### 3-E. `<meta name="theme-color">`

```html
<meta name="theme-color" content="#2E7DD1">
<meta name="theme-color" content="#0F2E54" media="(prefers-color-scheme: dark)">
```

#### 3-F. `<link rel="canonical">`

本番URLが確定したら：
```html
<link rel="canonical" href="https://example.jp/">
```

**所要：合計 2h**

---

### 🟩 Phase 4：将来対応・+α（低優先・やれると良い）

#### 4-A. Lighthouse 計測とチューニング

Phase 1-3 後に Lighthouse を回し、以下の目標：

| 指標 | 目標 |
|---|---|
| Performance | **90+** |
| Accessibility | **95+** |
| Best Practices | 95+ |
| SEO | 100 |
| LCP | 2.5s以下 |
| CLS | 0.1以下 |
| TBT | 200ms以下 |

#### 4-B. IntersectionObserver でKVアニメ停止

```js
const kvSection = document.querySelector('.kv');
const kvObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // 画面外ならsetInterval停止、画面内で再開
  });
});
kvObserver.observe(kvSection);
```

#### 4-C. ビルドツール導入

- Vite / Parcel で CSS/JS のminify・bundle
- 画像は `vite-plugin-imagemin` 等で自動最適化
- HTML は 11ty / Astro でパーシャル化 + 静的生成

**判断**：更新頻度が低いブランドサイトなら、必須ではない。News更新があるならWordPress/micro CMS連携を検討。

#### 4-D. 分析・エラー監視

- Google Analytics 4 または Plausible Analytics 導入
- フォーム送信イベントのカスタムイベント化
- JS エラーの Sentry 連携

#### 4-E. 印刷CSS

```css
@media print {
  .site-header, .overlay-menu, .hamburger, .cta, .marquee, .access__map { display: none; }
  body { color: #000; background: #fff; }
  a::after { content: " (" attr(href) ")"; font-size: 0.8em; color: #555; }
}
```

#### 4-F. CSP（Content Security Policy）

サーバー配信時にレスポンスヘッダで：
```
Content-Security-Policy: default-src 'self'; img-src 'self' https://www.google.com; ...
```

---

## 3. 実施チェックリスト（Claude Code に順次依頼可）

### Phase 1（最優先）
- [ ] 1-A-1. `image.jpg` / `image1.jpg` を WebP/AVIF に変換、1600pxに縮小
- [ ] 1-A-2. すべての `<img>` に `width` `height` 属性を追加
- [ ] 1-A-3. KV画像を `<picture>` + `srcset` 化
- [ ] 1-A-4. KV1枚目に `fetchpriority="high"` と `<link rel="preload">`
- [ ] 1-A-5. `icon.png` を SVG 化検討
- [ ] 1-B. Google Fonts のウェイト削減（9 → 5程度）
- [ ] 1-C-1. `<defs><symbol>` に cloud・arrow・Instagram・LINE・wave・phone を定義
- [ ] 1-C-2. 各セクションの雲SVGを `<use href="#icon-cloud" fill="...">` に置換
- [ ] 1-C-3. news-card の矢印SVGを `<use href="#icon-arrow-right">` に置換
- [ ] 1-D. target-card の `style="clip-path: ..."` をCSSに移動
- [ ] 1-E-1. `.marquee__item` デッドコード削除（CSS l.1999）
- [ ] 1-E-2. TODO・`href="#"` の棚卸し
- [ ] 1-F. JS 各 element 取得に null ガード追加

### Phase 2
- [ ] 2-A. CSS を8ファイルに分割・`@import`
- [ ] 2-B. HTMLセクションをパーシャル化
- [ ] 2-C-1. `data/services.json` 作成・JSでレンダー
- [ ] 2-C-2. `data/voices.json` 作成・JSでレンダー
- [ ] 2-C-3. `data/news.json` 作成・JSでレンダー
- [ ] 2-D. 画像ファイル命名リファクタ

### Phase 3
- [ ] 3-A. Skip Link 追加
- [ ] 3-B. JSON-LD 追加
- [ ] 3-D. フォーム UX 強化（aria-describedby / エラーフォーカス）
- [ ] 3-E. `<meta name="theme-color">`
- [ ] 3-F. `<link rel="canonical">`

### Phase 4
- [ ] 4-A. Lighthouse 計測
- [ ] 4-B. IntersectionObserver でKVアニメ停止制御
- [ ] 4-C. ビルドツール導入（必要であれば）
- [ ] 4-D. 分析タグ導入
- [ ] 4-E. 印刷CSS
- [ ] 4-F. CSP設定（サーバーサイド）

---

## 4. やらない判断（スコープ外）

| 項目 | 理由 |
|---|---|
| ダークモード | 介護サイトではニーズ低・白基調の世界観が損なわれる |
| PWA化（Service Worker） | ブローシャーサイトには過剰 |
| i18n（多言語対応） | 日本語単一サイトで要件外 |
| React/Vue化 | 静的サイトのまま十分軽量。SPA化はオーバーエンジニアリング |

---

## 5. 推定効果（Before → After）

| 指標 | Before | After（Phase 1 のみ） | After（Phase 1-3） |
|---|---|---|---|
| ページ重量 | 約 **3.6MB** | **約600KB** | 約500KB |
| LCP（4G） | 3.5〜4.5s | 1.8〜2.3s | 1.5〜2.0s |
| CLS | 0.15前後（推定） | 0.05以下 | 0.05以下 |
| Lighthouse Perf | 50〜60 | 85〜92 | 90〜95 |
| Lighthouse A11y | 85前後 | 88 | 95+ |
| コード行数（HTML） | 789 | **約500**（SVG整理） | 約300（パーシャル分離で個別に） |
| コード行数（CSS） | 2,068 | 2,050（僅減） | 分割で各200〜400 |

---

## 6. 優先して欲しい対応（推奨）

「全部やるのは時間がない」場合、**以下3点だけでも公開前に必ず**：

1. **1-A 画像最適化**（半日で3.6MB → 600KB）
2. **1-E TODOとデッドリンクの棚卸し**（公開後に404を出さないため）
3. **1-F JS null ガード**（JSエラーで表示崩れ防止）

この3つだけで、サイトの**信頼性とSEO評価の底が上がる**。残りのSVG一元化・CSS分割は「公開後の継続改善」でも遅くない。

---

*— 以上、実装は御社 Claude Code 側で。各フェーズ個別に依頼いただければ、詳細な実装スニペットまで落とし込みます。*
