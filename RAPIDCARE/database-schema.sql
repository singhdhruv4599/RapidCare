-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create RLS policies for public read access (for testing)
CREATE POLICY "Public read access" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Public read access" ON doctors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON beds FOR SELECT USING (true);
CREATE POLICY "Public read access" ON equipment FOR SELECT USING (true);

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Appointments policies
CREATE POLICY "Users can view their appointments" ON appointments
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT user_id FROM doctors WHERE id = appointments.doctor_id
  ));

CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE beds;
ALTER PUBLICATION supabase_realtime ADD TABLE equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE doctors;