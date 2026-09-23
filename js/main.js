/**
 * Aster Lab - Global Main Script
 * Handles Navigation, Mobile Drawer with Backdrop, and Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initMobileMenu();
    highlightActiveNavLink();
});

// 1. Page Preloader
function initPreloader() {
    const preloader = document.getElementById('page-preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 300);
    });

    setTimeout(() => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
        }
    }, 1200);
}

// 2. Mobile Navigation Drawer & Backdrop
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!menuToggle || !navMenu) return;

    // Create backdrop if not existing
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.appendChild(backdrop);
    }

    function openMenu() {
        navMenu.classList.add('open');
        backdrop.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Lock background scroll on mobile
    }

    function closeMenu() {
        navMenu.classList.remove('open');
        backdrop.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// 3. Highlight Active Navigation Item
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

// 4. Global Toast Notification Utility
window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
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
        border-radius: 8px;
        font-size: 0.9rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: var(--font-main);
        font-weight: 500;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.25s ease;
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
