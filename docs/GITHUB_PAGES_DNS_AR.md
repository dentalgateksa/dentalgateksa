# نشر الموقع على GitHub Pages بدومين www.dentalgateksa.com

الموقع بيتنشر أوتوماتيك من فرع `main` كل مرة يحصل فيه تغيير (ملف `.github/workflows/pages.yml`). بيتنشر **ملفات الموقع بس** (`index.html` و `css` و `js` و `config.js` والأيقونات).

---

## الجزء 1: إعدادات GitHub (مرة واحدة)

1. المستودع لازم يكون **Public**: **Settings → General** ← تحت خالص **Danger Zone → Change visibility → Public**.
2. **Settings → Pages**:
   - **Build and deployment → Source:** اختار **GitHub Actions**.
3. بعد ما تعمل merge للـ Pull Request على `main`، هتلاقي في تبويب **Actions** شغلانة اسمها **Deploy website** ← استنى لحد ما تبقى ✅ خضرا.
4. ارجع **Settings → Pages → Custom domain** ← اكتب `www.dentalgateksa.com` ← **Save**.
5. بعد ما الـ DNS يشتغل (الجزء 2) وعلامة الصح تظهر، علّم على **Enforce HTTPS** (ممكن تاخد لحد ساعة لحد ما تبقى متاحة).

## الجزء 2: إعدادات الـ DNS في Namecheap

1. ادخل [namecheap.com](https://www.namecheap.com) ← **Domain List** ← جنب `dentalgateksa.com` اضغط **Manage**.
2. تبويب **Advanced DNS**.
3. **امسح** السجلات الافتراضية اللي Namecheap بيحطها (غالباً `CNAME www → parkingpage.namecheap.com` و `URL Redirect Record @`). اضغط أيقونة سلة الزبالة 🗑️ جنب كل واحد.
4. اضغط **Add New Record** وضيف السجلات دي بالظبط:

| Type | Host | Value | TTL |
|---|---|---|---|
| `CNAME Record` | `www` | `dentalgateksa.github.io.` | Automatic |
| `A Record` | `@` | `185.199.108.153` | Automatic |
| `A Record` | `@` | `185.199.109.153` | Automatic |
| `A Record` | `@` | `185.199.110.153` | Automatic |
| `A Record` | `@` | `185.199.111.153` | Automatic |

5. اضغط ✔️ **Save all changes**.

- الـ `CNAME` هو اللي بيشغّل `www.dentalgateksa.com`.
- الـ 4 `A Records` بيخلّوا `dentalgateksa.com` (من غير www) يحوّل أوتوماتيك على `www`.
- لو المستودع اتنقل لحساب/منظمة باسم تاني، غيّر `dentalgateksa.github.io.` لـ `اسم-الحساب.github.io.`.

(اختياري — دعم IPv6) ضيف كمان 4 سجلات `AAAA Record` على `@` بالقيم: `2606:50c0:8000::153` و `2606:50c0:8001::153` و `2606:50c0:8002::153` و `2606:50c0:8003::153`.

⏱️ التغيير بياخد من 10 دقايق لحد 24 ساعة. تقدر تتابع من [dnschecker.org](https://dnschecker.org) (اكتب `www.dentalgateksa.com` واختار CNAME).

## الجزء 3: توثيق الدومين (حماية مهمة)

ده بيمنع أي حد تاني على GitHub إنه يستخدم دومينك.

1. في GitHub اضغط صورتك فوق يمين ← **Settings** (إعدادات الحساب، مش المستودع).
   - لو المستودع تبع **Organization**: افتح إعدادات الـ Organization بدل كده.
2. **Pages** (من القائمة الشمال، تحت "Code, planning, and automation") ← **Add a domain** ← اكتب `dentalgateksa.com` ← **Add domain**.
3. هيديك سجل **TXT**. في Namecheap ← Advanced DNS ← **Add New Record**:

| Type | Host | Value |
|---|---|---|
| `TXT Record` | `_github-pages-challenge-dentalgateksa` (انسخه زي ما GitHub كاتبه بالظبط) | الكود اللي GitHub اداهولك |

> ملاحظة: Namecheap بيضيف اسم الدومين أوتوماتيك، فاكتب في خانة Host الجزء اللي **قبل** `.dentalgateksa.com` بس.

4. **Save** ← ارجع GitHub ← **Verify** (لو ما اشتغلش، استنى شوية وجرّب تاني).

## الجزء 4: بعد ما يشتغل

- افتح `https://www.dentalgateksa.com` ← لازم يفتح بالقفل 🔒.
- افتح `https://dentalgateksa.com` ← لازم يحوّلك على `www`.
- افتح صفحة **رفع الحالات** واتأكد إن الزرار بيودّي على لينك dentlflow الصح.

## لو حصلت مشكلة

| المشكلة | الحل |
|---|---|
| GitHub بيقول `DNS check unsuccessful` | استنى شوية (الـ DNS لسه بيتنشر)، واتأكد إن سجل Namecheap الافتراضي `parkingpage` اتمسح. |
| `Enforce HTTPS` مش متاح | عادي في الأول؛ بيتفعّل لوحده خلال ساعة بعد نجاح فحص الـ DNS. |
| الشغلانة في Actions حمرا | افتح الشغلانة واقرا الخطأ؛ غالباً Source في Settings → Pages مش متظبطة على **GitHub Actions**. |
| 404 على الدومين | اتأكد إن آخر شغلانة **Deploy website** نجحت وإن Custom domain مكتوب صح. |
