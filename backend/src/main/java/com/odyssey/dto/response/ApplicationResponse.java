package com.odyssey.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ApplicationResponse {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String pitch;
    private String status;
    private LocalDateTime appliedAt;
    private String studentSkills;
    private double studentPerformanceScore;
    private String studentProfileImageUrl;
}
