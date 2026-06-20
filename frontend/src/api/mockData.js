// Mock data for demo mode - used when backend is not running
export const MOCK_USERS = {
    student: {
        email: 'student@demo.com', password: 'demo1234',
        fullName: 'Arjun Sharma', role: 'STUDENT', profileId: 1, userId: 1,
    },
    company: {
        email: 'company@demo.com', password: 'demo1234',
        fullName: 'TechCorp HR', role: 'COMPANY', profileId: 1, userId: 2,
    },
    college: {
        email: 'college@demo.com', password: 'demo1234',
        fullName: 'Dr. Priya Nair', role: 'COLLEGE_ADMIN', profileId: 1, userId: 3,
    },
    admin: {
        email: 'admin@demo.com', password: 'demo1234',
        fullName: 'Platform Admin', role: 'ADMIN', profileId: null, userId: 4,
    },
};

export const MOCK_STUDENT_PROFILE = {
    id: 1, userId: 1, fullName: 'Arjun Sharma', email: 'student@demo.com',
    bio: 'Full-stack developer passionate about building scalable web applications.',
    skills: 'React,Node.js,MongoDB,Java,Spring Boot,Python',
    department: 'Computer Science',
    graduationYear: 2025,
    performanceScore: 0.0,
    completedProjects: 0,
    verificationStatus: 'VERIFIED',
    collegeName: 'N.B. Navale Sinhgad College of Engineering, Solapur',
    collegeId: 1,
    linkedinUrl: 'https://linkedin.com/in/arjun',
    githubUrl: 'https://github.com/arjun',
};

export const MOCK_PROJECTS = [
    {
        id: 1, title: 'Build a React E-commerce Dashboard',
        description: 'Create a fully featured admin dashboard for an e-commerce platform with charts, product management, and order tracking.',
        requirements: 'Knowledge of React hooks and state management', requiredSkills: 'React,Node.js,MongoDB',
        durationDays: 30, status: 'OPEN',
        maxApplicants: 5, applicantsCount: 0, matchScore: 0.0,
        companyId: 1, companyName: 'TechCorp Solutions', companyLogo: null,
        createdAt: new Date().toISOString(), deadline: null,
    },
    {
        id: 2, title: 'Machine Learning Model for Crop Prediction',
        description: 'Develop and train a ML model to predict crop yield based on weather and soil data. Include API endpoint for predictions.',
        requirements: 'Knowledge of scikit-learn or TensorFlow', requiredSkills: 'Python,Machine Learning,FastAPI',
        durationDays: 45, status: 'OPEN',
        maxApplicants: 3, applicantsCount: 0, matchScore: 0.0,
        companyId: 2, companyName: 'AgriTech India', companyLogo: null,
        createdAt: new Date().toISOString(), deadline: null,
    },
    {
        id: 3, title: 'Spring Boot Microservices Architecture',
        description: 'Refactor a monolithic Java application into microservices. Set up API gateway, service discovery, and Docker containers.',
        requirements: 'Understanding of microservices patterns', requiredSkills: 'Java,Spring Boot,Docker,PostgreSQL',
        durationDays: 60, status: 'OPEN',
        maxApplicants: 2, applicantsCount: 0, matchScore: 0.0,
        companyId: 3, companyName: 'FinServe Labs', companyLogo: null,
        createdAt: new Date().toISOString(), deadline: null,
    },
    {
        id: 4, title: 'Mobile-Responsive Landing Page',
        description: 'Design and build a beautiful, animated landing page with Tailwind CSS and GSAP animations. SEO optimized.',
        requirements: 'Strong eye for design', requiredSkills: 'HTML,CSS,JavaScript,Tailwind',
        durationDays: 7, status: 'OPEN',
        maxApplicants: 10, applicantsCount: 0, matchScore: 0.0,
        companyId: 4, companyName: 'Creative Studio', companyLogo: null,
        createdAt: new Date().toISOString(), deadline: null,
    },
    {
        id: 5, title: 'GraphQL API Development',
        description: 'Build a GraphQL API for a social media app with subscriptions, mutations, and real-time updates using Node.js.',
        requirements: 'Familiarity with GraphQL schema design',
        requiredSkills: 'Node.js,GraphQL,MongoDB,JavaScript',
        durationDays: 21, status: 'OPEN', maxApplicants: 4, applicantsCount: 0, matchScore: 0.0,
        companyId: 1, companyName: 'TechCorp Solutions', companyLogo: null,
        createdAt: new Date().toISOString(), deadline: null,
    },
    {
        id: 6, title: 'Blockchain Smart Contract for NFT Marketplace',
        description: 'Develop ERC-721 smart contracts in Solidity for an NFT marketplace. Include minting, trading, and auction features.',
        requirements: 'Basic understanding of Ethereum', requiredSkills: 'Solidity,Web3.js,JavaScript,Ethereum',
        durationDays: 45, status: 'OPEN',
        maxApplicants: 2, applicantsCount: 0, matchScore: 0.0,
        companyId: 5, companyName: 'CryptoVault', companyLogo: null,
        createdAt: new Date().toISOString(), deadline: null,
    },
];

