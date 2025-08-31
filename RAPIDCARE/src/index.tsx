import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for Supabase API calls
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/js/*', serveStatic({ root: './public' }))
app.use('/css/*', serveStatic({ root: './public' }))

// API endpoint to proxy Supabase requests (to hide API key)
app.post('/api/supabase/*', async (c) => {
  const path = c.req.path.replace('/api/supabase/', '')
  const supabaseUrl = c.env?.SUPABASE_URL || 'https://your-project.supabase.co'
  const supabaseKey = c.env?.SUPABASE_ANON_KEY || 'your-anon-key'
  
  try {
    const body = await c.req.json()
    const response = await fetch(`${supabaseUrl}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to connect to Supabase' }, 500)
  }
})

// Main application HTML
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RapidCare - Hospital Availability System</title>
    <link href="/css/styles.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div id="app">
        <div class="loading-screen">
            <i class="fas fa-hospital-symbol fa-3x text-primary animate-pulse"></i>
            <p>Loading RapidCare...</p>
        </div>
    </div>
    
    <!-- Supabase SDK -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <!-- Application Scripts -->
    <script src="/js/config.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/database.js"></script>
    <script src="/js/ui.js"></script>
    <script src="/js/app.js"></script>
</body>
</html>
  `)
})

// Login page
app.get('/login', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - RapidCare</title>
    <link href="/css/styles.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div id="app">
        <div class="auth-container">
            <div class="auth-card">
                <h1><i class="fas fa-hospital-symbol"></i> RapidCare</h1>
                <div id="auth-form"></div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="/js/config.js"></script>
    <script src="/js/auth.js"></script>
</body>
</html>
  `)
})

// Dashboard page
app.get('/dashboard', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - RapidCare</title>
    <link href="/css/styles.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div id="app">
        <nav class="navbar">
            <div class="nav-brand">
                <i class="fas fa-hospital-symbol"></i> RapidCare
            </div>
            <div class="nav-menu">
                <span id="user-info"></span>
                <button onclick="logout()" class="btn btn-secondary">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </nav>
        
        <div id="dashboard-content" class="dashboard-container">
            <!-- Dynamic content loaded here -->
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="/js/config.js"></script>
    <script src="/js/auth.js"></script>
    <script src="/js/database.js"></script>
    <script src="/js/dashboard.js"></script>
</body>
</html>
  `)
})

export default app