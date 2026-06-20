package com.odyssey.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class UpdateCollegeProfileRequest {

    // Step 3: Basic Profile
    private String collegeName;
    private String shortName;
    private Integer establishmentYear;
    private String universityAffiliation;
    private String accreditation;
    private String website;
    private String description;

    // Address
    private String country;
    private String state;
    private String city;
    private String pincode;

    // Admin Info
    private String adminName;
    private String adminDesignation;
    private String contactPhone;

    // Step 4: Academic Info
    private List<String> coursesOffered;
    private List<String> departments;
    private Long totalStudents;

    // Step 5: Platform Preferences
    private Boolean talentShowcase;
    private Boolean internshipParticipation;
    private Boolean eventsParticipation;

    // Step 6: Media (URLs after upload — upload is separate endpoint)
    private String logoUrl;
    private String bannerUrl;

    // Step 7: Terms accepted
    private Boolean termsAccepted;

    private Integer registrationStep;

    // Legacy fields kept for backward compatibility
    private String collegeCode;
    private String location;      // old combined location → maps to address.city fallback
    private String institutionName; // old alias → maps to collegeName
}
