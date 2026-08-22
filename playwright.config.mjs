import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.001
    }
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    reducedMotion: "reduce",
    colorScheme: "light",
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    serviceWorkers: "block"
  },
  webServer: {
    command: "node scripts/serve.mjs",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: false,
    timeout: 20_000
  }
});
