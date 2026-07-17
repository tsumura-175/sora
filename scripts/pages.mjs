import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

async function findPageDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const childDirectory = join(directory, entry.name);
    const childEntries = await readdir(childDirectory);
    if (childEntries.includes("page.json")) pages.push(childDirectory);
    pages.push(...await findPageDirectories(childDirectory));
  }

  return pages;
}

export async function findPageConfigs(projectRoot) {
  const directories = (await findPageDirectories(join(projectRoot, "src", "pages"))).sort();
  return Promise.all(directories.map(async (directory) => ({
    directory,
    config: JSON.parse(await readFile(join(directory, "page.json"), "utf8"))
  })));
}
