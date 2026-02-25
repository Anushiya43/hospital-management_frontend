import api from './api';

export const doctorApi = {
    getProfile: () => api.get('/doctor/profile'),
    createProfile: (data: { fullName: string; specialization: string[]; experienceYears: number }) =>
        api.post('/doctor', data),
    updateProfile: (data: Partial<{ fullName: string; specialization: string[]; experienceYears: number }>) =>
        api.patch('/doctor/profile', data),
    getAllDoctors: () => api.get('/doctor/list'),
};

export const availabilityApi = {
    getMyAvailability: () => api.get('/availability'),
    create: (data: any) => api.post('/availability', data),
    delete: (id: number) => api.delete(`/availability/${id}`),
};

export const customAvailabilityApi = {
    getForMonth: (year: number, month: number) =>
        api.get(`/custom-availability/month?year=${year}&month=${month}`),
    create: (data: any) => api.post('/custom-availability', data),
    update: (id: number, data: any) => api.patch(`/custom-availability/${id}`, data),
    delete: (id: number) => api.delete(`/custom-availability/${id}`),
};

export const elasticSchedulingApi = {
    createSlot: (data: any) => api.post('/elastic-scheduling/slots', data),
    getMySlots: (date?: string) => api.get(`/elastic-scheduling/my-slots${date ? `?date=${date}` : ''}`),
    getSlots: (doctorId: number, date?: string) =>
        api.get(`/elastic-scheduling/slots?doctorId=${doctorId}${date ? `&date=${date}` : ''}`),
    updateSlot: (id: number, data: any) => api.patch(`/elastic-scheduling/slots/${id}`, data),
    deleteSlot: (id: number) => api.delete(`/elastic-scheduling/slots/${id}`),
};
