# دليل تفعيل Firebase الحقيقي (الدمام — me-central2)

الدليل ده لما تكون جاهز تستقبل حالات حقيقية. لحد ما تعمله، الموقع شغال في **الوضع التجريبي** (البيانات في متصفح الزائر بس).

> ⏱️ الوقت المتوقع: ساعة تقريباً. كل الخطوات من المتصفح، مش محتاج تنزّل حاجة على جهازك.

---

## قبل ما تبدأ: إيه اللي هيتخزن فين؟

| البيان | مكانه |
|---|---|
| بيانات الحالات (اسم المريض، الدكتور، العيادة، الملاحظات) | Firestore — **الدمام (me-central2)** |
| ملفات السكان (STL / ZIP / صور …) | Cloud Storage — **الدمام (me-central2)** |
| الكود اللي بيسجّل الحالات ويدير الفنيين | Cloud Functions — **الدمام (me-central2)** |
| حسابات الفنيين (الإيميل والباسورد بس) | Firebase Authentication — خدمة عالمية، **مفيهاش أي بيانات مرضى** |

الكود مايكتبش أي بيانات مرضى في السجلات (Logs)، لأن سجلات Google Cloud مش بتتخزن في السعودية افتراضياً.

---

## الخطوة 1: اعمل المشروع

