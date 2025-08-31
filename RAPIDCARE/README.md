# RapidCare - Hospital Availability & Patient Information System

## Project Overview
- **Name**: RapidCare
- **Goal**: Real-time hospital availability tracking and patient appointment management system
- **Features**: Multi-role access (Patient, Doctor, Admin), real-time updates, emergency mode, appointment booking

## 🚀 Live URLs
- **Production**: Not yet deployed
- **Local Development**: http://localhost:3000
- **GitHub**: Not yet configured

## ✅ Currently Completed Features

### 1. **User Authentication & Roles**
- ✅ Multi-role authentication system (Patient, Doctor, Hospital Admin)
- ✅ Secure sign-up/sign-in with Supabase Auth
- ✅ Role-specific dashboards and menus
- ✅ Profile management for all user types

### 2. **Patient Features**
- ✅ Hospital search and filtering by city/status
- ✅ Real-time availability indicators (🟢 Available, 🔴 Full)
- ✅ View detailed hospital information (beds, doctors, equipment)
- ✅ Book appointments with available doctors
- ✅ View and manage personal appointments
- ✅ Emergency mode for instant hospital availability

### 3. **Doctor Features**
- ✅ View daily schedule and appointments
- ✅ Update availability status
- ✅ Manage consultation timings
- ✅ Mark appointments as completed
- ✅ Cancel appointments

### 4. **Hospital Admin Features**
- ✅ Hospital overview dashboard
- ✅ Manage bed availability (ICU, General, Emergency)
- ✅ Update equipment availability (MRI, X-Ray, Ventilator, etc.)
- ✅ Toggle hospital status (Available/Full)
- ✅ Real-time resource management

### 5. **Real-time Updates**
- ✅ Supabase real-time subscriptions setup
- ✅ Automatic dashboard refresh on data changes
- ✅ Live availability status updates

### 6. **UI/UX**
- ✅ Clean, professional design with Tailwind CSS
- ✅ Responsive mobile-friendly layout
- ✅ Color-coded availability indicators
- ✅ Interactive modals and forms
- ✅ Tab-based navigation
- ✅ Search and filter functionality

## 📊 Data Architecture

### **Data Models**
1. **Users**: id, email, name, role, phone, created_at, profile_data
2. **Hospitals**: id, name, city, address, contact, status
3. **Doctors**: id, user_id, hospital_id, name, specialization, available, license_number
4. **Beds**: id, hospital_id, type (ICU/General/Emergency), total_count, available_count
5. **Equipment**: id, hospital_id, type, total_count, available_count
6. **Appointments**: id, patient_id, doctor_id, hospital_id, date, time, reason, status
7. **Availability_Slots**: id, doctor_id, day, start_time, end_time, available

### **Storage Services**
- **Supabase PostgreSQL**: Main database for all relational data
- **Supabase Auth**: User authentication and session management
- **Supabase Realtime**: Live updates and subscriptions

## 🔌 API Endpoints

### **Public Pages**
- `GET /` - Main application page
- `GET /login` - Authentication page
- `GET /dashboard` - Dashboard (redirects based on role)

### **API Routes**
- `POST /api/supabase/*` - Proxy for Supabase API calls (hides API keys)

## 📋 User Guide

### **For Patients**
1. **Sign Up**: Register with personal information and select your city
2. **Search Hospitals**: Use filters to find hospitals by city or availability
3. **View Details**: Click on any hospital to see beds, doctors, and equipment
4. **Book Appointments**: Select an available doctor and choose time slot
5. **Emergency Mode**: Click EMERGENCY button for instant nearby hospital info

### **For Doctors**
1. **Login**: Use your registered email and password
2. **View Schedule**: See today's appointments on dashboard
3. **Update Availability**: Toggle your availability status
4. **Manage Appointments**: Mark as completed or cancel

### **For Hospital Admins**
1. **Login**: Access admin portal with credentials
2. **Update Resources**: Manage beds, equipment counts in real-time
3. **Toggle Status**: Mark hospital as Available or Full
4. **Monitor Dashboard**: View occupancy and resource utilization

## ⚙️ Configuration Required

### **Supabase Setup**
1. Create a Supabase project at https://supabase.com
2. Update `/public/js/config.js` with your:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Your anonymous key

### **Database Schema**
Run these SQL commands in Supabase SQL editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'doctor', 'admin')),
  phone TEXT,
  address TEXT,
  city TEXT,
  dob DATE,
  hospital_id UUID,
  doctor_id UUID,
  specialization TEXT,
  license_number TEXT,
  hospital_name TEXT,
  hospital_city TEXT,
  hospital_contact TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hospitals table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  contact TEXT,
  status TEXT CHECK (status IN ('available', 'full')) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  hospital_id UUID REFERENCES hospitals(id),
  name TEXT NOT NULL,
  specialization TEXT,
  available BOOLEAN DEFAULT true,
  license_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Beds table
CREATE TABLE beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  type TEXT CHECK (type IN ('ICU', 'General', 'Emergency')),
  total_count INTEGER DEFAULT 0,
  available_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hospital_id, type)
);

-- Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  type TEXT,
  total_count INTEGER DEFAULT 0,
  available_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hospital_id, type)
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES doctors(id),
  hospital_id UUID REFERENCES hospitals(id),
  appointment_date DATE,
  appointment_time TEXT,
  reason TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Availability slots table
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id),
  day TEXT,
  start_time TIME,
  end_time TIME,
  available BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for users table)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE beds;
ALTER PUBLICATION supabase_realtime ADD TABLE equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE doctors;
```

### **Environment Variables**
Create `.dev.vars` file for local development:
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## 🚧 Features Not Yet Implemented
- Google Maps integration for distance/ETA calculation
- Email notifications for appointments
- Advanced search with multiple filters
- Appointment rescheduling
- Patient medical history
- Payment integration
- Report generation
- Multi-language support

## 💡 Recommended Next Steps

1. **Supabase Configuration**
   - Create Supabase project
   - Set up database tables with provided schema
   - Configure Row Level Security policies
   - Enable email authentication

2. **Testing & Sample Data**
   - Use "Load Sample Data" button in app
   - Test all three user roles
   - Verify real-time updates

3. **Production Deployment**
   - Configure environment variables
   - Deploy to Cloudflare Pages
   - Set up custom domain
   - Configure Supabase production keys

4. **Enhancements**
   - Add Google Maps API for location services
   - Implement SMS notifications
   - Add appointment reminder system
   - Create admin analytics dashboard

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS, Font Awesome Icons
- **Backend**: Hono (Cloudflare Workers)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Cloudflare Pages

## 📝 Development

### **Local Development**
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs rapidcare --nostream

# Stop server
pm2 stop rapidcare
```

### **Deployment**
```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## 📄 License
MIT License - Free to use and modify

## 👥 Contributors
- RapidCare Development Team

## 📞 Support
For issues or questions, please create an issue in the GitHub repository.

---
**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: ✅ Development Complete - Ready for Supabase Configuration