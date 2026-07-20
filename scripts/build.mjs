import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { findPageConfigs } from "./pages.mjs";

const projectRoot = process.cwd();
const sourceRoot = join(projectRoot, "src");
const read = (path) => readFile(path, "utf8");
const readOptional = async (path) => {
  try {
    return await read(path);
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
};

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  "\"": "&quot;"
}[character]));

function siteHref(root, href) {
  return href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href) ? href : `${root}${href}`;
}

function renderOverlayNavigation(items, root) {
  const renderLinks = (item) => {
    const children = item.children ?? [];
    return [
      `<a href="${siteHref(root, item.href)}" class="overlay-nav__detail-parent">トップを見る <span aria-hidden="true">→</span></a>`,
      ...children.map((child) => `<a href="${siteHref(root, child.href)}">${escapeHtml(child.label)} <span aria-hidden="true">→</span></a>`)
    ].join("\n              ");
  };

  const cards = items.map((item) => {
    const panelId = `overlay-nav-detail-${item.number}`;
    const isDefault = item.defaultOpen === true;
    return `        <li class="overlay-nav__item${isDefault ? " is-active" : ""}">
          <button type="button" class="overlay-nav__trigger" data-overlay-nav-trigger aria-controls="${panelId}" aria-expanded="${isDefault}">
            <span class="overlay-nav__num" aria-hidden="true">${escapeHtml(item.number)}</span>
            <span class="overlay-nav__en">${escapeHtml(item.en)}</span>
            <span class="overlay-nav__jp">${escapeHtml(item.jp)}</span>
            <span class="overlay-nav__trigger-arrow" aria-hidden="true">+</span>
          </button>
        </li>`;
  }).join("\n");

  const details = items.map((item) => {
    const isDefault = item.defaultOpen === true;
    return `        <section class="overlay-nav__detail-panel" id="overlay-nav-detail-${item.number}"${isDefault ? "" : " hidden"}>
          <div class="overlay-nav__detail-heading">
            <span class="overlay-nav__detail-en">${escapeHtml(item.en)}</span>
            <span class="overlay-nav__detail-jp">${escapeHtml(item.jp)}</span>
          </div>
          <div class="overlay-nav__detail-links">
              ${renderLinks(item)}
          </div>
        </section>`;
  }).join("\n");

  return { cards, details };
}

function renderNavigation(items, root, type, activePrimaryHref = null) {
  if (type === "primary") {
    return `<ul>\n${items.map((item) => {
      const isCurrent = item.href === activePrimaryHref;
      const currentAttributes = isCurrent ? ' class="is-current" aria-current="page"' : "";
      return `        <li><a href="${siteHref(root, item.href)}"${currentAttributes}>${escapeHtml(item.label)}</a></li>`;
    }).join("\n")}\n      </ul>`;
  }

  if (type === "overlay") {
    return renderOverlayNavigation(items, root).cards;
  }

  return items.map((item) => `      <div class="site-footer__col">
        <p class="site-footer__col-title">${item.href ? `<a href="${siteHref(root, item.href)}">${escapeHtml(item.label)}</a>` : escapeHtml(item.label)}</p>
        <ul>
${item.children.map((child) => `          <li><a href="${siteHref(root, child.href)}">${escapeHtml(child.label)}</a></li>`).join("\n")}
        </ul>
      </div>`).join("\n");
}

function render(template, context) {
  return template.replace(/{{([a-zA-Z]+)}}/g, (token, key) => context[key] ?? token);
}

function renderBreadcrumbs(items, root) {
  const breadcrumbs = items.map((item, index) => {
    const position = index + 1;
    const label = escapeHtml(item.label);
    if (Object.hasOwn(item, "href")) {
      return `      <li class="breadcrumb__item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a href="${siteHref(root, item.href)}" itemprop="item"><span itemprop="name">${label}</span></a><meta itemprop="position" content="${position}"></li>`;
    }
    return `      <li class="breadcrumb__item breadcrumb__item--current" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><span itemprop="name">${label}</span><meta itemprop="position" content="${position}"></li>`;
  }).join("\n");

  return `  <nav class="breadcrumb breadcrumb--on-kv" aria-label="現在地">
    <ol class="breadcrumb__list" itemscope itemtype="https://schema.org/BreadcrumbList">
${breadcrumbs}
    </ol>
  </nav>`;
}

function renderPageHero(template, hero, root) {
  const responsive = hero.sources?.length
    ? ` srcset="${hero.sources.map(({ src, width }) => `${root}${src} ${width}w`).join(", ")}" sizes="${escapeHtml(hero.sizes)}"`
    : "";

  return render(template, {
    root,
    heroImageSrc: `${root}${hero.image}`,
    heroResponsiveAttributes: responsive,
    heroImageWidth: hero.width,
    heroImageHeight: hero.height,
    heroEn: escapeHtml(hero.en),
    heroTitle: escapeHtml(hero.title),
    heroCloudThree: hero.includeThirdCloud === false ? "" : `    <svg class="cloud page-kv__cloud--3" viewBox="0 0 200 80"><use href="${root}images/icons.svg#icon-cloud" fill="rgba(255,255,255,0.55)"/></svg>`,
    pageBreadcrumbs: renderBreadcrumbs(hero.breadcrumbs, root)
  });
}

