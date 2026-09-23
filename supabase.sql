-- =========================================================
-- ASTER LAB: SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    offer_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_new BOOLEAN DEFAULT TRUE,
    badge_text VARCHAR(50) DEFAULT 'JUST ARRIVED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    age INTEGER,
    gender VARCHAR(20),
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    test_package VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. HOME COLLECTION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.home_collection_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(20) NOT NULL,
    test_package VARCHAR(255) NOT NULL,
    instructions TEXT,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- INDEXES FOR HIGH-SPEED QUERYING
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON public.appointments(reference_number);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_home_col_ref ON public.home_collection_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_home_col_status ON public.home_collection_requests(status);

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_collection_requests ENABLE ROW LEVEL SECURITY;

-- Offers Policies:
-- Public can read active offers within validity
CREATE POLICY "Allow public read access to active offers"
ON public.offers
FOR SELECT
USING (is_active = true AND valid_until >= CURRENT_TIMESTAMP);

-- Authenticated admins can perform ALL operations on offers
CREATE POLICY "Allow authenticated admin full access to offers"
ON public.offers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Appointments Policies:
-- Public users can insert appointments (INSERT only)
CREATE POLICY "Allow public to insert appointments"
ON public.appointments
FOR INSERT
WITH CHECK (true);

-- Authenticated admins can view and update appointments
CREATE POLICY "Allow authenticated admin full access to appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Home Collection Requests Policies:
-- Public users can insert requests (INSERT only)
CREATE POLICY "Allow public to insert home collection requests"
ON public.home_collection_requests
FOR INSERT
WITH CHECK (true);

-- Authenticated admins can view and update home collection requests
CREATE POLICY "Allow authenticated admin full access to home collection requests"
ON public.home_collection_requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ---------------------------------------------------------
-- REALISTIC SEED DATA FOR DEMO OFFERS
-- ---------------------------------------------------------
INSERT INTO public.offers (title, description, original_price, offer_price, image_url, valid_from, valid_until, is_active, is_new, badge_text)
VALUES
(
    'Comprehensive Full Body Vitality Screening',
    '85 critical parameters covering Complete Blood Count, Liver & Kidney Profile, Lipid Panel, Vitamin D3/B12, and HbA1c Diabetes metrics.',
    2499.00,
    999.00,
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '90 days',
    true,
    true,
    'NEW'
),
(
    'Advanced Cardiac & Lipid Risk Profile',
    'Cutting-edge cardiology diagnostics including High-Sensitivity Troponin I, hs-CRP, Apolipoprotein A1/B, and Complete Lipid Profile.',
    2999.00,
    1499.00,
    'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '45 days',
    true,
    true,
    'JUST ARRIVED'
),
(
    'Precision Diabetes & Metabolic Health Check',
    'Complete glucose management assessment featuring Fasting Blood Sugar, Postprandial, HbA1c with Average Blood Glucose, and Urine Microalbumin.',
    1599.00,
    699.00,
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '60 days',
    true,
    false,
    'POPULAR'
),
(
    'Women''s Master Wellness & Hormone Spectrum',
    'Tailored biomarker panel for women covering Thyroid (T3, T4, TSH), Iron deficiency profile, Calcium, Vitamin D, and Reproductive Hormones.',
    3299.00,
    1799.00,
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '75 days',
    true,
    true,
    'NEW'
),
(
    'Men''s Executive Health & Performance',
    'Comprehensive screening for active men including Testosterone levels, PSA (Prostate Specific Antigen), Liver Enzymes, and Cardiovascular Risk.',
    3199.00,
    1699.00,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '40 days',
    true,
    false,
    'FEATURED'
),
(
    'Essential Vitamin D & B12 Neurological Duo',
    'Accurate chemiluminescence testing for Active Vitamin B12 and Total 25-Hydroxy Vitamin D to target fatigue, immunity, and bone health.',
    1899.00,
    799.00,
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    true,
    true,
    'JUST ARRIVED'
);
