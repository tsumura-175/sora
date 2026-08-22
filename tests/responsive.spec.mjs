import { expect, test } from "@playwright/test";
import { pageConfigs, routeForOutput, snapshotName, waitForStablePage } from "./helpers.mjs";

const viewports = [
  { name: "320", width: 320, height: 800 },
  { name: "375", width: 375, height: 812 },
  { name: "414", width: 414, height: 896 },
  { name: "768", width: 768, height: 900 },
  { name: "1280", width: 1280, height: 800 }
];

test.describe("responsive layout and visual baseline", () => {
  for (const { config } of pageConfigs) {
    for (const viewport of viewports) {
      test(`${config.output} @ ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(routeForOutput(config.output));
        await waitForStablePage(page);

        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth
        }));
        expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

        await expect(page).toHaveScreenshot(snapshotName(config.output, `${viewport.name}.png`), {
          animations: "disabled",
          caret: "hide",
          fullPage: false,
          mask: [page.locator("iframe")]
        });
      });
    }
  }
});
