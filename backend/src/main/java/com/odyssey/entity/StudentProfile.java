package com.odyssey.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "student_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    private College college;

    @Column(name = "college_name")
    private String collegeName;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "portfolio_link")
    private String portfolioLink;

    @Column(name = "linkedin_link")
    private String linkedinLink;

    @Column(name = "github_link")
    private String githubLink;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String experienceLevel;
    private String department;
    private String degree;
    private Integer graduationYear;

    @Builder.Default
    private double performanceScore = 0.0;

    @Builder.Default
    private int completedProjects = 0;

    @Builder.Default
    @Column(name = "total_earnings")
    private Double totalEarnings = 0.0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private List<ProjectApplication> applications;

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private List<Review> reviews;

    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED
    }
}
