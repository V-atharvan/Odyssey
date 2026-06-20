package com.odyssey.controller;

import com.odyssey.dto.response.ApiResponse;
import com.odyssey.dto.response.UserResponse;
import com.odyssey.entity.User;
import com.odyssey.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin platform management")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;
    private final com.odyssey.service.DatabaseCleanupService databaseCleanupService;
    private final com.odyssey.repository.UserRepository userRepository;

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Hard delete a user from the entire database")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (user.getRole() == User.Role.COMPANY) {
            databaseCleanupService.deleteCompanyAndUser(userId);
        } else if (user.getRole() == User.Role.COLLEGE_ADMIN) {
            databaseCleanupService.deleteCollegeAndUser(userId);
        } else {
            throw new IllegalArgumentException("Can only hard delete Companies and Colleges from Admin panel");
        }
        return ResponseEntity.ok(ApiResponse.success("User permanently deleted", null));
    }

    @DeleteMapping("/system/purge/all")
    @Operation(summary = "Purge entire database (DANGEROUS)")
    public ResponseEntity<ApiResponse<Void>> purgeAll() {
        databaseCleanupService.purgeAll();
        return ResponseEntity.ok(ApiResponse.success("Database purged", null));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all platform users (paginated)")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String role,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(role, pageable)));
    }

    @PutMapping("/users/{userId}/toggle-status")
    @Operation(summary = "Enable/Disable a user account")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User status updated",
                adminService.toggleUserStatus(userId)));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get platform-wide analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPlatformAnalytics()));
    }

    @PutMapping("/companies/{companyId}/verify")
    @Operation(summary = "Verify a company")
    public ResponseEntity<ApiResponse<Void>> verifyCompany(@PathVariable Long companyId) {
        adminService.verifyCompany(companyId);
        return ResponseEntity.ok(ApiResponse.success("Company verified", null));
    }

    @PutMapping("/colleges/{collegeId}/verify")
    @Operation(summary = "Verify a college")
    public ResponseEntity<ApiResponse<Void>> verifyCollege(@PathVariable Long collegeId) {
        adminService.verifyCollege(collegeId);
        return ResponseEntity.ok(ApiResponse.success("College verified", null));
    }

    @PutMapping("/colleges/{collegeId}/reject")
    @Operation(summary = "Reject a college")
    public ResponseEntity<ApiResponse<Void>> rejectCollege(@PathVariable Long collegeId) {
        adminService.rejectCollege(collegeId);
        return ResponseEntity.ok(ApiResponse.success("College rejected", null));
    }

    @PutMapping("/companies/{companyId}/reject")
    @Operation(summary = "Reject a company")
    public ResponseEntity<ApiResponse<Void>> rejectCompany(@PathVariable Long companyId) {
        adminService.rejectCompany(companyId);
        return ResponseEntity.ok(ApiResponse.success("Company rejected", null));
    }
}
