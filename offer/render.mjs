import { chromium } from "/home/user/hidento/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync } from "fs";
const base = readFileSync(process.argv[2] || "offer.html", "utf8");
const AR = (process.argv[2] || "").includes("-ar");
const vEn = {
  "Hidento-Offer-650k": `<div class="pbox"><div class="l">ASKING PRICE</div><div class="v">$650,000</div><div class="n">Negotiable · full asset sale</div></div><div class="pnote">Includes all source code, IP, three connected products, documentation and demo videos. Priced on replacement cost and time-to-market, not on current revenue.</div>`,
  "Hidento-Offer-NoPrice": `<div class="pbox"><div class="l">PRICE</div><div class="v">On request</div><div class="n">Full asset sale</div></div><div class="pnote">Includes all source code, IP, three connected products, documentation and demo videos. Priced on replacement cost and time-to-market, not on current revenue.</div>`,
};
const vAr = {
  "Hidento-Offer-AR-650k": `<div class="pbox"><div class="l">السعر المطلوب</div><div class="v" dir="ltr">$650,000</div><div class="n">قابل للتفاوض · بيع كامل للأصل</div></div><div class="pnote">يشمل الكود المصدري الكامل والملكية الفكرية والمنتجات الثلاثة المترابطة والتوثيق وفيديوهات العرض. السعر مبني على تكلفة إعادة البناء واختصار الوقت، وليس على إيرادات حالية.</div>`,
  "Hidento-Offer-AR-NoPrice": `<div class="pbox"><div class="l">السعر</div><div class="v">عند الطلب</div><div class="n">بيع كامل للأصل</div></div><div class="pnote">يشمل الكود المصدري الكامل والملكية الفكرية والمنتجات الثلاثة المترابطة والتوثيق وفيديوهات العرض. السعر مبني على تكلفة إعادة البناء واختصار الوقت، وليس على إيرادات حالية.</div>`,
};
const v = AR ? vAr : vEn;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 2 });
for (const [name, html] of Object.entries(v)) {
  writeFileSync("_t.html", base.replace("__PRICE__", html));
  await p.goto("file://" + process.cwd() + "/_t.html"); await p.waitForTimeout(1500);
  await p.screenshot({ path: name + ".png", fullPage: true });
}
await b.close();
