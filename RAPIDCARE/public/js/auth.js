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
                window.location.href = 'dashboard.html';
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                window.location.href = 'login.html';
            }
        });
    },

    // Load user profile from users table
    async loadUserProfile() {
        if (!this.currentUser) return;

        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();

        if (data) {
            this.currentUser.profile = data;
        } else if (error) {
            console.error('Profile load error:', error.message);
        }
    },

    // Sign up new user
    async signUp(email, password, role = "patient", additionalData = {}) {
        try {
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { role } }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('User not created');

            // Create user profile
            const { error: profileError } = await supabaseClient
                .from('users')
                .insert({
                    id: authData.user.id,
                    email,
                    role,
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

    // Render login/signup form
    renderAuthForm() {
        const container = document.getElementById('auth-form');
        if (!container) return;

        container.innerHTML = `
            <form id="authForm">
                <div class="mb-4">
                    <label class="block mb-1">Email</label>
                    <input type="email" name="email" required class="w-full px-3 py-2 border rounded">
                </div>
                <div class="mb-4">
                    <label class="block mb-1">Password</label>
                    <input type="password" name="password" required class="w-full px-3 py-2 border rounded">
                </div>
                <button type="submit" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                    Submit
                </button>
                <div id="auth-message" class="text-center mt-4 text-red-600 hidden"></div>
            </form>
        `;

        const form = document.getElementById('authForm');
        const message = document.getElementById('auth-message');

        if (window.location.pathname.includes("login")) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const email = form.email.value;
                const password = form.password.value;
                const result = await this.signIn(email, password);
                if (result.success) {
                    message.textContent = "✅ Login successful! Redirecting...";
                    message.classList.remove("hidden");
                    setTimeout(() => window.location.href = "dashboard.html", 1000);
                } else {
                    message.textContent = "❌ " + result.error;
                    message.classList.remove("hidden");
                }
            };
        } else {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const email = form.email.value;
                const password = form.password.value;
                const result = await this.signUp(email, password);
                if (result.success) {
                    message.textContent = "✅ Signup successful! Check your email.";
                    message.classList.remove("hidden");
                    setTimeout(() => window.location.href = "login.html", 1000);
                } else {
                    message.textContent = "❌ " + result.error;
                    message.classList.remove("hidden");
                }
            };
        }
    }
};

// Global logout
async function logout() {
    await Auth.signOut();
}

// Init on page load
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
