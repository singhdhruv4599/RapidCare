// Database Module for RapidCare
const Database = {
    // Initialize database schema (called on first run)
    async initSchema() {
        // This would be handled by Supabase migrations
        // Schema is defined in Supabase dashboard
        console.log('Database schema initialized');
    },
    
    // Hospital operations
    hospitals: {
        async getAll(filters = {}) {
            let query = supabaseClient.from('hospitals').select('*');
            
            if (filters.city) {
                query = query.eq('city', filters.city);
            }
            
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            const { data, error } = await query;
            return { data, error };
        },
        
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('hospitals')
                .select('*')
                .eq('id', id)
                .single();
            
            return { data, error };
        },
        
        async create(hospitalData) {
            const { data, error } = await supabaseClient
                .from('hospitals')
                .insert(hospitalData)
                .select();
            
            return { data, error };
        },
        
        async update(id, updates) {
            const { data, error } = await supabaseClient
                .from('hospitals')
                .update(updates)
                .eq('id', id)
                .select();
            
            return { data, error };
        },
        
        async updateStatus(id, status) {
            return this.update(id, { 
                status, 
                updated_at: new Date().toISOString() 
            });
        },
        
        async getNearbyAvailable(city, emergency = false) {
            let query = supabaseClient
                .from('hospitals')
                .select(`
                    *,
                    beds (type, available_count),
                    doctors (id, name, specialization, available)
                `)
                .eq('city', city)
                .eq('status', 'available');
            
            if (emergency) {
                query = query.gt('beds.available_count', 0);
            }
            
            const { data, error } = await query;
            return { data, error };
        }
    },
    
    // Doctor operations
    doctors: {
        async getAll(filters = {}) {
            let query = supabaseClient.from('doctors').select(`
                *,
                hospitals (name, city)
            `);
            
            if (filters.hospital_id) {
                query = query.eq('hospital_id', filters.hospital_id);
            }
            
            if (filters.specialization) {
                query = query.eq('specialization', filters.specialization);
            }
            
            if (filters.available !== undefined) {
                query = query.eq('available', filters.available);
            }
            
            const { data, error } = await query;
            return { data, error };
        },
        
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('doctors')
                .select(`
                    *,
                    hospitals (name, city),
                    availability_slots (*)
                `)
                .eq('id', id)
                .single();
            
            return { data, error };
        },
        
        async updateAvailability(doctorId, slots) {
            // First, delete existing slots
            await supabaseClient
                .from('availability_slots')
                .delete()
                .eq('doctor_id', doctorId);
            
            // Then insert new slots
            const slotsData = slots.map(slot => ({
                doctor_id: doctorId,
                day: slot.day,
                start_time: slot.start_time,
                end_time: slot.end_time,
                available: slot.available
            }));
            
            const { data, error } = await supabaseClient
                .from('availability_slots')
                .insert(slotsData)
                .select();
            
            return { data, error };
        },
        
        async toggleAvailability(doctorId, available) {
            const { data, error } = await supabaseClient
                .from('doctors')
                .update({ available, updated_at: new Date().toISOString() })
                .eq('id', doctorId)
                .select();
            
            return { data, error };
        }
    },
    
    // Bed operations
    beds: {
        async getByHospital(hospitalId) {
            const { data, error } = await supabaseClient
                .from('beds')
                .select('*')
                .eq('hospital_id', hospitalId);
            
            return { data, error };
        },
        
        async update(id, availableCount) {
            const { data, error } = await supabaseClient
                .from('beds')
                .update({ 
                    available_count: availableCount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();
            
            return { data, error };
        },
        
        async bulkUpdate(hospitalId, bedsData) {
            const updates = bedsData.map(bed => ({
                hospital_id: hospitalId,
                type: bed.type,
                total_count: bed.total_count,
                available_count: bed.available_count,
                updated_at: new Date().toISOString()
            }));
            
            const { data, error } = await supabaseClient
                .from('beds')
                .upsert(updates, { onConflict: 'hospital_id,type' })
                .select();
            
            return { data, error };
        }
    },
    
    // Equipment operations
    equipment: {
        async getByHospital(hospitalId) {
            const { data, error } = await supabaseClient
                .from('equipment')
                .select('*')
                .eq('hospital_id', hospitalId);
            
            return { data, error };
        },
        
        async update(id, availableCount) {
            const { data, error } = await supabaseClient
                .from('equipment')
                .update({ 
                    available_count: availableCount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();
            
            return { data, error };
        },
        
        async bulkUpdate(hospitalId, equipmentData) {
            const updates = equipmentData.map(item => ({
                hospital_id: hospitalId,
                type: item.type,
                total_count: item.total_count,
                available_count: item.available_count,
                updated_at: new Date().toISOString()
            }));
            
            const { data, error } = await supabaseClient
                .from('equipment')
                .upsert(updates, { onConflict: 'hospital_id,type' })
                .select();
            
            return { data, error };
        }
    },
    
    // Appointment operations
    appointments: {
        async create(appointmentData) {
            const { data, error } = await supabaseClient
                .from('appointments')
                .insert({
                    ...appointmentData,
                    status: 'scheduled',
                    created_at: new Date().toISOString()
                })
                .select();
            
            return { data, error };
        },
        
        async getByPatient(patientId) {
            const { data, error } = await supabaseClient
                .from('appointments')
                .select(`
                    *,
                    doctors (name, specialization),
                    hospitals (name, city)
                `)
                .eq('patient_id', patientId)
                .order('appointment_date', { ascending: false });
            
            return { data, error };
        },
        
        async getByDoctor(doctorId) {
            const { data, error } = await supabaseClient
                .from('appointments')
                .select(`
                    *,
                    users (name, email, phone)
                `)
                .eq('doctor_id', doctorId)
                .order('appointment_date', { ascending: true });
            
            return { data, error };
        },
        
        async updateStatus(id, status) {
            const { data, error } = await supabaseClient
                .from('appointments')
                .update({ 
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();
            
            return { data, error };
        }
    },
    
    // Real-time subscriptions
    subscriptions: {
        subscribeToHospitalUpdates(callback) {
            return supabaseClient
                .channel('hospital-updates')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'hospitals' },
                    callback
                )
                .subscribe();
        },
        
        subscribeToBedUpdates(hospitalId, callback) {
            return supabaseClient
                .channel(`beds-${hospitalId}`)
                .on('postgres_changes',
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'beds',
                        filter: `hospital_id=eq.${hospitalId}`
                    },
                    callback
                )
                .subscribe();
        },
        
        subscribeToDoctorUpdates(hospitalId, callback) {
            return supabaseClient
                .channel(`doctors-${hospitalId}`)
                .on('postgres_changes',
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'doctors',
                        filter: `hospital_id=eq.${hospitalId}`
                    },
                    callback
                )
                .subscribe();
        },
        
        unsubscribe(subscription) {
            if (subscription) {
                supabaseClient.removeChannel(subscription);
            }
        }
    },
    
    // Seed sample data (for testing)
    async seedSampleData() {
        // Sample hospitals
        const hospitals = [
            {
                name: 'City General Hospital',
                city: 'New York',
                address: '123 Main St, New York, NY',
                contact: '555-0100',
                status: 'available'
            },
            {
                name: 'St. Mary Medical Center',
                city: 'New York',
                address: '456 Oak Ave, New York, NY',
                contact: '555-0200',
                status: 'available'
            },
            {
                name: 'Emergency Care Hospital',
                city: 'Los Angeles',
                address: '789 Emergency Blvd, Los Angeles, CA',
                contact: '555-0300',
                status: 'full'
            }
        ];
        
        for (const hospital of hospitals) {
            const { data: hospitalData } = await this.hospitals.create(hospital);
            
            if (hospitalData && hospitalData[0]) {
                const hospitalId = hospitalData[0].id;
                
                // Add beds
                const beds = [
                    { hospital_id: hospitalId, type: 'ICU', total_count: 10, available_count: 3 },
                    { hospital_id: hospitalId, type: 'General', total_count: 50, available_count: 15 },
                    { hospital_id: hospitalId, type: 'Emergency', total_count: 20, available_count: 5 }
                ];
                
                await this.beds.bulkUpdate(hospitalId, beds);
                
                // Add equipment
                const equipment = [
                    { hospital_id: hospitalId, type: 'MRI Scanner', total_count: 2, available_count: 1 },
                    { hospital_id: hospitalId, type: 'X-Ray Machine', total_count: 5, available_count: 3 },
                    { hospital_id: hospitalId, type: 'Ventilator', total_count: 15, available_count: 5 }
                ];
                
                await this.equipment.bulkUpdate(hospitalId, equipment);
            }
        }
        
        console.log('Sample data seeded successfully');
    }
};

// Export for use in other modules
window.Database = Database;