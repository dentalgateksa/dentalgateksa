sections = [
    ("🦷", "نظام إدارة المعمل (ERP)", [
        "تسجيل الحالات ومتابعتها: استلام ← تنفيذ ← جاهزة ← تسليم، بسجل كامل مين غيّر إيه وإمتى",
        "لوحة معلومات بأرقام المعمل لحظة بلحظة",
        "ميعاد تسليم لكل حالة، وتنبيه يومي بالحالات المتأخرة",
        "إسناد الحالة لفني معين، والفني يشوف حالاته هو بس",
        "محادثة على كل حالة بين المعمل والطبيب",
        "تعدد الفروع: المدير يشوف كل الفروع، وموظف الفرع يشوف فرعه بس",
        "صلاحيات حسب الدور: مدير عام، مدير فرع، موظف، موارد بشرية، محاسب، فني",
        "مساعد ذكي يرد على أسئلة المدير من بيانات المعمل (بالعربي والإنجليزي)",
    ]),
    ("🏭", "الإنتاج وجودة الشغل", [
        "لوحة إنتاج بمراحل: تصميم ← تفريز ← تلبيد ← تشطيب ← فحص جودة",
        "لو الحالة فشلت في فحص الجودة بتتسجل إعادة وترجع للإنتاج",
        "تقرير أداء الفنيين: مراحل خلّصها، ومتوسط الوقت، ونسبة الإعادة",
        "تحديد أبطأ مرحلة في المعمل (عنق الزجاجة)",
        "رفع التصميم (STL أو صورة أو PDF) والطبيب يوافق عليه بعارض ثلاثي الأبعاد",
    ]),
    ("💰", "الفواتير والحسابات", [
        "فواتير ضريبية بأكتر من بند، بترقيم متسلسل، عربي وإنجليزي",
        "ضرائب لـ 55 دولة: النسبة واسم الضريبة ورقمها والعملة لكل دولة",
        "QR الزكاة والضريبة السعودي (المرحلة الأولى) على الفاتورة",
        "إشعارات دائنة بسبب ورقم الفاتورة الأصلية، والفاتورة ما تتعدلش بعد إصدارها",
        "سجل مدفوعات كامل: المبلغ والطريقة والتاريخ ومين سجّله",
        "قائمة أسعار الخدمات، وأسعار خاصة لكل طبيب",
        "فاتورة تلقائية لما الحالة تتسلم، أو فاتورة مجمّعة لكل طبيب",
        "حسابات الأطباء: الأرصدة وأعمار الديون (0-30، 31-60، 61-90، أكتر من 90 يوم)",
        "كشف حساب مطبوع لكل طبيب بالرصيد الجاري",
        "تكلفة الحالة وربحيتها حسب الخدمة وحسب الطبيب",
    ]),
    ("📦", "المخزون والموظفين", [
        "مخزون لكل فرع بحد أدنى، وتنبيه لما صنف يقل",
        "خصم المواد من المخزون أوتوماتيك لما الحالة تتسلم",
        "ملف لكل موظف: الهوية أو الإقامة، والعقد، وجهة الطوارئ",
        "تنبيه قبل انتهاء الهوية أو الإقامة بـ 30 يوم",
        "رصيد الإجازات وطلبات إجازة بموافقة المدير",
        "تقارير مالية وتشغيلية ومخزون وموظفين، مع طباعة PDF",
    ]),
    ("📥", "الاستيراد والتصدير", [
        "استيراد المخزون وقائمة الأسعار من ملف Excel أو CSV",
        "قالب Excel جاهز، ومعاينة الصفوف قبل الحفظ، والأخطاء برقم الصف",
        "تصدير الأرصدة وقائمة الأسعار وأداء الفنيين لـ Excel",
    ]),
    ("⚙️", "الأتمتة (تتقفل وتتفتح من الإعدادات)", [
        "تقرير أسبوعي لصاحب المعمل كل يوم أحد",
        "تذكير الأطباء بالمستحقات المتأخرة كل أسبوع، وملخص للمحاسب",
        "تنبيه لما حالة تتعطل في مرحلة أطول من المعتاد",
        "كشف حساب شهري لكل طبيب في البوابة",
    ]),
    ("👨‍⚕️", "بوابة الأطباء", [
        "الطبيب يبعت حالة جديدة ويتابعها من غير ما يعمل حساب",
        "لينك مباشر لكل معمل، والبوابة بتفتكر معمل الطبيب",
        "حساب للطبيب يشوف فيه حالاته ورصيده وكشف حسابه",
        "إشعارات للطبيب بتغيير حالة الحالة وبالرسايل",
        "حماية من السبام والبوتات على الطلبات",
    ]),
    ("😁", "مصمّم الابتسامة للأطباء", [
        "يحدد الفم في صورة المريض أوتوماتيك",
        "أسنان جديدة واقعية فوق وتحت بدل الأسنان القديمة",
        "تعديل أي سنة باللمس: تحريك وتكبير ولف، والمقاسات بتتحدث لوحدها",
        "لون كل سنة (VITA)، ورجوع وإعادة، وتكبير على الفم",
        "صورة بعد لوحدها، ومقارنة قبل وبعد، وتنزيل الصور",
        "ملامح الوش برّه الفم عمرها ما تتغير",
    ]),
    ("🌐", "DentoMedia: الشبكة المهنية", [
        "بوستات وستوريز ولايكات وتعليقات ومشاركة ومتابعة",
        "رسايل خاصة ومكالمات صوتية وفيديو",
        "سوق عمل حر: طلبات شغل وعروض وتقييمات متبادلة",
        "بحث عن فنيين ومعامل حسب المهارة والتقييم والتوثيق",
        "إعلانات مدفوعة، وشارة توثيق مدفوعة للمستقلين",
        "إبلاغ وحظر ولوحة إشراف، وتصدير البيانات أو حذف الحساب",
    ]),
    ("👑", "صاحب المنصة والبيع", [
        "لوحة لصاحب المنصة: المعامل والفروع والأطباء والحالات والدخل المتوقع",
        "تسجيل ذاتي لأي معمل في أي دولة بتجربة مجانية 15 يوم",
        "اشتراكات شهرية وسنوية بتتجدد لوحدها عن طريق Paddle",
        "ديمو مباشر لأي زائر، محمي ويرجع لأصله كل ليلة",
        "صفحة أسعار، وصفحة للمستثمرين، وفيديو تعريفي",
    ]),
    ("🛡️", "التقنية والأمان", [
        "عربي وإنجليزي في كل الشاشات",
        "تطبيق يتثبت على الموبايل والكمبيوتر (PWA)، وإشعارات فورية",
        "بيانات كل معمل معزولة تمامًا عن المعامل التانية",
        "4 مراجعات أمنية، و299 اختبار آلي، و0 ثغرات معروفة",
        "سحابي بالكامل (Convex + Vercel) من غير سيرفرات تحتاج صيانة",
        "دليل تسليم كامل للمبرمج اللي هيستلم المشروع",
    ]),
]

