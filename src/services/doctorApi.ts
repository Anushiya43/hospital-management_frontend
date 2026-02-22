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
