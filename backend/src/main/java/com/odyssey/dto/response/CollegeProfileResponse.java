package com.odyssey.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CollegeProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;

    // Basic Info
    private String collegeName;
    private String shortName;
    private String collegeCode;
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
    private String location; // backward compat combined string e.g. "Solapur, Maharashtra"

    // Admin Info
    private String adminName;
    private String adminDesignation;
    private String contactPhone;

    // Academic
    private List<String> coursesOffered;
    private List<String> departments;
    private Long totalStudents;

    // Platform Preferences
    private Boolean talentShowcase;
    private Boolean internshipParticipation;
    private Boolean eventsParticipation;

    // Media
    private String logoUrl;
    private String bannerUrl;

    // Status
    private String verificationStatus;
    private int registrationStep; // 1-7, used by frontend for "Save & Continue Later"
}
