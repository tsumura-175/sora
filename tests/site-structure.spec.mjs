import { expect, test } from "@playwright/test";
import { normalizeGeneratedHtml, pageConfigs, readOutput, snapshotName } from "./helpers.mjs";

test.describe("generated HTML structure", () => {
  for (const { config } of pageConfigs) {
    test(config.output, async () => {
      const source = normalizeGeneratedHtml(await readOutput(config.output));
      expect(source).toMatchSnapshot(snapshotName(config.output, "html"));
    });
  }
});
