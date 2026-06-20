package com.odyssey.service;

import java.util.ArrayList;

import com.odyssey.dto.request.UpdateCollegeProfileRequest;
import com.odyssey.dto.response.CollegeProfileResponse;
import com.odyssey.dto.response.StudentProfileResponse;
import com.odyssey.dto.response.BulkImportResponse;
import com.odyssey.entity.*;
import com.odyssey.exception.BadRequestException;
import com.odyssey.exception.ResourceNotFoundException;
import com.odyssey.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CollegeService {

    private final CollegeRepository collegeRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final CompanyCollegePartnershipRepository partnershipRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;


    // -------------------------------------------------------
    // EXISTING METHODS (UNCHANGED)
    // -------------------------------------------------------

    @Transactional(readOnly = true)
    public List<StudentProfileResponse> getCollegeStudents(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        List<String> validDepartments = college.getDepartments();

        return studentProfileRepository.findByCollegeId(college.getId()).stream()
                .filter(s -> validDepartments != null && validDepartments.contains(s.getDepartment()))
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentProfileResponse toggleStudentStatus(String email, Long studentId) {
        User adminUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(adminUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        if (student.getCollege() == null || !student.getCollege().getId().equals(college.getId())) {
            throw new BadRequestException("Student does not belong to your college");
        }

        User studentUser = student.getUser();
        studentUser.setActive(!studentUser.isActive());
        userRepository.save(studentUser);

        log.info("Student {} active status toggled to {}", studentId, studentUser.isActive());
        return mapToStudentResponse(student);
    }

    @Transactional
    public StudentProfileResponse verifyStudent(String email, Long studentId, String status) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        if (student.getCollege() == null || !student.getCollege().getId().equals(college.getId())) {
            throw new BadRequestException("Student does not belong to your college");
        }

        student.setVerificationStatus(StudentProfile.VerificationStatus.valueOf(status.toUpperCase()));
        student = studentProfileRepository.save(student);
        log.info("Student {} verification status updated to {}", studentId, status);

        // Send notification to student
        String message = status.equalsIgnoreCase("VERIFIED") 
            ? "Your account has been verified by your college. You can now apply for jobs."
            : "Your account verification was rejected by your college.";
        
        Notification.NotificationType type = status.equalsIgnoreCase("VERIFIED")
            ? Notification.NotificationType.STUDENT_VERIFIED
            : Notification.NotificationType.STUDENT_REJECTED;

        notificationService.createNotification(student.getUser(), "Verification Update", message, type);

        return mapToStudentResponse(student);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        List<String> validDepartments = college.getDepartments();
        List<StudentProfile> students = studentProfileRepository.findByCollegeId(college.getId());
        
        if (validDepartments != null && !validDepartments.isEmpty()) {
            students = students.stream()
                .filter(s -> validDepartments.contains(s.getDepartment()))
                .collect(Collectors.toList());
        }

        long verified = students.stream()
                .filter(s -> s.getVerificationStatus() == StudentProfile.VerificationStatus.VERIFIED).count();
        long pending = students.stream()
                .filter(s -> s.getVerificationStatus() == StudentProfile.VerificationStatus.PENDING).count();
        double avgScore = students.stream()
                .mapToDouble(StudentProfile::getPerformanceScore).average().orElse(0.0);

        // Count active companies connected
        long activeCompanies = partnershipRepository.findByCollegeId(college.getId()).stream()
                .filter(p -> p.getStatus() == CompanyCollegePartnership.PartnershipStatus.ACCEPTED).count();

        // Check if there are ANY pending requests to make the dashboard aware
        long pendingRequests = partnershipRepository.findByCollegeId(college.getId()).stream()
                .filter(p -> p.getStatus() == CompanyCollegePartnership.PartnershipStatus.PENDING).count();

        return Map.of(
                "collegeName", college.getCollegeName() != null ? college.getCollegeName() : "",
                "totalStudents", students.size(),
                "verifiedStudents", verified,
                "pendingStudents", pending,
                "pendingPartnershipRequests", pendingRequests,
                "averagePerformanceScore", avgScore,
                "activeCompaniesConnected", activeCompanies,
                "topSkillDemand", Map.of("Java", 15, "React", 12, "Spring Boot", 10, "Python", 8),
                "verificationStatus", college.getVerificationStatus() != null ? college.getVerificationStatus().name() : "PENDING"
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        List<StudentProfile> students = studentProfileRepository.findByCollegeId(college.getId());
        List<String> validDepartments = college.getDepartments();
        
        Map<String, Long> byDepartment = new HashMap<>();
        if (validDepartments != null && !validDepartments.isEmpty()) {
            for (String dept : validDepartments) {
                long count = students.stream().filter(s -> dept.equals(s.getDepartment())).count();
                byDepartment.put(dept, count);
            }
        }

        return Map.of(
            "byDepartment", byDepartment,
            "monthlyActivity", Map.of("Jan", 5, "Feb", 12, "Mar", 18)
        );
    }

    @Transactional(readOnly = true)
    public List<StudentProfileResponse> getTopPerformers(String email, int limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        return studentProfileRepository.findByCollegeId(college.getId()).stream()
                .sorted((s1, s2) -> Double.compare(s2.getPerformanceScore(), s1.getPerformanceScore()))
                .limit(limit)
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // UPGRADED: updateProfile — maps ALL DTO fields to entity
    // -------------------------------------------------------

    @Transactional
    public CollegeProfileResponse updateProfile(String email, UpdateCollegeProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    College newCollege = College.builder()
                            .user(user)
                            .collegeName(user.getFullName())
                            .verificationStatus(College.VerificationStatus.PENDING)
                            .registrationStep(3)
                            .build();
                    return collegeRepository.save(newCollege);
                });

        // Basic Info — support both new field names and legacy aliases
        if (request.getCollegeName() != null)        college.setCollegeName(request.getCollegeName());
        if (request.getInstitutionName() != null)    college.setCollegeName(request.getInstitutionName()); // legacy alias
        if (request.getShortName() != null)          college.setShortName(request.getShortName());
        if (request.getCollegeCode() != null)        college.setCollegeCode(request.getCollegeCode());
        if (request.getEstablishmentYear() != null)  college.setEstablishmentYear(request.getEstablishmentYear());
        if (request.getUniversityAffiliation() != null) college.setUniversityAffiliation(request.getUniversityAffiliation());
        if (request.getAccreditation() != null)      college.setAccreditation(request.getAccreditation());
        if (request.getWebsite() != null)            college.setWebsite(request.getWebsite());
        if (request.getDescription() != null)        college.setDescription(request.getDescription());

        // Admin Info
        if (request.getAdminName() != null)        college.setAdminName(request.getAdminName());
        if (request.getAdminDesignation() != null) college.setAdminDesignation(request.getAdminDesignation());
        if (request.getContactPhone() != null)     college.setContactPhone(request.getContactPhone());

        // Address — build or update the embedded Address object
        Address address = college.getAddress() != null ? college.getAddress() : new Address();
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getState() != null)   address.setState(request.getState());
        if (request.getCity() != null)    address.setCity(request.getCity());
        if (request.getPincode() != null) address.setPincode(request.getPincode());
        // Legacy location field fallback — only set if city not already provided
        if (request.getLocation() != null && address.getCity() == null) {
            address.setCity(request.getLocation());
        }
        college.setAddress(address);

        // Academic Info
        if (request.getCoursesOffered() != null) college.setCoursesOffered(request.getCoursesOffered());
        if (request.getDepartments() != null)    college.setDepartments(request.getDepartments());
        if (request.getTotalStudents() != null)  college.setTotalStudents(request.getTotalStudents());

        // Platform Preferences
        if (request.getTalentShowcase() != null)         college.setTalentShowcase(request.getTalentShowcase());
        if (request.getInternshipParticipation() != null) college.setInternshipParticipation(request.getInternshipParticipation());
        if (request.getEventsParticipation() != null)    college.setEventsParticipation(request.getEventsParticipation());

        // Media URLs (stored after upload endpoint returns URLs)
        if (request.getLogoUrl() != null)   college.setLogoUrl(request.getLogoUrl());
        if (request.getBannerUrl() != null) college.setBannerUrl(request.getBannerUrl());

        // Registration step tracking — mark complete (7) when terms are accepted
        if (request.getTermsAccepted() != null && request.getTermsAccepted()) {
            college.setRegistrationStep(10); // 10 = Fully Complete / Verified required
        } else if (request.getRegistrationStep() != null) {
            // Only advance, don't go back unless explicitly needed
            if (college.getRegistrationStep() == null || request.getRegistrationStep() > college.getRegistrationStep()) {
                college.setRegistrationStep(request.getRegistrationStep());
            }
        }

        college = collegeRepository.save(college);
        log.info("College profile fully updated for: {}", email);
        return mapToCollegeResponse(college);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCollegeProjects(String email) {
        // Return projects associated with students of this college
        User user = userRepository.findByEmail(email).orElseThrow();
        College college = collegeRepository.findByUserId(user.getId()).orElseThrow();
        
        return studentProfileRepository.findByCollegeId(college.getId()).stream()
            .flatMap(s -> s.getApplications().stream())
            .map(app -> {
                Map<String, Object> map = new HashMap<>();
                map.put("projectId", app.getProject().getId());
                map.put("title", app.getProject().getTitle());
                map.put("description", app.getProject().getDescription());
                map.put("status", app.getProject().getStatus().name());
                map.put("companyName", app.getProject().getCompany().getCompanyName());
                map.put("studentName", app.getStudent().getUser().getFullName());
                map.put("durationDays", app.getProject().getDurationWeeks() * 7);
                map.put("approvedByCollege", true);
                return map;
            })
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCompanies(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        return partnershipRepository.findByCollegeId(college.getId()).stream()
                .filter(p -> p.getStatus().name().equals("ACCEPTED"))
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getCompany().getId()); 
                    map.put("companyName", p.getCompany().getCompanyName() != null ? p.getCompany().getCompanyName() : "Unknown");
                    map.put("industry", p.getCompany().getIndustry() != null ? p.getCompany().getIndustry() : "Other");
                    map.put("website", p.getCompany().getWebsite());
                    map.put("logoUrl", p.getCompany().getLogoUrl());
                    
                    String[] location = p.getCompany().getAddress() != null ? p.getCompany().getAddress().split(",") : new String[]{"N/A", "N/A"};
                    map.put("city", location.length > 0 ? location[0].trim() : "N/A");
                    map.put("state", location.length > 1 ? location[1].trim() : "N/A");
                    
                    map.put("approvedByCollege", true);
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> toggleCompanyApproval(String email, Long companyId) {
        // Mock toggle
        return Map.of("companyId", companyId, "approvedByCollege", true);
    }

    // -------------------------------------------------------
    // NEW: getMyProfile — fetch own profile (for resume flow)
    // -------------------------------------------------------

    @Transactional
    public CollegeProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    College newCollege = College.builder()
                            .user(user)
                            .collegeName(user.getFullName())
                            .verificationStatus(College.VerificationStatus.PENDING)
                            .registrationStep(3)
                            .build();
                    return collegeRepository.save(newCollege);
                });
        return mapToCollegeResponse(college);
    }

    // -------------------------------------------------------
    // PARTNERSHIP & PENDING STUDENTS LOGIC
    // -------------------------------------------------------

    @Transactional(readOnly = true)
    public List<StudentProfileResponse> getPendingStudents(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        return studentProfileRepository.findByCollegeId(college.getId()).stream()
                .filter(s -> s.getVerificationStatus() == StudentProfile.VerificationStatus.PENDING)
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCompanyRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        return partnershipRepository.findByCollegeId(college.getId()).stream()
                .map(p -> Map.<String, Object>of(
                        "id", p.getId(),
                        "companyId", p.getCompany().getId(),
                        "companyName", p.getCompany().getCompanyName() != null ? p.getCompany().getCompanyName() : "",
                        "industry", p.getCompany().getIndustry() != null ? p.getCompany().getIndustry() : "",
                        "status", p.getStatus().name(),
                        "createdAt", p.getCreatedAt()
                )).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> updatePartnershipStatus(String email, Long partnershipId, String status) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        CompanyCollegePartnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership request not found"));

        if (!partnership.getCollege().getId().equals(college.getId())) {
            throw new BadRequestException("Not authorized to modify this partnership");
        }

        CompanyCollegePartnership.PartnershipStatus newStatus = CompanyCollegePartnership.PartnershipStatus.valueOf(status.toUpperCase());
        partnership.setStatus(newStatus);
        partnershipRepository.save(partnership);

        // Notify Company
        String message = newStatus == CompanyCollegePartnership.PartnershipStatus.ACCEPTED 
            ? "Your partnership request with " + college.getCollegeName() + " has been accepted."
            : "Your partnership request with " + college.getCollegeName() + " has been rejected.";
            
        Notification.NotificationType type = newStatus == CompanyCollegePartnership.PartnershipStatus.ACCEPTED
            ? Notification.NotificationType.PARTNERSHIP_ACCEPTED
            : Notification.NotificationType.PARTNERSHIP_REJECTED;

        notificationService.createNotification(partnership.getCompany().getUser(), "Partnership Update", message, type);

        return Map.of("message", "Partnership status updated to " + newStatus.name());
    }

    // -------------------------------------------------------
    // PRIVATE MAPPERS
    // -------------------------------------------------------

    private CollegeProfileResponse mapToCollegeResponse(College c) {
        Address addr = c.getAddress();
        String city = addr != null ? addr.getCity() : null;
        String state = addr != null ? addr.getState() : null;
        String locationStr = (city != null && state != null) ? city + ", " + state
                           : (city != null ? city : (state != null ? state : null));

        return CollegeProfileResponse.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .email(c.getUser().getEmail())
                .fullName(c.getUser().getFullName())
                .collegeName(c.getCollegeName())
                .shortName(c.getShortName())
                .collegeCode(c.getCollegeCode())
                .establishmentYear(c.getEstablishmentYear())
                .universityAffiliation(c.getUniversityAffiliation())
                .accreditation(c.getAccreditation())
                .website(c.getWebsite())
                .description(c.getDescription())
                .country(addr != null ? addr.getCountry() : null)
                .state(state)
                .city(city)
                .pincode(addr != null ? addr.getPincode() : null)
                .location(locationStr)
                .adminName(c.getAdminName())
                .adminDesignation(c.getAdminDesignation())
                .contactPhone(c.getContactPhone())
                .coursesOffered(c.getCoursesOffered() != null ? new ArrayList<>(c.getCoursesOffered()) : null)
                .departments(c.getDepartments() != null ? new ArrayList<>(c.getDepartments()) : null)
                .totalStudents(c.getTotalStudents())
                .talentShowcase(c.getTalentShowcase())
                .internshipParticipation(c.getInternshipParticipation())
                .eventsParticipation(c.getEventsParticipation())
                .logoUrl(c.getLogoUrl())
                .bannerUrl(c.getBannerUrl())
                .verificationStatus(c.getVerificationStatus() != null ? c.getVerificationStatus().name() : "PENDING")
                .registrationStep(c.getRegistrationStep() != null ? c.getRegistrationStep() : 3)
                .build();
    }

    private StudentProfileResponse mapToStudentResponse(StudentProfile p) {
        return StudentProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .bio(p.getBio())
                .skills(p.getSkills())
                .experienceLevel(p.getExperienceLevel())
                .department(p.getDepartment())
                .graduationYear(p.getGraduationYear())
                .performanceScore(p.getPerformanceScore())
                .completedProjects(p.getCompletedProjects())
                .verificationStatus(p.getVerificationStatus().name())
                .active(p.getUser().isActive())
                .build();
    }

    @Transactional
    public BulkImportResponse importStudentsBulk(String collegeAdminEmail, MultipartFile file) {
        User adminUser = userRepository.findByEmail(collegeAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(adminUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        List<BulkImportResponse.RowError> errors = new ArrayList<>();
        int totalProcessed = 0;
        int successCount = 0;
        int failureCount = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BadRequestException("CSV file is empty");
            }

            // Parse headers
            String[] headers = headerLine.split(",");
            Map<String, Integer> headerMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                headerMap.put(headers[i].trim().toLowerCase(), i);
            }

            // Check required fields
            if (!headerMap.containsKey("fullname") || !headerMap.containsKey("email") ||
                !headerMap.containsKey("department") || !headerMap.containsKey("graduationyear")) {
                throw new BadRequestException("CSV header must contain: fullName, email, department, graduationYear");
            }

            String line;
            int rowNum = 1; // Header is row 1, data starts at row 2
            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.trim().isEmpty()) {
                    continue;
                }

                totalProcessed++;
                // Split by comma but ignore commas inside quotes if any (standard CSV format)
                String[] columns = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

                try {
                    String fullName = getCsvVal(columns, headerMap, "fullname");
                    String email = getCsvVal(columns, headerMap, "email");
                    String department = getCsvVal(columns, headerMap, "department");
                    String gradYearStr = getCsvVal(columns, headerMap, "graduationyear");
                    String skills = getCsvVal(columns, headerMap, "skills");
                    String expLevel = getCsvVal(columns, headerMap, "experiencelevel");

                    if (fullName == null || fullName.trim().isEmpty()) {
                        throw new IllegalArgumentException("fullName is required");
                    }
                    if (email == null || email.trim().isEmpty() || !email.contains("@")) {
                        throw new IllegalArgumentException("Valid email is required");
                    }
                    if (department == null || department.trim().isEmpty()) {
                        throw new IllegalArgumentException("department is required");
                    }
                    if (gradYearStr == null || gradYearStr.trim().isEmpty()) {
                        throw new IllegalArgumentException("graduationYear is required");
                    }

                    int graduationYear;
                    try {
                        graduationYear = Integer.parseInt(gradYearStr.trim());
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Invalid graduationYear format: " + gradYearStr);
                    }

                    // Check if email already exists
                    if (userRepository.findByEmail(email).isPresent()) {
                        throw new IllegalArgumentException("Email already registered: " + email);
                    }

                    // Create User
                    String tempPassword = UUID.randomUUID().toString().substring(0, 12);
                    User studentUser = User.builder()
                            .email(email.trim().toLowerCase())
                            .fullName(fullName.trim())
                            .password(passwordEncoder.encode(tempPassword))
                            .role(User.Role.STUDENT)
                            .status(AccountStatus.ACTIVE)
                            .emailVerified(true)
                            .active(true)
                            .build();
                    
                    studentUser = userRepository.save(studentUser);

                    // Create Profile
                    StudentProfile profile = StudentProfile.builder()
                            .user(studentUser)
                            .college(college)
                            .collegeName(college.getCollegeName())
                            .department(department.trim())
                            .graduationYear(graduationYear)
                            .skills(skills != null ? skills.trim() : "")
                            .experienceLevel(expLevel != null ? expLevel.trim() : "ENTRY")
                            .verificationStatus(StudentProfile.VerificationStatus.VERIFIED)
                            .build();

                    studentProfileRepository.save(profile);
                    successCount++;

                } catch (Exception e) {
                    failureCount++;
                    String rowEmail = "";
                    try {
                        rowEmail = getCsvVal(columns, headerMap, "email");
                    } catch (Exception ignore) {}
                    errors.add(new BulkImportResponse.RowError(rowNum, rowEmail, e.getMessage()));
                    log.warn("Bulk import failed on row {}: {}", rowNum, e.getMessage());
                }
            }

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse student import CSV file", e);
            throw new BadRequestException("Invalid CSV parsing state: " + e.getMessage());
        }

        return BulkImportResponse.builder()
                .totalProcessed(totalProcessed)
                .successCount(successCount)
                .failureCount(failureCount)
                .errors(errors)
                .build();
    }

    private String getCsvVal(String[] columns, Map<String, Integer> headerMap, String key) {
        Integer idx = headerMap.get(key);
        if (idx == null || idx >= columns.length) {
            return "";
        }
        String val = columns[idx].trim();
        // Remove enclosing quotes if present
        if (val.startsWith("\"") && val.endsWith("\"") && val.length() > 1) {
            val = val.substring(1, val.length() - 1);
        }
        return val;
    }
}

