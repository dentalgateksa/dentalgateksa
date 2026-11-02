// Site configuration. This file is public.
//
// uploadUrl: your case-upload link from your dentlflow account (must start with https://).
// While it is empty, the "Upload Cases" page shows "coming soon" instead of a button.
// whatsappNumber: the number that receives "Request a Courier" messages (country code, digits only).
window.DG_CONFIG = {
        uploadUrl: 'https://hidento.com/?lab=dental-gate-ksa',
        whatsappNumber: '966544572384'
};

window.DG_TRANSLATIONS = {
    ar: {
        doc_title: "DENTALGATE | معمل أسنان رقمي",
        skip_link: "انتقل إلى المحتوى",
        menu_label: "القائمة",
        nav_about: "من نحن",
        nav_how: "طريقة العمل",
        nav_location: "موقعنا",
        location_eyebrow: "زورونا",
        location_title: "موقع المعمل",
        location_desc: "المملكة العربية السعودية",
        location_btn: "افتح في خرائط جوجل",
        nav_upload: "ارفع حالة",
        hero_eyebrow: "معمل أسنان رقمي · المملكة العربية السعودية",
        hero_title: "حيث يلتقي طب الأسنان بالفن",
        hero_desc: "نعمل في DENTALGATE بأحدث تقنيات الـ CAD/CAM لتقديم تركيبات بدقة فائقة تناسب متطلبات العيادات الحديثة.",
        hero_cta: "ارفع حالتك",
        hero_more: "تعرّف علينا",
        courier_btn: "اطلب مندوب",
        courier_msg: "السلام عليكم، أرغب في طلب مندوب لاستلام حالة.\nاسم العيادة:\nالموقع:",
        sound_on: "🔇 تشغيل الصوت",
        sound_off: "🔊 كتم الصوت",
        about_eyebrow: "من نحن",
        about_title: "لماذا DENTALGATE",
        about_desc: "معمل رقمي متكامل لتصميم وتصنيع تركيبات الأسنان بأعلى معايير الجودة العالمية.",
        card1_title: "تقنيات CAD/CAM",
        card1_desc: "تصميم وتصنيع رقمي كامل يضمن مطابقة تامة لكل تركيبة.",
        card2_title: "دعم كافة الملفات",
        card2_desc: "استقبال مباشر لملفات STL و PLY و OBJ و ZIP المأخوذة بالماسح الضوئي.",
        card3_title: "سرعة والتزام",
        card3_desc: "تسليم دقيق وسريع لخدمة المراكز والعيادات بكفاءة عالية.",
        how_eyebrow: "طريقة العمل",
        how_title: "ثلاث خطوات بسيطة",
        step1_title: "امسح",
        step1_desc: "التقط سكان داخل الفم بأي ماسح ضوئي.",
        step2_title: "ارفع",
        step2_desc: "أرسل الملفات وبيانات الحالة من خلال بوابتنا.",
        step3_title: "استلم",
        step3_desc: "نصمم ونصنّع ونسلّم التركيبة بدقة وسرعة.",
        upload_title: "جاهز ترسل حالتك؟",
        upload_desc: "ارفع ملفات الحالة وبياناتها بأمان من خلال بوابة الحالات الخاصة بنا.",
        upload_go_btn: "ارفع حالتك الآن",
        upload_soon: "رفع الحالات أونلاين متاح قريباً",
        footer_rights: "جميع الحقوق محفوظة © 2026 DENTALGATE"
    },
    en: {
        doc_title: "DENTALGATE | Digital Dental Lab",
        skip_link: "Skip to content",
        menu_label: "Menu",
        nav_about: "About",
        nav_how: "How it works",
        nav_location: "Location",
        location_eyebrow: "Visit us",
        location_title: "Our Lab Location",
        location_desc: "Saudi Arabia",
        location_btn: "Open in Google Maps",
        nav_upload: "Upload a Case",
        hero_eyebrow: "Digital Dental Lab · Saudi Arabia",
        hero_title: "Where Dentistry Meets Art",
        hero_desc: "At DENTALGATE, we use the latest CAD/CAM technology to deliver high-precision restorations for modern clinics.",
        hero_cta: "Upload a Case",
        hero_more: "Learn more",
        courier_btn: "Request a Courier",
        courier_msg: "Hello, I would like to request a courier to pick up a case.\nClinic name:\nLocation:",
        sound_on: "🔇 Sound on",
        sound_off: "🔊 Mute",
        about_eyebrow: "About us",
        about_title: "Why DENTALGATE",
        about_desc: "An integrated digital dental lab producing top-tier restorations to international quality standards.",
        card1_title: "CAD/CAM Technology",
        card1_desc: "Fully digital design and milling for a perfect fit on every restoration.",
        card2_title: "All Scanner Files",
        card2_desc: "Direct support for intraoral scan files including STL, PLY, OBJ and ZIP.",
        card3_title: "Speed & Precision",
        card3_desc: "Fast, accurate delivery to serve clinics and centers efficiently.",
        how_eyebrow: "How it works",
        how_title: "Three simple steps",
        step1_title: "Scan",
        step1_desc: "Take an intraoral scan with any scanner.",
        step2_title: "Upload",
        step2_desc: "Send the files and case details through our portal.",
        step3_title: "Receive",
        step3_desc: "We design, manufacture and deliver your restoration.",
        upload_title: "Ready to send a case?",
        upload_desc: "Upload your case files and details securely through our case portal.",
        upload_go_btn: "Upload a Case Now",
        upload_soon: "Online case upload is coming soon",
        footer_rights: "All rights reserved © 2026 DENTALGATE"
    }
};

