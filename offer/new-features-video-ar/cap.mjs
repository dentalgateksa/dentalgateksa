import { chromium } from "/home/user/hidento/node_modules/playwright/index.mjs";
const D = process.argv[2];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const q = await ctx.newPage();
await q.addInitScript(() => { window.print = () => {}; window.open = () => null; try { localStorage.setItem("hidento_changelog_seen", "x"); } catch {} });
await q.goto("http://localhost:5199/#staff"); await q.waitForTimeout(3000);
const i = q.locator("input"); await i.nth(0).fill("demo_admin"); await i.nth(1).fill("Demo12345!"); await q.keyboard.press("Enter"); await q.waitForTimeout(5500);
await q.locator('button[aria-label="close"]').first().click().catch(() => {}); await q.waitForTimeout(500);
const go = async (h, w = 2500) => { await q.evaluate((x) => { location.hash = x; }, h); await q.waitForTimeout(w); };
// calendar
await go("#staff/cases"); await q.getByRole("tab", { name: "تقويم التسليمات" }).click(); await q.waitForTimeout(1200);
await q.screenshot({ path: `${D}/calendar.png` });
// cases list with ready WhatsApp + toast
await q.getByRole("tab", { name: "قائمة" }).click(); await q.waitForTimeout(800);
const sel = q.locator("table select").filter({ hasText: "تم الاستلام" }).nth(1);
await sel.selectOption("ready").catch(() => {}); await q.waitForTimeout(1800);
await q.screenshot({ path: `${D}/ready.png` });
// monthly report modal
await go("#staff/accounts"); await q.locator("table").getByRole("button", { name: "تقرير شهري" }).first().click(); await q.waitForTimeout(2500);
await q.screenshot({ path: `${D}/report-modal.png` });
await q.getByRole("button", { name: /طباعة \/ حفظ PDF/ }).click(); await q.waitForTimeout(1500);
const html = await q.evaluate(() => [...document.querySelectorAll("iframe")].pop()?.contentDocument?.documentElement.outerHTML);
const pp = await ctx.newPage(); await pp.setViewportSize({ width: 794, height: 1123 }); await pp.setContent(html); await pp.waitForTimeout(2500);
await pp.screenshot({ path: `${D}/report-pdf.png` }); await pp.close();
await q.keyboard.press("Escape"); await q.locator('[aria-label="إغلاق"]').first().click().catch(() => {});
// quick search (light) then dark dashboard
await go("#staff/dashboard"); await q.keyboard.press("Control+k"); await q.waitForTimeout(400); await q.keyboard.type("wilson", { delay: 60 }); await q.waitForTimeout(1200);
await q.screenshot({ path: `${D}/search.png` }); await q.keyboard.press("Escape");
await q.evaluate(() => localStorage.setItem("hidento_theme", "dark")); await q.reload(); await q.waitForTimeout(5000);
await q.locator('button[aria-label="close"]').first().click().catch(() => {});
await go("#staff/dashboard", 2500); await q.screenshot({ path: `${D}/dark.png` });
await q.evaluate(() => localStorage.setItem("hidento_theme", "light"));
// doctor portal (phone)
const c2 = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const m = await c2.newPage();
await m.goto("http://localhost:5199/"); await m.waitForTimeout(2500);
await m.getByRole("button", { name: /Smile designer|مصمم الابتسامة/ }).first().click(); await m.waitForTimeout(1500);
const f = m.locator(".fixed"); if (await f.locator("input[type=email]").count()) { await f.locator("input[type=email]").fill("dr.e2e.1790427895695@gmail.com"); await f.locator("input[type=password]").fill("Doctor12345!"); await f.locator("button[type=submit]").first().click(); await m.waitForTimeout(4000); }
await m.goto("http://localhost:5199/?lab=qa-lab"); await m.waitForTimeout(3500);
await m.getByRole("button", { name: /تابع حالاتك|تتبع/ }).first().click(); await m.waitForTimeout(4000);
await m.evaluate(() => { const a = document.querySelectorAll("article")[0]; a?.scrollIntoView({ block: "start" }); window.scrollBy(0, -330); }); await m.waitForTimeout(800);
await m.screenshot({ path: `${D}/m-track.png` });
await m.evaluate(() => window.scrollTo(0, 0)); await m.waitForTimeout(500);
await m.screenshot({ path: `${D}/m-verify.png` });
// forgot password (desktop, signed out)
const c3 = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 }); const r = await c3.newPage();
await r.goto("http://localhost:5199/?lab=qa-lab"); await r.waitForTimeout(3500);
await r.getByRole("button", { name: /تتبع حالاتي/ }).first().click(); await r.waitForTimeout(2000);
await r.getByRole("button", { name: "نسيت كلمة المرور؟" }).click(); await r.waitForTimeout(800);
await r.screenshot({ path: `${D}/forgot.png` });
await b.close();
