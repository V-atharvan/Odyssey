package com.odyssey.service;

import com.odyssey.dto.request.UpdateCompanyProfileRequest;
import com.odyssey.dto.response.CompanyProfileResponse;
import com.odyssey.entity.*;
import com.odyssey.exception.ResourceNotFoundException;
import com.odyssey.exception.BadRequestException;
import com.odyssey.repository.CollegeRepository;
import com.odyssey.repository.CompanyCollegePartnershipRepository;
import com.odyssey.repository.CompanyRepository;
import com.odyssey.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final CompanyCollegePartnershipRepository partnershipRepository;
    private final NotificationService notificationService;

    @Transactional
    public CompanyProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Company newCompany = Company.builder()
                            .user(user)
                            .companyName(user.getFullName())
                            .verificationStatus(Company.VerificationStatus.PENDING)
                            .build();
                    return companyRepository.save(newCompany);
                });
        return mapToResponse(company);
    }

    @Transactional
    public CompanyProfileResponse updateProfile(String email, UpdateCompanyProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Company newCompany = Company.builder()
                            .user(user)
                            .companyName(user.getFullName())
                            .verificationStatus(Company.VerificationStatus.PENDING)
                            .build();
                    return companyRepository.save(newCompany);
                });

        if (request.getCompanyName() != null) company.setCompanyName(request.getCompanyName());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());

        company = companyRepository.save(company);
        log.info("Updated profile for company: {}", email);
        return mapToResponse(company);
    }

    @Transactional
    public Map<String, Object> getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Company newCompany = Company.builder()
                            .user(user)
                            .companyName(user.getFullName())
                            .verificationStatus(Company.VerificationStatus.PENDING)
                            .build();
                    return companyRepository.save(newCompany);
                });

        long totalProjects = company.getProjects() != null ? company.getProjects().size() : 0;
        long openProjects = company.getProjects() != null ? 
            company.getProjects().stream().filter(p -> p.getStatus() == Project.ProjectStatus.OPEN).count() : 0;
        long inProgress = company.getProjects() != null ? 
            company.getProjects().stream().filter(p -> p.getStatus() == Project.ProjectStatus.IN_PROGRESS).count() : 0;
        long completed = company.getProjects() != null ? 
            company.getProjects().stream().filter(p -> p.getStatus() == Project.ProjectStatus.COMPLETED).count() : 0;

        Map<String, Long> categoryBreakdown = new HashMap<>();
        Map<String, Long> applicationStatusBreakdown = new HashMap<>();

        if (company.getProjects() != null) {
            for (Project p : company.getProjects()) {
                String cat = p.getCategory() != null ? p.getCategory() : "General";
                categoryBreakdown.put(cat, categoryBreakdown.getOrDefault(cat, 0L) + 1);

                if (p.getApplications() != null) {
                    for (ProjectApplication app : p.getApplications()) {
                        String status = app.getStatus() != null ? app.getStatus().name() : "PENDING";
                        applicationStatusBreakdown.put(status, applicationStatusBreakdown.getOrDefault(status, 0L) + 1);
                    }
                }
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", totalProjects);
        stats.put("openProjects", openProjects);
        stats.put("inProgressProjects", inProgress);
        stats.put("completedProjects", completed);
        stats.put("totalApplicants", company.getProjects() != null ? 
            company.getProjects().stream()
                .flatMap(p -> p.getApplications() != null ? p.getApplications().stream() : java.util.stream.Stream.empty())
                .count() : 0);
        stats.put("verificationStatus", company.getVerificationStatus() != null ? company.getVerificationStatus().name() : "PENDING");
        stats.put("categoryBreakdown", categoryBreakdown);
        stats.put("applicationStatusBreakdown", applicationStatusBreakdown);

        return stats;
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

    @Transactional
    public Map<String, Object> sendPartnershipRequest(String email, Long collegeId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        if (partnershipRepository.existsByCompanyIdAndCollegeId(company.getId(), college.getId())) {
            throw new BadRequestException("Partnership request already exists for this college");
        }

        CompanyCollegePartnership partnership = CompanyCollegePartnership.builder()
                .company(company)
                .college(college)
                .status(CompanyCollegePartnership.PartnershipStatus.PENDING)
                .build();
        partnershipRepository.save(partnership);

        notificationService.createNotification(
                college.getUser(),
                "New Partnership Request",
                "Company " + company.getCompanyName() + " has requested to partner with your college.",
                Notification.NotificationType.PARTNERSHIP_REQUEST
        );

        return Map.of("message", "Partnership request sent successfully");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSentRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
                
        return partnershipRepository.findByCompanyId(company.getId()).stream()
                .map(p -> Map.<String, Object>of(
                        "id", p.getId(),
                        "collegeId", p.getCollege().getId(),
                        "collegeName", p.getCollege().getCollegeName() != null ? p.getCollege().getCollegeName() : "",
                        "status", p.getStatus().name(),
                        "createdAt", p.getCreatedAt()
                )).collect(Collectors.toList());
    }

    private CompanyProfileResponse mapToResponse(Company c) {
        return CompanyProfileResponse.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .fullName(c.getUser().getFullName())
                .email(c.getUser().getEmail())
                .companyName(c.getCompanyName())
                .website(c.getWebsite())
                .industry(c.getIndustry())
                .description(c.getDescription())
                .logoUrl(c.getLogoUrl())
                .verificationStatus(c.getVerificationStatus() != null ? c.getVerificationStatus().name() : "PENDING")
                .build();
    }
}
