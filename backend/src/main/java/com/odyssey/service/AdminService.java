package com.odyssey.service;

import com.odyssey.dto.response.UserResponse;
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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CollegeRepository collegeRepository;
    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;
    private final ProjectApplicationRepository applicationRepository;
    private final EmailService emailService;

    public Page<UserResponse> getAllUsers(String role, Pageable pageable) {
        Page<User> users;
        if (role != null && !role.isEmpty() && !role.equalsIgnoreCase("ALL")) {
            try {
                User.Role enumRole = User.Role.valueOf(role.toUpperCase());
                users = userRepository.findByRole(enumRole, pageable);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAll(pageable);
            }
        } else {
            users = userRepository.findAll(pageable);
        }
        List<UserResponse> responses = users.getContent().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, users.getTotalElements());
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .active(user.isActive());

        if (user.getRole() == User.Role.COLLEGE_ADMIN) {
            collegeRepository.findByUserId(user.getId()).ifPresent(c -> {
                builder.profileId(c.getId());
                builder.verificationStatus(c.getVerificationStatus().name());
            });
        } else if (user.getRole() == User.Role.COMPANY) {
            companyRepository.findByUserId(user.getId()).ifPresent(c -> {
                builder.profileId(c.getId());
                builder.verificationStatus(c.getVerificationStatus().name());
            });
        }

        return builder.build();
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (user.getStatus() == AccountStatus.ACTIVE) {
            user.setStatus(AccountStatus.SUSPENDED);
        } else {
            user.setStatus(AccountStatus.ACTIVE);
        }
        user = userRepository.save(user);
        log.info("Admin toggled user {} status to {}", userId, user.getStatus());
        return user;
    }

    public Map<String, Object> getPlatformAnalytics() {
        long totalUsers = userRepository.count();
        long totalStudents = studentProfileRepository.count();
        long totalColleges = collegeRepository.count();
        long totalCompanies = companyRepository.count();
        long totalProjects = projectRepository.count();
        long openProjects = projectRepository.findByStatus(Project.ProjectStatus.OPEN, Pageable.unpaged())
                .getTotalElements();
        long completedProjects = projectRepository.findByStatus(Project.ProjectStatus.COMPLETED, Pageable.unpaged())
                .getTotalElements();
        long totalApplications = applicationRepository.count();

        return Map.of(
                "totalUsers", totalUsers,
                "totalStudents", totalStudents,
                "totalColleges", totalColleges,
                "totalCompanies", totalCompanies,
                "totalProjects", totalProjects,
                "openProjects", openProjects,
                "completedProjects", completedProjects,
                "totalApplications", totalApplications);
    }

    @Transactional
    public void verifyCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));
        company.setVerificationStatus(Company.VerificationStatus.VERIFIED);
        companyRepository.save(company);
        log.info("Admin verified company {}", companyId);

        emailService.sendVerificationAlert(
                company.getUser().getEmail(),
                company.getUser().getFullName(),
                "COMPANY",
                true
        );
    }

    @Transactional
    public void verifyCollege(Long collegeId) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException("College", collegeId));
        college.setVerificationStatus(College.VerificationStatus.VERIFIED);
        collegeRepository.save(college);
        log.info("Admin verified college {}", collegeId);

        emailService.sendVerificationAlert(
                college.getUser().getEmail(),
                college.getUser().getFullName(),
                "COLLEGE_ADMIN",
                true
        );
    }

    @Transactional
    public void rejectCollege(Long collegeId) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException("College", collegeId));
        college.setVerificationStatus(College.VerificationStatus.REJECTED);
        collegeRepository.save(college);
        log.info("Admin rejected college {}", collegeId);

        emailService.sendVerificationAlert(
                college.getUser().getEmail(),
                college.getUser().getFullName(),
                "COLLEGE_ADMIN",
                false
        );
    }

    @Transactional
    public void rejectCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));
        company.setVerificationStatus(Company.VerificationStatus.REJECTED);
        companyRepository.save(company);
        log.info("Admin rejected company {}", companyId);

        emailService.sendVerificationAlert(
                company.getUser().getEmail(),
                company.getUser().getFullName(),
                "COMPANY",
                false
        );
    }
}
