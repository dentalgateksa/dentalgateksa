# DENTALGATE — Digital Dental Lab

موقع معمل أسنان رقمي: صفحة رئيسية، من نحن، بوابة رفع الحالات للأطباء، ولوحة تحكم للإدارة والفنيين (على الرابط `#staff`). عربي / إنجليزي.
الـ Backend على **Firebase في الدمام (me-central2)**: Firestore + Cloud Storage + Cloud Functions + Authentication.

## الأوضاع الثلاثة

| الوضع | إمتى بيشتغل | البيانات فين |
|---|---|---|
| **تجريبي (Demo)** | طول ما `config.js` فاضي — الوضع الحالي | في متصفح الزائر بس. الدخول `admin` / `admin`. **ماتستقبلش بيه حالات حقيقية.** |
| **اختبار محلي (Emulator)** | `npm run dev` وفتح `http://localhost:5500/?emulator` | Firebase كامل بس على جهازك، ومن غير حساب ولا دفع. بيتمسح لما تقفل. |
| **حقيقي (Firebase)** | بعد ما تملا `config.js` | السعودية (الدمام). الخطوات في [`docs/FIREBASE_SETUP_AR.md`](docs/FIREBASE_SETUP_AR.md). |

## الأدلة

- [`docs/FIREBASE_SETUP_AR.md`](docs/FIREBASE_SETUP_AR.md) — تفعيل Firebase الحقيقي، تنبيه الميزانية، والمسح الأوتوماتيك للملفات القديمة.
- [`docs/GITHUB_PAGES_DNS_AR.md`](docs/GITHUB_PAGES_DNS_AR.md) — النشر على GitHub Pages وإعدادات الـ DNS في Namecheap.

## التجربة على الـ Emulator (على جهازك)

محتاج تنزّل مرة واحدة: [Node.js 22](https://nodejs.org) و [Java 21](https://adoptium.net).

```bash
npm run setup     # مرة واحدة: بينزّل الأدوات
npm run dev       # بيشغّل Firebase Emulator + الموقع
```

بعدها افتح `http://localhost:5500/?emulator`:
- **أدمن:** `admin@dentalgate.test` / `admin12345`
- **فني:** `tech@dentalgate.test` / `tech12345`
- تشوف البيانات المتخزنة من `http://localhost:4000`.

## الاختبارات

```bash
npm test
```

بتشغّل الـ Emulator وتتأكد من كل صلاحية (23 اختبار): الدكتور يرفع بس، الفني يشوف ويغيّر الحالة، الأدمن بس يحذف ويدير الفنيين. بتشتغل كمان أوتوماتيك على GitHub في كل Pull Request.

## الملفات

| الملف | الوظيفة |
|---|---|
| `index.html` | هيكل الصفحات |
| `css/style.css` | التصميم |
| `js/i18n.js` | نصوص العربي والإنجليزي |
| `js/data.js` | طبقة البيانات (تجريبي / Emulator / Firebase) |
| `js/app.js` | التنقل، الفورم، رفع الملفات، لوحة التحكم |
| `js/fx.js` | حركة النقط في الخلفية |
| `config.js` | إعدادات Firebase (مش أسرار) وحد حجم الملف |
| `firestore.rules` | صلاحيات قاعدة البيانات |
| `storage.rules` | صلاحيات الملفات |
| `functions/index.js` | تسجيل الحالات وإدارة حسابات الفنيين (منطقة الدمام) |
| `firebase/storage-lifecycle.json` | مسح ملفات السكان الأقدم من 180 يوم تلقائياً |
| `firebase/storage-cors.json` | السماح بتحميل الملفات من دومين الموقع بس |
| `scripts/dev.mjs` | بيانات تجريبية للـ Emulator + تشغيل الموقع محلياً |
| `tests/` | اختبارات الصلاحيات والـ Functions |
| `.github/workflows/` | النشر على GitHub Pages + تشغيل الاختبارات |

## الأمان

- المستودع Public: **مفيهوش أسرار ولا بيانات مرضى**. قيم `config.js` مصممة إنها تكون علنية.
- **عمرك ما ترفع** ملف Service Account أو أي JSON فيه `private_key`.
- الدكتور مايقدرش يقرا أي حالة؛ الحالات بتتسجل عن طريق Cloud Function بتتأكد من البيانات والملفات.
- الفني بيفقد صلاحيته فوراً لما يتمسح.
- ملفات أكبر من 50 ميجا أو امتدادات غير (STL, PLY, OBJ, ZIP, DCM, PDF, JPG, PNG) مرفوضة من السيرفر نفسه.
