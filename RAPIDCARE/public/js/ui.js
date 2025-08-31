// UI Module for RapidCare
const UI = {
    // Show loading screen
    showLoading(message = 'Loading...') {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="loading-screen">
                <i class="fas fa-spinner fa-spin fa-3x text-primary"></i>
                <p>${message}</p>
            </div>
        `;
    },
    
    // Show alert message
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        // Find or create alerts container
        let alertsContainer = document.getElementById('alerts-container');
        if (!alertsContainer) {
            alertsContainer = document.createElement('div');
            alertsContainer.id = 'alerts-container';
            alertsContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
            document.body.appendChild(alertsContainer);
        }
        
        alertsContainer.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    },
    
    // Render hospital card
    renderHospitalCard(hospital) {
        const statusClass = hospital.status === 'available' ? 'available' : 'full';
        const statusIcon = hospital.status === 'available' ? '🟢' : '🔴';
        
        return `
            <div class="hospital-card ${statusClass}" data-hospital-id="${hospital.id}">
                <div class="hospital-header">
                    <div>
                        <h3 class="hospital-name">${hospital.name}</h3>
                        <div class="info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${hospital.city}</span>
                        </div>
                    </div>
                    <div class="hospital-status status-${statusClass}">
                        ${statusIcon} ${hospital.status === 'available' ? 'Available' : 'Full'}
                    </div>
                </div>
                
                <div class="hospital-info">
                    <div class="info-row">
                        <i class="fas fa-phone"></i>
                        <span>${hospital.contact}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-location-dot"></i>
                        <span>${hospital.address || 'Address not available'}</span>
                    </div>
                </div>
                
                <div class="hospital-stats">
                    <div class="stat-item">
                        <div class="stat-value" id="beds-${hospital.id}">-</div>
                        <div class="stat-label">Beds Available</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="doctors-${hospital.id}">-</div>
                        <div class="stat-label">Doctors</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="equipment-${hospital.id}">-</div>
                        <div class="stat-label">Equipment</div>
                    </div>
                </div>
                
                <div class="hospital-actions" style="margin-top: 1rem;">
                    <button class="btn btn-primary btn-block" onclick="UI.showHospitalDetails('${hospital.id}')">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        `;
    },
    
    // Show hospital details modal
    async showHospitalDetails(hospitalId) {
        const { data: hospital } = await Database.hospitals.getById(hospitalId);
        const { data: beds } = await Database.beds.getByHospital(hospitalId);
        const { data: equipment } = await Database.equipment.getByHospital(hospitalId);
        const { data: doctors } = await Database.doctors.getAll({ hospital_id: hospitalId });
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${hospital.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="UI.switchTab(this, 'beds-tab')">Beds</button>
                    <button class="tab" onclick="UI.switchTab(this, 'doctors-tab')">Doctors</button>
                    <button class="tab" onclick="UI.switchTab(this, 'equipment-tab')">Equipment</button>
                </div>
                
                <div id="beds-tab" class="tab-content">
                    <h3>Bed Availability</h3>
                    <div class="availability-grid">
                        ${beds ? beds.map(bed => `
                            <div class="availability-item ${bed.available_count > 0 ? 'available' : 'unavailable'}">
                                <div class="availability-icon">
                                    <i class="fas fa-bed"></i>
                                </div>
                                <div class="availability-count">${bed.available_count}/${bed.total_count}</div>
                                <div class="availability-label">${bed.type}</div>
                            </div>
                        `).join('') : '<p>No bed information available</p>'}
                    </div>
                </div>
                
                <div id="doctors-tab" class="tab-content" style="display:none;">
                    <h3>Available Doctors</h3>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Specialization</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${doctors ? doctors.map(doctor => `
                                    <tr>
                                        <td>${doctor.name}</td>
                                        <td>${doctor.specialization}</td>
                                        <td>
                                            <span class="hospital-status status-${doctor.available ? 'available' : 'full'}">
                                                ${doctor.available ? '🟢 Available' : '🔴 Busy'}
                                            </span>
                                        </td>
                                        <td>
                                            ${doctor.available ? `
                                                <button class="btn btn-primary" onclick="UI.bookAppointment('${doctor.id}', '${doctor.name}')">
                                                    Book
                                                </button>
                                            ` : '-'}
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4">No doctors available</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div id="equipment-tab" class="tab-content" style="display:none;">
                    <h3>Equipment Availability</h3>
                    <div class="availability-grid">
                        ${equipment ? equipment.map(item => `
                            <div class="availability-item ${item.available_count > 0 ? 'available' : 'unavailable'}">
                                <div class="availability-icon">
                                    <i class="fas fa-${this.getEquipmentIcon(item.type)}"></i>
                                </div>
                                <div class="availability-count">${item.available_count}/${item.total_count}</div>
                                <div class="availability-label">${item.type}</div>
                            </div>
                        `).join('') : '<p>No equipment information available</p>'}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Switch tabs
    switchTab(tabElement, tabId) {
        // Update tab buttons
        tabElement.parentElement.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        tabElement.classList.add('active');
        
        // Update tab content
        tabElement.closest('.modal-content').querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(tabId).style.display = 'block';
    },
    
    // Get equipment icon
    getEquipmentIcon(type) {
        const icons = {
            'MRI Scanner': 'radiation',
            'X-Ray Machine': 'x-ray',
            'Ventilator': 'lungs',
            'CT Scanner': 'circle-radiation',
            'Ultrasound': 'wave-square',
            'ECG Machine': 'heart-pulse'
        };
        return icons[type] || 'medical';
    },
    
    // Book appointment
    async bookAppointment(doctorId, doctorName) {
        const user = Auth.getCurrentUser();
        if (!user) {
            this.showAlert('Please login to book an appointment', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Book Appointment with ${doctorName}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form onsubmit="return UI.handleBookingSubmit(event, '${doctorId}')">
                    <div class="form-group">
                        <label class="form-label">Select Date</label>
                        <input type="date" class="form-control" name="date" 
                               min="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Select Time Slot</label>
                        <div class="time-slots">
                            ${CONFIG.TIME_SLOTS.map(slot => `
                                <label class="time-slot">
                                    <input type="radio" name="time" value="${slot}" required>
                                    <span>${slot}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Reason for Visit</label>
                        <textarea class="form-control" name="reason" rows="3" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        <i class="fas fa-calendar-check"></i> Confirm Booking
                    </button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Handle booking submission
    async handleBookingSubmit(event, doctorId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const user = Auth.getCurrentUser();
        
        const appointmentData = {
            patient_id: user.id,
            doctor_id: doctorId,
            appointment_date: formData.get('date'),
            appointment_time: formData.get('time'),
            reason: formData.get('reason')
        };
        
        const { data, error } = await Database.appointments.create(appointmentData);
        
        if (error) {
            this.showAlert('Failed to book appointment: ' + error.message, 'error');
        } else {
            this.showAlert('Appointment booked successfully!', 'success');
            event.target.closest('.modal').remove();
        }
        
        return false;
    },
    
    // Render search and filters
    renderSearchFilters() {
        return `
            <div class="search-bar">
                <div class="search-input">
                    <input type="text" class="form-control" id="search-input" 
                           placeholder="Search hospitals, doctors, specializations...">
                </div>
                
                <div class="filter-group">
                    <select class="form-select" id="city-filter" onchange="UI.applyFilters()">
                        <option value="">All Cities</option>
                        ${CONFIG.CITIES.map(city => `<option value="${city}">${city}</option>`).join('')}
                    </select>
                    
                    <select class="form-select" id="status-filter" onchange="UI.applyFilters()">
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="full">Full</option>
                    </select>
                    
                    <button class="btn btn-emergency" onclick="UI.showEmergencyMode()">
                        <i class="fas fa-ambulance"></i> EMERGENCY
                    </button>
                </div>
            </div>
        `;
    },
    
    // Apply filters
    async applyFilters() {
        const city = document.getElementById('city-filter').value;
        const status = document.getElementById('status-filter').value;
        
        const filters = {};
        if (city) filters.city = city;
        if (status) filters.status = status;
        
        const { data: hospitals } = await Database.hospitals.getAll(filters);
        
        const container = document.getElementById('hospitals-grid');
        if (hospitals && hospitals.length > 0) {
            container.innerHTML = hospitals.map(h => this.renderHospitalCard(h)).join('');
            
            // Load additional data for each hospital
            hospitals.forEach(async (hospital) => {
                const { data: beds } = await Database.beds.getByHospital(hospital.id);
                const { data: doctors } = await Database.doctors.getAll({ hospital_id: hospital.id });
                const { data: equipment } = await Database.equipment.getByHospital(hospital.id);
                
                // Update stats
                const bedsCount = beds ? beds.reduce((sum, b) => sum + b.available_count, 0) : 0;
                const doctorsCount = doctors ? doctors.filter(d => d.available).length : 0;
                const equipmentCount = equipment ? equipment.filter(e => e.available_count > 0).length : 0;
                
                document.getElementById(`beds-${hospital.id}`).textContent = bedsCount;
                document.getElementById(`doctors-${hospital.id}`).textContent = doctorsCount;
                document.getElementById(`equipment-${hospital.id}`).textContent = equipmentCount;
            });
        } else {
            container.innerHTML = '<p>No hospitals found matching your criteria.</p>';
        }
    },
    
    // Show emergency mode
    async showEmergencyMode() {
        const city = document.getElementById('city-filter').value;
        
        if (!city) {
            this.showAlert('Please select a city first for emergency services', 'warning');
            return;
        }
        
        const { data: hospitals } = await Database.hospitals.getNearbyAvailable(city, true);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="emergency-banner">
                    <i class="fas fa-exclamation-triangle"></i> EMERGENCY MODE ACTIVATED
                </div>
                
                <h2 style="margin: 1rem 0;">Available Emergency Services in ${city}</h2>
                
                <div class="emergency-container">
                    ${hospitals && hospitals.length > 0 ? hospitals.map(hospital => `
                        <div class="hospital-card available" style="margin-bottom: 1rem;">
                            <h3>${hospital.name}</h3>
                            <p><i class="fas fa-phone"></i> ${hospital.contact}</p>
                            <p><i class="fas fa-location-dot"></i> ${hospital.address || 'Address not available'}</p>
                            <p><strong>Emergency Beds Available:</strong> ${
                                hospital.beds ? hospital.beds.filter(b => b.type === 'Emergency')[0]?.available_count || 0 : 0
                            }</p>
                            <button class="btn btn-danger btn-block" onclick="window.location.href='tel:${hospital.contact}'">
                                <i class="fas fa-phone"></i> Call Now
                            </button>
                        </div>
                    `).join('') : '<p>No emergency services available in this area.</p>'}
                </div>
                
                <button class="btn btn-secondary btn-block" onclick="this.closest('.modal').remove()">
                    Close Emergency Mode
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
};

// Export for use in other modules
window.UI = UI;