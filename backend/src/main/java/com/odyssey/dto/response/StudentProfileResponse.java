package com.odyssey.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class StudentProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String bio;
    private String skills;
    private String experienceLevel;
    private String department;
    private String degree;
    private Integer graduationYear;
    private String resumeUrl;
    private String profileImageUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private double performanceScore;
    private int completedProjects;
    private String verificationStatus;
    private String collegeName;
    private Long collegeId;
    private boolean active;
}
