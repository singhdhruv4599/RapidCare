// Authentication Module
const Auth = {
    currentUser: null,

    async init() {
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not initialized');
            return;
        }

        // Get current session
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) console.error("Session error:", error);

        if (session?.user) {
            this.currentUser = session.user;
            await this.loadUserProfile();
        }

        // Listen to auth state changes
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            console.log("🔔 Auth event:", event);

            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                await this.loadUserProfile();
                window.location.href = 'dashboard.html';
            } 
            else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                window.location.href = 'login.html';
            }
        });
    },

    async loadUserProfile() {
        if (!this.currentUser) return;

        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();

        if (data) {
            this.currentUser.profile = data;
            console.log("✅ User profile loaded:", data);
        } else if (error) {
            console.warn('⚠️ Profile not found (new user).', error.message);
        }
    },

    // ✅ Signup (users table auto-populated by trigger)
    async signUp(email, password, role = "patient") {
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { role }  // metadata → trigger users table me save karega
                }
            });

            if (error) throw error;
            if (!data.user) throw new Error('User not created');

            console.log("✅ Sign up successful:", data.user);
            return { success: true, user: data.user };
        } catch (err) {
            console.error('❌ Sign up error:', err.message);
            return { success: false, error: err.message };
        }
    },

    // ✅ Login
    async signIn(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            console.log("✅ Sign in successful:", data.user);

            return { success: true, user: data.user };
        } catch (err) {
            console.error('❌ Sign in error:', err.message);
            return { success: false, error: err.message };
        }
    },

    // ✅ Logout
    async signOut() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            console.log("✅ Signed out");
            return { success: true };
        } catch (err) {
            console.error('❌ Sign out error:', err.message);
            return { success: false, error: err.message };
        }
    }
};

// Expose logout for navbar
async function logout() {
    await Auth.signOut();
}

// Initialize Auth on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}
