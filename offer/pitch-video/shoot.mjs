import { chromium } from "/home/user/hidento/node_modules/playwright/index.mjs";
const ids = ["intro","idea","erp","portal","smile","dento","new","quality","revenue","honest","cta"];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
for (const id of ids) { await p.goto(`file://${process.cwd()}/scenes.html?s=${id}`); await p.waitForTimeout(700); await p.screenshot({ path: `frames/${id}.png` }); }
await b.close();
