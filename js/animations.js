/**
 * Aster Lab - Clean Scroll & Interaction System
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initFaqAccordion();
});

// 1. Scroll-Triggered Reveal via IntersectionObserver
function initScrollAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll('.reveal-fade-up');
    
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
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// 2. FAQ Accordion Toggle
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Toggle clicked
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}
