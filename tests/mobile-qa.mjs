import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";

const executablePath = process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const base = process.env.SITE_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath, headless: true });
const failures = [];
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const path of ["/", "/explore", "/demo", "/privacy"]) {
      await page.goto(new URL(path, base).href);
      await page.waitForLoadState("networkidle");
      if (process.env.QA_SCREENSHOT && viewport.width === 390 && path === "/explore") await page.screenshot({ path: process.env.QA_SCREENSHOT });
      const overflow = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        offenders: [...document.querySelectorAll("body *")].filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0, 8).map(element => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right })) }));
      console.log(`${viewport.width}px ${path}: width=${overflow.width}, scroll=${overflow.scroll}`);
      if (overflow.scroll > overflow.width + 1) console.log(overflow.offenders);
      if (overflow.scroll > overflow.width + 1) failures.push(`Horizontal overflow on ${path} at ${viewport.width}px`);
      const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      const serious = accessibility.violations.filter(item => item.impact === "critical" || item.impact === "serious");
      if (serious.length) {
        console.log(JSON.stringify(serious.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, data: node.any[0]?.data })) }))));
        failures.push(`Accessibility issues on ${path} at ${viewport.width}px`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
assert.deepEqual(failures, []);