n = 0
cards = []
for icon, title, items in sections:
    lis = []
    for it in items:
        n += 1
        lis.append(f'<li><span class="num">{n}</span><span>{it}</span></li>')
    cards.append(f'<section class="card"><h2><span class="ic">{icon}</span>{title}<span class="cnt">{len(items)}</span></h2><ol>{"".join(lis)}</ol></section>')

css = """
*{box-sizing:border-box;margin:0;padding:0}body{width:1400px;font-family:Cairo,"Noto Sans Arabic",Tahoma,sans-serif;background:#fff;color:#1f2937}
.hd{padding:40px 56px 28px;background:radial-gradient(900px 380px at 100% 0%,#FBE3CD 0,transparent 60%),linear-gradient(180deg,#FFF9F4,#fff);display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;gap:14px}.brand img{width:64px;height:64px}.brand .n{font-size:44px;font-weight:800;direction:ltr;line-height:1}.brand .s{font-size:12px;letter-spacing:.18em;color:#64748b;direction:ltr}
.hd h1{font-size:34px;font-weight:800;margin-top:18px}.hd p{color:#64748b;font-size:17px;margin-top:4px}
.total{background:linear-gradient(135deg,#EDB88F,#E0833B);color:#fff;border-radius:20px;padding:14px 26px;text-align:center;font-weight:700}.total b{display:block;font-size:48px;line-height:1.1}
.grid{columns:3;column-gap:20px;padding:10px 56px 36px}
.card{break-inside:avoid;margin-bottom:20px;border:1px solid #f1e4d8;border-radius:18px;padding:18px 20px;box-shadow:0 6px 20px -14px rgba(224,131,59,.35)}
.card h2{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:800;margin-bottom:10px}.ic{font-size:22px}.cnt{margin-inline-start:auto;background:#FDF4EC;color:#C2621F;border-radius:99px;padding:1px 10px;font-size:13px}
ol{list-style:none}li{display:flex;gap:10px;font-size:14.5px;line-height:1.6;padding:5px 0;border-top:1px dashed #f3ebe3}li:first-child{border-top:0}
.num{flex:none;width:28px;height:28px;border-radius:9px;background:#FDF4EC;color:#E0833B;font-weight:800;font-size:13px;display:grid;place-items:center;margin-top:1px}
.ft{background:linear-gradient(90deg,#E0833B,#E2A16F);color:#fff;padding:16px 56px;display:flex;justify-content:space-between;font-size:15px}
"""
html = f"""<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"><style>{css}</style></head><body>
<div class="hd"><div><div class="brand"><img src="logo.svg"><div><div class="n">Hidento</div><div class="s">DENTAL ECOSYSTEM PLATFORM</div></div></div>
<h1>كل مميزات المنصة في صفحة واحدة</h1><p>دليل سريع لأي حد هيشتغل على المنصة أو هيستلمها: كل حاجة موجودة وبتعمل إيه</p></div>
<div class="total"><b>{n}</b>ميزة وخاصية</div></div>
<div class="grid">{"".join(cards)}</div>
<div class="ft"><span><b>Hidento</b> · منصة متكاملة لمعامل الأسنان وأطبائها</span><span>للتواصل: <span dir="ltr">amrmreda1988@gmail.com</span></span></div>
</body></html>"""
open("features-ar.html", "w", encoding="utf-8").write(html)
print(n)
