/**
 * Aster Lab - Dynamic Offers System
 * 
 * Fetches promotional health screening packages dynamically from Supabase.
 * Features:
 * - Real-time countdown timer to expiry
 * - Animated "NEW" and "JUST ARRIVED" shimmer badges
 * - Price discount calculations
 * - Elegant Loading, Error, and Empty States
 */

document.addEventListener('DOMContentLoaded', () => {
    loadActiveOffers();
});

async function loadActiveOffers() {
    const container = document.getElementById('offers-container');
    if (!container) return;

    // 1. Loading State
    container.innerHTML = `
        <div class="offers-loading-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
            <div class="ecg-container" style="margin: 0 auto 1.5rem auto;">
                <svg viewBox="0 0 200 60" style="width: 140px; height: 42px;">
                    <path class="ecg-path" d="M 0 30 L 40 30 L 50 10 L 60 50 L 70 20 L 80 40 L 90 30 L 200 30" fill="none" stroke-width="3" />
                </svg>
            </div>
            <p style="color: var(--text-muted); font-size: 0.95rem; font-weight: 500;">Loading latest diagnostic health packages...</p>
        </div>
    `;

    try {
        const { data: offers, error } = await window.AsterLabDB.getActiveOffers();

        // 2. Error State
        if (error) {
            container.innerHTML = `
                <div class="offers-error-state" style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: #FFF5F5; border-radius: var(--radius-lg); border: 1px solid #FED7D7;">
                    <svg style="width: 44px; height: 44px; stroke: #E53E3E; margin: 0 auto 1rem auto;" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #9B2C2C;">Unable to load offers</h3>
                    <p style="color: #C53030; font-size: 0.9rem; max-width: 420px; margin: 0 auto 1.5rem auto;">
                        Something went wrong while loading current diagnostic offers. Please refresh or check back shortly.
                    </p>
                    <button class="btn btn-secondary btn-sm" onclick="loadActiveOffers()">Try Again</button>
                </div>
            `;
            return;
        }

        // 3. Empty State
        if (!offers || offers.length === 0) {
            container.innerHTML = `
                <div class="offers-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 1.5rem; background: #FFFFFF; border-radius: var(--radius-lg); border: 1px dashed #CBD5E1;">
                    <div style="width: 60px; height: 60px; background: #F1F5F9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem auto;">
                        <svg style="width: 28px; height: 28px; stroke: #64748B;" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">No Active Offers Right Now</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 440px; margin: 0 auto 1.5rem auto;">
                        Our clinical laboratory specialists are formulating new comprehensive preventive health packages.
                    </p>
                    <a href="tests.html" class="btn btn-secondary btn-sm">Explore Routine Tests</a>
                </div>
            `;
            return;
        }

        // 4. Success State: Render Offer Cards
        container.innerHTML = '';
        offers.forEach((offer, index) => {
            const card = createOfferCard(offer, index);
            container.appendChild(card);
        });

        // Start countdown timer updates
        startOfferTimers();

        // Re-run scroll animations on newly inserted DOM elements
        if (window.initScrollAnimations) {
            window.initScrollAnimations();
        }

    } catch (err) {
        console.error("Critical error in loadActiveOffers:", err);
    }
}

function createOfferCard(offer, index) {
    const card = document.createElement('div');
    const delayClass = `delay-${((index % 4) + 1) * 100}`;
    card.className = `glass-card offer-card reveal-fade-up ${delayClass}`;
    card.style.cssText = `
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 1.85rem;
    `;

    const discount = Math.round(((offer.original_price - offer.offer_price) / offer.original_price) * 100);
    const validUntilDate = new Date(offer.valid_until);
    const dateFormatted = validUntilDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Determine badge text
    const badgeText = offer.is_new ? (offer.badge_text || 'NEW') : (offer.badge_text || 'PACKAGE');

    card.innerHTML = `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.4rem;">
                <span class="badge-new shimmer-badge" style="position: static; margin-bottom: 0;">${badgeText}</span>
                <span class="badge-discount" style="position: static;">${discount}% OFF</span>
            </div>

            <h3 style="font-size: 1.3rem; margin-bottom: 0.75rem; color: var(--text-primary); line-height: 1.3;">
                ${escapeHtml(offer.title)}
            </h3>

            <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.4rem;">
                ${escapeHtml(offer.description)}
            </p>
        </div>

        <div>
            <!-- Countdown Clock Container -->
            <div class="offer-countdown" data-valid-until="${offer.valid_until}" style="
                background: rgba(2, 132, 199, 0.06);
                border: 1px solid rgba(2, 132, 199, 0.15);
                border-radius: var(--radius-md);
                padding: 0.6rem 0.85rem;
                margin-bottom: 1.4rem;
                font-size: 0.8rem;
                color: #0369A1;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            ">
                <svg style="width: 16px; height: 16px; stroke: currentColor; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="countdown-text">Valid until: ${dateFormatted}</span>
            </div>

            <div style="display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.5rem;">
                <span style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 700; color: #0A1128;">
                    ₹${Number(offer.offer_price).toLocaleString()}
                </span>
                <span style="font-size: 1rem; color: var(--text-light); text-decoration: line-through;">
                    ₹${Number(offer.original_price).toLocaleString()}
                </span>
            </div>

            <a href="appointment.html?package=${encodeURIComponent(offer.title)}" class="btn btn-primary" style="width: 100%;">
                Book Now 
                <svg style="width: 18px; height: 18px; stroke: currentColor; margin-left: 4px;" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </a>
        </div>
    `;

    return card;
}

// Countdown Calculation Engine
function startOfferTimers() {
    const countdownElements = document.querySelectorAll('.offer-countdown');
    if (!countdownElements.length) return;

    function updateTimers() {
        const now = new Date().getTime();

        countdownElements.forEach(el => {
            const targetIso = el.getAttribute('data-valid-until');
            if (!targetIso) return;

            const targetTime = new Date(targetIso).getTime();
            const difference = targetTime - now;
            const textSpan = el.querySelector('.countdown-text');
            if (!textSpan) return;

            if (difference <= 0) {
                textSpan.textContent = 'Offer Expired';
                el.style.color = '#EF4444';
                el.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                el.style.background = 'rgba(239, 68, 68, 0.05)';
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

                if (days > 0) {
                    textSpan.textContent = `Ends in: ${days}d ${hours}h ${minutes}m`;
                } else {
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                    textSpan.textContent = `Ends in: ${hours}h ${minutes}m ${seconds}s`;
                }
            }
        });
    }

    updateTimers();
    setInterval(updateTimers, 1000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[m]);
}
