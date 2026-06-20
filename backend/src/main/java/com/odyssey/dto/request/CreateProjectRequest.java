package com.odyssey.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    private String requirements;
    private List<String> skillsRequired;
    private String experienceLevelRequired;

    @NotNull(message = "Duration in weeks is required")
    @Positive(message = "Duration must be positive")
    private Integer durationWeeks;

    private Integer maxApplicants;
    private LocalDateTime deadline;
}
