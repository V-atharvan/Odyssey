package com.odyssey.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdateStudentProfileRequest {
    private String bio;
    private String skills;
    private String experienceLevel;
    private String department;
    private String degree;
    private Integer graduationYear;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String resumeUrl;
    private String profileImageUrl;
    private Long collegeId;
}
