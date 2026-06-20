package com.odyssey.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReviewRequest {

    @NotNull
    private Long studentId;

    @NotNull
    private Long projectId;

    @Min(1) @Max(5)
    private int rating;

    private String comment;
}
