package com.odyssey.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address {
    private String country;
    private String state;
    private String city;
    private String pincode;
}
