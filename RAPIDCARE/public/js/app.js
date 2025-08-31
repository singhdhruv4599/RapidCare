// Main Application Module for RapidCare
const App = {
    // Initialize application
    async init() {
        console.log('Initializing RapidCare...');
        
        // Check authentication
        await Auth.init();
        const user = Auth.getCurrentUser();
        
        if (!user) {
            // Redirect to login if not authenticated
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            return;
        }
        
        // User is authenticated, load dashboard
        if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
            await this.loadDashboard();
        }
    },
    
    // Load dashboard based on user role
    async loadDashboard() {
        const user = Auth.getCurrentUser();
        
        if (!user || !user.profile) {
            UI.showLoading('Loading user profile...');
            await Auth.loadUserProfile();
        }
        
        const role = user.profile?.role;
        
        switch(role) {
            case CONFIG.ROLES.PATIENT:
                await this.loadPatientDashboard();
                break;
            case CONFIG.ROLES.DOCTOR:
                await this.loadDoctorDashboard();
                break;
            case CONFIG.ROLES.ADMIN:
                await this.loadAdminDashboard();
                break;
            default:
                UI.showAlert('Invalid user role', 'error');
                await Auth.signOut();
        }
    },
    
    // Load patient dashboard
    async loadPatientDashboard() {
        const user = Auth.getCurrentUser();
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <nav class="navbar">
                <div class="nav-brand">
                    <i class="fas fa-hospital-symbol"></i> RapidCare - Patient Portal
                </div>
                <div class="nav-menu">
                    <span style="margin-right: 1rem;">
                        <i class="fas fa-user"></i> ${user.profile?.name || user.email}
                    </span>
                    <button onclick="logout()" class="btn btn-secondary">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </nav>
            
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>Find Healthcare Services</h1>
                    <p>Search for hospitals, check availability, and book appointments instantly.</p>
                </div>
                
                ${UI.renderSearchFilters()}
                
                <div class="tabs">
                    <button class="tab active" onclick="App.showHospitals()">
                        <i class="fas fa-hospital"></i> Hospitals
                    </button>
                    <button class="tab" onclick="App.showAppointments()">
                        <i class="fas fa-calendar"></i> My Appointments
                    </button>
                    <button class="tab" onclick="App.showProfile()">
                        <i class="fas fa-user-cog"></i> Profile
                    </button>
                </div>
                
                <div id="dashboard-content">
                    <div class="dashboard-grid" id="hospitals-grid">
                        <!-- Hospitals will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        // Load hospitals
        await this.showHospitals();
        
        // Subscribe to real-time updates
        this.subscribeToUpdates();
    },
    
    // Load doctor dashboard
    async loadDoctorDashboard() {
        const user = Auth.getCurrentUser();
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <nav class="navbar">
                <div class="nav-brand">
                    <i class="fas fa-hospital-symbol"></i> RapidCare - Doctor Portal
                </div>
                <div class="nav-menu">
                    <span style="margin-right: 1rem;">
                        <i class="fas fa-user-md"></i> Dr. ${user.profile?.name || user.email}
                    </span>
                    <button onclick="logout()" class="btn btn-secondary">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </nav>
            
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>Doctor Dashboard</h1>
                    <p>Manage your availability and appointments.</p>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="App.showDoctorSchedule()">
                        <i class="fas fa-calendar-alt"></i> My Schedule
                    </button>
                    <button class="tab" onclick="App.showDoctorAppointments()">
                        <i class="fas fa-clipboard-list"></i> Appointments
                    </button>
                    <button class="tab" onclick="App.showAvailabilitySettings()">
                        <i class="fas fa-clock"></i> Availability
                    </button>
                </div>
                
                <div id="dashboard-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;
        
        // Load schedule
        await this.showDoctorSchedule();
    },
    
    // Load admin dashboard
    async loadAdminDashboard() {
        const user = Auth.getCurrentUser();
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <nav class="navbar">
                <div class="nav-brand">
                    <i class="fas fa-hospital-symbol"></i> RapidCare - Admin Portal
                </div>
                <div class="nav-menu">
                    <span style="margin-right: 1rem;">
                        <i class="fas fa-user-shield"></i> ${user.profile?.name || user.email}
                    </span>
                    <button onclick="logout()" class="btn btn-secondary">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </nav>
            
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>Hospital Administration</h1>
                    <p>Manage hospital resources, beds, doctors, and equipment.</p>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="App.showHospitalOverview()">
                        <i class="fas fa-chart-line"></i> Overview
                    </button>
                    <button class="tab" onclick="App.showBedManagement()">
                        <i class="fas fa-bed"></i> Beds
                    </button>
                    <button class="tab" onclick="App.showDoctorManagement()">
                        <i class="fas fa-user-md"></i> Doctors
                    </button>
                    <button class="tab" onclick="App.showEquipmentManagement()">
                        <i class="fas fa-medical"></i> Equipment
                    </button>
                </div>
                
                <div id="dashboard-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;
        
        // Load overview
        await this.showHospitalOverview();
    },
    
    // Show hospitals (for patients)
    async showHospitals() {
        const container = document.getElementById('dashboard-content');
        container.innerHTML = '<div class="dashboard-grid" id="hospitals-grid">Loading hospitals...</div>';
        
        const { data: hospitals, error } = await Database.hospitals.getAll();
        
        if (error) {
            UI.showAlert('Failed to load hospitals: ' + error.message, 'error');
            return;
        }
        
        const grid = document.getElementById('hospitals-grid');
        
        if (hospitals && hospitals.length > 0) {
            grid.innerHTML = hospitals.map(h => UI.renderHospitalCard(h)).join('');
            
            // Load additional data for each hospital
            hospitals.forEach(async (hospital) => {
                const { data: beds } = await Database.beds.getByHospital(hospital.id);
                const { data: doctors } = await Database.doctors.getAll({ hospital_id: hospital.id });
                const { data: equipment } = await Database.equipment.getByHospital(hospital.id);
                
                // Update stats
                const bedsCount = beds ? beds.reduce((sum, b) => sum + b.available_count, 0) : 0;
                const doctorsCount = doctors ? doctors.filter(d => d.available).length : 0;
                const equipmentCount = equipment ? equipment.filter(e => e.available_count > 0).length : 0;
                
                const bedElement = document.getElementById(`beds-${hospital.id}`);
                const doctorElement = document.getElementById(`doctors-${hospital.id}`);
                const equipmentElement = document.getElementById(`equipment-${hospital.id}`);
                
                if (bedElement) bedElement.textContent = bedsCount;
                if (doctorElement) doctorElement.textContent = doctorsCount;
                if (equipmentElement) equipmentElement.textContent = equipmentCount;
            });
        } else {
            grid.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <p>No hospitals available at the moment.</p>
                        <button class="btn btn-primary" onclick="Database.seedSampleData().then(() => App.showHospitals())">
                            Load Sample Data
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    // Show appointments (for patients)
    async showAppointments() {
        const user = Auth.getCurrentUser();
        const container = document.getElementById('dashboard-content');
        
        container.innerHTML = '<div>Loading appointments...</div>';
        
        const { data: appointments, error } = await Database.appointments.getByPatient(user.id);
        
        if (error) {
            UI.showAlert('Failed to load appointments: ' + error.message, 'error');
            return;
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">My Appointments</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Doctor</th>
                                    <th>Hospital</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${appointments && appointments.length > 0 ? appointments.map(apt => `
                                    <tr>
                                        <td>${new Date(apt.appointment_date).toLocaleDateString()}</td>
                                        <td>${apt.appointment_time}</td>
                                        <td>${apt.doctors?.name || 'N/A'}</td>
                                        <td>${apt.hospitals?.name || 'N/A'}</td>
                                        <td>
                                            <span class="hospital-status status-${apt.status === 'scheduled' ? 'available' : 'full'}">
                                                ${apt.status}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="5">No appointments found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Show profile
    async showProfile() {
        const user = Auth.getCurrentUser();
        const container = document.getElementById('dashboard-content');
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">My Profile</h2>
                </div>
                <div class="card-body">
                    <form onsubmit="return App.updateProfile(event)">
                        <div class="form-group">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-control" name="name" value="${user.profile?.name || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" value="${user.email}" disabled>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Phone</label>
                            <input type="tel" class="form-control" name="phone" value="${user.profile?.phone || ''}" required>
                        </div>
                        
                        ${user.profile?.role === 'patient' ? `
                            <div class="form-group">
                                <label class="form-label">Date of Birth</label>
                                <input type="date" class="form-control" name="dob" value="${user.profile?.dob || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Address</label>
                                <input type="text" class="form-control" name="address" value="${user.profile?.address || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">City</label>
                                <select class="form-select" name="city">
                                    ${CONFIG.CITIES.map(city => `
                                        <option value="${city}" ${user.profile?.city === city ? 'selected' : ''}>${city}</option>
                                    `).join('')}
                                </select>
                            </div>
                        ` : ''}
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Update Profile
                        </button>
                    </form>
                </div>
            </div>
        `;
    },
    
    // Update profile
    async updateProfile(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const updates = Object.fromEntries(formData);
        
        const user = Auth.getCurrentUser();
        const { error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('id', user.id);
        
        if (error) {
            UI.showAlert('Failed to update profile: ' + error.message, 'error');
        } else {
            UI.showAlert('Profile updated successfully!', 'success');
            await Auth.loadUserProfile();
        }
        
        return false;
    },
    
    // Subscribe to real-time updates
    subscribeToUpdates() {
        // Subscribe to hospital updates
        Database.subscriptions.subscribeToHospitalUpdates((payload) => {
            console.log('Hospital update:', payload);
            // Refresh hospitals if on that view
            if (document.getElementById('hospitals-grid')) {
                this.showHospitals();
            }
        });
    },
    
    // Additional dashboard methods would go here...
    // (Doctor schedule, admin management, etc.)
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for global access
window.App = App;