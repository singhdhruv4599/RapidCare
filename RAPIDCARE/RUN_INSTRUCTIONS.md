# 🚀 How to Run RapidCare

## ✅ Application Status: **RUNNING**

The RapidCare application is **already running** and ready to use!

## 📱 Access the Application

### **Option 1: Live URL (Recommended)**
🌐 **Click here to open**: https://3000-ijivhe5p89rxzcemf1ap1-6532622b.e2b.dev

### **Option 2: Setup Guide**
📖 **Setup Instructions**: https://3000-ijivhe5p89rxzcemf1ap1-6532622b.e2b.dev/setup.html

---

## 🔧 Quick Setup (5 Minutes)

### **What You Need:**
1. A free Supabase account (takes 1 minute to create)
2. Copy-paste 2 values into the config file

### **Setup Steps:**

#### **1️⃣ Create Supabase Account (1 min)**
- Go to https://supabase.com
- Click "Start your project"
- Sign up with GitHub or email

#### **2️⃣ Create Project (1 min)**
- Name: "rapidcare"
- Password: Choose any
- Region: Select nearest
- Click "Create"

#### **3️⃣ Get Your Keys (30 sec)**
- Go to Settings → API
- Copy these:
  - **Project URL**: `https://xxxxx.supabase.co`
  - **Anon Key**: `eyJhbGc...` (long string)

#### **4️⃣ Setup Database (1 min)**
- Go to SQL Editor
- Click "New Query"
- Copy all content from: `/database-schema.sql`
- Paste and click "Run"

#### **5️⃣ Update Config (30 sec)**
- Edit `/public/js/config.js`
- Replace these lines:
```javascript
SUPABASE_URL: 'paste-your-url-here',
SUPABASE_ANON_KEY: 'paste-your-key-here',
```

#### **6️⃣ Done! Start Using**
- Refresh the app page
- Click "Sign Up"
- Create test accounts

---

## 🧪 Test Accounts

Create these accounts to test different features:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Patient** | patient@test.com | test123 | Search hospitals, book appointments, emergency mode |
| **Doctor** | doctor@test.com | test123 | Manage schedule, update availability |
| **Admin** | admin@test.com | test123 | Manage beds, equipment, hospital status |

---

## 💻 For Developers

### **Check Status**
```bash
pm2 status
```

### **View Logs**
```bash
pm2 logs rapidcare --nostream
```

### **Restart Application**
```bash
pm2 restart rapidcare
```

### **Stop Application**
```bash
pm2 stop rapidcare
```

### **Start Fresh**
```bash
cd /home/user/webapp
npm run clean-port
npm run build
pm2 start ecosystem.config.cjs
```

---

## 🆘 Troubleshooting

### **"Supabase not configured" error**
→ You need to add your Supabase credentials to `/public/js/config.js`

### **"Cannot sign up" error**
→ Check that you ran the SQL schema in Supabase

### **Application not loading**
→ Check if server is running: `pm2 status`
→ Restart: `pm2 restart rapidcare`

### **Port 3000 in use**
```bash
fuser -k 3000/tcp
pm2 restart rapidcare
```

---

## 📊 Sample Data

After setting up Supabase, you can load sample data:
1. Sign in as any user
2. If no hospitals appear, click "Load Sample Data" button
3. This will create 3 sample hospitals with beds, doctors, and equipment

---

## 🎯 Quick Test

1. **Open the app**: https://3000-ijivhe5p89rxzcemf1ap1-6532622b.e2b.dev
2. **View setup guide**: Click `/setup.html` in the URL
3. **Follow the colored steps** in the setup guide
4. **Create a patient account** and explore!

---

## 📝 Notes

- The app is built with Cloudflare Workers technology
- Uses Supabase for database and authentication
- Real-time updates work automatically once configured
- Mobile-responsive design works on all devices

**Need help?** Check the `/setup.html` page for visual instructions!