(function () {
    'use strict';

    const T = window.DG_TRANSLATIONS;
    const CFG = window.DG_CONFIG || {};

    const $ = (id) => document.getElementById(id);

    let lang = 'en';

    function t(key) {
        return (T[lang] && T[lang][key]) || T.en[key] || key;
    }

    // ---------- language ----------
    function applyLanguage(next) {
        lang = next === 'ar' ? 'ar' : 'en';
        const html = document.documentElement;
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';

        const langBtn = $('langBtn');
        langBtn.textContent = lang === 'ar' ? 'English' : 'عربي';
        langBtn.setAttribute('lang', lang === 'ar' ? 'en' : 'ar');

        document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
        document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
        document.title = t('doc_title');
        setupWhatsApp();

        try { localStorage.setItem('dg_lang', lang); } catch (e) { /* ignore */ }
    }

    // ---------- mobile menu ----------
    function setMenu(open) {
        $('navLinks').classList.toggle('open', open);
        $('menuBtn').setAttribute('aria-expanded', String(open));
    }

    // ---------- WhatsApp courier request ----------
    function setupWhatsApp() {
        const number = String(CFG.whatsappNumber || '').replace(/\D/g, '');
        document.querySelectorAll('[data-whatsapp]').forEach((a) => {
            a.hidden = !number;
            if (number) a.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(t('courier_msg'));
        });
    }

    // ---------- upload link ----------
    function setupUploadLink() {
        const url = String(CFG.uploadUrl || '').trim();
        const valid = /^https:\/\//i.test(url);
        if (valid) {
            $('uploadLink').href = url;
            // Send every "Upload a Case" button straight to the case portal
            document.querySelectorAll('[data-upload]').forEach((a) => {
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener';
            });
        }
        $('uploadLink').hidden = !valid;
        $('uploadSoon').hidden = valid;
    }

    // ---------- init ----------
    function init() {
        let saved = null;
        try { saved = localStorage.getItem('dg_lang'); } catch (e) { /* ignore */ }
        const browserAr = (navigator.language || '').toLowerCase().startsWith('ar');

        $('langBtn').addEventListener('click', () => applyLanguage(lang === 'en' ? 'ar' : 'en'));
        $('menuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            setMenu(!$('navLinks').classList.contains('open'));
        });
        $('navLinks').addEventListener('click', (e) => {
            if (e.target.closest('a')) setMenu(false);
        });
        document.addEventListener('click', (e) => {
            if (!$('navLinks').contains(e.target)) setMenu(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setMenu(false);
        });

        $('soundBtn').addEventListener('click', () => {
            const v = $('introVideo');
            v.muted = !v.muted;
            if (!v.muted) v.play();
            $('soundBtn').setAttribute('aria-pressed', String(!v.muted));
            $('soundBtn').dataset.i18n = v.muted ? 'sound_on' : 'sound_off';
            $('soundBtn').textContent = t($('soundBtn').dataset.i18n);
        });

        setupUploadLink();
        applyLanguage(saved || (browserAr ? 'ar' : 'en'));
    }

    init();
})();
