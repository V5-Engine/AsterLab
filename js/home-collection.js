/**
 * Aster Lab - Home Collection Form Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    initHomeCollectionForm();
    setMinDate();
    loadTestPackages();
});

function setMinDate() {
    const dateInput = document.getElementById('collection-date');
    if (!dateInput) return;
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

async function loadTestPackages() {

    const select = document.getElementById("collection-test");

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

function initHomeCollectionForm() {
    const form = document.getElementById('home-collection-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Form Fields
        const name = document.getElementById('collection-name').value.trim();
        const mobile = document.getElementById('collection-mobile').value.trim();
        const email = document.getElementById('collection-email') ? document.getElementById('collection-email').value.trim() : '';
        const address = document.getElementById('collection-address').value.trim();
        const city = document.getElementById('collection-city').value.trim();
        const pincode = document.getElementById('collection-pincode').value.trim();
        const preferred_date = document.getElementById('collection-date').value;
        const preferred_time = document.getElementById('collection-time').value;
        const test_package = document.getElementById('collection-test').value;
        const instructions = document.getElementById('collection-instructions') ? document.getElementById('collection-instructions').value.trim() : '';
        const submitBtn = document.getElementById('home-collection-submit-btn');

        // Validation
        if (!name || name.length < 2) {
            window.showToast('Please enter a valid name.', 'warning');
            return;
        }

        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!mobile || !phoneRegex.test(mobile.replace(/[\s-]/g, ''))) {
            window.showToast('Please enter a valid 10-digit mobile number.', 'warning');
            return;
        }

        if (!address || address.length < 5) {
            window.showToast('Please provide your complete doorstep address.', 'warning');
            return;
        }

        if (!city) {
            window.showToast('Please enter your city.', 'warning');
            return;
        }

        if (!pincode || pincode.length < 5) {
            window.showToast('Please enter a valid 6-digit postal pincode.', 'warning');
            return;
        }

        if (!preferred_date) {
            window.showToast('Please choose your preferred collection date.', 'warning');
            return;
        }

        if (!preferred_time) {
            window.showToast('Please select your preferred arrival time window.', 'warning');
            return;
        }

        if (!test_package) {
            window.showToast('Please choose the required test or package.', 'warning');
            return;
        }

        // Loading
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="32" stroke-dashoffset="12"></circle>
            </svg>
            Scheduling Phlebotomist...
        `;

        try {
            const { data, reference_number, error } = await window.AsterLabDB.createHomeCollectionRequest({
                name,
                mobile,
                email,
                address,
                city,
                pincode,
                preferred_date,
                preferred_time,
                test_package,
                instructions
            });

            if (error) {
                window.showToast(error, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                return;
            }

            // Show Success Modal
            showCollectionSuccessModal({
                referenceNumber: reference_number,
                name,
                address: `${address}, ${city} - ${pincode}`,
                slot: `${preferred_date} (${preferred_time})`,
                test: test_package
            });

            form.reset();

        } catch (err) {
            console.error("Home collection schedule error:", err);
            window.showToast('Failed to schedule collection. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
}

function showCollectionSuccessModal({ referenceNumber, name, address, slot, test }) {
    const modal = document.getElementById('collection-success-modal');
    if (!modal) return;

    const refElem = document.getElementById('modal-ref-number');
    const detailsElem = document.getElementById('modal-details');

    if (refElem) refElem.textContent = referenceNumber;
    if (detailsElem) {
        detailsElem.innerHTML = `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 1.1rem; margin-top: 1.2rem; font-size: 0.88rem; text-align: left; line-height: 1.6;">
                <div><strong>Patient:</strong> ${name}</div>
                <div><strong>Test:</strong> ${test}</div>
                <div><strong>Doorstep Slot:</strong> ${slot}</div>
                <div><strong>Location:</strong> ${address}</div>
            </div>
        `;
    }

    modal.classList.add('active');

    const closeBtns = modal.querySelectorAll('.close-modal-trigger');
    closeBtns.forEach(btn => {
        btn.onclick = () => {
            modal.classList.remove('active');
        };
    });
}
