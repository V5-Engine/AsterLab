/**
 * Aster Lab - Unified Supabase Data Layer
 *
 * Provides clean asynchronous data services for:
 * - Tests
 * - Popular Tests
 * - Offers
 * - Combined Booking Options
 * - Appointments
 * - Home Collections
 * - Admin Authentication
 *
 * Automatically detects whether real Supabase credentials are provided.
 * If credentials are valid, it uses the Supabase JS SDK.
 * Otherwise, it uses LocalStorage as a fallback/demo database.
 */

(function () {

    // ============================================================
    // DEFAULT TEST DATA
    // ============================================================

    const DEFAULT_TESTS = [
        {
            id: "T-01",
            title: "Complete Blood Count (CBC) with ESR",
            category: "blood",
            parameters: 28,
            fasting: "No fasting required",
            tat: "4 - 6 Hours",
            price: 350,
            description: "Evaluates red blood cells, white blood cells, platelets, hemoglobin, hematocrit, and erythrocyte sedimentation rate."
        },
        {
            id: "T-02",
            title: "HbA1c (Glycosylated Hemoglobin)",
            category: "diabetes",
            parameters: 2,
            fasting: "Fasting not strictly required",
            tat: "4 Hours",
            price: 490,
            description: "Measures average blood sugar levels over the past 3 months using Gold Standard HPLC methodology."
        },
        {
            id: "T-03",
            title: "Lipid Profile Comprehensive",
            category: "cardiac",
            parameters: 8,
            fasting: "10-12 hours overnight fasting required",
            tat: "6 Hours",
            price: 650,
            description: "Total Cholesterol, HDL, LDL, VLDL, Triglycerides, Non-HDL Cholesterol, and Cholesterol/HDL Ratio."
        },
        {
            id: "T-04",
            title: "Thyroid Profile Total (T3, T4, TSH)",
            category: "thyroid",
            parameters: 3,
            fasting: "Morning sample preferred",
            tat: "5 Hours",
            price: 550,
            description: "Assesses thyroid gland function for hyperthyroidism and hypothyroidism via ECLIA chemiluminescence."
        },
        {
            id: "T-05",
            title: "Vitamin D Total (25-Hydroxy)",
            category: "vitamins",
            parameters: 1,
            fasting: "No fasting required",
            tat: "8 Hours",
            price: 850,
            description: "Biomarker for bone density, calcium absorption, immune health, and chronic fatigue evaluation."
        },
        {
            id: "T-06",
            title: "Vitamin B12 (Active Cobalamin)",
            category: "vitamins",
            parameters: 1,
            fasting: "Overnight fasting recommended",
            tat: "8 Hours",
            price: 790,
            description: "Diagnostic indicator for megaloblastic anemia, peripheral neuropathy, and neurological vitality."
        },
        {
            id: "T-07",
            title: "Liver Function Test (LFT) with Enzymes",
            category: "organs",
            parameters: 11,
            fasting: "8-10 hours fasting preferred",
            tat: "6 Hours",
            price: 590,
            description: "Bilirubin (Total/Direct/Indirect), SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Total Protein, and Albumin."
        },
        {
            id: "T-08",
            title: "Kidney Function & Renal Panel (KFT)",
            category: "organs",
            parameters: 9,
            fasting: "Adequate hydration recommended",
            tat: "6 Hours",
            price: 590,
            description: "Serum Creatinine, Blood Urea Nitrogen (BUN), Uric Acid, Sodium, Potassium, Chloride, and eGFR."
        }

    ];


    // ============================================================
    // DEFAULT OFFER DATA
    // ============================================================

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
            description: "Comprehensive screening for active men including Testosterone levels, PSA, Liver Enzymes, and Cardiovascular Risk.",
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
            description: "Accurate testing for Active Vitamin B12 and Total 25-Hydroxy Vitamin D.",
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


    // ============================================================
    // DEFAULT APPOINTMENTS
    // ============================================================

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


    // ============================================================
    // DEFAULT HOME COLLECTIONS
    // ============================================================

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


    // ============================================================
    // LOCAL STORAGE HELPERS
    // ============================================================

    function getStorage(key, defaultVal) {
        try {
            const raw = localStorage.getItem("asterlab_" + key);

            return raw
                ? JSON.parse(raw)
                : defaultVal;

        } catch (e) {
            console.warn("Storage read error:", e);
            return defaultVal;
        }
    }


    function setStorage(key, val) {
        try {
            localStorage.setItem(
                "asterlab_" + key,
                JSON.stringify(val)
            );
        } catch (e) {
            console.warn("Storage write error:", e);
        }
    }


    // ============================================================
    // INITIALIZE LOCAL MOCK DATABASE
    // ============================================================

    if (!localStorage.getItem("asterlab_tests")) {
        setStorage("tests", DEFAULT_TESTS);
    }

    if (!localStorage.getItem("asterlab_offers")) {
        setStorage("offers", DEFAULT_OFFERS);
    }

    if (!localStorage.getItem("asterlab_appointments")) {
        setStorage("appointments", DEFAULT_APPOINTMENTS);
    }

    if (!localStorage.getItem("asterlab_home_collections")) {
        setStorage(
            "home_collections",
            DEFAULT_HOME_COLLECTIONS
        );
    }


    // ============================================================
    // SUPABASE CONFIGURATION
    // ============================================================

    let client = null;

    const config = window.SUPABASE_CONFIG || {};

    const isConfigured =
        config.URL &&
        config.ANON_KEY &&
        !config.URL.includes("your-project-id") &&
        !config.ANON_KEY.includes("your-anon-key");


    if (
        isConfigured &&
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {
        try {

            client = window.supabase.createClient(
                config.URL,
                config.ANON_KEY
            );

            console.log(
                "⚡ Aster Lab connected to Supabase Live Backend"
            );

        } catch (err) {

            console.warn(
                "Failed to initialize Supabase client, falling back to local engine:",
                err
            );

            client = null;
        }

    } else {

        console.log(
            "ℹ Aster Lab running in High-Fidelity Local Engine"
        );
    }


    // ============================================================
    // GENERATE REFERENCE NUMBER
    // ============================================================

    function generateReference(prefix) {

        const rand =
            Math.floor(1000 + Math.random() * 9000);

        const timestamp =
            Date.now().toString().slice(-4);

        return `${prefix}-${rand}${timestamp}`;
    }


    // ============================================================
    // ASTER LAB DATABASE API
    // ============================================================

    const AsterLabDB = {

        // ========================================================
        // GENERAL
        // ========================================================

        isLive: () => !!client,


        // ========================================================
        // TESTS
        // ========================================================
        async getTests() {

            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from("tests")
                            .select("*")
                            .eq("is_active", true)
                            .order("title", {
                                ascending: true
                            });

                    if (error) throw error;

                    return {
                        data: data || [],
                        error: null
                    };

                } catch (err) {

                    console.error(
                        "Supabase getTests error:",
                        err
                    );

                    return {
                        data: null,
                        error: err.message
                    };
                }
            }


            const tests =
                getStorage(
                    "tests",
                    DEFAULT_TESTS
                );

            return {
                data: tests.filter(
                    t => t.is_active !== false
                ),
                error: null
            };
        },


        // ========================================================
        // POPULAR TESTS
        // ========================================================

        async getPopularTests() {

            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from("tests")
                            .select("*")
                            .eq("is_active", true)
                            .eq("is_popular", true)
                            .order("title", {
                                ascending: true
                            });

                    if (error) throw error;

                    return {
                        data: data || [],
                        error: null
                    };

                } catch (err) {

                    console.error(
                        "Supabase getPopularTests error:",
                        err
                    );

                    return {
                        data: null,
                        error: err.message
                    };
                }
            }


            const tests =
                getStorage(
                    "tests",
                    DEFAULT_TESTS
                );

            return {
                data: tests.filter(
                    t =>
                        t.is_active !== false &&
                        t.is_popular === true
                ),
                error: null
            };
        },


        // ========================================================
        // ACTIVE OFFERS
        // ========================================================

        async getActiveOffers() {

            if (client) {

                try {

                    const now =
                        new Date().toISOString();

                    const { data, error } =
                        await client
                            .from("offers")
                            .select("*")
                            .eq("is_active", true)
                            .gte("valid_until", now)
                            .order("created_at", {
                                ascending: false
                            });

                    if (error) throw error;

                    return {
                        data: data || [],
                        error: null
                    };

                } catch (err) {

                    console.error(
                        "Supabase getActiveOffers error:",
                        err
                    );

                    return {
                        data: null,
                        error:
                            "Unable to load offers from server. Please try again later."
                    };
                }
            }


            const all =
                getStorage(
                    "offers",
                    DEFAULT_OFFERS
                );

            const active =
                all.filter(
                    o =>
                        o.is_active &&
                        new Date(o.valid_until) >= new Date()
                );

            return {
                data: active,
                error: null
            };
        },


        async getSelectTest() {
            const testsResult = await this.getTests();
            const offersResult = await this.getActiveOffers();

            const tests = Array.isArray(testsResult)
                ? testsResult
                : (testsResult?.data || []);

            const offers = Array.isArray(offersResult)
                ? offersResult
                : (offersResult?.data || []);

            const combined = [...tests, ...offers];

            const uniqueTests = new Map();

            combined.forEach(item => {
                if (item?.title && !uniqueTests.has(item.title)) {
                    uniqueTests.set(item.title, {
                        title: item.title,
                        price: item.price || 0
                    });
                }
            });

            return [...uniqueTests.values()];
        },
        // ========================================================
        // GET ALL OFFERS - ADMIN
        // ========================================================

        async getAllOffersAdmin() {

            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from("offers")
                            .select("*")
                            .order("created_at", {
                                ascending: false
                            });

                    if (error) throw error;

                    return {
                        data: data || [],
                        error: null
                    };

                } catch (err) {

                    console.error(
                        "Supabase getAllOffersAdmin error:",
                        err
                    );

                    return {
                        data: null,
                        error: err.message
                    };
                }
            }


            const all =
                getStorage(
                    "offers",
                    DEFAULT_OFFERS
                );

            return {
                data: all,
                error: null
            };
        },


        // ========================================================
        // GET OFFERS FOR BOOKING
        // ========================================================

        async getOffers() {

            return await this.getActiveOffers();
        },


        // ========================================================
        // COMBINED OFFERS + TESTS
        // ========================================================

        async getBookingOptions() {

            try {

                const [
                    offersResult,
                    testsResult
                ] = await Promise.all([
                    this.getOffers(),
                    this.getTests()
                ]);


                if (offersResult.error) {

                    return {
                        data: null,
                        error: offersResult.error
                    };
                }


                if (testsResult.error) {

                    return {
                        data: null,
                        error: testsResult.error
                    };
                }


                // ------------------------------
                // Convert Offers
                // ------------------------------

                const offers =
                    (offersResult.data || [])
                        .map(offer => ({

                            id: offer.id,

                            name:
                                offer.title ||
                                offer.name,

                            description:
                                offer.description || "",

                            price:
                                offer.offer_price ??
                                offer.price ??
                                0,

                            original_price:
                                offer.original_price ??
                                null,

                            type: "offer",

                            value:
                                `offer:${offer.id}`,

                            source: offer
                        }));


                // ------------------------------
                // Convert Tests
                // ------------------------------

                const tests =
                    (testsResult.data || [])
                        .map(test => ({

                            id: test.id,

                            name: test.name,

                            description:
                                test.description || "",

                            price:
                                test.price ?? 0,

                            type: "test",

                            value:
                                `test:${test.id}`,

                            source: test
                        }));


                return {

                    data: {

                        offers: offers,

                        tests: tests,

                        combined: [
                            ...offers,
                            ...tests
                        ]

                    },

                    error: null
                };

            } catch (err) {

                console.error(
                    "getBookingOptions error:",
                    err
                );

                return {

                    data: null,

                    error:
                        err.message ||
                        "Unable to load booking options."
                };
            }
        },


        // ========================================================
        // CREATE OFFER
        // ========================================================

        async createOffer(offerData) {

            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from("offers")
                            .insert([offerData])
                            .select();

                    if (error) throw error;

                    return {

                        data:
                            data
                                ? data[0]
                                : null,

                        error: null
                    };

                } catch (err) {

                    return {
                        data: null,
                        error: err.message
                    };
                }
            }


            const all =
                getStorage(
                    "offers",
                    DEFAULT_OFFERS
                );

            const newOffer = {

                ...offerData,

                id:
                    "off-" +
                    Date.now(),

                created_at:
                    new Date().toISOString(),

                updated_at:
                    new Date().toISOString()
            };

            all.unshift(newOffer);

            setStorage(
                "offers",
                all
            );

            return {
                data: newOffer,
                error: null
            };
        },


        // ========================================================
        // UPDATE OFFER
        // ========================================================

        async updateOffer(
            id,
            updateData
        ) {

            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from("offers")
                            .update({
                                ...updateData,
                                updated_at:
                                    new Date().toISOString()
                            })
                            .eq("id", id)
                            .select();

                    if (error) throw error;

                    return {

                        data:
                            data
                                ? data[0]
                                : null,

                        error: null
                    };

                } catch (err) {

                    return {
                        data: null,
                        error: err.message
                    };
                }
            }


            const all =
                getStorage(
                    "offers",
                    DEFAULT_OFFERS
                );

            const idx =
                all.findIndex(
                    o => o.id === id
                );

            if (idx === -1) {

                return {
                    data: null,
                    error: "Offer not found."
                };
            }


            all[idx] = {

                ...all[idx],

                ...updateData,

                updated_at:
                    new Date().toISOString()
            };


            setStorage(
                "offers",
                all
            );


            return {
                data: all[idx],
                error: null
            };
        },


        // ========================================================
        // DELETE OFFER
        // ========================================================

        async deleteOffer(id) {

            if (client) {

                try {

                    const { error } =
                        await client
                            .from("offers")
                            .delete()
                            .eq("id", id);

                    if (error) throw error;

                    return {
                        success: true,
                        error: null
                    };

                } catch (err) {

                    return {
                        success: false,
                        error: err.message
                    };
                }
            }


            let all =
                getStorage(
                    "offers",
                    DEFAULT_OFFERS
                );

            all =
                all.filter(
                    o => o.id !== id
                );

            setStorage(
                "offers",
                all
            );


            return {
                success: true,
                error: null
            };
        },


        // ========================================================
        // CREATE APPOINTMENT
        // ========================================================

        async createAppointment(
            appointmentData
        ) {

            const refNumber =
                generateReference(
                    "AST-APT"
                );

            const payload = {

                ...appointmentData,

                reference_number:
                    refNumber,

                status:
                    "Pending"
            };


            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from("appointments")
                            .insert([payload]);

                    if (error) throw error;

                    return {

                        data:
                            data
                                ? data[0]
                                : payload,

                        reference_number:
                            refNumber,

                        error: null
                    };

                } catch (err) {

                    console.error(
                        "Error creating appointment:",
                        err
                    );

                    return {

                        data: null,

                        reference_number:
                            null,

                        error:
                            "Failed to submit booking request. Please check your connection."
                    };
                }
            }


            const all =
                getStorage(
                    "appointments",
                    DEFAULT_APPOINTMENTS
                );

            const created = {

                ...payload,

                id:
                    "apt-" +
                    Date.now(),

                created_at:
                    new Date().toISOString()
            };

            all.unshift(created);

            setStorage(
                "appointments",
                all
            );


            return {

                data: created,

                reference_number:
                    refNumber,

                error: null
            };
        },


        // ========================================================
        // GET APPOINTMENTS
        // ========================================================

        async getAppointments(
            statusFilter = "All"
        ) {

            if (client) {

                try {

                    let query =
                        client
                            .from("appointments")
                            .select("*")
                            .order("created_at", {
                                ascending: false
                            });


                    if (
                        statusFilter &&
                        statusFilter !== "All"
                    ) {

                        query =
                            query.eq(
                                "status",
                                statusFilter
                            );
                    }


                    const {
                        data,
                        error
                    } = await query;


                    if (error)
                        throw error;


                    return {

                        data:
                            data || [],

                        error: null
                    };

                } catch (err) {

                    return {

                        data: null,

                        error:
                            err.message
                    };
                }
            }


            const all =
                getStorage(
                    "appointments",
                    DEFAULT_APPOINTMENTS
                );


            if (
                statusFilter &&
                statusFilter !== "All"
            ) {

                return {

                    data:
                        all.filter(
                            a =>
                                a.status
                                    .toLowerCase() ===
                                statusFilter
                                    .toLowerCase()
                        ),

                    error: null
                };
            }


            return {
                data: all,
                error: null
            };
        },


        // ========================================================
        // UPDATE APPOINTMENT STATUS
        // ========================================================

        async updateAppointmentStatus(
            id,
            newStatus
        ) {

            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from("appointments")
                            .update({
                                status: newStatus
                            })
                            .eq("id", id)
                            .select();

                    if (error) throw error;

                    return {

                        data:
                            data
                                ? data[0]
                                : null,

                        error: null
                    };

                } catch (err) {

                    return {

                        data: null,

                        error:
                            err.message
                    };
                }
            }


            const all =
                getStorage(
                    "appointments",
                    DEFAULT_APPOINTMENTS
                );

            const item =
                all.find(
                    a => a.id === id
                );


            if (item) {

                item.status =
                    newStatus;

                setStorage(
                    "appointments",
                    all
                );


                return {
                    data: item,
                    error: null
                };
            }


            return {

                data: null,

                error:
                    "Appointment not found."
            };
        },

        // ========================================================
        // CREATE Inquiry COLLECTION
        // ========================================================
        async createInquiryRequest(reqData) {

            const refNumber = generateReference("AST-INQ");

            const payload = {
                ...reqData,
                reference_id: refNumber,
                status: "Pending"
            };

            if (client) {
                try {

                    const { data, error } = await client
                        .from("enquiries")
                        .insert([payload]);

                    if (error) throw error;

                    return {
                        data: data || payload,
                        reference_id: refNumber,
                        error: null
                    };

                } catch (err) {

                    console.error("FULL Supabase error:", err);
                    console.error("Error message:", err?.message);
                    console.error("Error code:", err?.code);
                    console.error("Error details:", err?.details);
                    console.error("Error hint:", err?.hint);

                    return {
                        data: null,
                        reference_id: null,
                        error: "Failed to submit enquiry. Please try again."
                    };
                }
            }

            // Local fallback
            const all = getStorage(
                "enquiries",
                []
            );

            const created = {
                ...payload,
                id: "inq-" + Date.now(),
                created_at: new Date().toISOString()
            };

            all.unshift(created);

            setStorage(
                "enquiries",
                all
            );

            return {
                data: created,
                reference_id: refNumber,
                error: null
            };
        },
        // ========================================================
        // CREATE HOME COLLECTION
        // ========================================================

        async createHomeCollectionRequest(reqData)
        {

            const refNumber =
                generateReference(
                    "AST-HMC"
                );

            const payload = {

                ...reqData,

                reference_number:
                    refNumber,

                status:
                    "Pending"
            };


            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from(
                                "home_collection_requests"
                            )
                            .insert([payload]);

                    if (error) throw error;

                    return {

                        data:
                            data
                                ? data[0]
                                : payload,

                        reference_number:
                            refNumber,

                        error: null
                    };

                } catch (err) {

                    console.error(
                        "FULL Supabase error:",
                        err
                    );

                    console.error(
                        "Error message:",
                        err?.message
                    );

                    console.error(
                        "Error code:",
                        err?.code
                    );

                    console.error(
                        "Error details:",
                        err?.details
                    );

                    console.error(
                        "Error hint:",
                        err?.hint
                    );


                    return {

                        data: null,

                        reference_number:
                            null,

                        error:
                            "Failed to schedule home collection. Please try again."
                    };
                }
            }


            const all =
                getStorage(
                    "home_collections",
                    DEFAULT_HOME_COLLECTIONS
                );


            const created = {

                ...payload,

                id:
                    "hm-" +
                    Date.now(),

                created_at:
                    new Date().toISOString()
            };


            all.unshift(created);


            setStorage(
                "home_collections",
                all
            );


            return {

                data: created,

                reference_number:
                    refNumber,

                error: null
            };
        },


        // ========================================================
        // GET HOME COLLECTIONS
        // ========================================================

        async getHomeCollectionRequests(
            statusFilter = "All"
        ) {

            if (client) {

                try {

                    let query =
                        client
                            .from(
                                "home_collection_requests"
                            )
                            .select("*")
                            .order(
                                "created_at",
                                {
                                    ascending: false
                                }
                            );


                    if (
                        statusFilter &&
                        statusFilter !== "All"
                    ) {

                        query =
                            query.eq(
                                "status",
                                statusFilter
                            );
                    }


                    const {
                        data,
                        error
                    } = await query;


                    if (error)
                        throw error;


                    return {

                        data:
                            data || [],

                        error: null
                    };

                } catch (err) {

                    return {

                        data: null,

                        error:
                            err.message
                    };
                }
            }


            const all =
                getStorage(
                    "home_collections",
                    DEFAULT_HOME_COLLECTIONS
                );


            if (
                statusFilter &&
                statusFilter !== "All"
            ) {

                return {

                    data:
                        all.filter(
                            h =>
                                h.status
                                    .toLowerCase() ===
                                statusFilter
                                    .toLowerCase()
                        ),

                    error: null
                };
            }


            return {

                data: all,

                error: null
            };
        },


        // ========================================================
        // UPDATE HOME COLLECTION STATUS
        // ========================================================

        async updateHomeCollectionStatus(
            id,
            newStatus
        ) {

            if (client) {

                try {

                    const { data, error } =
                        await client
                            .from(
                                "home_collection_requests"
                            )
                            .update({
                                status: newStatus
                            })
                            .eq("id", id)
                            .select();

                    if (error) throw error;

                    return {

                        data:
                            data
                                ? data[0]
                                : null,

                        error: null
                    };

                } catch (err) {

                    return {

                        data: null,

                        error:
                            err.message
                    };
                }
            }


            const all =
                getStorage(
                    "home_collections",
                    DEFAULT_HOME_COLLECTIONS
                );


            const item =
                all.find(
                    h => h.id === id
                );


            if (item) {

                item.status =
                    newStatus;

                setStorage(
                    "home_collections",
                    all
                );


                return {

                    data: item,

                    error: null
                };
            }


            return {

                data: null,

                error:
                    "Home collection request not found."
            };
        },


        // ========================================================
        // ADMIN LOGIN
        // ========================================================

        async adminLogin(
            email,
            password
        ) {

            if (client) {

                try {

                    const {
                        data,
                        error
                    } =
                        await client.auth
                            .signInWithPassword({

                                email:
                                    email.trim(),

                                password:
                                    password
                            });


                    if (error)
                        throw error;


                    return {

                        session:
                            data.session,

                        user:
                            data.user,

                        error: null
                    };

                } catch (err) {

                    return {

                        session: null,

                        user: null,

                        error:
                            err.message ||
                            "Invalid login credentials."
                    };
                }
            }


            // Local demo login

            if (
                email.toLowerCase() ===
                "admin@asterlab.com" &&
                password ===
                "AsterAdmin2026!"
            ) {

                const mockSession = {

                    user: {

                        email:
                            "admin@asterlab.com",

                        role:
                            "authenticated"
                    },

                    access_token:
                        "mock-jwt-token-" +
                        Date.now()
                };


                localStorage.setItem(
                    "asterlab_admin_session",
                    JSON.stringify(mockSession)
                );


                return {

                    session:
                        mockSession,

                    user:
                        mockSession.user,

                    error: null
                };
            }


            return {

                session: null,

                user: null,

                error:
                    "Invalid credentials. For local preview, use: admin@asterlab.com / AsterAdmin2026!"
            };
        },


        // ========================================================
        // ADMIN LOGOUT
        // ========================================================

        async adminLogout() {

            if (client) {

                try {

                    await client.auth.signOut();

                } catch (e) {

                    console.warn(
                        "SignOut error:",
                        e
                    );
                }
            }


            localStorage.removeItem(
                "asterlab_admin_session"
            );


            return {
                success: true
            };
        },


        // ========================================================
        // GET ADMIN SESSION
        // ========================================================

        async getAdminSession() {

            if (client) {

                try {

                    const {
                        data: {
                            session
                        }
                    } =
                        await client.auth.getSession();


                    return session;

                } catch (e) {

                    return null;
                }
            }


            const sessionRaw =
                localStorage.getItem(
                    "asterlab_admin_session"
                );


            return sessionRaw
                ? JSON.parse(sessionRaw)
                : null;
        }

    };


    // ============================================================
    // EXPOSE DATABASE API GLOBALLY
    // ============================================================

    window.AsterLabDB = AsterLabDB;


    console.log(
        "AsterLabDB initialized. Live Supabase:",
        AsterLabDB.isLive()
    );

})();