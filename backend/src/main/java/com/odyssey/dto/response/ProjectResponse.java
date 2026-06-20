package com.odyssey.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class ProjectResponse {
    private Long id;
    private String title;
    private String category;
    private String description;
    private String requirements;
    private List<String> skillsRequired;
    private String experienceLevelRequired;
    private Integer durationWeeks;
    private String status;
    private int maxApplicants;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private int applicantsCount;
    private double matchScore;
}
