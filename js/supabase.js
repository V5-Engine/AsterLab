/**
 * Aster Lab - Unified Supabase Data Layer
 * 
 * Provides clean asynchronous data services for Offers, Appointments, 
 * Home Collections, and Admin Authentication.
 * 
 * Automatically detects whether real Supabase credentials are provided.
 * If credentials are valid, it leverages the Supabase JS SDK.
 * Otherwise, it activates a high-fidelity local sandbox backed by LocalStorage,
 * ensuring seamless demonstration, testing, and zero-downtime offline functionality.
 */

(function () {
    // Initial Seed Data for Demo / Fallback Mode
    const DEFAULT_OFFERS = [
        {
            id: "off-001",
            title: "Comprehensive Full Body Vitality Screening",
            description: "85 critical parameters covering Complete Blood Count, Liver & Kidney Profile, Lipid Panel, Vitamin D3/B12, and HbA1c Diabetes metrics.",
            original_price: 2499,
            offer_price: 999,
            image_url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 90 * 86400000).toISOString(),
            is_active: true,
            is_new: true,
            badge_text: "NEW",
            created_at: new Date().toISOString()
        },
        {
            id: "off-002",
            title: "Advanced Cardiac & Lipid Risk Profile",
            description: "Cutting-edge cardiology diagnostics including High-Sensitivity Troponin I, hs-CRP, Apolipoprotein A1/B, and Complete Lipid Profile.",
            original_price: 2999,
            offer_price: 1499,
            image_url: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80",
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 45 * 86400000).toISOString(),
            is_active: true,
            is_new: true,
            badge_text: "JUST ARRIVED",
            created_at: new Date().toISOString()
        },
        {
            id: "off-003",
            title: "Precision Diabetes & Metabolic Health Check",
            description: "Complete glucose management assessment featuring Fasting Blood Sugar, Postprandial, HbA1c with Average Blood Glucose, and Urine Microalbumin.",
            original_price: 1599,
            offer_price: 699,
            image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 60 * 86400000).toISOString(),
            is_active: true,
            is_new: false,
            badge_text: "POPULAR",
            created_at: new Date().toISOString()
        },
        {
            id: "off-004",
            title: "Women's Master Wellness & Hormone Spectrum",
            description: "Tailored biomarker panel for women covering Thyroid (T3, T4, TSH), Iron deficiency profile, Calcium, Vitamin D, and Reproductive Hormones.",
            original_price: 3299,
            offer_price: 1799,
            image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 75 * 86400000).toISOString(),
            is_active: true,
            is_new: true,
            badge_text: "NEW",
            created_at: new Date().toISOString()
        },
        {
            id: "off-005",
            title: "Men's Executive Health & Performance",
            description: "Comprehensive screening for active men including Testosterone levels, PSA (Prostate Specific Antigen), Liver Enzymes, and Cardiovascular Risk.",
            original_price: 3199,
            offer_price: 1699,
            image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 40 * 86400000).toISOString(),
            is_active: true,
            is_new: false,
            badge_text: "POPULAR",
            created_at: new Date().toISOString()
        },
        {
            id: "off-006",
            title: "Essential Vitamin D & B12 Neurological Duo",
            description: "Accurate chemiluminescence testing for Active Vitamin B12 and Total 25-Hydroxy Vitamin D to target fatigue, immunity, and bone health.",
            original_price: 1899,
            offer_price: 799,
            image_url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80",
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
            is_active: true,
            is_new: true,
            badge_text: "JUST ARRIVED",
            created_at: new Date().toISOString()
        }
    ];

    const DEFAULT_APPOINTMENTS = [
        {
            id: "apt-101",
            reference_number: "AST-APT-8921",
            name: "Dr. Rajesh Kulkarni",
            mobile: "+91 98450 12345",
            email: "rajesh.kulkarni@example.com",
            age: 48,
            gender: "Male",
            appointment_date: "2026-09-24",
            appointment_time: "08:30 AM",
            test_package: "Comprehensive Full Body Vitality Screening",
            notes: "Fasting 10 hours required. Prefer early morning slot.",
            status: "Confirmed",
            created_at: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
            id: "apt-102",
            reference_number: "AST-APT-8922",
            name: "Ananya Sharma",
            mobile: "+91 98765 43210",
            email: "ananya.s@example.com",
            age: 32,
            gender: "Female",
            appointment_date: "2026-09-25",
            appointment_time: "10:00 AM",
            test_package: "Women's Master Wellness & Hormone Spectrum",
            notes: "Annual routine check-up.",
            status: "Pending",
            created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        }
    ];

    const DEFAULT_HOME_COLLECTIONS = [
        {
            id: "hm-201",
            reference_number: "AST-HMC-4512",
            name: "Vikram Malhotra",
            mobile: "+91 91234 56789",
            email: "vikram.m@example.com",
            address: "Villa 42, Green Glen Valley, Outer Ring Road",
            city: "Bengaluru",
            pincode: "560103",
            preferred_date: "2026-09-23",
            preferred_time: "07:00 AM - 08:00 AM",
            test_package: "Precision Diabetes & Metabolic Health Check",
            instructions: "Ring bell twice, elderly patient.",
            status: "Confirmed",
            created_at: new Date(Date.now() - 3600000 * 8).toISOString()
        },
        {
            id: "hm-202",
            reference_number: "AST-HMC-4513",
            name: "Pooja Hegde",
            mobile: "+91 99887 76655",
            email: "pooja.h@example.com",
            address: "Flat 402, Sky High Towers, Indiranagar",
            city: "Bengaluru",
            pincode: "560038",
            preferred_date: "2026-09-24",
            preferred_time: "08:00 AM - 09:00 AM",
            test_package: "Advanced Cardiac & Lipid Risk Profile",
            instructions: "Call on arrival at security gate.",
            status: "Pending",
            created_at: new Date(Date.now() - 3600000 * 1).toISOString()
        }
    ];

    // Local Storage Helpers
    function getStorage(key, defaultVal) {
        try {
            const raw = localStorage.getItem("asterlab_" + key);
            return raw ? JSON.parse(raw) : defaultVal;
        } catch (e) {
            console.warn("Storage read error:", e);
            return defaultVal;
        }
    }

    function setStorage(key, val) {
        try {
            localStorage.setItem("asterlab_" + key, JSON.stringify(val));
        } catch (e) {
            console.warn("Storage write error:", e);
        }
    }

    // Initialize Mock DB if not present
    if (!localStorage.getItem("asterlab_offers")) {
        setStorage("offers", DEFAULT_OFFERS);
    }
    if (!localStorage.getItem("asterlab_appointments")) {
        setStorage("appointments", DEFAULT_APPOINTMENTS);
    }
    if (!localStorage.getItem("asterlab_home_collections")) {
        setStorage("home_collections", DEFAULT_HOME_COLLECTIONS);
    }

    // Check if real Supabase client can be configured
    let client = null;
    const config = window.SUPABASE_CONFIG || {};
    const isConfigured = config.URL && 
                         config.ANON_KEY && 
                         !config.URL.includes("your-project-id") &&
                         !config.ANON_KEY.includes("your-anon-key");

    if (isConfigured && window.supabase && typeof window.supabase.createClient === "function") {
        try {
            client = window.supabase.createClient(config.URL, config.ANON_KEY);
            console.log("⚡ Aster Lab connected to Supabase Live Backend");
        } catch (err) {
            console.warn("Failed to initialize Supabase client, falling back to local engine:", err);
            client = null;
        }
    } else {
        console.log("ℹ Aster Lab running in High-Fidelity Local Engine (configure js/config.js for live Supabase)");
    }

    // Utility: Generate Unique Reference Numbers
    function generateReference(prefix) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        const timestamp = Date.now().toString().slice(-4);
        return `${prefix}-${rand}${timestamp}`;
    }

    // Aster Lab Service API
    const AsterLabDB = {
        isLive: () => !!client,

        // ----------------- OFFERS -----------------
        async getActiveOffers() {
            if (client) {
                try {
                    const now = new Date().toISOString();
                    const { data, error } = await client
                        .from("offers")
                        .select("*")
                        .eq("is_active", true)
                        .gte("valid_until", now)
                        .order("created_at", { ascending: false });

                    if (error) throw error;
                    return { data: data || [], error: null };
                } catch (err) {
                    console.error("Supabase getActiveOffers error:", err);
                    return { data: null, error: "Unable to load offers from server. Please try again later." };
                }
            } else {
                // Local fallback
                const all = getStorage("offers", DEFAULT_OFFERS);
                const active = all.filter(o => o.is_active && new Date(o.valid_until) >= new Date());
                return { data: active, error: null };
            }
        },

        async getAllOffersAdmin() {
            if (client) {
                try {
                    const { data, error } = await client
                        .from("offers")
                        .select("*")
                        .order("created_at", { ascending: false });

                    if (error) throw error;
                    return { data: data || [], error: null };
                } catch (err) {
                    console.error("Supabase getAllOffersAdmin error:", err);
                    return { data: null, error: err.message };
                }
            } else {
                const all = getStorage("offers", DEFAULT_OFFERS);
                return { data: all, error: null };
            }
        },

        async createOffer(offerData) {
            if (client) {
                try {
                    const { data, error } = await client
                        .from("offers")
                        .insert([offerData])
                        .select();

                    if (error) throw error;
                    return { data: data ? data[0] : null, error: null };
                } catch (err) {
                    return { data: null, error: err.message };
                }
            } else {
                const all = getStorage("offers", DEFAULT_OFFERS);
                const newOffer = {
                    ...offerData,
                    id: "off-" + Date.now(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                all.unshift(newOffer);
                setStorage("offers", all);
                return { data: newOffer, error: null };
            }
        },

        async updateOffer(id, updateData) {
            if (client) {
                try {
                    const { data, error } = await client
                        .from("offers")
                        .update({ ...updateData, updated_at: new Date().toISOString() })
                        .eq("id", id)
                        .select();

                    if (error) throw error;
                    return { data: data ? data[0] : null, error: null };
                } catch (err) {
                    return { data: null, error: err.message };
                }
            } else {
                const all = getStorage("offers", DEFAULT_OFFERS);
                const idx = all.findIndex(o => o.id === id);
                if (idx === -1) return { data: null, error: "Offer not found." };
                all[idx] = { ...all[idx], ...updateData, updated_at: new Date().toISOString() };
                setStorage("offers", all);
                return { data: all[idx], error: null };
            }
        },

        async deleteOffer(id) {
            if (client) {
                try {
                    const { error } = await client
                        .from("offers")
                        .delete()
                        .eq("id", id);

                    if (error) throw error;
                    return { success: true, error: null };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            } else {
                let all = getStorage("offers", DEFAULT_OFFERS);
                all = all.filter(o => o.id !== id);
                setStorage("offers", all);
                return { success: true, error: null };
            }
        },

        // ----------------- APPOINTMENTS -----------------
        async createAppointment(appointmentData) {
            const refNumber = generateReference("AST-APT");
            const payload = {
                ...appointmentData,
                reference_number: refNumber,
                status: "Pending"
            };

            if (client) {
                try {
                    const { data, error } = await client
                        .from("appointments")
                        .insert([payload])
                        .select();

                    if (error) throw error;
                    return { data: data ? data[0] : payload, reference_number: refNumber, error: null };
                } catch (err) {
                    console.error("Error creating appointment:", err);
                    return { data: null, reference_number: null, error: "Failed to submit booking request. Please check your connection." };
                }
            } else {
                const all = getStorage("appointments", DEFAULT_APPOINTMENTS);
                const created = {
                    ...payload,
                    id: "apt-" + Date.now(),
                    created_at: new Date().toISOString()
                };
                all.unshift(created);
                setStorage("appointments", all);
                return { data: created, reference_number: refNumber, error: null };
            }
        },

        async getAppointments(statusFilter = "All") {
            if (client) {
                try {
                    let query = client
                        .from("appointments")
                        .select("*")
                        .order("created_at", { ascending: false });

                    if (statusFilter && statusFilter !== "All") {
                        query = query.eq("status", statusFilter);
                    }

                    const { data, error } = await query;
                    if (error) throw error;
                    return { data: data || [], error: null };
                } catch (err) {
                    return { data: null, error: err.message };
                }
            } else {
                const all = getStorage("appointments", DEFAULT_APPOINTMENTS);
                if (statusFilter && statusFilter !== "All") {
                    return { data: all.filter(a => a.status.toLowerCase() === statusFilter.toLowerCase()), error: null };
                }
                return { data: all, error: null };
            }
        },

        async updateAppointmentStatus(id, newStatus) {
            if (client) {
                try {
                    const { data, error } = await client
                        .from("appointments")
                        .update({ status: newStatus })
                        .eq("id", id)
                        .select();

                    if (error) throw error;
                    return { data: data ? data[0] : null, error: null };
                } catch (err) {
                    return { data: null, error: err.message };
                }
            } else {
                const all = getStorage("appointments", DEFAULT_APPOINTMENTS);
                const item = all.find(a => a.id === id);
                if (item) {
                    item.status = newStatus;
                    setStorage("appointments", all);
                    return { data: item, error: null };
                }
                return { data: null, error: "Appointment not found." };
            }
        },

        // ----------------- HOME COLLECTIONS -----------------
        async createHomeCollectionRequest(reqData) {
            const refNumber = generateReference("AST-HMC");
            const payload = {
                ...reqData,
                reference_number: refNumber,
                status: "Pending"
            };

            if (client) {
                try {
                    const { data, error } = await client
                        .from("home_collection_requests")
                        .insert([payload])
                        .select();

                    if (error) throw error;
                    return { data: data ? data[0] : payload, reference_number: refNumber, error: null };
                } catch (err) {
                    console.error("Error creating home collection request:", err);
                    return { data: null, reference_number: null, error: "Failed to schedule home collection. Please try again." };
                }
            } else {
                const all = getStorage("home_collections", DEFAULT_HOME_COLLECTIONS);
                const created = {
                    ...payload,
                    id: "hm-" + Date.now(),
                    created_at: new Date().toISOString()
                };
                all.unshift(created);
                setStorage("home_collections", all);
                return { data: created, reference_number: refNumber, error: null };
            }
        },

        async getHomeCollectionRequests(statusFilter = "All") {
            if (client) {
                try {
                    let query = client
                        .from("home_collection_requests")
                        .select("*")
                        .order("created_at", { ascending: false });

                    if (statusFilter && statusFilter !== "All") {
                        query = query.eq("status", statusFilter);
                    }

                    const { data, error } = await query;
                    if (error) throw error;
                    return { data: data || [], error: null };
                } catch (err) {
                    return { data: null, error: err.message };
                }
            } else {
                const all = getStorage("home_collections", DEFAULT_HOME_COLLECTIONS);
                if (statusFilter && statusFilter !== "All") {
                    return { data: all.filter(h => h.status.toLowerCase() === statusFilter.toLowerCase()), error: null };
                }
                return { data: all, error: null };
            }
        },

        async updateHomeCollectionStatus(id, newStatus) {
            if (client) {
                try {
                    const { data, error } = await client
                        .from("home_collection_requests")
                        .update({ status: newStatus })
                        .eq("id", id)
                        .select();

                    if (error) throw error;
                    return { data: data ? data[0] : null, error: null };
                } catch (err) {
                    return { data: null, error: err.message };
                }
            } else {
                const all = getStorage("home_collections", DEFAULT_HOME_COLLECTIONS);
                const item = all.find(h => h.id === id);
                if (item) {
                    item.status = newStatus;
                    setStorage("home_collections", all);
                    return { data: item, error: null };
                }
                return { data: null, error: "Home collection request not found." };
            }
        },

        // ----------------- AUTHENTICATION -----------------
        async adminLogin(email, password) {
            if (client) {
                try {
                    const { data, error } = await client.auth.signInWithPassword({
                        email: email.trim(),
                        password: password
                    });
                    if (error) throw error;
                    return { session: data.session, user: data.user, error: null };
                } catch (err) {
                    return { session: null, user: null, error: err.message || "Invalid login credentials." };
                }
            } else {
                // Local fallback admin login (demo account)
                if (email.toLowerCase() === "admin@asterlab.com" && password === "AsterAdmin2026!") {
                    const mockSession = {
                        user: { email: "admin@asterlab.com", role: "authenticated" },
                        access_token: "mock-jwt-token-" + Date.now()
                    };
                    localStorage.setItem("asterlab_admin_session", JSON.stringify(mockSession));
                    return { session: mockSession, user: mockSession.user, error: null };
                } else {
                    return { 
                        session: null, 
                        user: null, 
                        error: "Invalid credentials. For local preview, use: admin@asterlab.com / AsterAdmin2026!" 
                    };
                }
            }
        },

        async adminLogout() {
            if (client) {
                try {
                    await client.auth.signOut();
                } catch (e) {
                    console.warn("SignOut error:", e);
                }
            }
            localStorage.removeItem("asterlab_admin_session");
            return { success: true };
        },

        async getAdminSession() {
            if (client) {
                try {
                    const { data: { session } } = await client.auth.getSession();
                    return session;
                } catch (e) {
                    return null;
                }
            } else {
                const sessionRaw = localStorage.getItem("asterlab_admin_session");
                return sessionRaw ? JSON.parse(sessionRaw) : null;
            }
        }
    };

    // Expose AsterLabDB globally
    window.AsterLabDB = AsterLabDB;
})();
