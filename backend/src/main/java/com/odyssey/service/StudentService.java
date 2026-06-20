package com.odyssey.service;

import com.odyssey.dto.request.UpdateStudentProfileRequest;
import com.odyssey.dto.response.ApplicationResponse;
import com.odyssey.dto.response.ProjectResponse;
import com.odyssey.dto.response.*;
import com.odyssey.dto.request.*;
import com.odyssey.entity.*;
import com.odyssey.exception.ResourceNotFoundException;
import com.odyssey.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final ProjectApplicationRepository applicationRepository;
    private final ProjectRepository projectRepository;
    private final CollegeRepository collegeRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public StudentProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    StudentProfile newProfile = StudentProfile.builder()
                            .user(user)
                            .verificationStatus(StudentProfile.VerificationStatus.PENDING)
                            .performanceScore(0.0)
                            .completedProjects(0)
                            .totalEarnings(0.0)
                            .build();
                    return studentProfileRepository.save(newProfile);
                });
        return mapToResponse(profile);
    }

    @Transactional
    public StudentProfileResponse updateProfile(String email, UpdateStudentProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    StudentProfile newProfile = StudentProfile.builder()
                            .user(user)
                            .verificationStatus(StudentProfile.VerificationStatus.PENDING)
                            .performanceScore(0.0)
                            .completedProjects(0)
                            .totalEarnings(0.0)
                            .build();
                    return studentProfileRepository.save(newProfile);
                });

        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getSkills() != null) profile.setSkills(request.getSkills());
        if (request.getExperienceLevel() != null) profile.setExperienceLevel(request.getExperienceLevel());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getDegree() != null) profile.setDegree(request.getDegree());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getLinkedinUrl() != null) profile.setLinkedinLink(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubLink(request.getGithubUrl());
        if (request.getPortfolioUrl() != null) profile.setPortfolioLink(request.getPortfolioUrl());
        if (request.getResumeUrl() != null) profile.setResumeUrl(request.getResumeUrl());
        if (request.getProfileImageUrl() != null) profile.setProfileImageUrl(request.getProfileImageUrl());

        if (request.getCollegeId() != null) {
            College college = collegeRepository.findById(request.getCollegeId())
                    .orElseThrow(() -> new ResourceNotFoundException("College", request.getCollegeId()));
            profile.setCollege(college);
        }

        profile = studentProfileRepository.save(profile);
        log.info("Updated profile for student: {}", email);
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getProjectsForStudent(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (profile.getVerificationStatus() != StudentProfile.VerificationStatus.VERIFIED || profile.getCollege() == null) {
            return Page.empty();
        }

        Page<Project> partneredProjects = projectRepository.findByCollegePartnership(profile.getCollege().getId(), pageable);

        List<ProjectResponse> scored = partneredProjects.getContent().stream()
                .map(p -> mapToProjectResponse(p, calculateMatchScore(profile, p)))
                .sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
                .collect(Collectors.toList());

        return new PageImpl<>(scored, pageable, partneredProjects.getTotalElements());
    }

    private double calculateMatchScore(StudentProfile student, Project project) {
        double score = 0.0;

        // Skill matching (60%)
        if (student.getSkills() != null && project.getSkillsRequired() != null && !project.getSkillsRequired().isEmpty()) {
            List<String> studentSkills = Arrays.stream(student.getSkills().split(","))
                    .map(String::trim).map(String::toLowerCase).collect(Collectors.toList());
            List<String> projectSkills = project.getSkillsRequired().stream()
                    .map(String::trim).map(String::toLowerCase).collect(Collectors.toList());
            long matched = projectSkills.stream().filter(studentSkills::contains).count();
            score += 0.6 * ((double) matched / projectSkills.size());
        }

        // Experience level match (40%)
        if (student.getExperienceLevel() != null && project.getExperienceLevelRequired() != null) {
            if (student.getExperienceLevel().equalsIgnoreCase(project.getExperienceLevelRequired())) {
                score += 0.4;
            }
        }

        return Math.round(score * 100.0) / 100.0;
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return applicationRepository.findByStudent(profile).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getPortfolio(Long studentId) {
        StudentProfile profile = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        return mapToResponse(profile);
    }

    private StudentProfileResponse mapToResponse(StudentProfile p) {
        return StudentProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .bio(p.getBio())
                .skills(p.getSkills())
                .experienceLevel(p.getExperienceLevel())
                .department(p.getDepartment())
                .degree(p.getDegree())
                .graduationYear(p.getGraduationYear())
                .resumeUrl(p.getResumeUrl())
                .profileImageUrl(p.getProfileImageUrl())
                .linkedinUrl(p.getLinkedinLink())
                .githubUrl(p.getGithubLink())
                .portfolioUrl(p.getPortfolioLink())
                .performanceScore(p.getPerformanceScore())
                .completedProjects(p.getCompletedProjects())
                .verificationStatus(p.getVerificationStatus() != null ? p.getVerificationStatus().name() : "PENDING")
                .collegeName(p.getCollege() != null ? p.getCollege().getCollegeName() : p.getCollegeName())
                .collegeId(p.getCollege() != null ? p.getCollege().getId() : null)
                .build();
    }

    private ProjectResponse mapToProjectResponse(Project p, double matchScore) {
        return ProjectResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .category(p.getCategory())
                .description(p.getDescription())
                .requirements(p.getRequirements())
                .skillsRequired(p.getSkillsRequired())
                .experienceLevelRequired(p.getExperienceLevelRequired())
                .durationWeeks(p.getDurationWeeks())
                .status(p.getStatus().name())
                .maxApplicants(p.getMaxApplicants())
                .deadline(p.getDeadline())
                .createdAt(p.getCreatedAt())
                .companyId(p.getCompany().getId())
                .companyName(p.getCompany().getCompanyName())
                .companyLogo(p.getCompany().getLogoUrl())
                .applicantsCount(p.getApplications() != null ? p.getApplications().size() : 0)
                .matchScore(matchScore)
                .build();
    }

    private ApplicationResponse mapToApplicationResponse(ProjectApplication a) {
        return ApplicationResponse.builder()
                .id(a.getId())
                .projectId(a.getProject().getId())
                .projectTitle(a.getProject().getTitle())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getUser().getFullName())
                .pitch(a.getPitch())
                .status(a.getStatus().name())
                .appliedAt(a.getAppliedAt())
                .build();
    }
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchColleges(String query) {
        List<College> colleges = collegeRepository.findAll();
        if (query != null && !query.trim().isEmpty()) {
            String lowerQuery = query.toLowerCase();
            colleges = colleges.stream()
                .filter(c -> c.getCollegeName() != null && c.getCollegeName().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList());
        }
        
        return colleges.stream().map(c -> Map.<String, Object>of(
                "id", c.getId(),
                "collegeName", c.getCollegeName() != null ? c.getCollegeName() : "",
                "city", c.getAddress() != null && c.getAddress().getCity() != null ? c.getAddress().getCity() : "",
                "state", c.getAddress() != null && c.getAddress().getState() != null ? c.getAddress().getState() : "",
                "logoUrl", c.getLogoUrl() != null ? c.getLogoUrl() : ""
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCollegeDepartments(Long collegeId) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));
        return college.getDepartments() != null ? new java.util.ArrayList<>(college.getDepartments()) : java.util.Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public List<String> getCollegeCourses(Long collegeId) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));
        return college.getCoursesOffered() != null ? new java.util.ArrayList<>(college.getCoursesOffered()) : java.util.Collections.emptyList();
    }

    // ------------------------------------------------------------------------
    // MOCK ASSESSMENT BANK & SKILLS INTEGRATION
    // ------------------------------------------------------------------------

    private static final List<AssessmentDto> ASSESSMENT_BANK = List.of(
        AssessmentDto.builder()
            .id(1L)
            .title("Java & Spring Boot Core Assessment")
            .subject("Java")
            .questionCount(3)
            .durationMinutes(15)
            .questions(List.of(
                AssessmentDto.QuestionDto.builder().id(1).text("Which annotation registers a class as a Spring-managed Bean?").options(List.of("@Component", "@Autowired", "@Inject", "@BeanInstance")).build(),
                AssessmentDto.QuestionDto.builder().id(2).text("What is the primary difference between List and Set in Java?").options(List.of("List permits duplicate entries; Set guarantees uniqueness.", "List is unordered; Set preserves order.", "Set allows multiple null items; List forbids nulls.", "There is no performance difference.")).build(),
                AssessmentDto.QuestionDto.builder().id(3).text("What JPA annotation defines a one-to-many relationship mapping?").options(List.of("@OneToMany", "@ManyToOne", "@JoinColumn", "@ManyToMany")).build()
            ))
            .build(),
        AssessmentDto.builder()
            .id(2L)
            .title("React Framework Specialist Challenge")
            .subject("React")
            .questionCount(3)
            .durationMinutes(15)
            .questions(List.of(
                AssessmentDto.QuestionDto.builder().id(1).text("Which hook should be used to memoize expensive computations?").options(List.of("useMemo", "useCallback", "useState", "useEffect")).build(),
                AssessmentDto.QuestionDto.builder().id(2).text("What keyword allows clean, conditional logic inside JSX fields?").options(List.of("Standard JavaScript ternary or logical logical AND (&&)", "Traditional if-else block wrappers", "Dynamic switch tags", "Loops inside markup")).build(),
                AssessmentDto.QuestionDto.builder().id(3).text("What triggers a component re-render in React?").options(List.of("Updates to either state values or incoming props.", "Modifying a local normal variable.", "Invoking a plain helper function.", "Clicking any screen button.")).build()
            ))
            .build(),
        AssessmentDto.builder()
            .id(3L)
            .title("Secure Web Application Hardening")
            .subject("Security")
            .questionCount(3)
            .durationMinutes(15)
            .questions(List.of(
                AssessmentDto.QuestionDto.builder().id(1).text("What security header helps mitigate XSS and clickjacking?").options(List.of("Content-Security-Policy", "X-Frame-Options", "Access-Control-Allow-Origin", "Strict-Transport-Security")).build(),
                AssessmentDto.QuestionDto.builder().id(2).text("What is the purpose of Cross-Origin Resource Sharing (CORS)?").options(List.of("To define which external origins are permitted to access local API resources.", "To validate client user credentials.", "To encrypt communication pathways.", "To block search engine crawler indexes.")).build(),
                AssessmentDto.QuestionDto.builder().id(3).text("What represents the best defense against SQL Injection (SQLi)?").options(List.of("Using Prepared Statements with parameterized parameters.", "Removing single quotes from client inputs.", "Restricting user length options.", "Encoding database schemas.")).build()
            ))
            .build()
    );

    // Correct Answer option index mapping (Server-side keys)
    private static final Map<Long, List<Integer>> ANSWER_KEYS = Map.of(
        1L, List.of(0, 0, 0), // Q1: @Component (0), Q2: List allows duplicates (0), Q3: @OneToMany (0)
        2L, List.of(0, 0, 0), // Q1: useMemo (0), Q2: ternary (0), Q3: updates to state/props (0)
        3L, List.of(0, 0, 0)  // Q1: Content-Security-Policy (0), Q2: define origins (0), Q3: Prepared Statements (0)
    );

    @Transactional(readOnly = true)
    public List<AssessmentDto> getAvailableAssessments() {
        return ASSESSMENT_BANK;
    }

    @Transactional
    public AssessmentResultDto submitAssessment(String email, AssessmentSubmitDto submission) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        Long testId = submission.getAssessmentId();
        AssessmentDto test = ASSESSMENT_BANK.stream()
                .filter(t -> t.getId().equals(testId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Assessment test not found"));

        List<Integer> selectedAnswers = submission.getAnswers();
        List<Integer> correctAnswers = ANSWER_KEYS.get(testId);

        if (selectedAnswers == null || correctAnswers == null || selectedAnswers.size() < correctAnswers.size()) {
            throw new IllegalArgumentException("Incomplete submission answers");
        }

        int correctCount = 0;
        for (int i = 0; i < correctAnswers.size(); i++) {
            if (correctAnswers.get(i).equals(selectedAnswers.get(i))) {
                correctCount++;
            }
        }

        double scorePercent = ((double) correctCount / correctAnswers.size()) * 100.0;
        boolean passed = scorePercent >= 70.0;

        String feedback = passed 
            ? "Reputation upgrade unlocked! You passed the challenge with flying colors! 🌟"
            : "Keep practicing! You can retake the test anytime to unlock verification points. 📚";

        double newScore = profile.getPerformanceScore();
        if (passed) {
            // Increment score by +10.0, up to a cap of 100.0
            newScore = Math.min(100.0, profile.getPerformanceScore() + 10.0);
            profile.setPerformanceScore(newScore);

            // Auto-append verified skills keyword to profile if not present
            String subjectSkill = test.getSubject();
            String currentSkills = profile.getSkills() != null ? profile.getSkills() : "";
            List<String> skillList = Arrays.stream(currentSkills.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            if (!skillList.stream().anyMatch(s -> s.equalsIgnoreCase(subjectSkill))) {
                skillList.add(subjectSkill);
                profile.setSkills(String.join(", ", skillList));
            }

            studentProfileRepository.save(profile);
            log.info("Student {} passed assessment '{}'. Performance score upgraded to {}", email, test.getTitle(), newScore);
        }

        return AssessmentResultDto.builder()
                .passed(passed)
                .scorePercent(scorePercent)
                .correctCount(correctCount)
                .totalQuestions(correctAnswers.size())
                .performanceScoreUpdated(newScore)
                .feedbackMessage(feedback)
                .build();
    }
}
