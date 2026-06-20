package com.odyssey.service;

import com.odyssey.dto.request.CreateReviewRequest;
import com.odyssey.dto.response.ReviewResponse;
import com.odyssey.entity.*;
import com.odyssey.exception.ResourceNotFoundException;
import com.odyssey.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

        private final ReviewRepository reviewRepository;
        private final CompanyRepository companyRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final ProjectRepository projectRepository;
        private final UserRepository userRepository;

        @Transactional
        public ReviewResponse createReview(String companyEmail, CreateReviewRequest request) {
                User user = userRepository.findByEmail(companyEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                Company company = companyRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

                StudentProfile student = studentProfileRepository.findById(request.getStudentId())
                                .orElseThrow(() -> new ResourceNotFoundException("Student", request.getStudentId()));

                Project project = projectRepository.findById(request.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException("Project", request.getProjectId()));

                Review review = Review.builder()
                                .company(company)
                                .student(student)
                                .project(project)
                                .rating(request.getRating())
                                .comment(request.getComment())
                                .build();

                review = reviewRepository.save(review);

                // Update student performance score
                Double avgRating = reviewRepository.findAverageRatingByStudentId(student.getId());
                if (avgRating != null) {
                        student.setPerformanceScore(Math.round(avgRating * 20.0) / 100.0 * 100); // Convert 1-5 to 0-100
                        studentProfileRepository.save(student);
                }

                log.info("Review created for student {} by company {}", student.getId(), company.getId());
                return mapToResponse(review);
        }

        public List<ReviewResponse> getStudentReviews(Long studentId) {
                return reviewRepository.findByStudentId(studentId).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<ReviewResponse> getStudentReviewsByEmail(String email) {
                return reviewRepository.findByStudentEmail(email).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        private ReviewResponse mapToResponse(Review r) {
                return ReviewResponse.builder()
                                .id(r.getId())
                                .companyName(r.getCompany().getCompanyName())
                                .studentName(r.getStudent().getUser().getFullName())
                                .projectTitle(r.getProject().getTitle())
                                .rating(r.getRating())
                                .comment(r.getComment())
                                .createdAt(r.getCreatedAt())
                                .build();
        }
}
