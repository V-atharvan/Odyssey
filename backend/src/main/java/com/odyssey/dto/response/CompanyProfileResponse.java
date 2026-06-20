package com.odyssey.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class CompanyProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String companyName;
    private String website;
    private String industry;
    private String description;
    private String logoUrl;
    private String verificationStatus;
}