export const MOCK_APPLICATIONS = [
    {
        id: 1, projectId: 1, projectTitle: 'Build a React E-commerce Dashboard',
        studentId: 1, studentName: 'Arjun Sharma', studentEmail: 'student@demo.com',
        coverLetter: 'I am a highly motivated developer with deep interest in React...',
        status: 'ASSIGNED', appliedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        assignedAt: new Date(Date.now() - 3 * 86400000).toISOString(), completedAt: null,
    },
    {
        id: 2, projectId: 2, projectTitle: 'Machine Learning Model for Crop Prediction',
        studentId: 1, studentName: 'Arjun Sharma', studentEmail: 'student@demo.com',
        coverLetter: 'My background in Python and ML makes me a great fit...',
        status: 'PENDING', appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        assignedAt: null, completedAt: null,
    },
    {
        id: 3, projectId: 5, projectTitle: 'GraphQL API Development',
        studentId: 1, studentName: 'Arjun Sharma', studentEmail: 'student@demo.com',
        coverLetter: 'I have built GraphQL APIs for production apps...',
        status: 'COMPLETED', appliedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        assignedAt: new Date(Date.now() - 38 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
];

export const MOCK_COMPANY_PROJECTS = [
    { ...MOCK_PROJECTS[0], status: 'OPEN', applicantsCount: 3 },
    { ...MOCK_PROJECTS[4], status: 'IN_PROGRESS', applicantsCount: 5 },
    {
        id: 10, title: 'Data Pipeline with Apache Kafka',
        description: 'Set up a real-time data streaming pipeline.', requiredSkills: 'Kafka,Java,Docker',
        durationDays: 30, status: 'COMPLETED', applicantsCount: 2,
        companyId: 1, companyName: 'TechCorp Solutions', matchScore: 0, createdAt: new Date().toISOString(),
    },
];

export const MOCK_APPLICANTS = [
    {
        id: 1, studentId: 1, studentName: 'Arjun Sharma', studentEmail: 'student@demo.com',
        coverLetter: 'I have built 5+ React dashboards in production environments and am excited about this opportunity.',
        status: 'PENDING', appliedAt: new Date().toISOString(), studentSkills: 'React,Node.js,MongoDB',
        studentPerformanceScore: 82.5,
    },
    {
        id: 2, studentId: 2, studentName: 'Sneha Patel', studentEmail: 'sneha@college.edu',
        coverLetter: 'Full stack developer with strong UI/UX skills and experience in e-commerce projects.',
        status: 'PENDING', appliedAt: new Date().toISOString(), studentSkills: 'React,Vue.js,CSS',
        studentPerformanceScore: 91.0,
    },
    {
        id: 3, studentId: 3, studentName: 'Rahul Verma', studentEmail: 'rahul@college.edu',
        coverLetter: '3 years of frontend experience. Built dashboards for fintech startups.',
        status: 'SHORTLISTED', appliedAt: new Date().toISOString(), studentSkills: 'React,TypeScript,GraphQL',
        studentPerformanceScore: 78.3,
    },
];

export const MOCK_COLLEGE_STUDENTS = [
    { id: 1, fullName: 'Arjun Sharma', email: 'arjun@college.edu', department: 'Computer Science', verificationStatus: 'VERIFIED', performanceScore: 82.5, completedProjects: 3, skills: 'React,Node.js,MongoDB', graduationYear: 2025, averageRating: 4.5, placementReadinessScore: 78.4 },
    { id: 2, fullName: 'Sneha Patel', email: 'sneha@college.edu', department: 'Computer Science', verificationStatus: 'VERIFIED', performanceScore: 91.0, completedProjects: 5, skills: 'React,Vue.js,Python', graduationYear: 2025, averageRating: 4.8, placementReadinessScore: 87.1 },
    { id: 3, fullName: 'Rahul Verma', email: 'rahul@college.edu', department: 'Electronics', verificationStatus: 'PENDING', performanceScore: 0, completedProjects: 0, skills: 'C++,Arduino,MATLAB', graduationYear: 2026, averageRating: 0, placementReadinessScore: 0 },
    { id: 4, fullName: 'Priya Iyer', email: 'priya@college.edu', department: 'Computer Science', verificationStatus: 'PENDING', performanceScore: 0, completedProjects: 0, skills: 'Java,Spring Boot,SQL', graduationYear: 2026, averageRating: 0, placementReadinessScore: 0 },
    { id: 5, fullName: 'Kiran Rao', email: 'kiran@college.edu', department: 'Data Science', verificationStatus: 'VERIFIED', performanceScore: 88.0, completedProjects: 2, skills: 'Python,TensorFlow,Pandas', graduationYear: 2025, averageRating: 4.3, placementReadinessScore: 74.2 },
    { id: 6, fullName: 'Ananya Singh', email: 'ananya@college.edu', department: 'Computer Science', verificationStatus: 'REJECTED', performanceScore: 0, completedProjects: 0, skills: 'HTML,CSS,JavaScript', graduationYear: 2026, averageRating: 0, placementReadinessScore: 0 },
    { id: 7, fullName: 'Vikram Nair', email: 'vikram@college.edu', department: 'Data Science', verificationStatus: 'VERIFIED', performanceScore: 79.3, completedProjects: 2, skills: 'Python,R,SQL,Tableau', graduationYear: 2025, averageRating: 4.0, placementReadinessScore: 68.5 },
    { id: 8, fullName: 'Meera Krishnan', email: 'meera@college.edu', department: 'Electronics', verificationStatus: 'VERIFIED', performanceScore: 75.0, completedProjects: 1, skills: 'Python,OpenCV,Raspberry Pi', graduationYear: 2025, averageRating: 3.8, placementReadinessScore: 55.0 },
];

export const MOCK_COLLEGE_DASHBOARD = {
    collegeId: 1,
    collegeName: 'N.B. Navale Sinhgad College of Engineering, Solapur',
    logoUrl: null,
    contactEmail: 'placements@nbnsinhgad.edu.in',
    accreditationDetails: 'NAAC A++ | NBA Accredited | NIRF Rank 42',
    city: 'Solapur',
    state: 'Maharashtra',
    totalStudents: 8,
    verifiedStudents: 5,
    pendingStudents: 2,
    rejectedStudents: 1,
    totalProjectsCompleted: 13,
    totalActiveProjects: 3,
    averagePerformanceScore: 73.2,
    averagePlacementReadiness: 57.9,
    activeCompaniesConnected: 4,
    topPerformers: [
        { id: 2, fullName: 'Sneha Patel', email: 'sneha@college.edu', department: 'Computer Science', performanceScore: 91.0, completedProjects: 5, verificationStatus: 'VERIFIED', skills: 'React,Vue.js,Python' },
        { id: 1, fullName: 'Arjun Sharma', email: 'arjun@college.edu', department: 'Computer Science', performanceScore: 82.5, completedProjects: 3, verificationStatus: 'VERIFIED', skills: 'React,Node.js,MongoDB' },
        { id: 5, fullName: 'Kiran Rao', email: 'kiran@college.edu', department: 'Data Science', performanceScore: 88.0, completedProjects: 2, verificationStatus: 'VERIFIED', skills: 'Python,TensorFlow,Pandas' },
    ],
    topSkillDemand: { 'React': 12, 'Python': 10, 'Node.js': 8, 'Java': 7, 'SQL': 6, 'Machine Learning': 5, 'Docker': 4, 'Spring Boot': 4, 'MongoDB': 3, 'TypeScript': 3 },
};

export const MOCK_COLLEGE_PROJECTS = [
    { projectId: 1, title: 'Build a React E-commerce Dashboard', description: 'Create a fully featured admin dashboard.', requiredSkills: 'React,Node.js,MongoDB', status: 'COMPLETED', durationDays: 30, companyId: 1, companyName: 'TechCorp Solutions', companyLogoUrl: null, approvedByCollege: true, studentId: 1, studentName: 'Arjun Sharma', studentEmail: 'arjun@college.edu', rating: 4.5, createdAt: new Date(Date.now() - 60 * 86400000).toISOString() },
    { projectId: 2, title: 'GraphQL API Development', description: 'Build a GraphQL API for a social media app.', requiredSkills: 'Node.js,GraphQL,MongoDB', status: 'COMPLETED', durationDays: 21, companyId: 1, companyName: 'TechCorp Solutions', companyLogoUrl: null, approvedByCollege: true, studentId: 2, studentName: 'Sneha Patel', studentEmail: 'sneha@college.edu', rating: 4.8, createdAt: new Date(Date.now() - 90 * 86400000).toISOString() },
    { projectId: 3, title: 'ML Crop Prediction Model', description: 'Develop and train a ML model to predict crop yield.', requiredSkills: 'Python,Machine Learning,FastAPI', status: 'IN_PROGRESS', durationDays: 45, companyId: 2, companyName: 'AgriTech India', companyLogoUrl: null, approvedByCollege: true, studentId: 5, studentName: 'Kiran Rao', studentEmail: 'kiran@college.edu', rating: null, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
    { projectId: 4, title: 'Spring Boot Microservices', description: 'Refactor a monolithic Java app.', requiredSkills: 'Java,Spring Boot,Docker', status: 'ASSIGNED', durationDays: 60, companyId: 3, companyName: 'FinServe Labs', companyLogoUrl: null, approvedByCollege: false, studentId: 1, studentName: 'Arjun Sharma', studentEmail: 'arjun@college.edu', rating: null, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { projectId: 5, title: 'Computer Vision Module', description: 'Object detection for smart cameras.', requiredSkills: 'Python,OpenCV,TensorFlow', status: 'SUBMITTED', durationDays: 30, companyId: 4, companyName: 'VisionTech', companyLogoUrl: null, approvedByCollege: true, studentId: 8, studentName: 'Meera Krishnan', studentEmail: 'meera@college.edu', rating: null, createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
];

export const MOCK_PLACEMENT_READINESS = [
    { studentId: 2, studentName: 'Sneha Patel', email: 'sneha@college.edu', department: 'Computer Science', graduationYear: 2025, skills: 'React,Vue.js,Python', performanceScore: 91.0, completedProjects: 5, averageRating: 4.8, placementReadinessScore: 87.1, verificationStatus: 'VERIFIED', rank: 1 },
    { studentId: 1, studentName: 'Arjun Sharma', email: 'arjun@college.edu', department: 'Computer Science', graduationYear: 2025, skills: 'React,Node.js,MongoDB', performanceScore: 82.5, completedProjects: 3, averageRating: 4.5, placementReadinessScore: 78.4, verificationStatus: 'VERIFIED', rank: 2 },
    { studentId: 5, studentName: 'Kiran Rao', email: 'kiran@college.edu', department: 'Data Science', graduationYear: 2025, skills: 'Python,TensorFlow,Pandas', performanceScore: 88.0, completedProjects: 2, averageRating: 4.3, placementReadinessScore: 74.2, verificationStatus: 'VERIFIED', rank: 3 },
    { studentId: 7, studentName: 'Vikram Nair', email: 'vikram@college.edu', department: 'Data Science', graduationYear: 2025, skills: 'Python,R,SQL,Tableau', performanceScore: 79.3, completedProjects: 2, averageRating: 4.0, placementReadinessScore: 68.5, verificationStatus: 'VERIFIED', rank: 4 },
    { studentId: 8, studentName: 'Meera Krishnan', email: 'meera@college.edu', department: 'Electronics', graduationYear: 2025, skills: 'Python,OpenCV,Raspberry Pi', performanceScore: 75.0, completedProjects: 1, averageRating: 3.8, placementReadinessScore: 55.0, verificationStatus: 'VERIFIED', rank: 5 },
    { studentId: 3, studentName: 'Rahul Verma', email: 'rahul@college.edu', department: 'Electronics', graduationYear: 2026, skills: 'C++,Arduino,MATLAB', performanceScore: 0, completedProjects: 0, averageRating: 0, placementReadinessScore: 0, verificationStatus: 'PENDING', rank: 6 },
    { studentId: 4, studentName: 'Priya Iyer', email: 'priya@college.edu', department: 'Computer Science', graduationYear: 2026, skills: 'Java,Spring Boot,SQL', performanceScore: 0, completedProjects: 0, averageRating: 0, placementReadinessScore: 0, verificationStatus: 'PENDING', rank: 7 },
];

export const MOCK_SKILL_GAP = {
    collegeName: 'N.B. Navale Sinhgad College of Engineering, Solapur',
    skillCoveragePercent: 68.5,
    gaps: [
        { skill: 'Docker', demanded: 8, available: 1, gapCount: 7, severity: 'HIGH' },
        { skill: 'Kubernetes', demanded: 6, available: 0, gapCount: 6, severity: 'HIGH' },
        { skill: 'TypeScript', demanded: 7, available: 2, gapCount: 5, severity: 'HIGH' },
        { skill: 'Machine Learning', demanded: 10, available: 4, gapCount: 6, severity: 'HIGH' },
        { skill: 'React', demanded: 12, available: 9, gapCount: 3, severity: 'MEDIUM' },
        { skill: 'Node.js', demanded: 8, available: 5, gapCount: 3, severity: 'MEDIUM' },
        { skill: 'Python', demanded: 10, available: 7, gapCount: 3, severity: 'MEDIUM' },
        { skill: 'SQL', demanded: 6, available: 4, gapCount: 2, severity: 'MEDIUM' },
        { skill: 'Java', demanded: 7, available: 6, gapCount: 1, severity: 'LOW' },
        { skill: 'MongoDB', demanded: 5, available: 4, gapCount: 1, severity: 'LOW' },
    ],
    studentSkillCounts: { 'React': 9, 'Python': 7, 'Node.js': 5, 'Java': 6, 'MongoDB': 4, 'TensorFlow': 3, 'SQL': 4 },
    marketDemandCounts: { 'React': 12, 'Python': 10, 'Machine Learning': 10, 'Node.js': 8, 'Docker': 8, 'Java': 7, 'TypeScript': 7, 'Kubernetes': 6, 'SQL': 6, 'MongoDB': 5 },
};

export const MOCK_COLLEGE_COMPANIES = [
    { companyId: 1, companyName: 'TechCorp Solutions', industry: 'Software', description: 'Enterprise software solutions.', website: 'https://techcorp.com', logoUrl: null, verificationStatus: 'VERIFIED', approvedByCollege: true, totalProjects: 8 },
    { companyId: 2, companyName: 'AgriTech India', industry: 'Agriculture Technology', description: 'AI-powered agricultural solutions.', website: 'https://agritech.in', logoUrl: null, verificationStatus: 'VERIFIED', approvedByCollege: true, totalProjects: 4 },
    { companyId: 3, companyName: 'FinServe Labs', industry: 'FinTech', description: 'Financial technology and banking APIs.', website: 'https://finservelabs.com', logoUrl: null, verificationStatus: 'VERIFIED', approvedByCollege: false, totalProjects: 6 },
    { companyId: 4, companyName: 'VisionTech', industry: 'Computer Vision', description: 'Smart camera and AI vision systems.', website: 'https://visiontech.io', logoUrl: null, verificationStatus: 'VERIFIED', approvedByCollege: true, totalProjects: 3 },
    { companyId: 5, companyName: 'CryptoVault', industry: 'Blockchain', description: 'NFT and DeFi platform security.', website: 'https://cryptovault.io', logoUrl: null, verificationStatus: 'VERIFIED', approvedByCollege: false, totalProjects: 2 },
];

export const MOCK_COLLEGE_ANALYTICS = {
    collegeName: 'N.B. Navale Sinhgad College of Engineering, Solapur',
    totalStudents: 8,
    byDepartment: { 'Computer Science': 4, 'Data Science': 2, 'Electronics': 2 },
    statusDistribution: { 'VERIFIED': 5, 'PENDING': 2, 'REJECTED': 1 },
    topStudentSkills: { 'React': 9, 'Python': 7, 'Java': 6, 'Node.js': 5, 'SQL': 4, 'MongoDB': 4, 'TensorFlow': 3, 'Vue.js': 2, 'Docker': 1, 'TypeScript': 1 },
    projectStatusDistribution: { 'COMPLETED': 7, 'IN_PROGRESS': 2, 'ASSIGNED': 1, 'SUBMITTED': 1, 'PENDING': 2 },
    averagePerformanceScore: 73.2,
    monthlyActivity: { 'JAN 2025': 2, 'FEB 2025': 3, 'MAR 2025': 5, 'APR 2025': 1, 'MAY 2025': 4, 'JUN 2025': 3 },
};

export const MOCK_ADMIN_ANALYTICS = {
    totalUsers: 124, totalStudents: 98, totalColleges: 12, totalCompanies: 34,
    totalProjects: 87, openProjects: 42, completedProjects: 31, totalApplications: 356,
};

export const MOCK_ADMIN_USERS = [
    { id: 1, fullName: 'Arjun Sharma', email: 'arjun@college.edu', role: 'STUDENT', active: true, createdAt: new Date().toISOString() },
    { id: 2, fullName: 'TechCorp HR', email: 'hr@techcorp.com', role: 'COMPANY', active: true, createdAt: new Date().toISOString() },
    { id: 3, fullName: 'Dr. Priya Nair', email: 'priya@mit.edu', role: 'COLLEGE_ADMIN', active: true, createdAt: new Date().toISOString() },
    { id: 4, fullName: 'Platform Admin', email: 'admin@odyssey.dev', role: 'ADMIN', active: true, createdAt: new Date().toISOString() },
    { id: 5, fullName: 'Sneha Patel', email: 'sneha@college.edu', role: 'STUDENT', active: true, createdAt: new Date().toISOString() },
    { id: 6, fullName: 'AgriTech India', email: 'hr@agritech.in', role: 'COMPANY', active: false, createdAt: new Date().toISOString() },
];

export const MOCK_REVIEWS = [
    {
        id: 1, companyName: 'TechCorp Solutions', companyLogo: null,
        projectTitle: 'GraphQL API Development', rating: 5,
        comment: 'Exceptional work! Arjun delivered a robust, well-documented GraphQL API ahead of schedule. Communication was top-notch throughout.',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
        id: 2, companyName: 'FinServe Labs', companyLogo: null,
        projectTitle: 'Spring Boot Microservices', rating: 4,
        comment: 'Solid work on the microservices setup. Code was clean and well-structured. Minor delays due to scope changes but handled professionally.',
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
        id: 3, companyName: 'AgriTech India', companyLogo: null,
        projectTitle: 'ML Crop Prediction Model', rating: 5,
        comment: 'Outstanding ML model with 94% accuracy. Great at explaining complex concepts and delivering clean Python code.',
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
];
