import { escapeHtml, render, siteHref } from "./html.mjs";

export function renderOverlayNavigation(items, root) {
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

export function renderNavigation(items, root, type, activePrimaryHref = null) {
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

export function renderPageHero(template, hero, root) {
  const responsive = hero.sources?.length
    ? ` srcset="${hero.sources.map(({ src, width }) => `${root}${src} ${width}w`).join(", ")}" sizes="${escapeHtml(hero.sizes)}"`
    : "";
  const objectPosition = hero.objectPosition ?? "center 40%";
  const mobileObjectPosition = hero.mobileObjectPosition ?? objectPosition;

  return render(template, {
    root,
    heroImageSrc: `${root}${hero.image}`,
    heroResponsiveAttributes: responsive,
    heroImageWidth: hero.width,
    heroImageHeight: hero.height,
    heroImageStyle: ` style="--page-kv-object-position: ${escapeHtml(objectPosition)}; --page-kv-object-position-mobile: ${escapeHtml(mobileObjectPosition)};"`,
    heroEn: escapeHtml(hero.en),
    heroTitle: escapeHtml(hero.title),
    heroCloudThree: hero.includeThirdCloud === false ? "" : `    <svg class="cloud page-kv__cloud--3" viewBox="0 0 200 80"><use href="${root}images/icons.svg#icon-cloud" fill="rgba(255,255,255,0.55)"/></svg>`,
    pageBreadcrumbs: renderBreadcrumbs(hero.breadcrumbs, root)
  });
}

export function renderPageRelated(template, items, root) {
  const relatedItems = items.map((item) => `      <li><a href="${siteHref(root, item.href)}" class="page-related__link"><span class="page-related__en">${escapeHtml(item.en)}</span><span class="page-related__jp">${escapeHtml(item.label)}</span><span class="page-related__arrow" aria-hidden="true">→</span></a></li>`).join("\n");
  return render(template, { relatedItems });
}

export function renderPageAnchors(template, anchorNavigation) {
  const items = anchorNavigation.items ?? [];
  const anchorItems = items.map((item) => `    <li class="page-anchor-nav__item"><a href="#${escapeHtml(item.id)}" class="page-anchor-nav__link"><em class="page-anchor-nav__en">${escapeHtml(item.en)}</em><span class="page-anchor-nav__jp">${escapeHtml(item.label)}</span><span class="page-anchor-nav__arrow" aria-hidden="true">↓</span></a></li>`).join("\n");
  const sideNavItems = items.map((item) => `    <li class="page-side-nav__item"><a href="#${escapeHtml(item.id)}" class="page-side-nav__link" data-target="${escapeHtml(item.id)}"><em class="page-side-nav__en">${escapeHtml(item.en)}</em><span class="page-side-nav__jp">${escapeHtml(item.sideLabel ?? item.label)}</span></a></li>`).join("\n");

  return render(template, {
    anchorNavClass: anchorNavigation.className ? ` ${escapeHtml(anchorNavigation.className)}` : "",
    anchorItems,
    sideNavItems
  });
}
