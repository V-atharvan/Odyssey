package com.odyssey.controller;

import com.odyssey.dto.request.UpdateCollegeProfileRequest;
import com.odyssey.dto.response.ApiResponse;
import com.odyssey.dto.response.CollegeProfileResponse;
import com.odyssey.dto.response.StudentProfileResponse;
import com.odyssey.entity.College;
import com.odyssey.entity.User;
import com.odyssey.exception.ResourceNotFoundException;
import com.odyssey.repository.CollegeRepository;
import com.odyssey.repository.UserRepository;
import com.odyssey.service.CollegeService;
import com.odyssey.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/colleges")
@RequiredArgsConstructor
@Tag(name = "College", description = "College admin operations")
@SecurityRequirement(name = "bearerAuth")
public class CollegeController {

    private final CollegeService collegeService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final com.odyssey.repository.StudentProfileRepository studentProfileRepository;
    private final com.odyssey.service.DatabaseCleanupService databaseCleanupService;

    // -------------------------------------------------------
    // EXISTING ENDPOINTS (UNCHANGED)
    // -------------------------------------------------------

    @DeleteMapping("/students/{studentId}")
    @Operation(summary = "Hard delete a student account completely from the database")
    public ResponseEntity<ApiResponse<Void>> deleteStudentAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long studentId) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        College college = collegeRepository.findByUserId(user.getId()).orElseThrow();
        com.odyssey.entity.StudentProfile student = studentProfileRepository.findById(studentId).orElseThrow();
        if (student.getCollege() == null || !student.getCollege().getId().equals(college.getId())) {
             throw new IllegalArgumentException("You can only delete students belonging to your institution");
        }
        databaseCleanupService.deleteStudentAccount(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student permanently deleted", null));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update college admin profile — supports all 7 registration steps")
    public ResponseEntity<ApiResponse<CollegeProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateCollegeProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("College profile updated",
                collegeService.updateProfile(userDetails.getUsername(), request)));
    }

    @GetMapping("/students")
    @Operation(summary = "Get all students registered under this college")
    public ResponseEntity<ApiResponse<List<StudentProfileResponse>>> getStudents(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                collegeService.getCollegeStudents(userDetails.getUsername())));
    }

    @GetMapping("/students/pending")
    @Operation(summary = "Get pending students")
    public ResponseEntity<ApiResponse<List<StudentProfileResponse>>> getPendingStudents(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                collegeService.getPendingStudents(userDetails.getUsername())));
    }

    @PutMapping("/students/{studentId}/verify")
    @Operation(summary = "Verify or reject a student profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> verifyStudent(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long studentId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Student status updated",
                collegeService.verifyStudent(userDetails.getUsername(), studentId, status)));
    }

    @PutMapping("/students/{studentId}/toggle-status")
    @Operation(summary = "Toggle student active/suspended status")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> toggleStudentStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student active status updated",
                collegeService.toggleStudentStatus(userDetails.getUsername(), studentId)));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get college dashboard analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                collegeService.getDashboard(userDetails.getUsername())));
    }

    // -------------------------------------------------------
    // NEW ENDPOINTS
    // -------------------------------------------------------

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated college admin's own profile (used for Save & Continue Later)")
    public ResponseEntity<ApiResponse<CollegeProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                collegeService.getMyProfile(userDetails.getUsername())));
    }

    @PostMapping("/upload-media")
    @Operation(summary = "Upload college logo or banner image to S3")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMedia(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {

        String subDir = "colleges/" + (type.equalsIgnoreCase("logo") ? "logo" : "banner");
        String url = fileStorageService.storeFile(file, subDir);

        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        College college = collegeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("College not found"));

        if ("logo".equalsIgnoreCase(type)) {
            college.setLogoUrl(url);
        } else if ("banner".equalsIgnoreCase(type)) {
            college.setBannerUrl(url);
        }
        collegeRepository.save(college);

        return ResponseEntity.ok(ApiResponse.success(
                "Media uploaded successfully",
                Map.of("url", url, "type", type)));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(collegeService.getAnalytics(userDetails.getUsername())));
    }

    @GetMapping("/top-performers")
    public ResponseEntity<ApiResponse<List<StudentProfileResponse>>> getTopPerformers(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(collegeService.getTopPerformers(userDetails.getUsername(), limit)));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(collegeService.getCollegeProjects(userDetails.getUsername())));
    }



    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCompanies(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(collegeService.getCompanies(userDetails.getUsername())));
    }

    @GetMapping("/requests/companies")
    @Operation(summary = "Get pending company partnership requests")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCompanyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(collegeService.getCompanyRequests(userDetails.getUsername())));
    }

    @PutMapping("/requests/companies/{partnershipId}")
    @Operation(summary = "Update partnership status (ACCEPTED / REJECTED)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePartnershipStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long partnershipId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success(
                collegeService.updatePartnershipStatus(userDetails.getUsername(), partnershipId, status)));
    }

    @PutMapping("/companies/{companyId}/toggle-approval")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleCompanyApproval(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long companyId) {
        return ResponseEntity.ok(ApiResponse.success(collegeService.toggleCompanyApproval(userDetails.getUsername(), companyId)));
    }

    @PostMapping(value = "/students/bulk-import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import student user accounts and profiles via CSV file")
    public ResponseEntity<ApiResponse<com.odyssey.dto.response.BulkImportResponse>> importStudents(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Bulk student import execution finished",
                collegeService.importStudentsBulk(userDetails.getUsername(), file)));
    }
}

