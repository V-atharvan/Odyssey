import {
    MOCK_USERS, MOCK_STUDENT_PROFILE, MOCK_PROJECTS, MOCK_APPLICATIONS,
    MOCK_COMPANY_PROJECTS, MOCK_APPLICANTS, MOCK_COLLEGE_STUDENTS,
    MOCK_COLLEGE_DASHBOARD, MOCK_COLLEGE_PROJECTS, MOCK_PLACEMENT_READINESS,
    MOCK_SKILL_GAP, MOCK_COLLEGE_COMPANIES, MOCK_COLLEGE_ANALYTICS,
    MOCK_ADMIN_ANALYTICS, MOCK_ADMIN_USERS, MOCK_REVIEWS,
} from './mockData';

// Simulate network delay for realistic feel
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

const wrap = (data) => ({ data: { success: true, data, message: 'Success' } });
const pageWrap = (content, total = content.length) => ({
    data: { success: true, data: { content, totalElements: total, totalPages: Math.ceil(total / 10), size: 10, number: 0 } }
});

// ============ Auth ============
export const mockAuthAPI = {
    login: async ({ email, password }) => {
        await delay();
        const user = Object.values(MOCK_USERS).find(u => u.email === email && u.password === password);
        if (!user) throw { response: { data: { message: 'Invalid email or password. Use demo credentials shown below.' } } };
        return wrap({ token: 'mock-jwt-token-' + Date.now(), tokenType: 'Bearer', ...user });
    },
    register: async ({ fullName, email, password, role, _organizationName }) => {
        await delay();
        // Accept organization name for API compatibility (not used in mock)
        void _organizationName;
        if (!email || !password || !fullName) throw { response: { data: { message: 'All fields are required' } } };
        const mockUser = MOCK_USERS[role?.toLowerCase()] || MOCK_USERS.student;
        return wrap({ token: 'mock-jwt-token-' + Date.now(), tokenType: 'Bearer', ...mockUser, fullName, email });
    },
    firebaseLogin: async ({ idToken, role }) => {
        await delay();
        void idToken; // Not used in mock
        const mockUser = MOCK_USERS[role?.toLowerCase()] || MOCK_USERS.student;
        return wrap({ 
            token: 'mock-firebase-jwt-' + Date.now(), 
            tokenType: 'Bearer', 
            ...mockUser,
            message: 'Mock Firebase login successful' 
        });
    },
};

// ============ Student ============
export const mockStudentAPI = {
    getProfile: async () => { await delay(); return wrap(MOCK_STUDENT_PROFILE); },
    updateProfile: async (data) => { await delay(600); return wrap({ ...MOCK_STUDENT_PROFILE, ...data }); },
    getMatchedProjects: async (_page = 0, _size = 10) => {
        await delay(600);
        // Pagination params accepted for compatibility (mock returns full list)
        void _page;
        void _size;
        return pageWrap(MOCK_PROJECTS, MOCK_PROJECTS.length);
    },
    getApplications: async () => { await delay(); return wrap(MOCK_APPLICATIONS); },
    getPortfolio: async (_id) => {
        await delay();
        // Accept ID but always return the single mock profile
        void _id;
        return wrap(MOCK_STUDENT_PROFILE);
    },
    getReviews: async () => { await delay(); return wrap(MOCK_REVIEWS); },
    searchColleges: async (query) => {
        await delay();
        const list = [
            { id: 1, collegeName: 'Odyssey University', city: 'Mumbai', state: 'Maharashtra', logoUrl: '' },
            { id: 2, collegeName: 'Stellar Institute', city: 'Bangalore', state: 'Karnataka', logoUrl: '' }
        ];
        if (query) {
            return wrap(list.filter(c => c.collegeName.toLowerCase().includes(query.toLowerCase())));
        }
        return wrap(list);
    },
    getCollegeDepartments: async (id) => {
        await delay();
        return wrap(['Computer Science', 'Data Science', 'Electronics', 'Mechanical']);
    },
    getCollegeCourses: async (id) => {
        await delay();
        return wrap(['B.Tech', 'M.Tech', 'BBA', 'MBA', 'MCA']);
    },
    getAssessments: async () => {
        await delay();
        return wrap([
            { id: 1, title: 'Java & Spring Boot Core Assessment', subject: 'Java', questionCount: 3, durationMinutes: 15, questions: [] },
            { id: 2, title: 'React Framework Specialist Challenge', subject: 'React', questionCount: 3, durationMinutes: 15, questions: [] }
        ]);
    },
    submitAssessment: async (data) => {
        await delay(600);
        return wrap({ passed: true, scorePercent: 100, correctCount: 3, totalQuestions: 3, performanceScoreUpdated: 85, feedbackMessage: 'Passed!' });
    }
};

