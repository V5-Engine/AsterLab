/**
 * Aster Lab - Appointment Booking Form Handler
 */

document.addEventListener('DOMContentLoaded', async () => {
    await loadTestPackages();
    initAppointmentForm();
    prefillPackageFromUrl();
    setMinDate();
});

async function loadTestPackages() {

    const select = document.getElementById("test-package-select");

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

// Prefill package selector if URL contains ?package=...
function prefillPackageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const packageParam = params.get('package');
    const select = document.getElementById('test-package-select');

    console.log("select", select);
    console.log("select length", select.options.length);

    if (!packageParam || !select) return;

    let found = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.toLowerCase().includes(packageParam.toLowerCase()) || 
            select.options[i].value.toLowerCase().includes(packageParam.toLowerCase())) {
            select.selectedIndex = i;
            console.log("Found")
            found = true;
            break;
        }
    }

    if (!found) {
        const customOpt = document.createElement('option');
        customOpt.value = packageParam;
        customOpt.text = packageParam;
        customOpt.selected = true;
        select.add(customOpt);
    }
}

// Disallow past dates
function setMinDate() {
    const dateInput = document.getElementById('appointment-date');
    if (!dateInput) return;
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

function initAppointmentForm() {
    const form = document.getElementById('appointment-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Gather form fields
        const nameInput = document.getElementById('patient-name');
        const mobileInput = document.getElementById('patient-mobile');
        const emailInput = document.getElementById('patient-email');
        const ageInput = document.getElementById('patient-age');
        const genderInput = document.getElementById('patient-gender');
        const dateInput = document.getElementById('appointment-date');
        const timeInput = document.getElementById('appointment-time');
        const packageInput = document.getElementById('test-package-select');
        const notesInput = document.getElementById('patient-notes');
        const submitBtn = document.getElementById('appointment-submit-btn');

        // 2. Validation
        const name = nameInput.value.trim();
        const mobile = mobileInput.value.trim();
        const email = emailInput ? emailInput.value.trim() : '';
        const age = ageInput && ageInput.value ? parseInt(ageInput.value, 10) : null;
        const gender = genderInput ? genderInput.value : '';
        const appointment_date = dateInput.value;
        const appointment_time = timeInput.value;
        const test_package = packageInput.value;
        const notes = notesInput ? notesInput.value.trim() : '';

        if (!name || name.length < 2) {
            window.showToast('Please enter a valid full name.', 'warning');
            nameInput.focus();
            return;
        }

        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!mobile || !phoneRegex.test(mobile.replace(/[\s-]/g, ''))) {
            window.showToast('Please enter a valid 10-digit mobile number.', 'warning');
            mobileInput.focus();
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            window.showToast('Please enter a valid email address.', 'warning');
            emailInput.focus();
            return;
        }

        if (!appointment_date) {
            window.showToast('Please select your preferred appointment date.', 'warning');
            dateInput.focus();
            return;
        }

        if (!appointment_time) {
            window.showToast('Please select your preferred time slot.', 'warning');
            timeInput.focus();
            return;
        }

        if (!test_package) {
            window.showToast('Please select the diagnostic test or health package.', 'warning');
            packageInput.focus();
            return;
        }

        // 3. Loading state
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="32" stroke-dashoffset="12"></circle>
            </svg>
            Confirming Booking...
        `;

        try {
            const { data, reference_number, error } = await window.AsterLabDB.createAppointment({
                name,
                mobile,
                email,
                age,
                gender,
                appointment_date,
                appointment_time,
                test_package,
                notes
            });

            if (error) {
                window.showToast(error, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                return;
            }

            // 4. Success state modal
            showSuccessModal({
                title: 'Appointment Request Received',
                referenceNumber: reference_number,
                message: 'Thank you. Our lab reception team will contact you shortly to confirm your diagnostic slot.',
                date: appointment_date,
                time: appointment_time,
                test: test_package
            });

            form.reset();

        } catch (err) {
            console.error("Booking error:", err);
            window.showToast('Something went wrong while booking. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
}

function showSuccessModal({ title, referenceNumber, message, date, time, test }) {
    const modal = document.getElementById('booking-success-modal');
    if (!modal) return;

    const refElem = document.getElementById('modal-ref-number');
    const titleElem = document.getElementById('modal-title');
    const msgElem = document.getElementById('modal-msg');
    const detailsElem = document.getElementById('modal-details');

    if (titleElem) titleElem.textContent = title;
    if (refElem) refElem.textContent = referenceNumber;
    if (msgElem) msgElem.textContent = message;
    if (detailsElem) {
        detailsElem.innerHTML = `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 1rem; margin-top: 1rem; font-size: 0.88rem; text-align: left;">
                <div style="margin-bottom: 0.4rem;"><strong>Test:</strong> ${test}</div>
                <div style="margin-bottom: 0.4rem;"><strong>Scheduled Date:</strong> ${date}</div>
                <div><strong>Preferred Slot:</strong> ${time}</div>
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
