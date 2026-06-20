package com.odyssey.controller;

import com.odyssey.dto.request.UpdateStudentProfileRequest;
import com.odyssey.dto.response.ApiResponse;
import com.odyssey.dto.response.ApplicationResponse;
import com.odyssey.dto.response.ProjectResponse;
import com.odyssey.dto.response.StudentProfileResponse;
import com.odyssey.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Student", description = "Student profile and project operations")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    @Operation(summary = "Get current student's profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.getProfile(userDetails.getUsername())));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update student profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateStudentProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.updateProfile(userDetails.getUsername(), request)));
    }

    @GetMapping("/jobs")
    @Operation(summary = "Get matched jobs from partnered colleges")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getProjectsForStudent(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.getProjectsForStudent(userDetails.getUsername(), pageable)));
    }

    @GetMapping("/applications")
    @Operation(summary = "Get all applications by the student")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.getApplications(userDetails.getUsername())));
    }

    @GetMapping("/portfolio/{studentId}")
    @Operation(summary = "View a student's public portfolio")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getPortfolio(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getPortfolio(studentId)));
    }

    @GetMapping("/colleges/search")
    @Operation(summary = "Search partnered colleges")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> searchColleges(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(ApiResponse.success(studentService.searchColleges(query)));
    }

    @GetMapping("/colleges/{id}/departments")
    @Operation(summary = "Get departments from a linked college")
    public ResponseEntity<ApiResponse<List<String>>> getCollegeDepartments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getCollegeDepartments(id)));
    }

    @GetMapping("/colleges/{id}/courses")
    @Operation(summary = "Get courses offered by a linked college")
    public ResponseEntity<ApiResponse<List<String>>> getCollegeCourses(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getCollegeCourses(id)));
    }

    @GetMapping("/assessments")
    @Operation(summary = "Get all available student skill assessment tests")
    public ResponseEntity<ApiResponse<List<com.odyssey.dto.response.AssessmentDto>>> getAvailableAssessments() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAvailableAssessments()));
    }

    @PostMapping("/assessments/submit")
    @Operation(summary = "Submit assessment choices and calculate pass/fail scorecard results")
    public ResponseEntity<ApiResponse<com.odyssey.dto.response.AssessmentResultDto>> submitAssessment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody com.odyssey.dto.request.AssessmentSubmitDto submission) {
        return ResponseEntity.ok(ApiResponse.success("Assessment graded successfully",
                studentService.submitAssessment(userDetails.getUsername(), submission)));
    }
}