// ============ Projects ============
export const mockProjectAPI = {
    getAll: async () => { await delay(); return pageWrap(MOCK_PROJECTS); },
    getFeed: async () => { await delay(); return wrap(MOCK_PROJECTS.filter(p => p.status === 'OPEN')); },
    getMyApplications: async () => { await delay(); return wrap(MOCK_APPLICATIONS); },
    getById: async (id) => { await delay(); return wrap(MOCK_PROJECTS.find(p => p.id === id) || MOCK_PROJECTS[0]); },
    create: async (data) => { await delay(600); return wrap({ id: Date.now(), ...data, status: 'OPEN', companyName: 'Your Company', applicantsCount: 0, createdAt: new Date().toISOString() }); },
    getMy: async () => { await delay(); return wrap(MOCK_COMPANY_PROJECTS); },
    apply: async (projectId, data) => { await delay(600); return wrap({ id: Date.now(), projectId, status: 'PENDING', appliedAt: new Date().toISOString(), ...data }); },
    getApplicants: async (_projectId) => {
        await delay();
        // Accept project ID for compatibility (not used in mock)
        void _projectId;
        return wrap(MOCK_APPLICANTS);
    },
    assignStudent: async (_projectId, _studentId) => {
        await delay(600);
        // Accept IDs for compatibility (not used in mock)
        void _projectId;
        void _studentId;
        return wrap({ status: 'ASSIGNED' });
    },
    updateStatus: async (projectId, status) => { await delay(); return wrap({ id: projectId, status }); },
};

// ============ College ============
export const mockCollegeAPI = {
    getStudents: async () => { await delay(); return wrap(MOCK_COLLEGE_STUDENTS); },
    verifyStudent: async (studentId, status) => {
        await delay(600);
        const student = MOCK_COLLEGE_STUDENTS.find(s => s.id === studentId) || MOCK_COLLEGE_STUDENTS[0];
        return wrap({ ...student, verificationStatus: status });
    },
    getDashboard: async () => { await delay(); return wrap(MOCK_COLLEGE_DASHBOARD); },
    getAnalytics: async () => { await delay(); return wrap(MOCK_COLLEGE_ANALYTICS); },
    getTopPerformers: async (limit = 10) => { await delay(); return wrap(MOCK_COLLEGE_STUDENTS.filter(s => s.verificationStatus === 'VERIFIED').sort((a, b) => b.performanceScore - a.performanceScore).slice(0, limit)); },
    getProjects: async () => { await delay(); return wrap(MOCK_COLLEGE_PROJECTS); },
    getStudentProjects: async (studentId) => { await delay(); return wrap(MOCK_COLLEGE_PROJECTS.filter(p => p.studentId === studentId)); },
    getCompanies: async () => { await delay(); return wrap(MOCK_COLLEGE_COMPANIES); },
    toggleCompanyApproval: async (companyId) => {
        await delay(500);
        const company = MOCK_COLLEGE_COMPANIES.find(c => c.companyId === companyId) || MOCK_COLLEGE_COMPANIES[0];
        return wrap({ ...company, approvedByCollege: !company.approvedByCollege });
    },
    updateProfile: async (data) => { await delay(600); return wrap({ ...MOCK_COLLEGE_DASHBOARD, ...data }); },
    getMyProfile: async () => { await delay(); return wrap(MOCK_COLLEGE_DASHBOARD); },
    uploadMedia: async (file, type) => {
        await delay(1000);
        return wrap({ url: `https://placeholder.com/${type}.png` });
    },
};

// ============ Admin ============
export const mockAdminAPI = {
    getProfile: async () => { await delay(); return wrap({ fullName: 'Platform Admin', email: 'admin@demo.com', role: 'ADMIN' }); },
    updateProfile: async (data) => { await delay(600); return wrap({ fullName: 'Platform Admin', email: 'admin@demo.com', role: 'ADMIN', ...data }); },
    getUsers: async (page = 0, role = 'ALL') => {
        await delay();
        // Page param accepted but not used in mock implementation
        void page;
        let filteredUsers = MOCK_ADMIN_USERS;
        if (role && role !== 'ALL') {
            filteredUsers = MOCK_ADMIN_USERS.filter(u => u.role === role);
        }
        return pageWrap(filteredUsers, filteredUsers.length);
    },
    toggleUserStatus: async (userId) => {
        await delay(400);
        const user = MOCK_ADMIN_USERS.find(u => u.id === userId) || MOCK_ADMIN_USERS[0];
        return wrap({ ...user, active: !user.active });
    },
    getAnalytics: async () => { await delay(); return wrap(MOCK_ADMIN_ANALYTICS); },
    verifyCompany: async () => { await delay(); return wrap(null); },
    verifyCollege: async () => { await delay(); return wrap(null); },
};



// ============ Review ============
export const mockReviewAPI = {
    create: async (data) => { await delay(600); return wrap({ id: Date.now(), ...data, companyName: 'TechCorp Solutions', studentName: 'Arjun Sharma', createdAt: new Date().toISOString() }); },
    getByStudent: async (_studentId) => {
        await delay();
        // Accept student ID for compatibility (not used in mock implementation)
        void _studentId;
        return wrap([{
            id: 1,
            companyName: 'TechCorp Solutions',
            studentName: 'Arjun Sharma',
            projectTitle: 'GraphQL API Development',
            rating: 5,
            comment: 'Excellent work! Delivered ahead of schedule.',
            createdAt: new Date().toISOString(),
        }]);
    },
};
