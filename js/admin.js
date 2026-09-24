/**
 * Aster Lab - Admin Portal Engine
 * Handles: Route guards, Role-based access (Admin vs Staff), Authentication,
 * Dashboard Metrics, Offers CRUD, Diagnostic Tests CRUD,
 * Appointments & Home Collection Status Management, and Audit Trail.
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

    // Determine Role: if email contains 'admin', rolename = 'admin', else 'staff'
    const userEmail = session?.user?.email || sessionStorage.getItem('admin_email') || '';
    const rolename = session?.rolename || (userEmail.toLowerCase().includes('admin') ? 'admin' : 'staff');
    sessionStorage.setItem('admin_email', userEmail);
    sessionStorage.setItem('admin_role', rolename);

    // Route Protection for Admin-only pages (Inquiries and Audit Logs)
    const currentPath = window.location.pathname;
    const isAdminOnlyPage = currentPath.endsWith('inquiry.html') || currentPath.endsWith('audit-logs.html');

    if (!isLoginPage && isAdminOnlyPage && rolename !== 'admin') {
        window.location.replace('dashboard.html');
        return;
    }

    // Attach Logout Handlers
    const logoutBtns = document.querySelectorAll('.admin-logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.AsterLabDB.logAudit('LOGOUT', 'auth', userEmail, `User ${userEmail} logged out.`);
            await window.AsterLabDB.adminLogout();
            sessionStorage.removeItem('admin_role');
            sessionStorage.removeItem('admin_email');
            window.location.replace('index.html');
        });
    });

    // Initialize UI Role Permissions & Mobile Navigation
    if (!isLoginPage) {
        applyRolePermissions(rolename, userEmail);
        initAdminMobileNav();
    }

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
    } else if (window.location.pathname.endsWith('inquiry.html')) {
        initAdminInquiryCollections();
    } else if (window.location.pathname.endsWith('tests.html')) {
        initAdminTests();
    } else if (window.location.pathname.endsWith('audit-logs.html')) {
        initAdminAuditLogs();
    }
});

// ----------------- ROLE-BASED ACCESS CONTROL -----------------
function applyRolePermissions(role, email) {
    if (role !== 'admin') {
        // Hide Admin-only features for Staff role
        document.querySelectorAll('.nav-inquiries-link, a[href="inquiry.html"]').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.nav-audit-link, a[href="audit-logs.html"]').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Render User Profile & Role summary in sidebar footer
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter && !document.getElementById('user-profile-summary-box')) {
        const profileBox = document.createElement('div');
        profileBox.id = 'user-profile-summary-box';
        profileBox.className = 'user-profile-summary';
        profileBox.innerHTML = `
            <div class="user-profile-role">
                <span style="font-size: 0.72rem; color: #94A3B8; font-weight: 600;">Signed in as</span>
                <span class="role-badge ${role}">${role.toUpperCase()}</span>
            </div>
            <div class="user-profile-email" title="${escapeHtml(email)}">${escapeHtml(email)}</div>
        `;
        sidebarFooter.insertBefore(profileBox, sidebarFooter.firstChild);
    }
}

// ----------------- ADMIN MOBILE NAVIGATION DRAWER -----------------
function initAdminMobileNav() {
    const sidebar = document.querySelector('.admin-sidebar');
    const toggleBtn = document.getElementById('admin-sidebar-toggle');
    const closeBtn = document.getElementById('admin-sidebar-close');
    const backdrop = document.getElementById('admin-sidebar-backdrop');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (backdrop) backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSidebar();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeSidebar);
    }

    // Auto-close drawer on link click in mobile view
    if (sidebar) {
        sidebar.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 991) {
                    closeSidebar();
                }
            });
        });
    }

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });

    // Close sidebar if window resized to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991 && sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

// ----------------- ADMIN LOGIN -----------------
function initAdminLogin() {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value.trim();
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
            const rolename = email.toLowerCase().includes('admin') ? 'admin' : 'staff';
            sessionStorage.setItem('admin_email', email);
            sessionStorage.setItem('admin_role', rolename);

            // Log authentication event in audit log
            await window.AsterLabDB.logAudit('LOGIN', 'auth', email, `User signed in with role: ${rolename.toUpperCase()}`);

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
                    await window.AsterLabDB.logAudit('UPDATE_OFFER', 'offer', id, `Updated package "${title}" (Price: ₹${offer_price})`);
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
                    await window.AsterLabDB.logAudit('CREATE_OFFER', 'offer', res.data?.id || title, `Created package "${title}" (Price: ₹${offer_price})`);
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

    tableBody.innerHTML = `<tr><td colspan="9" class="table-empty-state">Loading offers database...</td></tr>`;
    const { data: offers, error } = await window.AsterLabDB.getAllOffersAdmin();

    if (error || !offers || offers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="table-empty-state">No diagnostic packages created yet.</td></tr>`;
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
                <td>${escapeHtml(
                    new Date(o.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                    )}
                </td>
                <td>${escapeHtml(
                    o.updated_at
                        ? new Date(o.updated_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })
                        : '-'
                )}</td>
                <td>${escapeHtml(o.updated_user || '-')}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditOfferModal('${o.id}')" style="margin-right: 4px; padding: 4px 10px; font-size: 0.78rem;">Edit</button>
                    <button class="btn btn-outline btn-sm" onclick="deleteOfferRecord('${o.id}')" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.4); padding: 4px 8px; font-size: 0.78rem;">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.openEditOfferModal = function (id) {
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

window.deleteOfferRecord = async function (id) {
    const offer = offersDataCache.find(o => o.id === id);
    const offerTitle = offer?.title || id;

    if (confirm(`Are you sure you want to permanently delete "${offerTitle}"?`)) {
        const res = await window.AsterLabDB.deleteOffer(id);
        if (res.success) {
            await window.AsterLabDB.logAudit('DELETE_OFFER', 'offer', id, `Deleted package "${offerTitle}"`);
            window.showToast('Package removed.', 'info');
            await reloadOffersTable();
        } else {
            window.showToast(res.error || 'Delete failed.', 'error');
        }
    }
};

// ----------------- ADMIN TESTS -----------------
let testsDataCache = [];

async function initAdminTests() {
    const tableBody = document.getElementById('admin-tests-table');
    const addTestsBtn = document.getElementById('btn-add-tests');
    const testsModal = document.getElementById('tests-form-modal');
    const testsForm = document.getElementById('admin-tests-form');

    if (!tableBody || !testsModal || !testsForm) {
        return;
    }

    await reloadTestsTable();

    // Add Test Button
    if (addTestsBtn) {
        addTestsBtn.addEventListener('click', () => {
            testsForm.reset();
            document.getElementById('tests-modal-title').textContent = 'Create New Diagnostic Test';
            document.getElementById('tests-id').value = '';
            document.getElementById('tests-is-active').checked = true;
            document.getElementById('tests-is-popular').checked = false;
            document.getElementById('tests-display-order').value = 0;
            testsModal.classList.add('active');
        });
    }

    // Modal Close
    testsModal.querySelectorAll('.close-modal-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            testsModal.classList.remove('active');
        });
    });

    // Form Submit
    testsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('tests-id').value.trim();
        const title = document.getElementById('tests-title').value.trim();
        const category = document.getElementById('tests-category').value.trim();
        const description = document.getElementById('tests-description').value.trim();
        const parametersValue = document.getElementById('tests-parameters').value;
        const parameters = parametersValue === '' ? null : parseInt(parametersValue, 10);
        const tat = document.getElementById('tests-tat').value.trim();
        const price = parseFloat(document.getElementById('tests-price').value);
        const displayOrderValue = document.getElementById('tests-display-order').value;
        const display_order = displayOrderValue === '' ? 0 : parseInt(displayOrderValue, 10);
        const fasting = document.getElementById('tests-fasting').value.trim();
        const is_active = document.getElementById('tests-is-active').checked;
        const is_popular = document.getElementById('tests-is-popular').checked;

        if (!title) {
            window.showToast('Test title is required.', 'error');
            return;
        }

        if (isNaN(price) || price < 0) {
            window.showToast('Please enter a valid test price.', 'error');
            return;
        }

        const payload = {
            title,
            category: category || null,
            description: description || null,
            parameters,
            tat: tat || null,
            price,
            is_popular,
            is_active,
            display_order,
            fasting: fasting || null
        };

        if (id) {
            const res = await window.AsterLabDB.updateTest(id, payload);
            if (res.error) {
                window.showToast(res.error, 'error');
                return;
            }
            await window.AsterLabDB.logAudit('UPDATE_TEST', 'test', id, `Updated test "${title}" (Price: ₹${price})`);
            window.showToast('Test updated successfully!', 'success');
        } else {
            const res = await window.AsterLabDB.createTest(payload);
            if (res.error) {
                window.showToast(res.error, 'error');
                return;
            }
            await window.AsterLabDB.logAudit('CREATE_TEST', 'test', title, `Created test "${title}" (Price: ₹${price})`);
            window.showToast('Test created successfully!', 'success');
        }

        testsModal.classList.remove('active');
        await reloadTestsTable();
    });
}

async function reloadTestsTable() {
    const tableBody = document.getElementById('admin-tests-table');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="11" class="table-empty-state">Loading tests database...</td></tr>`;

    const result = await window.AsterLabDB.getAllTestsAdmin();
    const tests = result?.data || [];
    const error = result?.error;

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="11" class="table-empty-state">Error loading tests database.</td></tr>`;
        return;
    }

    if (tests.length === 0) {
        testsDataCache = [];
        tableBody.innerHTML = `<tr><td colspan="11" class="table-empty-state">No diagnostic tests created yet.</td></tr>`;
        return;
    }

    testsDataCache = tests;

    tableBody.innerHTML = tests.map(test => {
        const updatedDate = test.updated_at
            ? new Date(test.updated_at).toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
            : '-';

        return `
            <tr>
                <td><strong>${escapeHtml(test.title || '')}</strong></td>
                <td>${escapeHtml(test.category || '-')}</td>
                <td>${test.parameters ?? '-'}</td>
                <td>${escapeHtml(test.tat || '-')}</td>
                <td><span style="font-weight: 700; color: #0A1128;">₹${Number(test.price || 0).toFixed(2)}</span></td>
                <td>${escapeHtml(test.fasting || '-')}</td>
                <td>${test.is_popular ? '<span class="status-badge confirmed" style="font-size: 0.7rem;">Popular</span>' : '<span style="color: #94A3B8;">-</span>'}</td>
                <td><span class="status-badge ${test.is_active ? 'completed' : 'cancelled'}">${test.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>${escapeHtml(updatedDate)}</td>
                <td>${escapeHtml(test.updated_user || '-')}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditTestModal('${test.id}')" style="margin-right: 4px; padding: 4px 10px; font-size: 0.78rem;">Edit</button>
                    <button class="btn btn-outline btn-sm" onclick="deleteTestRecord('${test.id}')" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.4); padding: 4px 8px; font-size: 0.78rem;">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.openEditTestModal = function (id) {
    const test = testsDataCache.find(t => t.id === id);
    if (!test) return;

    document.getElementById('tests-modal-title').textContent = 'Edit Diagnostic Test';
    document.getElementById('tests-id').value = test.id || '';
    document.getElementById('tests-title').value = test.title || '';
    document.getElementById('tests-category').value = test.category || '';
    document.getElementById('tests-description').value = test.description || '';
    document.getElementById('tests-parameters').value = test.parameters ?? '';
    document.getElementById('tests-tat').value = test.tat || '';
    document.getElementById('tests-price').value = test.price ?? 0;
    document.getElementById('tests-display-order').value = test.display_order ?? 0;
    document.getElementById('tests-fasting').value = test.fasting || '';
    document.getElementById('tests-is-active').checked = test.is_active === true;
    document.getElementById('tests-is-popular').checked = test.is_popular === true;

    document.getElementById('tests-form-modal').classList.add('active');
};

window.deleteTestRecord = async function (id) {
    const test = testsDataCache.find(t => t.id === id);
    const testName = test?.title || 'this test';

    if (!confirm(`Are you sure you want to permanently delete "${testName}"?`)) {
        return;
    }

    const res = await window.AsterLabDB.deleteTest(id);
    if (res.success) {
        await window.AsterLabDB.logAudit('DELETE_TEST', 'test', id, `Deleted test "${testName}"`);
        window.showToast('Test removed successfully.', 'info');
        await reloadTestsTable();
    } else {
        window.showToast(res.error || 'Delete failed.', 'error');
    }
};

// ----------------- ADMIN APPOINTMENTS -----------------
let appointmentsCache = [];
let currentAptFilter = 'All';

async function initAdminAppointments() {
    await reloadAppointmentsTable();

    const pills = document.querySelectorAll('.apt-filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', async () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentAptFilter = pill.getAttribute('data-status');
            filterAndRenderAppointments();
        });
    });

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
    tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">Loading appointments...</td></tr>`;

    const { data, error } = await window.AsterLabDB.getAppointments('All');
    if (error || !data) {
        tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">Error loading appointments.</td></tr>`;
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
        tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">No appointments match criteria.</td></tr>`;
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
            <td>${escapeHtml(
                apt.updated_at
                    ? new Date(apt.updated_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                    : '-'
            )}</td>
            <td>${escapeHtml(apt.updated_user || '-')}</td>
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

window.changeAppointmentStatus = async function (id, newStatus) {
    const item = appointmentsCache.find(a => a.id === id);
    const res = await window.AsterLabDB.updateAppointmentStatus(id, newStatus);
    if (res.error) {
        window.showToast(res.error, 'error');
    } else {
        await window.AsterLabDB.logAudit(
            'UPDATE_APPOINTMENT_STATUS',
            'appointment',
            item?.reference_number || id,
            `Changed patient (${item?.name || 'Unknown'}) appointment status to ${newStatus}`
        );
        window.showToast(`Appointment status updated to ${newStatus}`, 'success');
        if (item) item.status = newStatus;
        reloadAppointmentsTable();
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
    tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">Loading home collection requests...</td></tr>`;

    const { data, error } = await window.AsterLabDB.getHomeCollectionRequests('All');
    if (error || !data) {
        tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">Error loading collection requests.</td></tr>`;
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
        tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">No doorstep requests match criteria.</td></tr>`;
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
            <td>${escapeHtml(
                col.updated_at
                    ? new Date(col.updated_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                    : '-'
            )}</td>
            <td>${escapeHtml(col.updated_user || '-')}</td>
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

window.changeCollectionStatus = async function (id, newStatus) {
    const item = collectionsCache.find(c => c.id === id);
    const res = await window.AsterLabDB.updateHomeCollectionStatus(id, newStatus);
    if (res.error) {
        window.showToast(res.error, 'error');
    } else {
        await window.AsterLabDB.logAudit(
            'UPDATE_COLLECTION_STATUS',
            'home_collection',
            item?.reference_number || id,
            `Changed doorstep collection (${item?.name || 'Unknown'}) status to ${newStatus}`
        );
        window.showToast(`Doorstep request status updated to ${newStatus}`, 'success');
        if (item) item.status = newStatus;
        reloadCollectionsTable();
    }
};

// ----------------- ADMIN INQUIRY COLLECTIONS -----------------
let InquiryCache = [];
let currentInqFilter = 'All';

async function initAdminInquiryCollections() {
    await reloadInquiryCollectionsTable();

    const pills = document.querySelectorAll('.inq-filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', async () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentInqFilter = pill.getAttribute('data-status');
            filterAndRenderInquiry();
        });
    });

    const searchInput = document.getElementById('inq-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderInquiry();
        });
    }
}

async function reloadInquiryCollectionsTable() {
    const tableBody = document.getElementById('admin-inq-table');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">Loading inquiry requests...</td></tr>`;

    const { data, error } = await window.AsterLabDB.getInquiryRequests('All');
    if (error || !data) {
        tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">Error loading inquiry requests.</td></tr>`;
        return;
    }
    InquiryCache = data;
    filterAndRenderInquiry();
}

function filterAndRenderInquiry() {
    const tableBody = document.getElementById('admin-inq-table');
    const searchVal = (document.getElementById('inq-search-input')?.value || '').toLowerCase();
    if (!tableBody) return;

    let filtered = InquiryCache;

    if (currentInqFilter !== 'All') {
        filtered = filtered.filter(c => c.status.toLowerCase() === currentInqFilter.toLowerCase());
    }

    if (searchVal) {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(searchVal) ||
            c.mobile.toLowerCase().includes(searchVal) ||
            c.reference_id.toLowerCase().includes(searchVal) ||
            c.email.toLowerCase().includes(searchVal)
        );
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="table-empty-state">No inquiry requests match criteria.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(col => `
        <tr>
            <td><strong>${escapeHtml(col.reference_id)}</strong></td>
            <td>${escapeHtml(col.name)}</td>
            <td>${escapeHtml(col.mobile)}</td>
            <td>${escapeHtml(col.email)}</td>
            <td>${escapeHtml(col.message)}</td>
            <td>${escapeHtml(col.type)}</td>
            <td><span class="status-badge ${col.status.toLowerCase()}">${col.status}</span></td>
            <td>${escapeHtml(
                col.updated_at
                    ? new Date(col.updated_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                    : '-'
            )}</td>
            <td>${escapeHtml(col.updated_user || '-')}</td>
            <td>
                <select class="action-select" onchange="changeInquiryStatus('${col.id}', this.value)">
                    <option value="Pending" ${col.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Confirmed" ${col.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Completed" ${col.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${col.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

window.changeInquiryStatus = async function (id, newStatus) {
    const item = InquiryCache.find(c => c.id === id);
    const res = await window.AsterLabDB.updateInquiryStatus(id, newStatus);
    if (res.error) {
        window.showToast(res.error, 'error');
    } else {
        await window.AsterLabDB.logAudit(
            'UPDATE_INQUIRY_STATUS',
            'inquiry',
            item?.reference_id || id,
            `Changed inquiry (${item?.name || 'Customer'}) status to ${newStatus}`
        );
        window.showToast(`Inquiry request status updated to ${newStatus}`, 'success');
        if (item) item.status = newStatus;
        reloadInquiryCollectionsTable();
    }
};

// ----------------- ADMIN AUDIT LOGS MANAGEMENT (ADMIN ONLY) -----------------
let auditLogsCache = [];
let currentAuditFilter = 'All';

async function initAdminAuditLogs() {
    await reloadAuditLogsTable();

    const pills = document.querySelectorAll('.audit-filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', async () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentAuditFilter = pill.getAttribute('data-filter');
            filterAndRenderAuditLogs();
        });
    });

    const searchInput = document.getElementById('audit-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderAuditLogs();
        });
    }

    const refreshBtn = document.getElementById('btn-refresh-audit');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            await reloadAuditLogsTable();
            refreshBtn.disabled = false;
            window.showToast('Audit trail refreshed.', 'info');
        });
    }
}

async function reloadAuditLogsTable() {
    const tableBody = document.getElementById('admin-audit-table');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="6" class="table-empty-state">Loading audit trail records...</td></tr>`;

    const { data, error } = await window.AsterLabDB.getAuditLogs('All');
    if (error || !data) {
        tableBody.innerHTML = `<tr><td colspan="6" class="table-empty-state">Error loading audit logs.</td></tr>`;
        return;
    }
    auditLogsCache = data;
    filterAndRenderAuditLogs();
}

function filterAndRenderAuditLogs() {
    const tableBody = document.getElementById('admin-audit-table');
    const searchVal = (document.getElementById('audit-search-input')?.value || '').toLowerCase();
    if (!tableBody) return;

    let filtered = auditLogsCache;

    if (currentAuditFilter !== 'All') {
        const f = currentAuditFilter.toLowerCase();
        filtered = filtered.filter(l => 
            (l.entity_type || '').toLowerCase() === f ||
            (l.action || '').toLowerCase().includes(f)
        );
    }

    if (searchVal) {
        filtered = filtered.filter(l =>
            (l.user_email || '').toLowerCase().includes(searchVal) ||
            (l.action || '').toLowerCase().includes(searchVal) ||
            (l.entity_type || '').toLowerCase().includes(searchVal) ||
            (l.entity_id || '').toLowerCase().includes(searchVal) ||
            (l.details || '').toLowerCase().includes(searchVal)
        );
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="table-empty-state">No audit logs match criteria.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(log => {
        const timeStr = log.created_at
            ? new Date(log.created_at).toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
            : '-';

        const actionType = (log.action || '').toUpperCase();
        let actionClass = 'update';
        if (actionType.includes('CREATE')) actionClass = 'create';
        else if (actionType.includes('DELETE')) actionClass = 'delete';
        else if (actionType.includes('LOGIN') || actionType.includes('LOGOUT') || actionType.includes('AUTH')) actionClass = 'auth';

        const role = (log.role || 'staff').toLowerCase();

        return `
            <tr>
                <td style="white-space: nowrap; font-size: 0.82rem; color: #64748B;">${escapeHtml(timeStr)}</td>
                <td><strong>${escapeHtml(log.user_email || '-')}</strong></td>
                <td><span class="role-badge ${role}">${role.toUpperCase()}</span></td>
                <td><span class="action-tag ${actionClass}">${escapeHtml(log.action || '-')}</span></td>
                <td style="font-size: 0.82rem; color: #475569;">
                    <span style="text-transform: capitalize; font-weight: 600;">${escapeHtml(log.entity_type || '-')}</span>
                    ${log.entity_id ? `<br><small style="color: #94A3B8;">ID: ${escapeHtml(log.entity_id)}</small>` : ''}
                </td>
                <td style="font-size: 0.85rem; max-width: 320px;">${escapeHtml(log.details || '-')}</td>
            </tr>
        `;
    }).join('');
}

// ----------------- UTILITIES -----------------
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

window.showToast = function (message, type = 'info') {
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
