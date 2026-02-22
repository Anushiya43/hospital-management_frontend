import api from './api';

export const patientApi = {
    getProfile: () => api.get('/patient/profile'),
    createProfile: (data: { fullName: string; gender?: string; birthDate?: string }) =>
        api.post('/patient', data),
    updateProfile: (data: Partial<{ fullName: string; gender: string; birthDate: string }>) =>
        api.patch('/patient/profile-update', data),
};
