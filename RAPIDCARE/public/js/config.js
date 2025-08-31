// RapidCare Configuration

// ⚠️ IMPORTANT: Replace these with your Supabase project details
// 1. Go to https://supabase.com → create a project
// 2. Go to Settings → API
// 3. Copy your Project URL and anon key
// 4. Paste them below

window.CONFIG = {
    // ✅ Supabase credentials
    SUPABASE_URL: 'https://napxigoaplxnlloxavdn.supabase.co',  
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcHhpZ29hcGx4bmxsb3hhdmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc2OTUsImV4cCI6MjA3MjI0MzY5NX0.BkxHVkaPbVLKCXddGjnMsc8rRuUEXqqzvw8OX51ilpg',
    
    // Application settings
    APP_NAME: 'RapidCare',
    APP_VERSION: '1.0.0',

    // User roles
    ROLES: {
        PATIENT: 'patient',
        DOCTOR: 'doctor',
        ADMIN: 'admin'
    },

    // Bed types
    BED_TYPES: {
        ICU: 'ICU',
        GENERAL: 'General',
        EMERGENCY: 'Emergency'
    },

    // Equipment types
    EQUIPMENT_TYPES: {
        MRI: 'MRI Scanner',
        XRAY: 'X-Ray Machine',
        VENTILATOR: 'Ventilator',
        CT_SCAN: 'CT Scanner',
        ULTRASOUND: 'Ultrasound',
        ECG: 'ECG Machine'
    },

    // Doctor specializations
    SPECIALIZATIONS: [
        'General Medicine',
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'Gynecology',
        'Emergency Medicine',
        'Surgery',
        'Radiology',
        'Anesthesiology'
    ],

    // Cities
    CITIES: [
        'New York',
        'Los Angeles',
        'Chicago',
        'Houston',
        'Phoenix',
        'Philadelphia',
        'San Antonio',
        'San Diego',
        'Dallas',
        'Boston'
    ],

    // Time slots for appointments
    TIME_SLOTS: [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
        '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
        '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
    ]
};

// Initialize Supabase client
(function initSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        window.supabaseClient = window.supabase.createClient(
            window.CONFIG.SUPABASE_URL,
            window.CONFIG.SUPABASE_ANON_KEY
        );

        console.log(`✅ Supabase client initialized for ${window.CONFIG.APP_NAME}`);
    } else {
        console.error("❌ Supabase library not loaded. Please include @supabase/supabase-js before config.js");
    }
})();
