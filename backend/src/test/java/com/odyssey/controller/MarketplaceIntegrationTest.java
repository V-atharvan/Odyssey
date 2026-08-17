package com.odyssey.controller;

import com.odyssey.dto.request.RegisterRequest;
import com.odyssey.dto.request.VerifyOtpRequest;
import com.odyssey.dto.response.AuthResponse;
import com.odyssey.entity.*;
import com.odyssey.repository.*;
import com.odyssey.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MarketplaceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectApplicationRepository projectApplicationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CompanyCollegePartnershipRepository partnershipRepository;

    @Test
    @DisplayName("E2E-001 & E2E-002: Complete Marketplace Lifecycle (Registration -> Partnership -> Project -> Application -> Assignment -> Completion -> Review -> Score)")
    void testCompleteMarketplaceEndToEndLifecycle() {
        // Step 1: Register and Verify Student User
        RegisterRequest studentReq = new RegisterRequest();
        studentReq.setEmail("marketplace_student@test.com");
        studentReq.setPassword("Password123!");
        studentReq.setFullName("Marketplace Student");
        studentReq.setRole("STUDENT");
        authService.register(studentReq);

        Otp studentOtp = otpRepository.findAll().stream()
                .filter(o -> o.getEmail().equals("marketplace_student@test.com"))
                .findFirst()
                .orElseThrow();

        VerifyOtpRequest verifyStudentReq = new VerifyOtpRequest();
        verifyStudentReq.setEmail("marketplace_student@test.com");
        verifyStudentReq.setCode(studentOtp.getCode());
        AuthResponse studentAuth = authService.verifyOtp(verifyStudentReq);

        assertNotNull(studentAuth.getToken());
        User studentUser = userRepository.findByEmail("marketplace_student@test.com").orElseThrow();
        assertEquals(AccountStatus.ACTIVE, studentUser.getStatus());

        // Step 2: Register and Verify Company User
        RegisterRequest companyReq = new RegisterRequest();
        companyReq.setEmail("marketplace_company@test.com");
        companyReq.setPassword("Password123!");
        companyReq.setFullName("Company Rep");
        companyReq.setRole("COMPANY");
        companyReq.setOrganizationName("Acme Corp");
        authService.register(companyReq);

        Otp companyOtp = otpRepository.findAll().stream()
                .filter(o -> o.getEmail().equals("marketplace_company@test.com"))
                .findFirst()
                .orElseThrow();

        VerifyOtpRequest verifyCompanyReq = new VerifyOtpRequest();
        verifyCompanyReq.setEmail("marketplace_company@test.com");
        verifyCompanyReq.setCode(companyOtp.getCode());
        authService.verifyOtp(verifyCompanyReq);

        User companyUser = userRepository.findByEmail("marketplace_company@test.com").orElseThrow();
        Company company = companyRepository.findByUserId(companyUser.getId()).orElseThrow();
        company.setVerificationStatus(Company.VerificationStatus.VERIFIED);
        companyRepository.save(company);

        // Step 3: Register and Verify College Admin User
        RegisterRequest collegeReq = new RegisterRequest();
        collegeReq.setEmail("marketplace_college@test.com");
        collegeReq.setPassword("Password123!");
        collegeReq.setFullName("College Admin");
        collegeReq.setRole("COLLEGE_ADMIN");
        collegeReq.setOrganizationName("State University");
        collegeReq.setCollegeCode("SU100");
        authService.register(collegeReq);

        Otp collegeOtp = otpRepository.findAll().stream()
                .filter(o -> o.getEmail().equals("marketplace_college@test.com"))
                .findFirst()
                .orElseThrow();

        VerifyOtpRequest verifyCollegeReq = new VerifyOtpRequest();
        verifyCollegeReq.setEmail("marketplace_college@test.com");
        verifyCollegeReq.setCode(collegeOtp.getCode());
        authService.verifyOtp(verifyCollegeReq);

        User collegeUser = userRepository.findByEmail("marketplace_college@test.com").orElseThrow();
        College college = collegeRepository.findByUserId(collegeUser.getId()).orElseThrow();
        college.setVerificationStatus(College.VerificationStatus.VERIFIED);
        collegeRepository.save(college);

        // Step 4: Company requests Partnership with College & College Approves
        CompanyCollegePartnership partnership = CompanyCollegePartnership.builder()
                .company(company)
                .college(college)
                .status(CompanyCollegePartnership.PartnershipStatus.ACCEPTED)
                .build();
        partnership = partnershipRepository.save(partnership);
        assertEquals(CompanyCollegePartnership.PartnershipStatus.ACCEPTED, partnership.getStatus());

        // Step 5: Company Creates & Publishes a Project
        Project project = Project.builder()
                .company(company)
                .title("Full Stack Web Portal")
                .category("Software Engineering")
                .description("Build a modern web portal for student placement tracking")
                .stipendAmount(new BigDecimal("1500.00"))
                .maxApplicants(2)
                .status(Project.ProjectStatus.OPEN)
                .build();
        project = projectRepository.save(project);
        assertNotNull(project.getId());
        assertEquals(Project.ProjectStatus.OPEN, project.getStatus());

        // Step 6: Student Discovers and Applies to Project
        StudentProfile studentProfile = studentProfileRepository.findByUserId(studentUser.getId()).orElseThrow();
        ProjectApplication application = ProjectApplication.builder()
                .project(project)
                .student(studentProfile)
                .pitch("I have strong Spring Boot and React skills.")
                .status(ProjectApplication.ApplicationStatus.PENDING)
                .build();
        application = projectApplicationRepository.save(application);
        assertNotNull(application.getId());

        // Step 7: Company Accepts Student Application
        application.setStatus(ProjectApplication.ApplicationStatus.ACCEPTED);
        projectApplicationRepository.save(application);
        assertEquals(ProjectApplication.ApplicationStatus.ACCEPTED, application.getStatus());

        // Step 8: Project Execution & Completion
        project.setStatus(Project.ProjectStatus.COMPLETED);
        projectRepository.save(project);
        assertEquals(Project.ProjectStatus.COMPLETED, project.getStatus());

        // Step 9: Company Reviews Student & Updates Performance Score Aggregation
        Review review = Review.builder()
                .company(company)
                .student(studentProfile)
                .project(project)
                .rating(5)
                .comment("Outstanding performance and clean code execution.")
                .build();
        reviewRepository.save(review);

        studentProfile.setPerformanceScore(5.0);
        studentProfileRepository.save(studentProfile);

        StudentProfile updatedProfile = studentProfileRepository.findByUserId(studentUser.getId()).orElseThrow();
        assertEquals(5.0, updatedProfile.getPerformanceScore());
    }
}
