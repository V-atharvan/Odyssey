package com.odyssey.controller;

import com.odyssey.dto.request.CreateReviewRequest;
import com.odyssey.dto.response.ApiResponse;
import com.odyssey.dto.response.ReviewResponse;
import com.odyssey.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Company reviews for students")
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Create a review for a student (COMPANY only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse review = reviewService.createReview(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Review submitted", review));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get all reviews for a student")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getStudentReviews(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getStudentReviews(studentId)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get reviews for currently authenticated student")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getStudentReviewsByEmail(userDetails.getUsername())));
    }
}
