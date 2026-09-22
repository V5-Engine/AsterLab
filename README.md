# Aster Lab - Futuristic Diagnostic Laboratory Website

A modern, premium, futuristic medical diagnostic laboratory website for **Aster Lab**, built using **HTML5, CSS3, Vanilla JavaScript**, and **Supabase**, ready for instant static deployment via **GitHub Pages**.

> **"Precision. Technology. Care."**

---

## 🌟 Key Highlights & Features

### 1. Design & Futuristic Aesthetics
- **Apple-Level Simplicity + Next-Gen Diagnostics**: Clean medical white/off-white background with cybernetic cyan/teal accents, soft violet gradients, and glowing glassmorphism panels.
- **Micro-Interactions**: Hover lifts, smooth glowing borders, shimmer badges on newly arrived packages, and custom desktop interactive cursor (dot + ring, automatically disabled on touch devices).
- **Page Preloader**: Medical ECG heartbeat pulse animation transitioning into the hero section.
- **IntersectionObserver Scroll Animations**: Fade-up, scale-reveal, and animated metric counters counting from `0` to target numbers.
- **Mobile First**: Fully responsive layout with mobile drawer navigation and a sticky **Floating Mobile Action Dock** (`Call`, `Location`, `Book`).

### 2. Live Dynamic Offers Engine (Supabase Integrated)
- Dynamic offers loaded directly from Supabase (`offers` table).
- Real-time countdown timer to validity expiration (`Ends in: XXd XXh XXm`).
- Automated calculation of discount percentages and animated "NEW" shimmer badges.
- Built-in Loading, Error, and Empty states with friendly UI feedback.

### 3. Patient Bookings & Phlebotomy Logistics
- **Lab Visit Booking (`appointment.html`)**: Interactive booking form with date/time pickers, package selection, and instant reference number generation (`AST-APT-XXXX`).
- **Doorstep Home Collection (`home-collection.html`)**: Complete doorstep sample collection scheduler with temperature-controlled cold chain assurance and tracking reference code (`AST-HMC-XXXX`).
- **Tests Catalog (`tests.html`)**: Searchable and filterable clinical directory of over 500+ diagnostic parameters.

### 4. Admin Portal (`/admin/`)
- **Protected Access**: Route guards redirect unauthenticated users to `/admin/index.html`.
- **Dashboard (`/admin/dashboard.html`)**: Live statistics (Total Offers, Active Published Packages, Pending Appointments, Pending Home Pickups).
- **Offers CRUD (`/admin/offers.html`)**: Add, edit, activate/deactivate, mark as NEW, configure validity dates and pricing.
- **Appointments Management (`/admin/appointments.html`)**: Search and filter by status (`Pending`, `Confirmed`, `Completed`, `Cancelled`) with one-click status updates.
- **Home Collection Management (`/admin/home-collection.html`)**: Search and dispatch doorstep requests with full address tracking.

---

## 🚀 Quick Setup & Supabase Configuration

### Step 1: Set up Supabase
1. Create a free account at [Supabase](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase.sql`](./supabase.sql) from this repository, copy its contents, and run it. This will:
   - Create tables: `offers`, `appointments`, `home_collection_requests`.
   - Configure high-speed database indexes.
   - Establish **Row Level Security (RLS)** policies (public read for active offers, public INSERT for bookings, authenticated access for admin).
   - Seed realistic diagnostic health package demo data.

### Step 2: Configure Keys in `js/config.js`
Open [`js/config.js`](./js/config.js) and paste your project URL and public anon key:
```javascript
const SUPABASE_CONFIG = {
    URL: "https://your-project-id.supabase.co",
    ANON_KEY: "your-anon-public-key"
};
```

> **Smart Offline / Fallback Sandbox**: If the keys in `config.js` remain as placeholders, Aster Lab automatically runs in intelligent **Local Preview Mode** backed by `localStorage`, so you can test all forms, appointments, and admin CRUD immediately without setting up a backend first!

### Step 3: Admin Login Credentials
- **URL**: `admin/index.html`
- **Email**: `admin@asterlab.com`
- **Password**: `AsterAdmin2026!`

*(Once connected to live Supabase, create an admin user in Supabase Auth -> Users with these or your own credentials)*.

---

## 🌐 Deploy to GitHub Pages

This project is 100% static with **strict relative paths** (`./`, `../`), making it fully compatible with GitHub Pages at any path (e.g. `https://username.github.io/aster-lab/`).

1. Push this directory to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Build Futuristic Aster Lab Website"
   git branch -M main
   git remote add origin https://github.com/your-username/aster-lab.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
4. Choose **main** branch and `/ (root)` folder, then click **Save**.
5. Your website will be live in seconds!

---

## 📁 Project Structure

```text
AsterLab/
├── index.html                  # Homepage with Hero, Stats, Offers, Services, Process
├── offers.html                 # Dynamic health packages & countdown timers
├── tests.html                  # Tests catalog with instant live search & categories
├── appointment.html            # Lab visit appointment booking with reference generator
├── home-collection.html        # Doorstep phlebotomy request form
├── about.html                  # Technology, robotics, CAP & NABL accreditations
├── contact.html                # Locations, 24/7 helpline, and inquiry form
├── supabase.sql                # Complete database schema, RLS policies, & seed data
├── README.md                   # Documentation & setup guide
├── admin/
│   ├── index.html              # Admin login portal with Supabase Auth
│   ├── dashboard.html          # Operational metrics & recent bookings feed
│   ├── offers.html             # Add/Edit/Delete diagnostic packages
│   ├── appointments.html       # Appointment status management & search
│   └── home-collection.html    # Home collection dispatch & status tracking
├── assets/
│   ├── icons/                  # SVG icons and favicon.svg
│   └── logo/                   # Brand vector logo.svg
├── css/
│   ├── main.css                # Design system, glassmorphism, buttons, layout
│   ├── animations.css          # ECG preloader, pulse, shimmer, custom cursor
│   ├── responsive.css          # Mobile action dock, drawer nav, breakpoints
│   └── admin.css               # Admin layout, sidebar, tables, status tags
└── js/
    ├── config.js               # Supabase URL and anon key configuration
    ├── supabase.js             # Data service layer with local fallback sandbox
    ├── main.js                 # Global navbar blur, drawer, preloader, carousel
    ├── animations.js           # Scroll reveal triggers, counters, cursor logic
    ├── offers.js               # Dynamic offer cards rendering & countdown clocks
    ├── appointment.js          # Lab appointment validation & submission
    ├── home-collection.js      # Doorstep collection validation & submission
    └── admin.js                # Auth guard, dashboard stats, CRUD, status updates
```

---

## 🔒 Security & Best Practices

- **Row Level Security**: Public users can only read active offers and submit requests (`INSERT`).
- **No Secret Keys Exposed**: Only `SUPABASE_ANON_KEY` is referenced on the frontend. Never use the `service_role` key in static client files.
- **Input Sanitization**: All user submitted strings rendered in the DOM are escaped against XSS attacks.
- **Accessibility**: Includes support for `prefers-reduced-motion` to tone down animations on sensitive devices.
