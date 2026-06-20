package com.odyssey.controller;

import com.odyssey.dto.request.UpdateCompanyProfileRequest;
import com.odyssey.dto.response.ApiResponse;
import com.odyssey.dto.response.CompanyProfileResponse;
import com.odyssey.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "Company", description = "Company profile and dashboard operations")
@SecurityRequirement(name = "bearerAuth")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/profile")
    @Operation(summary = "Get current company's profile")
    public ResponseEntity<ApiResponse<CompanyProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Company profile retrieved",
                companyService.getProfile(userDetails.getUsername())));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update company profile")
    public ResponseEntity<ApiResponse<CompanyProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateCompanyProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Company profile updated",
                companyService.updateProfile(userDetails.getUsername(), request)));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get company dashboard analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.getDashboard(userDetails.getUsername())));
    }

    @GetMapping("/colleges/search")
    @Operation(summary = "Search colleges to partner with")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchColleges(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(ApiResponse.success(companyService.searchColleges(query)));
    }

    @PostMapping("/requests/college/{collegeId}")
    @Operation(summary = "Send partnership request to a college")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendPartnershipRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long collegeId) {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.sendPartnershipRequest(userDetails.getUsername(), collegeId)));
    }

    @GetMapping("/requests/sent")
    @Operation(summary = "Get all sent partnership requests")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSentRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.getSentRequests(userDetails.getUsername())));
    }
}
