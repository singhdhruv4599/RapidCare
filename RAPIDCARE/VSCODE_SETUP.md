# 🚀 Running RapidCare in VS Code

## 📥 **Step 1: Download the Project**

**Download Link**: [Download RapidCare Project](https://page.gensparksite.com/project_backups/toolu_01BXRS9kuKy4uJ2bAJLCjK7o.tar.gz)

### **Extract the Project:**
1. Download the tar.gz file from the link above
2. Extract it to your desired location:
   - **Windows**: Use 7-Zip or WinRAR
   - **Mac/Linux**: Double-click or use `tar -xzf rapidcare_project.tar.gz`
3. You'll get a folder structure: `home/user/webapp/`
4. Move the `webapp` folder to your workspace (e.g., `C:\Projects\rapidcare` or `~/Projects/rapidcare`)

---

## 🛠️ **Step 2: Prerequisites**

### **Install Required Software:**

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **VS Code**
   - Download: https://code.visualstudio.com/

3. **VS Code Extensions** (Recommended):
   - **Prettier** - Code formatter
   - **ESLint** - JavaScript linter
   - **Tailwind CSS IntelliSense** - CSS autocomplete
   - **Live Server** - For testing static files

---

## 📂 **Step 3: Open in VS Code**

1. Open VS Code
2. Click **File → Open Folder**
3. Select the extracted `rapidcare` folder (formerly webapp)
4. Trust the folder when prompted

---

## ⚙️ **Step 4: Install Dependencies**

Open VS Code Terminal (`Terminal → New Terminal` or `Ctrl+` `) and run:

```bash
# Install project dependencies
npm install

# Install PM2 globally (for process management)
npm install -g pm2

# Install Wrangler globally (for Cloudflare deployment)
npm install -g wrangler
```

---

## 🔧 **Step 5: Configure Supabase**

### **Create Supabase Account:**
1. Go to https://supabase.com
2. Sign up and create a new project
3. Name it "rapidcare"

### **Get Your Credentials:**
1. In Supabase Dashboard → **Settings → API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...` (long string)

### **Update Configuration:**
1. In VS Code, open `public/js/config.js`
2. Replace these lines:
```javascript
SUPABASE_URL: 'https://your-project.supabase.co',  // <- Your URL
SUPABASE_ANON_KEY: 'your-anon-key-here',          // <- Your Key
```

### **Setup Database:**
1. In Supabase → **SQL Editor**
2. Open `database-schema.sql` from VS Code
3. Copy all content
4. Paste in Supabase SQL Editor and click **Run**

---

## 🏃 **Step 6: Run the Application**

### **Option A: Development Mode (Recommended)**

```bash
# Build the project first
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs

# Check if running
pm2 status

# View logs
pm2 logs rapidcare
```

### **Option B: Direct Wrangler (Alternative)**

```bash
# Build first
npm run build

# Run directly with Wrangler
npx wrangler pages dev dist --port 3000
```

### **Option C: Simple Node Server (Quick Test)**

Create a file `server.js` in the root:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('dist'));
app.use(express.static('public'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => {
  console.log('RapidCare running on http://localhost:3000');
});
```

Then run:
```bash
npm install express
node server.js
```

---

## 🌐 **Step 7: Access the Application**

Open your browser and go to:
- **http://localhost:3000**

---

## 📝 **VS Code Settings (Optional)**

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "node_modules": true,
    ".wrangler": true,
    "dist": false
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug RapidCare",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 🔨 **Useful VS Code Commands**

### **Terminal Commands:**
```bash
# Install dependencies
npm install

# Build project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Stop server
pm2 stop rapidcare

# Restart server
pm2 restart rapidcare

# View logs
pm2 logs rapidcare

# Check status
pm2 status

# Delete from PM2
pm2 delete rapidcare

# Deploy to Cloudflare
npm run deploy
```

### **VS Code Shortcuts:**
- **Terminal**: `` Ctrl+` `` (backtick)
- **Command Palette**: `Ctrl+Shift+P`
- **File Search**: `Ctrl+P`
- **Global Search**: `Ctrl+Shift+F`
- **Format Document**: `Shift+Alt+F`

---

## 🐛 **Troubleshooting**

### **Port 3000 Already in Use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### **PM2 Not Found:**
```bash
npm install -g pm2
```

### **Wrangler Not Working:**
```bash
npm install -g wrangler
```

### **Dependencies Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📚 **Project Structure in VS Code**

```
rapidcare/
├── 📁 public/           # Static files
│   ├── 📁 css/         # Stylesheets
│   ├── 📁 js/          # Frontend JavaScript
│   └── setup.html      # Setup guide
├── 📁 src/             # Source code
│   └── index.tsx       # Main Hono app
├── 📁 dist/            # Built files (after npm run build)
├── 📄 package.json     # Dependencies
├── 📄 ecosystem.config.cjs  # PM2 config
├── 📄 wrangler.jsonc   # Cloudflare config
├── 📄 database-schema.sql  # Database setup
└── 📄 README.md        # Documentation
```

---

## 🚀 **Quick Start Summary**

```bash
# 1. Extract project to your workspace
# 2. Open folder in VS Code
# 3. Open terminal in VS Code

# 4. Install and run:
npm install
npm run build
pm2 start ecosystem.config.cjs

# 5. Open browser:
# http://localhost:3000

# 6. Configure Supabase (see Step 5)
```

---

## 💡 **VS Code Tips**

1. **Use integrated terminal** - It's faster than external terminal
2. **Install extensions** - They provide better development experience
3. **Use Git integration** - VS Code has excellent Git support
4. **Enable autosave** - File → Auto Save
5. **Use multi-cursor** - Alt+Click for multiple cursors
6. **Use Emmet** - Type shortcuts for HTML (e.g., `div.container` + Tab)

---

## 📞 **Need Help?**

- Check `README.md` for detailed features
- View `RUN_INSTRUCTIONS.md` for more commands
- See `BRANDING.md` for app details
- Open `setup.html` in browser for visual guide

**Application is ready to run in VS Code!** 🎉