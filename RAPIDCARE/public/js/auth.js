// Authentication Module
const Auth = {
    currentUser: null,
    
    // Initialize authentication
    async init() {
        if (!window.supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }
        
        // Check current session
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.loadUserProfile();
        }
        
        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                await this.loadUserProfile();
                window.location.href = '/dashboard';
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                window.location.href = '/login';
            }
        });
    },
    
    // Load user profile from database
    async loadUserProfile() {
        if (!this.currentUser) return;
        
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();
        
        if (data) {
            this.currentUser.profile = data;
        }
    },
    
    // Sign up new user
    async signUp(email, password, role, additionalData = {}) {
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { role }
                }
            });
            
            if (authError) throw authError;
            
            // Create user profile
            const { error: profileError } = await supabaseClient
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: email,
                    role: role,
                    ...additionalData,
                    created_at: new Date().toISOString()
                });
            
            if (profileError) throw profileError;
            
            return { success: true, user: authData.user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Sign in existing user
    async signIn(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Sign out
    async signOut() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },
    
    // Check if user has role
    hasRole(role) {
        return this.currentUser?.profile?.role === role;
    },
    
    // Render auth forms
    renderAuthForm() {
        const container = document.getElementById('auth-form');
        if (!container) return;
        
        container.innerHTML = `
            <div class="tabs">
                <button class="tab active" onclick="Auth.showSignIn()">Sign In</button>
                <button class="tab" onclick="Auth.showSignUp()">Sign Up</button>
            </div>
            
            <div id="signin-form" class="auth-form-content">
                <form onsubmit="return Auth.handleSignIn(event)">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" name="email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-control" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </button>
                </form>
            </div>
            
            <div id="signup-form" class="auth-form-content" style="display:none;">
                <form onsubmit="return Auth.handleSignUp(event)">
                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <select class="form-select" name="role" onchange="Auth.toggleRoleFields(this.value)" required>
                            <option value="">Select Role</option>
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Hospital Admin</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-control" name="password" minlength="6" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="form-control" name="phone" required>
                    </div>
                    
                    <div id="role-specific-fields"></div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </button>
                </form>
            </div>
            
            <div id="auth-message" class="alert" style="display:none; margin-top:1rem;"></div>
        `;
    },
    
    showSignIn() {
        document.getElementById('signin-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab')[0].classList.add('active');
    },
    
    showSignUp() {
        document.getElementById('signin-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab')[1].classList.add('active');
    },
    
    toggleRoleFields(role) {
        const container = document.getElementById('role-specific-fields');
        let html = '';
        
        if (role === 'patient') {
            html = `
                <div class="form-group">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" name="dob" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Address</label>
                    <input type="text" class="form-control" name="address" required>
                </div>
                <div class="form-group">
                    <label class="form-label">City</label>
                    <select class="form-select" name="city" required>
                        <option value="">Select City</option>
                        ${CONFIG.CITIES.map(city => `<option value="${city}">${city}</option>`).join('')}
                    </select>
                </div>
            `;
        } else if (role === 'doctor') {
            html = `
                <div class="form-group">
                    <label class="form-label">Specialization</label>
                    <select class="form-select" name="specialization" required>
                        <option value="">Select Specialization</option>
                        ${CONFIG.SPECIALIZATIONS.map(spec => `<option value="${spec}">${spec}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">License Number</label>
                    <input type="text" class="form-control" name="license_number" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Hospital ID</label>
                    <input type="text" class="form-control" name="hospital_id" placeholder="Enter hospital ID" required>
                </div>
            `;
        } else if (role === 'admin') {
            html = `
                <div class="form-group">
                    <label class="form-label">Hospital Name</label>
                    <input type="text" class="form-control" name="hospital_name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Hospital City</label>
                    <select class="form-select" name="hospital_city" required>
                        <option value="">Select City</option>
                        ${CONFIG.CITIES.map(city => `<option value="${city}">${city}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Hospital Contact</label>
                    <input type="tel" class="form-control" name="hospital_contact" required>
                </div>
            `;
        }
        
        container.innerHTML = html;
    },
    
    async handleSignIn(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        const messageDiv = document.getElementById('auth-message');
        messageDiv.style.display = 'none';
        
        const result = await this.signIn(email, password);
        
        if (result.success) {
            messageDiv.className = 'alert alert-success';
            messageDiv.textContent = 'Sign in successful! Redirecting...';
            messageDiv.style.display = 'block';
        } else {
            messageDiv.className = 'alert alert-error';
            messageDiv.textContent = result.error || 'Sign in failed';
            messageDiv.style.display = 'block';
        }
        
        return false;
    },
    
    async handleSignUp(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        const messageDiv = document.getElementById('auth-message');
        messageDiv.style.display = 'none';
        
        const { email, password, role, ...additionalData } = data;
        const result = await this.signUp(email, password, role, additionalData);
        
        if (result.success) {
            messageDiv.className = 'alert alert-success';
            messageDiv.textContent = 'Sign up successful! Please check your email to verify your account.';
            messageDiv.style.display = 'block';
        } else {
            messageDiv.className = 'alert alert-error';
            messageDiv.textContent = result.error || 'Sign up failed';
            messageDiv.style.display = 'block';
        }
        
        return false;
    }
};

// Logout function for global access
async function logout() {
    await Auth.signOut();
}

// Initialize auth when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Auth.init();
        if (document.getElementById('auth-form')) {
            Auth.renderAuthForm();
        }
    });
} else {
    Auth.init();
    if (document.getElementById('auth-form')) {
        Auth.renderAuthForm();
    }
}