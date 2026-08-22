export const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  "\"": "&quot;"
}[character]));

export function siteHref(root, href) {
  return /^(https?:|mailto:|tel:)/.test(href) ? href : `${root}${href}`;
}

export function render(template, context) {
  return template.replace(/{{([a-zA-Z]+)}}/g, (token, key) => context[key] ?? token);
}
