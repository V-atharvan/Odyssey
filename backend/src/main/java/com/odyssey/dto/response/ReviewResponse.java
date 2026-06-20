package com.odyssey.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String companyName;
    private String studentName;
    private String projectTitle;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
