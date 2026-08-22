const homeSoraSections = [
  ["home-sora-feature home-sora-feature--air reveal", "air"],
  ["home-sora-feature home-sora-feature--food reveal", "food"],
  ["home-sora-feature home-sora-feature--plants reveal", "plants"],
  ["home-sora-feature home-sora-feature--sound reveal", "sound"],
  ["home-sora-feature home-sora-feature--bedding reveal", "bedding"],
  ["home-sora-gallery reveal", "gallery"]
];

export function applyPageTransforms(markup, output) {
  if (output !== "home-sora/index.html") return markup;

  return homeSoraSections.reduce(
    (html, [className, id]) => html.replace(`class="${className}"`, `class="${className}" id="${id}"`),
    markup
  );
}
