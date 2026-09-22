/**
 * Aster Lab - Global Main Script
 * Handles: Preloader, Navigation, Mobile Menu, Testimonial Carousel, Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavbar();
    initMobileMenu();
    initTestimonialsCarousel();
    highlightActiveNavLink();
});

// 1. Page Preloader
function initPreloader() {
    const preloader = document.getElementById('page-preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 500);
    });

    // Fallback: Ensure page displays even if assets take longer
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
        }
    }, 1800);
}

// 2. Sticky Navbar Blur & Scrolled State
function initNavbar() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

// 3. Mobile Navigation Drawer
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('open');
        }
    });

    // Close when clicking a nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
        });
    });
}

// 4. Highlight Active Navigation Item
function highlightActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
            link.classList.add('active');
        }
    });
}

// 5. Testimonial Carousel (Item 34)
function initTestimonialsCarousel() {
    const track = document.querySelector('.testimonials-track');
    if (!track) return;

    const slides = track.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');
    if (!slides.length) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let isPaused = false;

    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, idx) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to testimonial ${idx + 1}`);
            dot.addEventListener('click', () => goToSlide(idx));
            dotsContainer.appendChild(dot);
        });
    }

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }
    }

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        updateCarousel();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

    // Autoplay with pause on hover / touch
    function startAutoplay() {
        stopAutoplay();
        autoPlayTimer = setInterval(() => {
            if (!isPaused) {
                nextSlide();
            }
        }, 5500);
    }

    function stopAutoplay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    const carouselContainer = track.closest('.testimonials-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => { isPaused = true; });
        carouselContainer.addEventListener('mouseleave', () => { isPaused = false; });
        carouselContainer.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
        carouselContainer.addEventListener('touchend', () => { isPaused = false; });
    }

    startAutoplay();
}

// 6. Global Toast Notification Utility
window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 360px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColors = {
        success: '#059669',
        error: '#DC2626',
        info: '#0284C7',
        warning: '#D97706'
    };
    
    toast.style.cssText = `
        background: ${bgColors[type] || '#0A1128'};
        color: #FFFFFF;
        padding: 12px 18px;
        border-radius: 12px;
        font-size: 0.9rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.18);
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: var(--font-main);
    `;

    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};
