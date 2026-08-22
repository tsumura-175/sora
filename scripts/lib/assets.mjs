import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function assembleFile(partsDirectory, extension, output) {
  const partNames = (await readdir(partsDirectory)).filter((name) => name.endsWith(extension)).sort();
  const content = (await Promise.all(
    partNames.map((name) => readFile(join(partsDirectory, name), "utf8"))
  )).join("").replace(/\r?\n+$/, "\n");

  await writeFile(output, content, "utf8");
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

  await Promise.all([
    assembleFile(
      join(sourceRoot, "assets", "css", "base-parts"),
      ".css",
      join(projectRoot, "css", "base.css")
    ),
    assembleFile(
      join(sourceRoot, "assets", "js", "script-parts"),
      ".js",
      join(projectRoot, "js", "script.js")
    )
  ]);

  await Promise.all([
    rm(join(projectRoot, "css", "base-parts"), { recursive: true, force: true }),
    rm(join(projectRoot, "js", "script-parts"), { recursive: true, force: true }),
    rm(join(projectRoot, "images", "selected", "originals"), { recursive: true, force: true }),
    rm(join(projectRoot, "images", "selected", "README.md"), { force: true }),
    rm(join(projectRoot, "images", "selected", "selection-map.csv"), { force: true })
  ]);
}
