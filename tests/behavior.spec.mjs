import { expect, test } from "@playwright/test";
import { waitForStablePage } from "./helpers.mjs";

test.use({ viewport: { width: 1280, height: 800 } });

test("overlay menu opens, switches panels and closes with Escape", async ({ page }) => {
  await page.goto("/");
  await waitForStablePage(page);

  await page.locator("#hamburger").evaluate((element) => element.click());
  await expect(page.locator("#overlayMenu")).toHaveClass(/is-open/);
  await expect(page.locator("#hamburger")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).toHaveClass(/menu-open/);

  const triggers = page.locator("[data-overlay-nav-trigger]");
  await triggers.nth(1).evaluate((element) => element.click());
  await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Escape");
  await expect(page.locator("#overlayMenu")).not.toHaveClass(/is-open/);
  await expect(page.locator("#hamburger")).toHaveAttribute("aria-expanded", "false");
});

test("same-page contact link closes the overlay and keeps the inquiry preset", async ({ page }) => {
  await page.goto("/");
  await waitForStablePage(page);

  await page.locator("#hamburger").evaluate((element) => element.click());
  await page.locator('#overlayMenu a[href*="inquiry=visit"]').first().evaluate((element) => element.click());
  await expect(page.locator("#overlayMenu")).not.toHaveClass(/is-open/);
  await expect(page).toHaveURL(/\?inquiry=visit#contact$/);
  await expect(page.locator("#f-type")).toHaveValue("見学・ご相談予約");
});

test("recruitment inquiry preset selects recruitment", async ({ page }) => {
  await page.goto("/?inquiry=recruit#contact");
  await waitForStablePage(page);
  await expect(page.locator("#f-type")).toHaveValue("採用について");
});

test("contact form retains its validation behavior", async ({ page }) => {
  await page.goto("/#contact");
  await waitForStablePage(page);
  await page.waitForTimeout(3_100);
  await page.locator("#contactForm button[type=submit]").click();
  await expect(page.locator("#formStatus")).toHaveClass(/is-error/);
  await expect(page.locator("#f-type")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#f-name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#f-email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#f-message")).toHaveAttribute("aria-invalid", "true");
});

test("recruitment FAQ opens and closes natively", async ({ page }) => {
  await page.goto("/recruit/#faq");
  await waitForStablePage(page);
  const item = page.locator(".recruit-faq__item").first();
  await item.locator("summary").click();
  await expect(item).toHaveAttribute("open", "");
  await item.locator("summary").click();
  await expect(item).not.toHaveAttribute("open", "");
});

test("top-page KV retains three slides and advances", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await waitForStablePage(page);
  const slides = page.locator("[data-kv-slider] .kv__img");
  await expect(slides).toHaveCount(3);
  await expect(slides.nth(0)).toHaveClass(/is-active/);
  await page.waitForTimeout(5_200);
  await expect(slides.nth(1)).toHaveClass(/is-active/);
});

test("floating CTA hides after the end boundary", async ({ page }) => {
  await page.goto("/recruit/");
  await waitForStablePage(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);
  await expect(page.locator("body")).toHaveClass(/is-cta-visible/);
});
