# DENTALGATE — Digital Dental Lab

موقع معمل أسنان رقمي (عربي / إنجليزي): الرئيسية، من نحن، ورفع الحالات.
رفع الحالات بيتم عن طريق حساب المعمل على **dentlflow**، والموقع بيودّي الدكتور على لينك الرفع بتاعه.

## تغيير لينك رفع الحالات

افتح `config.js` على GitHub ← أيقونة القلم ✏️ ← حط اللينك بين العلامتين:

```js
uploadUrl: 'https://....'
```

← **Commit changes**. الموقع بيتحدّث خلال دقيقتين. طول ما اللينك فاضي، صفحة الرفع بتقول "متاح قريباً".

## النشر والدومين

الموقع بيتنشر أوتوماتيك على GitHub Pages مع أي تغيير على `main`. الإعدادات وخطوات Namecheap في
[`docs/GITHUB_PAGES_DNS_AR.md`](docs/GITHUB_PAGES_DNS_AR.md).

## الملفات

| الملف | الوظيفة |
|---|---|
| `index.html` | هيكل الصفحات |
| `css/style.css` | التصميم |
| `js/i18n.js` | نصوص العربي والإنجليزي |
| `js/app.js` | اللغة والقائمة وزرار الرفع |
| `config.js` | لينك رفع الحالات |
| `CNAME` | الدومين `www.dentalgateksa.com` |
| `.github/workflows/pages.yml` | النشر على GitHub Pages |

## تجربته على جهازك

```bash
python3 -m http.server 8000
# افتح http://localhost:8000
```
