import { dirname, join, relative } from "node:path";

export function rootForOutput(projectRoot, output) {
  const outputDirectory = dirname(join(projectRoot, output));
  const pathToRoot = relative(outputDirectory, projectRoot).replaceAll("\\", "/");
  return pathToRoot ? `${pathToRoot}/` : "./";
}

export function primaryHrefForOutput(output) {
  if (output === "index.html") return null;
  return `${output.split("/")[0]}/`;
}
