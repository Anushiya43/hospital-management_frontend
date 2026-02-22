import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export const authApi = {
    sendOtp: (email: string) =>
        api.post('/auth/email/send-otp', { email }),

    verifyOtp: (email: string, otp: string) =>
        api.post('/auth/email/verify-otp', { email, otp }),

    register: (userData: any) =>
        api.post('/auth/register', userData),

    login: (credentials: any) =>
        api.post('/auth/login', credentials),

    googleDoctorAuth: () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/auth/google/doctor`;
    },

    googlePatientAuth: () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/auth/google/patient`;
    },

    handleGoogleCallback: (searchParams: string) =>
        api.get(`/auth/google/callback${searchParams}`),
};

export const appointmentApi = {
    searchDoctors: (query: string) =>
        api.get(`/appointments/search-doctors?query=${query}`),

    getAvailableSlots: (doctorId: number, date: string) =>
        api.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`),

    bookAppointment: (data: any) =>
        api.post('/appointments/book', data),

    getMyAppointments: () =>
        api.get('/appointments/my-appointments'),

    cancelAppointment: (id: number) =>
        api.delete(`/appointments/${id}/cancel`),

    getDoctorAppointments: () =>
        api.get('/appointments/doctor-appointments'),

    updateStatus: (id: number, status: string) =>
        api.patch(`/appointments/${id}/status`, { status }),

    rescheduleAppointment: (id: number, data: { date: string, startTime: string, endTime: string }) =>
        api.patch(`/appointments/${id}/reschedule`, data)
};

export default api;
