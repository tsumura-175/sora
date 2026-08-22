import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function assembleMainScript(sourceRoot, projectRoot) {
  const partsDirectory = join(sourceRoot, "assets", "js", "script-parts");
  const partNames = (await readdir(partsDirectory)).filter((name) => name.endsWith(".js")).sort();
  const script = (await Promise.all(
    partNames.map((name) => readFile(join(partsDirectory, name), "utf8"))
  )).join("").replace(/\r?\n+$/, "\n");

  await writeFile(join(projectRoot, "js", "script.js"), script, "utf8");
  await rm(join(projectRoot, "js", "script-parts"), { recursive: true, force: true });
}

export async function copyGeneratedAssets(sourceRoot, projectRoot) {
  await Promise.all([
    rm(join(projectRoot, "css"), { recursive: true, force: true }),
    rm(join(projectRoot, "js"), { recursive: true, force: true }),
    rm(join(projectRoot, "images"), { recursive: true, force: true })
  ]);

  await Promise.all([
    cp(join(sourceRoot, "assets", "css"), join(projectRoot, "css"), { recursive: true }),
    cp(join(sourceRoot, "assets", "js"), join(projectRoot, "js"), { recursive: true }),
    cp(join(sourceRoot, "assets", "images"), join(projectRoot, "images"), { recursive: true })
  ]);

  await assembleMainScript(sourceRoot, projectRoot);
  await Promise.all([
    rm(join(projectRoot, "images", "selected", "originals"), { recursive: true, force: true }),
    rm(join(projectRoot, "images", "selected", "README.md"), { force: true }),
    rm(join(projectRoot, "images", "selected", "selection-map.csv"), { force: true })
  ]);
}
