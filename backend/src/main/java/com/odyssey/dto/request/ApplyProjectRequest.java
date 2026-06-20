package com.odyssey.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplyProjectRequest {

    @NotBlank(message = "Pitch is required")
    private String pitch;
}
