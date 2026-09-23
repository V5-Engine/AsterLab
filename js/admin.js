/**
 * Aster Lab - Admin Portal Engine
 * Handles: Route guards, Authentication, Dashboard Metrics, Offers CRUD,
 * Appointments & Home Collection Status Management.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const isLoginPage = window.location.pathname.endsWith('/admin/index.html') || 
                        window.location.pathname.endsWith('/admin/');

    // Route Protection Guard
    const session = await window.AsterLabDB.getAdminSession();

    if (!session && !isLoginPage) {
        // Not logged in -> redirect to login
        window.location.replace('index.html');
        return;
    }

    if (session && isLoginPage) {
        // Already logged in on login page -> redirect to dashboard
        window.location.replace('dashboard.html');
        return;
    }

    // Attach Logout Handlers
    const logoutBtns = document.querySelectorAll('.admin-logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.AsterLabDB.adminLogout();
            window.location.replace('index.html');
        });
    });

    // Page Specific Initializers
    if (isLoginPage) {
        initAdminLogin();
    } else if (window.location.pathname.endsWith('dashboard.html')) {
        initAdminDashboard();
    } else if (window.location.pathname.endsWith('offers.html')) {
        initAdminOffers();
    } else if (window.location.pathname.endsWith('appointments.html')) {
        initAdminAppointments();
    } else if (window.location.pathname.endsWith('home-collection.html')) {
        initAdminHomeCollections();
    }
});

// ----------------- ADMIN LOGIN -----------------
function initAdminLogin() {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const submitBtn = document.getElementById('login-submit-btn');
        const errorAlert = document.getElementById('login-error-alert');

        if (errorAlert) errorAlert.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying Access...';

        const { session, error } = await window.AsterLabDB.adminLogin(email, password);

        if (error || !session) {
            if (errorAlert) {
                errorAlert.textContent = error || 'Authentication failed.';
                errorAlert.style.display = 'block';
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In to Portal';
        } else {
            window.location.replace('dashboard.html');
        }
    });
}

// ----------------- ADMIN DASHBOARD -----------------
async function initAdminDashboard() {
    try {
        const [offersRes, aptsRes, colRes] = await Promise.all([
            window.AsterLabDB.getAllOffersAdmin(),
            window.AsterLabDB.getAppointments('All'),
            window.AsterLabDB.getHomeCollectionRequests('All')
        ]);

        const allOffers = offersRes.data || [];
        const allApts = aptsRes.data || [];
        const allCols = colRes.data || [];

        // Compute metrics
        const totalOffers = allOffers.length;
        const activeOffers = allOffers.filter(o => o.is_active).length;
        const pendingApts = allApts.filter(a => a.status === 'Pending').length;
        const pendingCols = allCols.filter(c => c.status === 'Pending').length;

        // Render metrics
        const totalOffersEl = document.getElementById('stat-total-offers');
        const activeOffersEl = document.getElementById('stat-active-offers');
        const pendingAptsEl = document.getElementById('stat-pending-apts');
        const pendingColsEl = document.getElementById('stat-pending-cols');

        if (totalOffersEl) totalOffersEl.textContent = totalOffers;
        if (activeOffersEl) activeOffersEl.textContent = activeOffers;
        if (pendingAptsEl) pendingAptsEl.textContent = pendingApts;
        if (pendingColsEl) pendingColsEl.textContent = pendingCols;

        // Render Recent Appointments preview table
        const recentAptsTable = document.getElementById('dashboard-recent-apts');
        if (recentAptsTable) {
            if (allApts.length === 0) {
                recentAptsTable.innerHTML = `<tr><td colspan="5" class="table-empty-state">No appointments recorded yet.</td></tr>`;
            } else {
                recentAptsTable.innerHTML = allApts.slice(0, 5).map(apt => `
                    <tr>
                        <td><strong>${escapeHtml(apt.reference_number)}</strong></td>
                        <td>${escapeHtml(apt.name)}</td>
                        <td>${escapeHtml(apt.test_package)}</td>
                        <td>${escapeHtml(apt.appointment_date)}</td>
                        <td><span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span></td>
                    </tr>
                `).join('');
            }
        }

        // Render Recent Home Collections preview table
        const recentColsTable = document.getElementById('dashboard-recent-cols');
        if (recentColsTable) {
            if (allCols.length === 0) {
                recentColsTable.innerHTML = `<tr><td colspan="5" class="table-empty-state">No home collection requests recorded yet.</td></tr>`;
            } else {
                recentColsTable.innerHTML = allCols.slice(0, 5).map(col => `
                    <tr>
                        <td><strong>${escapeHtml(col.reference_number)}</strong></td>
                        <td>${escapeHtml(col.name)}</td>
                        <td>${escapeHtml(col.city)}</td>
                        <td>${escapeHtml(col.preferred_date)}</td>
                        <td><span class="status-badge ${col.status.toLowerCase()}">${col.status}</span></td>
                    </tr>
                `).join('');
            }
        }

    } catch (err) {
        console.error("Dashboard metric load error:", err);
    }
}

// ----------------- ADMIN OFFERS MANAGEMENT -----------------
let offersDataCache = [];

async function initAdminOffers() {
    const tableBody = document.getElementById('admin-offers-table');
    const addOfferBtn = document.getElementById('btn-add-offer');
    const offerModal = document.getElementById('offer-form-modal');
    const offerForm = document.getElementById('admin-offer-form');

    await reloadOffersTable();

    // Add Offer Button
    if (addOfferBtn && offerModal) {
        addOfferBtn.addEventListener('click', () => {
            offerForm.reset();
            document.getElementById('offer-modal-title').textContent = 'Create New Diagnostic Package';
            document.getElementById('offer-id').value = '';
            // Default 90 days validity
            const ninetyDays = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
            document.getElementById('offer-valid-until').value = ninetyDays;
            document.getElementById('offer-is-active').checked = true;
            document.getElementById('offer-is-new').checked = true;
            offerModal.classList.add('active');
        });
    }

    // Modal Close Triggers
    if (offerModal) {
        offerModal.querySelectorAll('.close-modal-trigger').forEach(btn => {
            btn.addEventListener('click', () => offerModal.classList.remove('active'));
        });
    }

    // Save Offer Form Submit
    if (offerForm) {
        offerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('offer-id').value;
            const title = document.getElementById('offer-title').value.trim();
            const description = document.getElementById('offer-desc').value.trim();
            const original_price = parseFloat(document.getElementById('offer-orig-price').value);
            const offer_price = parseFloat(document.getElementById('offer-price').value);
            const valid_until = new Date(document.getElementById('offer-valid-until').value).toISOString();
            const is_active = document.getElementById('offer-is-active').checked;
            const is_new = document.getElementById('offer-is-new').checked;
            const badge_text = document.getElementById('offer-badge-text').value.trim() || 'NEW';

            const payload = {
                title,
                description,
                original_price,
                offer_price,
                valid_until,
                is_active,
                is_new,
                badge_text
            };

            if (id) {
                // Update
                const res = await window.AsterLabDB.updateOffer(id, payload);
                if (res.error) {
                    window.showToast(res.error, 'error');
                } else {
                    window.showToast('Offer updated successfully!', 'success');
                    offerModal.classList.remove('active');
                    await reloadOffersTable();
                }
            } else {
                // Create
                const res = await window.AsterLabDB.createOffer(payload);
                if (res.error) {
                    window.showToast(res.error, 'error');
                } else {
                    window.showToast('Offer created successfully!', 'success');
                    offerModal.classList.remove('active');
                    await reloadOffersTable();
                }
            }
        });
    }
}

async function reloadOffersTable() {
    const tableBody = document.getElementById('admin-offers-table');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="7" class="table-empty-state">Loading offers database...</td></tr>`;
    const { data: offers, error } = await window.AsterLabDB.getAllOffersAdmin();

    if (error || !offers || offers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="table-empty-state">No diagnostic packages created yet.</td></tr>`;
        return;
    }

    offersDataCache = offers;
    tableBody.innerHTML = offers.map(o => {
        const validDate = new Date(o.valid_until).toLocaleDateString();
        return `
            <tr>
                <td><strong>${escapeHtml(o.title)}</strong></td>
                <td>
                    ${o.is_new ? '<span class="status-badge confirmed" style="font-size: 0.7rem;">NEW</span>' : '<span style="color: #94A3B8;">Standard</span>'}
                </td>
                <td>
                    <span style="font-weight: 700; color: #0A1128;">₹${o.offer_price}</span>
                    <span style="color: #94A3B8; text-decoration: line-through; font-size: 0.8rem; margin-left: 4px;">₹${o.original_price}</span>
                </td>
                <td>${validDate}</td>
                <td>
                    <span class="status-badge ${o.is_active ? 'completed' : 'cancelled'}">
                        ${o.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditOfferModal('${o.id}')" style="margin-right: 4px; padding: 4px 10px; font-size: 0.78rem;">Edit</button>
                    <button class="btn btn-outline btn-sm" onclick="deleteOfferRecord('${o.id}')" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.4); padding: 4px 8px; font-size: 0.78rem;">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.openEditOfferModal = function(id) {
    const offer = offersDataCache.find(o => o.id === id);
    if (!offer) return;

    document.getElementById('offer-modal-title').textContent = 'Edit Diagnostic Package';
    document.getElementById('offer-id').value = offer.id;
    document.getElementById('offer-title').value = offer.title;
    document.getElementById('offer-desc').value = offer.description;
    document.getElementById('offer-orig-price').value = offer.original_price;
    document.getElementById('offer-price').value = offer.offer_price;
    document.getElementById('offer-valid-until').value = new Date(offer.valid_until).toISOString().split('T')[0];
    document.getElementById('offer-is-active').checked = offer.is_active;
    document.getElementById('offer-is-new').checked = offer.is_new;
    document.getElementById('offer-badge-text').value = offer.badge_text || 'NEW';

    document.getElementById('offer-form-modal').classList.add('active');
};

window.deleteOfferRecord = async function(id) {
    if (confirm("Are you sure you want to permanently delete this health package?")) {
        const res = await window.AsterLabDB.deleteOffer(id);
        if (res.success) {
            window.showToast('Package removed.', 'info');
            await reloadOffersTable();
        } else {
            window.showToast(res.error || 'Delete failed.', 'error');
        }
    }
};

// ----------------- ADMIN APPOINTMENTS -----------------
let appointmentsCache = [];
let currentAptFilter = 'All';

async function initAdminAppointments() {
    await reloadAppointmentsTable();

    // Filter pills
    const pills = document.querySelectorAll('.apt-filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', async () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentAptFilter = pill.getAttribute('data-status');
            filterAndRenderAppointments();
        });
    });

    // Search
    const searchInput = document.getElementById('apt-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderAppointments();
        });
    }
}

async function reloadAppointmentsTable() {
    const tableBody = document.getElementById('admin-apts-table');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="8" class="table-empty-state">Loading appointments...</td></tr>`;

    const { data, error } = await window.AsterLabDB.getAppointments('All');
    if (error || !data) {
        tableBody.innerHTML = `<tr><td colspan="8" class="table-empty-state">Error loading appointments.</td></tr>`;
        return;
    }
    appointmentsCache = data;
    filterAndRenderAppointments();
}

function filterAndRenderAppointments() {
    const tableBody = document.getElementById('admin-apts-table');
    const searchVal = (document.getElementById('apt-search-input')?.value || '').toLowerCase();
    if (!tableBody) return;

    let filtered = appointmentsCache;

    if (currentAptFilter !== 'All') {
        filtered = filtered.filter(a => a.status.toLowerCase() === currentAptFilter.toLowerCase());
    }

    if (searchVal) {
        filtered = filtered.filter(a => 
            a.name.toLowerCase().includes(searchVal) ||
            a.mobile.toLowerCase().includes(searchVal) ||
            a.reference_number.toLowerCase().includes(searchVal)
        );
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="table-empty-state">No appointments match criteria.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(apt => `
        <tr>
            <td><strong>${escapeHtml(apt.reference_number)}</strong></td>
            <td>${escapeHtml(apt.name)}</td>
            <td>${escapeHtml(apt.mobile)}</td>
            <td>${escapeHtml(apt.appointment_date)}</td>
            <td>${escapeHtml(apt.appointment_time)}</td>
            <td>${escapeHtml(apt.test_package)}</td>
            <td><span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td>
                <select class="action-select" onchange="changeAppointmentStatus('${apt.id}', this.value)">
                    <option value="Pending" ${apt.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Confirmed" ${apt.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Completed" ${apt.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${apt.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

window.changeAppointmentStatus = async function(id, newStatus) {
    const res = await window.AsterLabDB.updateAppointmentStatus(id, newStatus);
    if (res.error) {
        window.showToast(res.error, 'error');
    } else {
        window.showToast(`Appointment status updated to ${newStatus}`, 'success');
        // Update cache item
        const item = appointmentsCache.find(a => a.id === id);
        if (item) item.status = newStatus;
        filterAndRenderAppointments();
    }
};

// ----------------- ADMIN HOME COLLECTIONS -----------------
let collectionsCache = [];
let currentColFilter = 'All';

async function initAdminHomeCollections() {
    await reloadCollectionsTable();

    const pills = document.querySelectorAll('.col-filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', async () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentColFilter = pill.getAttribute('data-status');
            filterAndRenderCollections();
        });
    });

    const searchInput = document.getElementById('col-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderCollections();
        });
    }
}

async function reloadCollectionsTable() {
    const tableBody = document.getElementById('admin-cols-table');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="8" class="table-empty-state">Loading home collection requests...</td></tr>`;

    const { data, error } = await window.AsterLabDB.getHomeCollectionRequests('All');
    if (error || !data) {
        tableBody.innerHTML = `<tr><td colspan="8" class="table-empty-state">Error loading collection requests.</td></tr>`;
        return;
    }
    collectionsCache = data;
    filterAndRenderCollections();
}

function filterAndRenderCollections() {
    const tableBody = document.getElementById('admin-cols-table');
    const searchVal = (document.getElementById('col-search-input')?.value || '').toLowerCase();
    if (!tableBody) return;

    let filtered = collectionsCache;

    if (currentColFilter !== 'All') {
        filtered = filtered.filter(c => c.status.toLowerCase() === currentColFilter.toLowerCase());
    }

    if (searchVal) {
        filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(searchVal) ||
            c.mobile.toLowerCase().includes(searchVal) ||
            c.reference_number.toLowerCase().includes(searchVal) ||
            c.address.toLowerCase().includes(searchVal)
        );
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="table-empty-state">No doorstep requests match criteria.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(col => `
        <tr>
            <td><strong>${escapeHtml(col.reference_number)}</strong></td>
            <td>${escapeHtml(col.name)}</td>
            <td>${escapeHtml(col.mobile)}</td>
            <td style="max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(col.address)}">
                ${escapeHtml(col.address)}, ${escapeHtml(col.city)}
            </td>
            <td>${escapeHtml(col.preferred_date)} (${escapeHtml(col.preferred_time)})</td>
            <td>${escapeHtml(col.test_package)}</td>
            <td><span class="status-badge ${col.status.toLowerCase()}">${col.status}</span></td>
            <td>
                <select class="action-select" onchange="changeCollectionStatus('${col.id}', this.value)">
                    <option value="Pending" ${col.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Confirmed" ${col.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Completed" ${col.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${col.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

window.changeCollectionStatus = async function(id, newStatus) {
    const res = await window.AsterLabDB.updateHomeCollectionStatus(id, newStatus);
    if (res.error) {
        window.showToast(res.error, 'error');
    } else {
        window.showToast(`Doorstep request status updated to ${newStatus}`, 'success');
        const item = collectionsCache.find(c => c.id === id);
        if (item) item.status = newStatus;
        filterAndRenderCollections();
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[m]);
}
