package com.odyssey.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FirebaseLoginRequest {
    @NotBlank
    private String idToken;

    private String role; // Optional: role chosen during registration
}
