import { chromium } from "/home/user/hidento/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 2 });
await p.goto("file://" + process.cwd() + "/offer-v2-ar.html"); await p.waitForTimeout(2000);
await p.screenshot({ path: "Hidento-Offer-AR-v2.png", fullPage: true });
await b.close();
