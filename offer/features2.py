# مولّد صفحة "كل المميزات" بالعربي والإنجليزي (2026-10-02) - مصدر واحد للنسختين
import ast
AR, EN = ast.literal_eval(open("features_data_old.txt").read())
AR = [list(x) for x in AR]; EN = [list(x) for x in EN]

def sec(lst, title_prefix):
    return next(x for x in lst if title_prefix in x[1])

# المخزون والموظفين -> المخزون والتقارير (الموظفين بقى قسم لوحده)
inv_ar, inv_en = sec(AR, "المخزون"), sec(EN, "Inventory")
inv_ar[1], inv_en[1] = "المخزون والتقارير", "Inventory and reports"
inv_ar[2] = [inv_ar[2][0], inv_ar[2][1], "فاتورة الشراء بتزوّد المخزون وتحدّث تكلفة الصنف (متوسط مرجّح)", inv_ar[2][5]]
inv_en[2] = [inv_en[2][0], inv_en[2][1], "Purchase invoices add stock and update the item cost (weighted average)", inv_en[2][5]]

hr_ar = ("👥", "الموارد البشرية والرواتب", [
    "ملف لكل موظف ومستنداته (عقد، هوية أو إقامة، جواز، شهادات) وتنبيه قبل انتهاء أي مستند",
    "الحضور والانصراف من موبايل الموظف، والتأخير والإضافي بيتحسبوا لوحدهم بتوقيت المعمل",
    "كشف حضور يومي للموارد البشرية، وزرار يعلّم الغياب، وملخص شهري لكل موظف",
    "«ملفي الوظيفي»: الموظف يطلب إجازته ويشوف رصيده وقسائم راتبه",
    "الإجازة السنوية بأيام العمل، مع الإجازات الرسمية والأسبوعية، والرصيد بيزيد لوحده كل شهر",
    "مسير رواتب شهري: الأساسي والبدلات وأجر القطعة من مراحل الإنتاج والمكافأة والإضافي",
    "الخصومات لوحدها: الغياب، والإجازة من غير راتب، والتأمينات الاجتماعية (GOSI)، وأقساط السلف",
    "المعيّن أو اللي ساب في نص الشهر بياخد أيامه بس",
    "مسودة المسير بتتجهز لوحدها أول كل شهر، والاعتماد بيسجّل مصروف الرواتب والتأمينات",
    "قسائم راتب وكشف مسير للطباعة",
    "مكافأة نهاية الخدمة حسب دولة المعمل (السعودية والإمارات) مع مخصص لكل الموظفين",
])
hr_en = ("👥", "HR and payroll", [
    "A file per employee with documents (contract, ID or residency, passport, certificates) and alerts before any expires",
    "Attendance from the employee's phone; lateness and overtime calculated automatically in the lab's time zone",
    "Daily attendance sheet for HR, a one-click mark-absent, and a monthly summary per employee",
    "“My HR”: employees request leave and see their balance and payslips",
    "Annual leave in working days, with weekends and public holidays, and a balance that grows every month",
    "Monthly payroll: basic, allowances, piece work from production steps, bonus and overtime",
    "Automatic deductions: absence, unpaid leave, social insurance (GOSI) and advance installments",
    "Staff who join or leave mid-month are paid only for their days",
    "The payroll draft is prepared on the 1st; approval records the salaries and GOSI expenses",
    "Printable payslips and payroll sheet",
    "End-of-service gratuity by the lab's country (Saudi Arabia and UAE) with a provision for all staff",
])
acc_ar = ("🧮", "الحسابات والمشتريات", [
    "قائمة الدخل من غير الضريبة، مع مقارنة بالفترة اللي قبلها",
    "ملخص إقرار ضريبة القيمة المضافة: المخرجات والمدخلات والصافي، للطباعة",
    "تقرير الخزنة والبنك حسب طريقة الدفع: الداخل والخارج والصافي",
    "المصروفات بضريبتها ومورّدها وطريقة دفعها، مع تعديل ومسح",
    "مصروفات ثابتة شهرية (إيجار، إنترنت) بتتسجل لوحدها في يومها",
    "فواتير الشراء كاش أو آجل، والشراء بيتسجل مصروف لوحده مرة واحدة",
    "حساب لكل مورد: الرصيد المستحق والسداد وكشف حساب",
    "تصدير الفواتير والتحصيلات والمصروفات للمحاسب على Excel",
])
acc_en = ("🧮", "Accounting and purchases", [
    "Income statement net of VAT, compared with the previous period",
    "VAT return summary: output, input and net, printable",
    "Cash and bank report by payment method: in, out and net",
    "Expenses with their VAT, supplier and payment method, editable",
    "Fixed monthly expenses (rent, internet) recorded automatically on their day",
    "Purchase invoices paid now or on credit, recorded as one expense automatically",
    "An account per supplier: balance due, payments and a statement",
    "Export invoices, collections and expenses to Excel for the accountant",
])
def insert_after(lst, prefix, item):
    i = next(k for k, x in enumerate(lst) if prefix in x[1]); lst.insert(i + 1, list(item))
