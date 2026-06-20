package com.odyssey.dto.response;

import com.odyssey.entity.User;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private Long profileId; // studentProfileId / collegeId / companyId
    private String message;
}
