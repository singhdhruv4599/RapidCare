// Dashboard specific functions for RapidCare

// Doctor Dashboard Functions
App.showDoctorSchedule = async function() {
    const user = Auth.getCurrentUser();
    const container = document.getElementById('dashboard-content');
    
    const today = new Date().toISOString().split('T')[0];
    const { data: appointments } = await Database.appointments.getByDoctor(user.profile?.doctor_id || user.id);
    
    const todayAppointments = appointments?.filter(apt => 
        apt.appointment_date === today && apt.status === 'scheduled'
    ) || [];
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Today's Schedule - ${new Date().toLocaleDateString()}</h2>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Patient</th>
                                <th>Contact</th>
                                <th>Reason</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${todayAppointments.length > 0 ? todayAppointments.map(apt => `
                                <tr>
                                    <td>${apt.appointment_time}</td>
                                    <td>${apt.users?.name || 'N/A'}</td>
                                    <td>${apt.users?.phone || 'N/A'}</td>
                                    <td>${apt.reason || 'General Consultation'}</td>
                                    <td>
                                        <button class="btn btn-success" onclick="App.markAppointmentComplete('${apt.id}')">
                                            <i class="fas fa-check"></i> Complete
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="5">No appointments scheduled for today</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

App.showDoctorAppointments = async function() {
    const user = Auth.getCurrentUser();
    const container = document.getElementById('dashboard-content');
    
    const { data: appointments } = await Database.appointments.getByDoctor(user.profile?.doctor_id || user.id);
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">All Appointments</h2>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Patient</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appointments && appointments.length > 0 ? appointments.map(apt => `
                                <tr>
                                    <td>${new Date(apt.appointment_date).toLocaleDateString()}</td>
                                    <td>${apt.appointment_time}</td>
                                    <td>${apt.users?.name || 'N/A'}</td>
                                    <td>
                                        <span class="hospital-status status-${apt.status === 'scheduled' ? 'available' : apt.status === 'completed' ? 'available' : 'full'}">
                                            ${apt.status}
                                        </span>
                                    </td>
                                    <td>
                                        ${apt.status === 'scheduled' ? `
                                            <button class="btn btn-danger" onclick="App.cancelAppointment('${apt.id}')">
                                                Cancel
                                            </button>
                                        ` : '-'}
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="5">No appointments found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

App.showAvailabilitySettings = async function() {
    const user = Auth.getCurrentUser();
    const container = document.getElementById('dashboard-content');
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Manage Availability</h2>
            </div>
            <div class="card-body">
                <form onsubmit="return App.updateDoctorAvailability(event)">
                    <div class="form-group">
                        <label class="form-label">Current Status</label>
                        <select class="form-select" name="available">
                            <option value="true">Available</option>
                            <option value="false">Not Available</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Consultation Hours</label>
                        <div style="display: grid; gap: 1rem;">
                            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => `
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <label style="width: 100px;">${day}</label>
                                    <input type="time" class="form-control" name="${day.toLowerCase()}_start" value="09:00">
                                    <span>to</span>
                                    <input type="time" class="form-control" name="${day.toLowerCase()}_end" value="17:00">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Update Availability
                    </button>
                </form>
            </div>
        </div>
    `;
};

// Admin Dashboard Functions
App.showHospitalOverview = async function() {
    const user = Auth.getCurrentUser();
    const container = document.getElementById('dashboard-content');
    
    // Get hospital data based on admin's hospital
    const hospitalId = user.profile?.hospital_id || 1; // Default to 1 for demo
    
    const { data: hospital } = await Database.hospitals.getById(hospitalId);
    const { data: beds } = await Database.beds.getByHospital(hospitalId);
    const { data: equipment } = await Database.equipment.getByHospital(hospitalId);
    const { data: doctors } = await Database.doctors.getAll({ hospital_id: hospitalId });
    
    const totalBeds = beds?.reduce((sum, b) => sum + b.total_count, 0) || 0;
    const availableBeds = beds?.reduce((sum, b) => sum + b.available_count, 0) || 0;
    const totalDoctors = doctors?.length || 0;
    const availableDoctors = doctors?.filter(d => d.available).length || 0;
    
    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-body">
                    <h3>Hospital Status</h3>
                    <div class="hospital-status status-${hospital?.status === 'available' ? 'available' : 'full'}" style="font-size: 1.5rem; margin: 1rem 0;">
                        ${hospital?.status === 'available' ? '🟢 Available' : '🔴 Full'}
                    </div>
                    <button class="btn btn-${hospital?.status === 'available' ? 'danger' : 'success'}" 
                            onclick="App.toggleHospitalStatus('${hospitalId}', '${hospital?.status === 'available' ? 'full' : 'available'}')">
                        Mark as ${hospital?.status === 'available' ? 'Full' : 'Available'}
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <h3>Bed Occupancy</h3>
                    <div class="stat-value">${availableBeds} / ${totalBeds}</div>
                    <div class="stat-label">Available / Total</div>
                    <div style="margin-top: 1rem;">
                        <div style="background: #e5e7eb; border-radius: 4px; height: 20px;">
                            <div style="background: #10b981; width: ${(availableBeds/totalBeds)*100}%; height: 100%; border-radius: 4px;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <h3>Doctor Availability</h3>
                    <div class="stat-value">${availableDoctors} / ${totalDoctors}</div>
                    <div class="stat-label">Available / Total</div>
                </div>
            </div>
        </div>
        
        <div class="card" style="margin-top: 2rem;">
            <div class="card-header">
                <h2 class="card-title">Hospital Information</h2>
            </div>
            <div class="card-body">
                <p><strong>Name:</strong> ${hospital?.name || 'N/A'}</p>
                <p><strong>City:</strong> ${hospital?.city || 'N/A'}</p>
                <p><strong>Contact:</strong> ${hospital?.contact || 'N/A'}</p>
                <p><strong>Address:</strong> ${hospital?.address || 'N/A'}</p>
            </div>
        </div>
    `;
};

App.showBedManagement = async function() {
    const user = Auth.getCurrentUser();
    const container = document.getElementById('dashboard-content');
    
    const hospitalId = user.profile?.hospital_id || 1;
    const { data: beds } = await Database.beds.getByHospital(hospitalId);
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Bed Management</h2>
            </div>
            <div class="card-body">
                <form onsubmit="return App.updateBeds(event, '${hospitalId}')">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Total Beds</th>
                                    <th>Available</th>
                                    <th>Occupied</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.values(CONFIG.BED_TYPES).map(type => {
                                    const bed = beds?.find(b => b.type === type) || { total_count: 0, available_count: 0 };
                                    return `
                                        <tr>
                                            <td>${type}</td>
                                            <td>
                                                <input type="number" class="form-control" 
                                                       name="${type}_total" value="${bed.total_count}" min="0">
                                            </td>
                                            <td>
                                                <input type="number" class="form-control" 
                                                       name="${type}_available" value="${bed.available_count}" min="0">
                                            </td>
                                            <td>${bed.total_count - bed.available_count}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-save"></i> Update Bed Count
                    </button>
                </form>
            </div>
        </div>
    `;
};

App.showEquipmentManagement = async function() {
    const user = Auth.getCurrentUser();
    const container = document.getElementById('dashboard-content');
    
    const hospitalId = user.profile?.hospital_id || 1;
    const { data: equipment } = await Database.equipment.getByHospital(hospitalId);
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Equipment Management</h2>
            </div>
            <div class="card-body">
                <form onsubmit="return App.updateEquipment(event, '${hospitalId}')">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Equipment</th>
                                    <th>Total Count</th>
                                    <th>Available</th>
                                    <th>In Use</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(CONFIG.EQUIPMENT_TYPES).map(([key, name]) => {
                                    const item = equipment?.find(e => e.type === name) || { total_count: 0, available_count: 0 };
                                    return `
                                        <tr>
                                            <td>${name}</td>
                                            <td>
                                                <input type="number" class="form-control" 
                                                       name="${key}_total" value="${item.total_count}" min="0">
                                            </td>
                                            <td>
                                                <input type="number" class="form-control" 
                                                       name="${key}_available" value="${item.available_count}" min="0">
                                            </td>
                                            <td>${item.total_count - item.available_count}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-save"></i> Update Equipment
                    </button>
                </form>
            </div>
        </div>
    `;
};

// Update functions
App.updateBeds = async function(event, hospitalId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const bedsData = Object.values(CONFIG.BED_TYPES).map(type => ({
        type,
        total_count: parseInt(formData.get(`${type}_total`) || 0),
        available_count: parseInt(formData.get(`${type}_available`) || 0)
    }));
    
    const { error } = await Database.beds.bulkUpdate(hospitalId, bedsData);
    
    if (error) {
        UI.showAlert('Failed to update beds: ' + error.message, 'error');
    } else {
        UI.showAlert('Bed counts updated successfully!', 'success');
    }
    
    return false;
};

App.updateEquipment = async function(event, hospitalId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const equipmentData = Object.entries(CONFIG.EQUIPMENT_TYPES).map(([key, name]) => ({
        type: name,
        total_count: parseInt(formData.get(`${key}_total`) || 0),
        available_count: parseInt(formData.get(`${key}_available`) || 0)
    }));
    
    const { error } = await Database.equipment.bulkUpdate(hospitalId, equipmentData);
    
    if (error) {
        UI.showAlert('Failed to update equipment: ' + error.message, 'error');
    } else {
        UI.showAlert('Equipment updated successfully!', 'success');
    }
    
    return false;
};

App.toggleHospitalStatus = async function(hospitalId, newStatus) {
    const { error } = await Database.hospitals.updateStatus(hospitalId, newStatus);
    
    if (error) {
        UI.showAlert('Failed to update hospital status: ' + error.message, 'error');
    } else {
        UI.showAlert('Hospital status updated successfully!', 'success');
        await App.showHospitalOverview();
    }
};

App.updateDoctorAvailability = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const user = Auth.getCurrentUser();
    
    const available = formData.get('available') === 'true';
    const { error } = await Database.doctors.toggleAvailability(user.profile?.doctor_id || user.id, available);
    
    if (error) {
        UI.showAlert('Failed to update availability: ' + error.message, 'error');
    } else {
        UI.showAlert('Availability updated successfully!', 'success');
    }
    
    return false;
};

App.markAppointmentComplete = async function(appointmentId) {
    const { error } = await Database.appointments.updateStatus(appointmentId, 'completed');
    
    if (error) {
        UI.showAlert('Failed to update appointment: ' + error.message, 'error');
    } else {
        UI.showAlert('Appointment marked as completed!', 'success');
        await App.showDoctorSchedule();
    }
};

App.cancelAppointment = async function(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    const { error } = await Database.appointments.updateStatus(appointmentId, 'cancelled');
    
    if (error) {
        UI.showAlert('Failed to cancel appointment: ' + error.message, 'error');
    } else {
        UI.showAlert('Appointment cancelled!', 'success');
        await App.showDoctorAppointments();
    }
};