1. ادخل [console.firebase.google.com](https://console.firebase.google.com) بحساب Google بتاع الشركة.
2. **Create a project** → الاسم مثلاً `dentalgate` → كمّل.
3. Google Analytics: **اقفله** (مش محتاجينه) → **Create project**.
4. اكتب في ورقة **Project ID** (بيظهر تحت اسم المشروع، مثلاً `dentalgate-1a2b3`).

## الخطوة 2: فعّل خطة Blaze (الدفع حسب الاستخدام)

Cloud Functions و Storage محتاجين خطة Blaze. في البداية الاستخدام هيكون صغير جداً وغالباً داخل الحد المجاني، بس لازم كارت.

1. تحت يسار الشاشة: **Spark plan → Upgrade** → اختار **Blaze** → اربط حساب فوترة (Billing account) بالكارت.

## الخطوة 3: تنبيه الميزانية (مهم جداً)

1. افتح [console.cloud.google.com/billing](https://console.cloud.google.com/billing) → اختار حساب الفوترة.
2. من القائمة: **Budgets & alerts** → **Create budget**.
3. **Name:** `DENTALGATE monthly` — **Projects:** اختار مشروعك.
4. **Amount:** نوع `Specified amount` ← اكتب مثلاً **20 USD** شهرياً.
5. **Alert thresholds:** خليها 50% و 90% و 100% ← وعلّم **Email alerts to billing admins**.
6. **Finish**.

> ⚠️ التنبيه **بيبعتلك إيميل بس، مش بيوقف الصرف**. لو جالك إيميل مفاجئ، ادخل وشوف إيه اللي حصل. كمان الكود محدد إن كل Function ماتشتغلش أكتر من 5 نسخ في نفس الوقت، وده بيقلل خطر الفواتير المفاجئة.

## الخطوة 4: قاعدة البيانات Firestore في الدمام

1. في Firebase: **Build → Firestore Database → Create database**.
2. **Edition:** Standard. **Database ID:** سيبه `(default)`.
3. **Location:** اختار **`me-central2 (Dammam)`**. ⚠️ **ماينفعش تغيّره بعد كده.**
4. **Start in production mode** → **Create**.

## الخطوة 5: تخزين الملفات Storage في الدمام

1. **Build → Storage → Get started**.
2. **Location:** اختار من **All locations** ← **`me-central2`**. ⚠️ ماينفعش تغيّره بعد كده.
3. **Start in production mode** → **Create**.
4. اكتب اسم الـ bucket اللي ظاهر فوق (شكله `gs://dentalgate-1a2b3.firebasestorage.app`).

## الخطوة 6: تسجيل الدخول (Authentication)

1. **Build → Authentication → Get started**.
2. **Sign-in method → Email/Password → Enable → Save** (اتأكد إن "Email link" مقفول).
3. **Settings → Authorized domains → Add domain** ← ضيف `www.dentalgateksa.com` و `dentalgateksa.com`.
4. (مُستحسن) **Settings → User actions** ← شيل علامة **Enable create (sign-up)** ← Save. كده محدش يقدر يعمل حساب لنفسه؛ الحسابات بتتعمل من لوحة الأدمن بس.

## الخطوة 7: رفع قواعد الأمان والـ Functions (من Cloud Shell)

Cloud Shell ده terminal جاهز جوه المتصفح من Google، مجاني.

1. افتح [console.cloud.google.com](https://console.cloud.google.com) ← اتأكد إن مشروعك مختار فوق.
2. اضغط أيقونة **Activate Cloud Shell** (شكلها `>_` فوق يمين) واستنى لحد ما يفتح.
3. انسخ الأوامر دي واحد واحد (غيّر `PROJECT_ID` بالـ Project ID بتاعك):

```bash
git clone https://github.com/dentalgateksa/dentalgateksa.git
cd dentalgateksa
npm --prefix functions install
npx firebase-tools@latest login --no-localhost
npx firebase-tools@latest deploy --only firestore,storage,functions --project PROJECT_ID
```

- في أمر `login` هيديك لينك ← افتحه ← وافق ← انسخ الكود وارجع الصقه.
- لو سألك عن **cleanup policy** لـ Artifact Registry ← اكتب `Y` واختار **1 day** (بيمسح نسخ الكود القديمة ويوفّر فلوس).
- لو سألك يفعّل APIs ← وافق. أول مرة ممكن تاخد 5–10 دقايق.

لما يخلص هيكتب `Deploy complete!`.

## الخطوة 8: المسح الأوتوماتيك للملفات القديمة + السماح بالتحميل

في نفس Cloud Shell (وإنت جوه فولدر `dentalgateksa`)، غيّر `BUCKET` باسم الـ bucket من الخطوة 5 (من غير `gs://`):

```bash
gcloud storage buckets update gs://BUCKET --lifecycle-file=firebase/storage-lifecycle.json
gcloud storage buckets update gs://BUCKET --cors-file=firebase/storage-cors.json
```

- الأمر الأول: أي ملف سكان عمره **أكتر من 180 يوم بيتمسح تلقائياً**. عايز مدة تانية؟ غيّر رقم `180` في `firebase/storage-lifecycle.json` وشغّل الأمر تاني.
  - بيانات الحالة نفسها (الاسم والحالة) بتفضل في لوحة التحكم، ولو فني ضغط على ملف اتمسح هتظهر له رسالة إن الملف مش متاح. الأدمن يقدر يمسح الحالة كلها من اللوحة.
- الأمر التاني: بيسمح للوحة التحكم على دومينك إنها تحمّل الملفات (من غيره التحميل مش هيشتغل).

للتأكد:

```bash
gcloud storage buckets describe gs://BUCKET --format="default(lifecycle_config,cors_config)"
```

## الخطوة 9: أول حساب أدمن

1. **Authentication → Users → Add user** ← إيميلك وباسورد قوي ← **Add user**.
2. انسخ الـ **User UID** اللي ظهر في الجدول.
3. **Firestore Database → Data → Start collection** ← Collection ID: `staff` ← Next.
4. **Document ID:** الصق الـ UID. وضيف الحقول دي:

| Field | Type | Value |
|---|---|---|
| `name` | string | اسمك |
| `email` | string | إيميلك |
| `role` | string | `Admin` |
| `isAdmin` | boolean | `true` |
| `createdAt` | timestamp | تاريخ النهارده |

5. **Save**. بعد كده أي فني جديد تعمله من لوحة التحكم نفسها (تبويب "حسابات الفنيين").

## الخطوة 10: اربط الموقع بـ Firebase

1. Firebase: ⚙️ **Project settings → General → Your apps** ← اضغط أيقونة الويب `</>`.
2. اسم التطبيق `dentalgate-web` ← **ماتعلّمش** على Firebase Hosting ← **Register app**.
3. هيظهر كود فيه `firebaseConfig`. انسخ منه القيم دي بس.
4. في GitHub افتح الملف `config.js` ← أيقونة القلم ✏️ ← املا القيم:

```js
firebase: {
    apiKey: 'AIza....',
    authDomain: 'dentalgate-1a2b3.firebaseapp.com',
    projectId: 'dentalgate-1a2b3',
    storageBucket: 'dentalgate-1a2b3.firebasestorage.app',
    appId: '1:1234567890:web:abc123'
},
```

5. **Commit changes** على `main`. خلال دقيقتين الموقع هيتحدّث ويبطل وضع تجريبي.

> ✅ القيم دي **مش أسرار** ومسموح تكون في مستودع Public. الحماية الحقيقية في قواعد الأمان (الخطوة 7). **عمرك ما تحط في المستودع** ملف Service Account أو أي ملف JSON فيه `private_key`.

## الخطوة 11: قفل المفتاح على دومينك (مُستحسن)

1. [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) ← افتح المفتاح اللي اسمه **Browser key (auto created by Firebase)**.
2. **Application restrictions → Websites** ← ضيف:
   - `https://www.dentalgateksa.com/*`
   - `https://dentalgateksa.com/*`
3. **Save**.

## الخطوة 12: جرّب

1. افتح `https://www.dentalgateksa.com/#upload` ← ارفع حالة تجريبية بملف صغير.
2. افتح `https://www.dentalgateksa.com/#staff` ← ادخل بحساب الأدمن ← لازم تلاقي الحالة، تغيّر حالتها، وتحمّل الملف.
3. اعمل فني تجريبي من تبويب الفنيين، ادخل بيه من متصفح تاني، واتأكد إنه مش شايف زرار الحذف.
4. امسح الحالة التجريبية والفني التجريبي.

---

## الصلاحيات باختصار

| | الدكتور (من غير دخول) | الفني | الأدمن |
|---|:-:|:-:|:-:|
| يرفع حالة وملفات | ✅ | ✅ | ✅ |
| يشوف الحالات والملفات | ❌ | ✅ | ✅ |
| يغيّر حالة الطلب | ❌ | ✅ | ✅ |
| يمسح حالة | ❌ | ❌ | ✅ |
| يضيف / يمسح فنيين | ❌ | ❌ | ✅ |

- الدكتور مايقدرش يقرا أي حالة، ولا حتى اللي هو رفعها، ومايقدرش يضيف ملفات لحالة اتبعتت خلاص.
- لما تمسح فني، بيفقد الصلاحية **فوراً** حتى لو كان فاتح اللوحة.
- كل ده متجرّب أوتوماتيك (`npm test`) في كل Pull Request.

## خطوات لاحقة مقترحة

- **App Check (reCAPTCHA Enterprise):** يمنع البوتات من رفع ملفات سبام على الفورم. مفيد لما الموقع يبقى معروف.
- **نسخ احتياطي لـ Firestore:** من Firestore → Disaster recovery ← Backups ← اختار يومي.
- راجع متطلبات **نظام حماية البيانات الشخصية (PDPL)** مع مستشار قانوني، زي سياسة الخصوصية وموافقة المريض.
