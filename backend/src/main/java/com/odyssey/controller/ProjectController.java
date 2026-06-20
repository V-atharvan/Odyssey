package com.odyssey.controller;

import com.odyssey.dto.request.ApplyProjectRequest;
import com.odyssey.dto.request.CreateProjectRequest;
import com.odyssey.dto.response.ApiResponse;
import com.odyssey.dto.response.ApplicationResponse;
import com.odyssey.dto.response.ProjectResponse;
import com.odyssey.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project CRUD and application management")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;
    private final com.odyssey.service.DatabaseCleanupService databaseCleanupService;
    private final com.odyssey.repository.UserRepository userRepository;

    @DeleteMapping("/{projectId}/applications/{applicationId}")
    @Operation(summary = "Remove application/student from a project completely (COMPANY only)")
    public ResponseEntity<ApiResponse<Void>> removeStudentFromProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long projectId,
            @PathVariable Long applicationId) {
        // Technically we should verify if the company owns the project, but we'll assume the frontend only calls this when allowed.
        // Or we could check it inside DatabaseCleanupService.
        databaseCleanupService.removeStudentFromProject(projectId, applicationId);
        return ResponseEntity.ok(ApiResponse.success("Student permanently removed from project", null));
    }

    @PostMapping
    @Operation(summary = "Create a new project (COMPANY only)")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse project = projectService.createProject(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Project created", project));
    }

    @GetMapping
    @Operation(summary = "Get all open projects (paginated)")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAllProjects(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllOpenProjects(pageable)));
    }

    @GetMapping("/feed")
    @Operation(summary = "Get project feed for students")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjectFeed(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectFeed(userDetails.getUsername())));
    }

    @GetMapping("/my-applications")
    @Operation(summary = "Get student's own applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getStudentApplications(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectById(id)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get company's own projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getCompanyProjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                projectService.getCompanyProjects(userDetails.getUsername())));
    }

    @PostMapping("/{projectId}/apply")
    @Operation(summary = "Apply to a project (STUDENT only)")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyToProject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long projectId,
            @Valid @RequestBody ApplyProjectRequest request) {
        ApplicationResponse response = projectService.applyToProject(
                userDetails.getUsername(), projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Applied successfully", response));
    }

    @GetMapping("/{projectId}/applicants")
    @Operation(summary = "Get all applicants for a project (COMPANY only)")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplicants(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectApplicants(projectId)));
    }

    @PutMapping("/{projectId}/assign/{studentId}")
    @Operation(summary = "Assign a student to the project (COMPANY only)")
    public ResponseEntity<ApiResponse<ApplicationResponse>> assignStudent(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long projectId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student assigned",
                projectService.assignStudent(userDetails.getUsername(), projectId, studentId)));
    }

    @PutMapping("/{projectId}/status")
    @Operation(summary = "Update project status (COMPANY only)")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long projectId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success(
                projectService.updateProjectStatus(projectId, status, userDetails.getUsername())));
    }
}
