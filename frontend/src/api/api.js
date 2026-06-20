import axios from 'axios';
import {
    mockAuthAPI, mockStudentAPI, mockProjectAPI,
    mockCollegeAPI, mockAdminAPI, mockReviewAPI,
} from './mockApi';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const DEMO_MODE = import.meta.env.VITE_AUTH_DEMO !== 'false';
export const AI_PROXY_ON = import.meta.env.VITE_AI_PROXY === 'true';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('odyssey_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/verify-otp');
        if (error.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('odyssey_token');
            localStorage.removeItem('odyssey_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = DEMO_MODE ? mockAuthAPI : {
    login: (data) => axiosInstance.post('/auth/login', data),
    register: (data) => axiosInstance.post('/auth/register', data),
    firebaseLogin: (data) => axiosInstance.post('/auth/firebase-login', data),
    verifyOtp: (data) => axiosInstance.post('/auth/verify-otp', data),
    getGoogleUrl: () => `${BASE_URL}/auth/oauth2/authorize/google`,
    getGithubUrl: () => `${BASE_URL}/auth/oauth2/authorize/github`,
    getLinkedinUrl: () => `${BASE_URL}/auth/oauth2/authorize/linkedin`,
};

export const studentAPI = DEMO_MODE ? mockStudentAPI : {
    getProfile: () => axiosInstance.get('/students/profile'),
    updateProfile: (data) => axiosInstance.put('/students/profile', data),
    getMatchedProjects: (page = 0, size = 10) => axiosInstance.get(`/students/jobs?page=${page}&size=${size}`),
    getApplications: () => axiosInstance.get('/students/applications'),
    getPortfolio: (id) => axiosInstance.get(`/students/portfolio/${id}`),
    getReviews: () => axiosInstance.get('/reviews/my'),
    searchColleges: (query) => axiosInstance.get(`/students/colleges/search${query ? `?query=${query}` : ''}`),
    getCollegeDepartments: (id) => axiosInstance.get(`/students/colleges/${id}/departments`),
    getCollegeCourses: (id) => axiosInstance.get(`/students/colleges/${id}/courses`),
    getAssessments: () => axiosInstance.get('/students/assessments'),
    submitAssessment: (data) => axiosInstance.post('/students/assessments/submit', data),
};

export const projectAPI = DEMO_MODE ? mockProjectAPI : {
    getAll: (page = 0, size = 10) => axiosInstance.get(`/projects?page=${page}&size=${size}`),
    getFeed: () => axiosInstance.get('/projects/feed'),
    getMyApplications: () => axiosInstance.get('/projects/my-applications'),
    getById: (id) => axiosInstance.get(`/projects/${id}`),
    create: (data) => axiosInstance.post('/projects', data),
    getMy: () => axiosInstance.get('/projects/my'),
    apply: (projectId, data) => axiosInstance.post(`/projects/${projectId}/apply`, data),
    getApplicants: (projectId) => axiosInstance.get(`/projects/${projectId}/applicants`),
    assignStudent: (projectId, sid) => axiosInstance.put(`/projects/${projectId}/assign/${sid}`),
    updateStatus: (projectId, s) => axiosInstance.put(`/projects/${projectId}/status?status=${s}`),
    removeStudent: (projectId, appId) => axiosInstance.delete(`/projects/${projectId}/applications/${appId}`),
};

export const collegeAPI = DEMO_MODE ? mockCollegeAPI : {
    // --- EXISTING ---
    getStudents: () => axiosInstance.get('/colleges/students'),
    verifyStudent: (studentId, status) => axiosInstance.put(`/colleges/students/${studentId}/verify?status=${status}`),
    toggleStudentStatus: (studentId) => axiosInstance.put(`/colleges/students/${studentId}/toggle-status`),
    deleteStudentAccount: (studentId) => axiosInstance.delete(`/colleges/students/${studentId}`),
    getDashboard: () => axiosInstance.get('/colleges/dashboard'),
    getAnalytics: () => axiosInstance.get('/colleges/analytics'),
    getTopPerformers: (limit = 10) => axiosInstance.get(`/colleges/top-performers?limit=${limit}`),
    getProjects: () => axiosInstance.get('/colleges/projects'),
    getStudentProjects: (studentId) => axiosInstance.get(`/colleges/student/${studentId}/projects`),
    getCompanies: () => axiosInstance.get('/colleges/companies'),
    toggleCompanyApproval: (companyId) => axiosInstance.put(`/colleges/companies/${companyId}/toggle-approval`),
    exportReport: () => axiosInstance.get('/admin/college/export-report'),
    // --- PARTNERSHIPS ---
    getCompanyRequests: () => axiosInstance.get('/colleges/requests/companies'),
    updatePartnership: (id, status) => axiosInstance.put(`/colleges/requests/companies/${id}?status=${status}`),
    getPendingStudents: () => axiosInstance.get('/colleges/students/pending'),
    // --- NEW ---
    getMyProfile: () => axiosInstance.get('/colleges/me'),
    updateProfile: (data) => axiosInstance.put('/colleges/profile', data),
    uploadMedia: (file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return axiosInstance.post('/colleges/upload-media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    bulkImportStudents: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosInstance.post('/colleges/students/bulk-import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export const adminAPI = DEMO_MODE ? mockAdminAPI : {
    getProfile: () => axiosInstance.get('/admin/profile'),
    updateProfile: (data) => axiosInstance.put('/admin/profile', data),
    getUsers: (page = 0, role = 'ALL') => axiosInstance.get(`/admin/users?page=${page}${role && role !== 'ALL' ? `&role=${role}` : ''}`),
    toggleUserStatus: (userId) => axiosInstance.put(`/admin/users/${userId}/toggle-status`),
    getAnalytics: () => axiosInstance.get('/admin/analytics'),
    verifyCompany: (id) => axiosInstance.put(`/admin/companies/${id}/verify`),
    rejectCompany: (id) => axiosInstance.put(`/admin/companies/${id}/reject`),
    verifyCollege: (id) => axiosInstance.put(`/admin/colleges/${id}/verify`),
    rejectCollege: (id) => axiosInstance.put(`/admin/colleges/${id}/reject`),
    deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
};



export const reviewAPI = DEMO_MODE ? mockReviewAPI : {
    create: (data) => axiosInstance.post('/reviews', data),
    getByStudent: (studentId) => axiosInstance.get(`/reviews/student/${studentId}`),
};

export const notificationAPI = {
    getAll: () => axiosInstance.get('/notifications'),
    getUnreadCount: () => axiosInstance.get('/notifications/unread-count'),
    markAsRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
    markAllAsRead: () => axiosInstance.put('/notifications/read-all'),
};

export const companyAPI = DEMO_MODE ? {
    getProfile: () => Promise.resolve({ data: { success: true, data: { fullName: 'TechCorp HR', email: 'company@demo.com', role: 'COMPANY', companyName: 'TechCorp Solutions', website: 'https://techcorp.com', industry: 'Software', description: 'Enterprise software solutions.' } } }),
    updateProfile: (data) => Promise.resolve({ data: { success: true, data } }),
    searchColleges: (query) => axiosInstance.get(`/companies/colleges/search${query ? `?query=${query}` : ''}`),
    sendRequest: (collegeId) => axiosInstance.post(`/companies/requests/college/${collegeId}`),
    getSentRequests: () => axiosInstance.get('/companies/requests/sent'),
} : {
    getProfile: () => axiosInstance.get('/companies/profile'),
    updateProfile: (data) => axiosInstance.put('/companies/profile', data),
    searchColleges: (query) => axiosInstance.get(`/companies/colleges/search${query ? `?query=${query}` : ''}`),
    sendRequest: (collegeId) => axiosInstance.post(`/companies/requests/college/${collegeId}`),
    getSentRequests: () => axiosInstance.get('/companies/requests/sent'),
};

export const contactAPI = {
    sendMessage: (data) => axiosInstance.post('/contact', data),
};

export default axiosInstance;
