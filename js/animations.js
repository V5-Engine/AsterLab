/**
 * Aster Lab - Futuristic Animations & Interaction System
 * 
 * Features:
 * - IntersectionObserver Scroll Reveal (fade-up, fade-left/right, scale)
 * - Animated Number Counters (0 -> target)
 * - Desktop Custom Glow Cursor
 * - Hero subtle 3D/Parallax interaction
 * - Prefers-reduced-motion compliance
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initCounterAnimations();
    initCustomCursor();
    initHeroParallax();
});

// 1. Scroll-Triggered Reveal via IntersectionObserver
function initScrollAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale');
    
    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('reveal-active'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                obs.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// 2. Animated Number Counters
function initCounterAnimations() {
    const counters = document.querySelectorAll('.counter-val');
    if (!counters.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateCount = (counter) => {
        const target = parseFloat(counter.getAttribute('data-target') || '0');
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 1800; // 1.8 seconds
        const startTime = performance.now();

        if (prefersReducedMotion) {
            counter.textContent = target.toLocaleString() + suffix;
            return;
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            counter.textContent = current.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target.toLocaleString() + suffix;
            }
        }

        requestAnimationFrame(update);
    };

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        counters.forEach(c => counterObserver.observe(c));
    } else {
        counters.forEach(c => animateCount(c));
    }
}

// 3. Desktop Custom Cursor
function initCustomCursor() {
    // Only run on desktop with fine pointer
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    let dot = document.querySelector('.cursor-dot');
    let ring = document.querySelector('.cursor-ring');

    if (!dot) {
        dot = document.createElement('div');
        dot.className = 'cursor-dot';
        document.body.appendChild(dot);
    }
    if (!ring) {
        ring = document.createElement('div');
        ring.className = 'cursor-ring';
        document.body.appendChild(ring);
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    // Smooth ring following
    function renderRing() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Expand on interactive elements
    const interactiveSelectors = 'a, button, input, select, textarea, .glass-card, .clickable';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            ring.classList.add('cursor-hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            ring.classList.remove('cursor-hover');
        }
    });
}

// 4. Hero Visual Subtle 3D Tilt / Parallax
function initHeroParallax() {
    const heroVisual = document.querySelector('.hero-visual-card');
    if (!heroVisual || window.innerWidth < 992) return;

    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const tiltX = (y / (rect.height / 2)) * -6;
        const tiltY = (x / (rect.width / 2)) * 6;

        heroVisual.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    heroSection.addEventListener('mouseleave', () => {
        heroVisual.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
}
