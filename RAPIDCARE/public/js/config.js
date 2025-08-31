// RapidCare Configuration

// ⚠️ IMPORTANT: Replace these with your Supabase project details
// 1. Go to https://supabase.com and create a project
// 2. Go to Settings → API
// 3. Copy your Project URL and anon key
// 4. Paste them below

window.CONFIG = {
    // 🔴 REPLACE THESE VALUES WITH YOUR SUPABASE CREDENTIALS 🔴
    SUPABASE_URL: 'https://your-project.supabase.co',  // <- Replace this
    SUPABASE_ANON_KEY: 'your-anon-key-here',          // <- Replace this
    
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
    
    // Cities (can be expanded)
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
if (typeof window !== 'undefined' && window.supabase) {
    window.supabaseClient = window.supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY
    );
    
    // Check if credentials are still default
    if (CONFIG.SUPABASE_URL === 'https://your-project.supabase.co') {
        console.warn('⚠️ Please update your Supabase credentials in /js/config.js');
    }
}