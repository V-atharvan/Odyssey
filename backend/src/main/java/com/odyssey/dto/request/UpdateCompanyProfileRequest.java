package com.odyssey.dto.request;

import lombok.Data;

@Data
public class UpdateCompanyProfileRequest {
    private String companyName;
    private String website;
    private String industry;
    private String description;
    private String logoUrl;
}
