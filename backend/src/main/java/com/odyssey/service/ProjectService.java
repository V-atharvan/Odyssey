package com.odyssey.service;

import com.odyssey.dto.request.ApplyProjectRequest;
import com.odyssey.dto.request.CreateProjectRequest;
import com.odyssey.dto.response.ApplicationResponse;
import com.odyssey.dto.response.ProjectResponse;
import com.odyssey.entity.*;
import com.odyssey.exception.BadRequestException;
import com.odyssey.exception.ResourceNotFoundException;
import com.odyssey.repository.*;
import com.odyssey.exception.BadRequestException;
import com.odyssey.exception.ResourceNotFoundException;
import com.odyssey.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ProjectApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CompanyCollegePartnershipRepository partnershipRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public ProjectResponse createProject(String companyEmail, CreateProjectRequest request) {
        User user = userRepository.findByEmail(companyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Project project = Project.builder()
                .company(company)
                .title(request.getTitle())
                .category(request.getCategory())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .skillsRequired(request.getSkillsRequired())
                .experienceLevelRequired(request.getExperienceLevelRequired())
                .durationWeeks(request.getDurationWeeks())
                .maxApplicants(request.getMaxApplicants() != null ? request.getMaxApplicants() : 10)
                .deadline(request.getDeadline())
                .build();

        project = projectRepository.save(project);
        log.info("Project created: {} by {}", project.getId(), companyEmail);
        return mapToResponse(project, 0);
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getAllOpenProjects(Pageable pageable) {
        return projectRepository.findByStatus(Project.ProjectStatus.OPEN, pageable)
                .map(p -> mapToResponse(p, p.getApplications() != null ? p.getApplications().size() : 0));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectFeed(String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (student.getVerificationStatus() != StudentProfile.VerificationStatus.VERIFIED) {
            return List.of(); // Return empty if not verified
        }

        List<CompanyCollegePartnership> partnerships = partnershipRepository
                .findByCollegeIdAndStatus(student.getCollege().getId(), CompanyCollegePartnership.PartnershipStatus.ACCEPTED);
        
        List<Long> approvedCompanyIds = partnerships.stream()
                .map(p -> p.getCompany().getId())
                .collect(Collectors.toList());

        return projectRepository.findByStatus(Project.ProjectStatus.OPEN).stream()
                .filter(p -> approvedCompanyIds.contains(p.getCompany().getId()))
                .map(p -> mapToResponse(p, p.getApplications() != null ? p.getApplications().size() : 0))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        return mapToResponse(project, project.getApplications() != null ? project.getApplications().size() : 0);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getCompanyProjects(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return projectRepository.findByCompanyId(company.getId()).stream()
                .map(p -> mapToResponse(p, p.getApplications() != null ? p.getApplications().size() : 0))
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse applyToProject(String studentEmail, Long projectId, ApplyProjectRequest request) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (user.getStatus() != AccountStatus.ACTIVE || student.getVerificationStatus() != StudentProfile.VerificationStatus.VERIFIED) {
            throw new BadRequestException("Verify your profile with your College to start applying.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        if (project.getStatus() != Project.ProjectStatus.OPEN) {
            throw new BadRequestException("Project is not accepting applications");
        }

        if (applicationRepository.existsByProjectIdAndStudentId(projectId, student.getId())) {
            throw new BadRequestException("You have already applied to this project");
        }

        ProjectApplication application = ProjectApplication.builder()
                .project(project)
                .student(student)
                .pitch(request.getPitch())
                .build();

        application = applicationRepository.save(application);
        log.info("Application submitted: student={} project={}", studentEmail, projectId);

        // Notify Company
        notificationService.createNotification(
                project.getCompany().getUser(),
                "New Application Received",
                "Student " + student.getUser().getFullName() + " has applied to your project: " + project.getTitle(),
                Notification.NotificationType.APPLICATION_RECEIVED
        );

        // Send Email Alert to Company
        emailService.sendProjectApplicationAlert(
                project.getCompany().getUser().getEmail(),
                project.getCompany().getCompanyName(),
                student.getUser().getFullName(),
                project.getTitle()
        );

        // Notify College Admin
        if (student.getCollege() != null) {
            notificationService.createNotification(
                    student.getCollege().getUser(),
                    "Student Applied to Project",
                    "Student " + student.getUser().getFullName() + " applied to Company " + project.getCompany().getCompanyName() + ".",
                    Notification.NotificationType.APPLICATION_RECEIVED
            );
        }

        return mapToApplicationResponse(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getStudentApplications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        
        return applicationRepository.findByStudent(student).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse assignStudent(String companyEmail, Long projectId, Long studentId) {
        User companyUser = userRepository.findByEmail(companyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Company user not found"));
        Company company = companyRepository.findByUserId(companyUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        if (!project.getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("You don't own this project");
        }

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        ProjectApplication application = applicationRepository.findByProjectIdAndStudentId(projectId, studentId)
                .orElseThrow(() -> new BadRequestException("No application found for this student on this project"));

        application.setStatus(ProjectApplication.ApplicationStatus.ACCEPTED);
        application = applicationRepository.save(application);

        project.setStatus(Project.ProjectStatus.IN_PROGRESS);
        projectRepository.save(project);

        // Notify Student via platform
        notificationService.createNotification(
                student.getUser(),
                "Project Assigned! 🎉",
                "Congratulations! You have been assigned to the project: " + project.getTitle() + " by " + company.getCompanyName() + ".",
                Notification.NotificationType.SYSTEM_ALERT
        );

        // Send Email Alert to Student
        emailService.sendProjectAssignmentAlert(
                student.getUser().getEmail(),
                student.getUser().getFullName(),
                project.getTitle(),
                company.getCompanyName()
        );

        log.info("Student {} assigned to project {}", studentId, projectId);
        return mapToApplicationResponse(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getProjectApplicants(Long projectId) {
        return applicationRepository.findByProjectId(projectId).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponse updateProjectStatus(Long projectId, String status, String companyEmail) {
        User user = userRepository.findByEmail(companyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        if (!project.getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("You don't own this project");
        }

        project.setStatus(Project.ProjectStatus.valueOf(status.toUpperCase()));
        project = projectRepository.save(project);
        return mapToResponse(project, 0);
    }

    private ProjectResponse mapToResponse(Project p, int applicantsCount) {
        return ProjectResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .category(p.getCategory())
                .description(p.getDescription())
                .requirements(p.getRequirements())
                .skillsRequired(p.getSkillsRequired() != null ? new java.util.ArrayList<>(p.getSkillsRequired()) : List.of())
                .experienceLevelRequired(p.getExperienceLevelRequired())
                .durationWeeks(p.getDurationWeeks())
                .status(p.getStatus().name())
                .maxApplicants(p.getMaxApplicants())
                .deadline(p.getDeadline())
                .createdAt(p.getCreatedAt())
                .companyId(p.getCompany().getId())
                .companyName(p.getCompany().getCompanyName())
                .companyLogo(p.getCompany().getLogoUrl())
                .applicantsCount(applicantsCount)
                .matchScore(0.0)
                .build();
    }

    private ApplicationResponse mapToApplicationResponse(ProjectApplication a) {
        return ApplicationResponse.builder()
                .id(a.getId())
                .projectId(a.getProject().getId())
                .projectTitle(a.getProject().getTitle())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getUser().getFullName())
                .studentEmail(a.getStudent().getUser().getEmail())
                .pitch(a.getPitch())
                .status(a.getStatus().name())
                .appliedAt(a.getAppliedAt())
                .studentSkills(a.getStudent().getSkills())
                .studentPerformanceScore(a.getStudent().getPerformanceScore())
                .studentProfileImageUrl(a.getStudent().getProfileImageUrl())
                .build();
    }
}
