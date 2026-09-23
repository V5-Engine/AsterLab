/**
 * Aster Lab - Dynamic Offers & Health Packages Engine
 * 
 * Fetches promotional health screening packages dynamically from Supabase.
 * Features:
 * - Package Title & test count
 * - Test parameter pills/badges
 * - Original vs Discounted price display
 * - Dual CTAs: Book Now & Enquire Now
 * - Seamless Loading, Error, and Empty States
 */

document.addEventListener('DOMContentLoaded', () => {
    loadActiveOffers();
    loadPopularTests();
    loadTestPackages();
});

async function loadActiveOffers() {
    const container = document.getElementById('offers-container');
    if (!container) return;

    // 1. Loading State
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1rem;">
            <div class="preloader-spinner" style="margin: 0 auto 1rem auto;"></div>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Loading health checkup packages...</p>
        </div>
    `;

    try {
        const { data: offers, error } = await window.AsterLabDB.getActiveOffers();

        // 2. Error State
        if (error) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #FFF5F5; border-radius: var(--radius-lg); border: 1px solid #FED7D7;">
                    <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: #9B2C2C;">Unable to load packages</h3>
                    <p style="color: #C53030; font-size: 0.9rem; max-width: 420px; margin: 0 auto 1.25rem auto;">
                        Something went wrong while fetching health packages. Please try again.
                    </p>
                    <button class="btn btn-secondary btn-sm" onclick="loadActiveOffers()">Try Again</button>
                </div>
            `;
            return;
        }

        // 3. Empty State
        if (!offers || offers.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: #FFFFFF; border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
                    <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">No Active Packages Found</h3>
                    <p style="color: var(--text-muted); font-size: 0.92rem; max-width: 440px; margin: 0 auto 1.25rem auto;">
                        No packages match your filter criteria right now.
                    </p>
                    <a href="tests.html" class="btn btn-secondary btn-sm">Explore Routine Tests</a>
                </div>
            `;
            return;
        }

        // 4. Success State: Render Cards
        container.innerHTML = '';
        offers.forEach((offer, index) => {
            const card = createOfferCard(offer, index);
            container.appendChild(card);
        });

        // Trigger scroll reveals
        if (window.initScrollAnimations) {
            window.initScrollAnimations();
        }

    } catch (err) {
        console.error("Critical error loading active offers:", err);
    }
}

function createOfferCard(offer, index) {
    const card = document.createElement('div');
    card.className = `package-card reveal-fade-up delay-${((index % 3) + 1) * 100}`;

    const originalPriceFormatted = offer.original_price ? `₹${Number(offer.original_price).toLocaleString()}` : '';
    const offerPriceFormatted = `₹${Number(offer.offer_price).toLocaleString()}`;
    const badgeHtml = offer.is_new ? `<span class="package-badge-new">${escapeHtml(offer.badge_text || 'NEW')}</span>` : '';

    card.innerHTML = `
        ${badgeHtml}
        <div>
            <h3 class="package-title">${escapeHtml(offer.title)}</h3>
            <div class="package-test-count">Includes Comprehensive Screening</div>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">
                ${escapeHtml(offer.description)}
            </p>
        </div>

        <div>
            <div class="package-price-row">
                ${originalPriceFormatted ? `<span class="price-original">${originalPriceFormatted}</span>` : ''}
                <span class="price-discounted">${offerPriceFormatted}</span>
            </div>

            <div class="package-actions">
                <a href="appointment.html?package=${encodeURIComponent(offer.title)}" class="btn btn-primary btn-sm">
                    Book Now
                </a>
                <a href="contact.html?package=${encodeURIComponent(offer.title)}" class="btn btn-secondary btn-sm">
                    Enquire Now
                </a>
            </div>
        </div>
    `;

    return card;
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
async function loadTestPackages() {

    const select = document.getElementById("direct-test");

    if (!select) return;

    const result = await window.AsterLabDB.getSelectTest();

    const selectedTests = result?.data || result || [];

    select.innerHTML = `
    <option value="">Select Test or Package</option>
    ${selectedTests.map(item => `
        <option value="${item.title}">
            ${item.title} (₹${Number(item.price || 0).toLocaleString("en-IN")})
        </option>
    `).join("")}
`;
}
async function loadPopularTests() {

    const container = document.getElementById("popular-test");

    if (!container) return;

    var result = await window.AsterLabDB.getPopularTests();

    var popularTests = result?.data || [];

    container.innerHTML = popularTests.map(test => `
        <div class="clean-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
            
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                    <span>Sample: ${test.sample}</span>
                    <span>TAT: ${test.tat}</span>
                </div>

                <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">
                    ${test.title}
                </h3>

                <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                    ${test.description}
                </p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <span style="font-family: var(--font-main); font-size: 1.3rem; font-weight: 700; color: var(--text-primary);">
                    ₹${test.price}
                </span>

                <a href="appointment.html?package=${encodeURIComponent(test.title)}" class="btn btn-primary btn-sm">
                    Book Test
                </a>
            </div>

        </div>
    `).join("");
}

