package com.odyssey.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "colleges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = true, name = "institution_name")
    private String collegeName;

    @Column(nullable = true, name = "short_name")
    private String shortName;

    @Column(unique = true)
    private String collegeCode;

    private String website;
    
    @Embedded
    private Address address;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String logoUrl;
    private String bannerUrl;
    private String contactPhone;

    // New Fields
    private Integer establishmentYear;
    private String universityAffiliation;
    private String accreditation;
    
    // Admin Info
    private String adminName;
    private String adminDesignation;

    // Academic Info
    @ElementCollection
    private List<String> coursesOffered;
    
    @ElementCollection
    private List<String> departments;
    
    private Long totalStudents;

    // Platform Preferences
    @Column(columnDefinition = "boolean default false")
    private Boolean talentShowcase;
    
    @Column(columnDefinition = "boolean default false")
    private Boolean internshipParticipation;
    
    @Column(columnDefinition = "boolean default false")
    private Boolean eventsParticipation;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    // Registration Progress Tracking (for "Save & Continue Later")
    @Column(columnDefinition = "integer default 3")
    @Builder.Default
    private Integer registrationStep = 3;

    @OneToMany(mappedBy = "college", fetch = FetchType.LAZY)
    private List<StudentProfile> students;

    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED
    }
}
