import { chromium } from "/home/user/hidento/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1400, height: 800 }, deviceScaleFactor: 2 });
await p.goto("file://" + process.cwd() + "/show.html"); await p.waitForTimeout(800);
await p.screenshot({ path: "Hidento-Code-Show.png", fullPage: true }); await b.close();
