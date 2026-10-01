import { chromium } from "/home/user/hidento/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2";
const FPS = 25;
const scenes = [["intro",6],["idea",7],["erp",7],["qr",7.5],["portal",7],["ratings",7],["loyalty",7],["smile",7],["dento",6.5],["auto",7],["quality",7],["revenue",8.5],["cta",7.5]];
const only = process.argv[2];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
fs.mkdirSync("clips", { recursive: true });
for (const [id, dur] of scenes) {
  if (only && only !== id) continue;
  await p.goto(`file://${process.cwd()}/scenes.html?s=${id}&d=${dur}`); await p.waitForLoadState("networkidle"); await p.evaluate(() => document.fonts.ready);
  const n = Math.round(dur * FPS);
  const ff = (await import("node:child_process")).spawn(FF, ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", `clips/${id}.mp4`], { stdio: ["pipe", "ignore", "ignore"] });
  for (let f = 0; f < n; f++) {
    await p.evaluate((t) => window.seek(t), f / FPS);
    const buf = await p.screenshot({ type: "jpeg", quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
  console.log(id, n);
}
await b.close();
