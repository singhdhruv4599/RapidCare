// Authentication Module
const Auth = {
    currentUser: null,

    async init() {
        if (!window.supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.loadUserProfile();
        }

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

    // ✅ Signup simplified — trigger handle karega users table
    async signUp(email, password, role = "patient") {
        try {
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { role }  // yahi role trigger me insert ho jayega
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('User not created');

            return { success: true, user: authData.user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    },

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

    async signOut() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }
};

async function logout() {
    await Auth.signOut();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}