function renderPageRelated(template, items, root) {
  const relatedItems = items.map((item) => `      <li><a href="${siteHref(root, item.href)}" class="page-related__link"><span class="page-related__en">${escapeHtml(item.en)}</span><span class="page-related__jp">${escapeHtml(item.label)}</span><span class="page-related__arrow" aria-hidden="true">→</span></a></li>`).join("\n");
  return render(template, { relatedItems });
}

function renderPageAnchors(template, anchorNavigation) {
  const items = anchorNavigation.items ?? [];
  const anchorItems = items.map((item) => `    <li class="page-anchor-nav__item"><a href="#${escapeHtml(item.id)}" class="page-anchor-nav__link"><em class="page-anchor-nav__en">${escapeHtml(item.en)}</em><span class="page-anchor-nav__jp">${escapeHtml(item.label)}</span><span class="page-anchor-nav__arrow" aria-hidden="true">↓</span></a></li>`).join("\n");
  const sideNavItems = items.map((item) => `    <li class="page-side-nav__item"><a href="#${escapeHtml(item.id)}" class="page-side-nav__link" data-target="${escapeHtml(item.id)}"><em class="page-side-nav__en">${escapeHtml(item.en)}</em><span class="page-side-nav__jp">${escapeHtml(item.sideLabel ?? item.label)}</span></a></li>`).join("\n");

  return render(template, {
    anchorNavClass: anchorNavigation.className ? ` ${escapeHtml(anchorNavigation.className)}` : "",
    anchorItems,
    sideNavItems
  });
}

function addHomeSoraSectionAnchors(markup, output) {
  if (output !== "home-sora/index.html") return markup;

  const sections = [
    ["home-sora-feature home-sora-feature--air reveal", "air"],
    ["home-sora-feature home-sora-feature--food reveal", "food"],
    ["home-sora-feature home-sora-feature--plants reveal", "plants"],
    ["home-sora-feature home-sora-feature--sound reveal", "sound"],
    ["home-sora-feature home-sora-feature--bedding reveal", "bedding"],
    ["home-sora-gallery reveal", "gallery"]
  ];

  return sections.reduce(
    (html, [className, id]) => html.replace(`class="${className}"`, `class="${className}" id="${id}"`),
    markup
  );
}

function rootForOutput(output) {
  const outputDirectory = dirname(join(projectRoot, output));
  const pathToRoot = relative(outputDirectory, projectRoot).replaceAll("\\", "/");
  return pathToRoot ? `${pathToRoot}/` : "./";
}

function primaryHrefForOutput(output) {
  if (output === "index.html") return null;
  return `${output.split("/")[0]}/`;
}

const site = JSON.parse(await read(join(sourceRoot, "data", "site.json")));
const pages = await findPageConfigs(projectRoot);
const templates = Object.fromEntries(await Promise.all([
  "document-start",
  "header",
  "overlay-menu",
  "page-kv",
  "page-anchors",
  "page-related",
  "contact",
  "footer-wave",
  "floating-cta",
  "footer",
  "scripts"
].map(async (name) => [name, await read(join(sourceRoot, name === "document-start" ? "layouts" : "components", `${name}.html`))])));

for (const { directory: pageDirectory, config } of pages) {
  const root = rootForOutput(config.output);
  const overlayNavigation = renderOverlayNavigation(site.overlayNavigation, root);
  const [pageMainSource, pageAfterContact] = await Promise.all([
    read(join(pageDirectory, "main.html")),
    readOptional(join(pageDirectory, "after-contact.html"))
  ]);
  const pageMain = addHomeSoraSectionAnchors(pageMainSource, config.output);
  const context = {
    root,
    title: config.title,
    description: config.description,
    canonical: config.canonical,
    preload: config.preload ? render(config.preload, { root }) : "",
    contactTelHref: site.contact.telHref,
    contactTelDisplay: site.contact.telDisplay,
    contactHours: site.contact.hours,
    primaryNavigation: renderNavigation(site.primaryNavigation, root, "primary", primaryHrefForOutput(config.output)),
    overlayNavigation: overlayNavigation.cards,
    overlayNavigationDetails: overlayNavigation.details,
    footerNavigation: renderNavigation(site.footerNavigation, root, "footer"),
    pageHero: config.hero ? renderPageHero(templates["page-kv"], config.hero, root) : "",
    pageAnchors: config.anchorNavigation ? renderPageAnchors(templates["page-anchors"], config.anchorNavigation) : "",
    pageRelated: config.related ? renderPageRelated(templates["page-related"], config.related, root) : ""
  };

  const html = [
    "<!-- Generated by npm run build. Edit src/ files, not this file. -->",
    render(templates["document-start"], context),
    render(templates.header, context),
    render(templates["overlay-menu"], context),
    render(pageMain, context),
    render(templates.contact, context),
    render(pageAfterContact, context),
    "</main>",
    render(templates["footer-wave"], context),
    render(templates["floating-cta"], context),
    render(templates.footer, context),
    render(templates.scripts, context)
  ].join("\n");

  const output = join(projectRoot, config.output);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, "utf8");
}

await rm(join(projectRoot, "css"), { recursive: true, force: true });
await rm(join(projectRoot, "js"), { recursive: true, force: true });
await rm(join(projectRoot, "images"), { recursive: true, force: true });
await cp(join(sourceRoot, "assets", "css"), join(projectRoot, "css"), { recursive: true });
await cp(join(sourceRoot, "assets", "js"), join(projectRoot, "js"), { recursive: true });
await cp(join(sourceRoot, "assets", "images"), join(projectRoot, "images"), { recursive: true });

console.log(`Built ${pages.length} GitHub Pages preview pages from src/.`);
