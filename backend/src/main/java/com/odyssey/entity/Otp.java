package com.odyssey.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Builder.Default
    private boolean used = false;
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }
}
