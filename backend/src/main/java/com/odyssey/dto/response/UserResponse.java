package com.odyssey.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String status;
    private boolean active;
    private String verificationStatus; // For COLLEGE_ADMIN and COMPANY
    private Long profileId; // The ID of the College or Company profile
}
