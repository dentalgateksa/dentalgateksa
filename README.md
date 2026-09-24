# DENTALGATE — Digital Dental Lab

موقع معمل أسنان رقمي: صفحة رئيسية، من نحن، بوابة رفع الحالات للأطباء، ولوحة تحكم للإدارة والفنيين (على الرابط `#staff`). عربي / إنجليزي.

## الملفات

| الملف | الوظيفة |
|---|---|
| `index.html` | هيكل الصفحات |
| `css/style.css` | التصميم |
| `js/i18n.js` | نصوص العربي والإنجليزي |
| `js/data.js` | طبقة البيانات (وضع تجريبي أو Supabase) |
| `js/app.js` | التنقل، الفورم، رفع الملفات، لوحة التحكم |
| `js/fx.js` | حركة النقط في الخلفية |
| `config.js` | إعدادات Supabase وحد حجم الملف |
| `supabase/schema.sql` | الجداول وصلاحيات الأمان (RLS) |
| `supabase/functions/manage-staff` | إنشاء وحذف حسابات الفنيين (للأدمن فقط) |

## التشغيل محلياً

```bash
python3 -m http.server 8000
# افتح http://localhost:8000
```

## الوضع التجريبي (الافتراضي)

طالما `config.js` فاضي، الموقع بيشتغل في **وضع تجريبي**: البيانات بتتحفظ في متصفح الزائر فقط، والدخول للوحة التحكم بـ `admin` / `admin`.
**لا تستخدم الوضع التجريبي لاستقبال حالات حقيقية.**

## التشغيل الفعلي مع Supabase

1. اعمل مشروع مجاني على [supabase.com](https://supabase.com).
2. من **SQL Editor** شغّل محتوى `supabase/schema.sql`.
3. من **Authentication → Users → Add user** اعمل حساب الأدمن (فعّل Auto Confirm)، وبعدين شغّل في SQL Editor:
   ```sql
   insert into public.staff (id, name, email, role, is_admin)
   select id, 'Admin', email, 'Admin', true from auth.users where email = 'you@example.com';
   ```
4. انشر الـ Edge Function الخاصة بإدارة الفنيين:
   ```bash
   npx supabase login
   npx supabase functions deploy manage-staff --project-ref <project-ref>
   ```
5. من **Project Settings → API** انسخ `Project URL` و `anon public key` وحطهم في `config.js`.
6. ارفع الموقع على أي استضافة ثابتة (GitHub Pages / Netlify / Vercel).

### الأمان
- الأطباء (بدون تسجيل دخول) يقدروا **يرسلوا** حالات ويرفعوا ملفات فقط — مايقدروش يشوفوا أي حالة.
- الفنيين يشوفوا الحالات ويغيروا حالتها ويحملوا الملفات (روابط مؤقتة 5 دقائق).
- الأدمن فقط يحذف الحالات ويدير حسابات الفنيين.
- الملفات في bucket خاص (غير عام)، وحد الملف 50 ميجا (يتغير من `config.js` و `schema.sql`).
- مفتاح `anon` مصمم إنه يكون علني؛ الحماية الفعلية في سياسات RLS. **لا تضع مفتاح `service_role` في الموقع أبداً.**
- بيانات المرضى بيانات صحية: راجع متطلبات نظام حماية البيانات الشخصية (PDPL) واختر منطقة سيرفر مناسبة في Supabase.
- مقترح لاحقاً: إضافة CAPTCHA (مثل Cloudflare Turnstile) على فورم الرفع لمنع السبام.