insert_after(AR, "الفواتير", acc_ar); insert_after(EN, "Invoicing", acc_en)
insert_after(AR, "المخزون", hr_ar); insert_after(EN, "Inventory", hr_en)

au_ar, au_en = sec(AR, "الأتمتة"), sec(EN, "Automations")
au_ar[2] += ["مسودة مسير الرواتب أول كل شهر، والمصروفات الثابتة في يومها"]
au_en[2] += ["Payroll draft on the 1st of each month, and fixed expenses on their day"]

te_ar, te_en = sec(AR, "التقنية"), sec(EN, "Technology")
te_ar[2] = [x.replace("6 مراجعات (أمنية وفحص كمشتري)، و322 اختبار آلي", "7 مراجعات (أمنية وفحص كمشتري)، و351 اختبار آلي") for x in te_ar[2]]
te_en[2] = [x.replace("6 reviews (security and buyer-style audit), 322 automated tests", "7 reviews (security and buyer-style audit), 351 automated tests") for x in te_en[2]]
te_ar[2].insert(3, "حماية متصفح (CSP) مفعّلة، وCAPTCHA جاهزة تتفعّل بمفتاح")
te_en[2].insert(3, "Browser protection (CSP) enforced and a CAPTCHA ready to switch on with a key")

src = open("features.py").read()
css = src.split('css = """', 1)[1].split('"""', 1)[0]

def build(sections, lang):
    n = 0; cards = []
    for icon, title, items in sections:
        lis = []
        for it in items:
            n += 1
            lis.append(f'<li><span class="num">{n}</span><span>{it}</span></li>')
        cards.append(f'<section class="card"><h2><span class="ic">{icon}</span>{title}<span class="cnt">{len(items)}</span></h2><ol>{"".join(lis)}</ol></section>')
    if lang == "ar":
        head = ('rtl', 'ar', "كل مميزات المنصة في صفحة واحدة", "دليل سريع لأي حد هيشتغل على المنصة أو هيستلمها: كل حاجة موجودة وبتعمل إيه", "ميزة وخاصية",
                '<span><b>Hidento</b> · منصة متكاملة لمعامل الأسنان وأطبائها</span><span>للتواصل: <span dir="ltr">amrmreda1988@gmail.com</span></span>')
    else:
        head = ('ltr', 'en', "Every feature of the platform on one page", "A quick guide for anyone who will work on or take over the platform: what exists and what it does", "features",
                '<span><b>Hidento</b> · An integrated platform for dental labs and their doctors</span><span>Contact: amrmreda1988@gmail.com</span>')
    d, l, h1, p, tot, ft = head
    font = 'Cairo:wght@400;600;700;800' if lang == "ar" else 'Inter:wght@400;600;700;800'
    css2 = css if lang == "ar" else css.replace('font-family:Cairo,"Noto Sans Arabic",Tahoma,sans-serif', 'font-family:Inter,system-ui,sans-serif')
    return n, f"""<!doctype html><html dir="{d}" lang="{l}"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family={font}&display=swap" rel="stylesheet"><style>{css2}</style></head><body>
<div class="hd"><div><div class="brand"><img src="logo.svg"><div><div class="n">Hidento</div><div class="s">DENTAL ECOSYSTEM PLATFORM</div></div></div>
<h1>{h1}</h1><p>{p}</p></div>
<div class="total"><b>{n}</b>{tot}</div></div>
<div class="grid">{"".join(cards)}</div>
<div class="ft">{ft}</div>
</body></html>"""

for lang, secs, fn in [("ar", AR, "Hidento-Features-AR.html"), ("en", EN, "Hidento-Features-EN.html")]:
    n, html = build(secs, lang)
    open(fn, "w", encoding="utf-8").write(html)
    print(fn, n)
