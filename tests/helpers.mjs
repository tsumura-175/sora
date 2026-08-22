import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findPageConfigs } from "../scripts/pages.mjs";

export const pageConfigs = await findPageConfigs(process.cwd());

export function routeForOutput(output) {
  return output === "index.html" ? "/" : `/${output.replace(/index\.html$/, "")}`;
}

export function snapshotName(output, suffix) {
  const slug = output === "index.html" ? "home" : output.replace(/\/index\.html$/, "").replaceAll("/", "--");
  return `${slug}.${suffix}`;
}

export async function readOutput(output) {
  return readFile(join(process.cwd(), output), "utf8");
}

export function normalizeGeneratedHtml(html) {
  return html
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

export async function waitForStablePage(page) {
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(100);
}
