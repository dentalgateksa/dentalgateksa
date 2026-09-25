// Particle network behind the hero. Runs only while the hero is on screen,
// and not at all for visitors who prefer reduced motion.
window.DG_HERO_FX = (function () {
    'use strict';

    const canvas = document.getElementById('heroCanvas');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!canvas || !canvas.getContext) return { setActive() {} };

    const ctx = canvas.getContext('2d');
    const LINK_DIST = 100;
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = null;
    let pageActive = true;
    let inView = true;

    function makeParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            r: Math.random() * 1.5 + 1
        };
    }

    function resize() {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (!w || !h || (w === width && h === height)) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = w;
        height = h;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(120, Math.floor((w * h) / 15000));
        particles = Array.from({ length: count }, makeParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(192, 201, 238, 0.3)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = `rgba(192, 201, 238, ${0.15 * (1 - dist / LINK_DIST)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function loop() {
        draw();
        frame = requestAnimationFrame(loop);
    }

    function update() {
        const shouldRun = pageActive && inView && !document.hidden && !reducedMotion.matches;
        if (shouldRun && frame === null) {
            resize();
            frame = requestAnimationFrame(loop);
        } else if (!shouldRun && frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
        }
        if (reducedMotion.matches) ctx.clearRect(0, 0, width, height);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', update);
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', update);
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            inView = entries[0].isIntersecting;
            update();
        }).observe(canvas);
    }

    return {
        setActive(active) {
            pageActive = active;
            update();
        }
    };
})();
