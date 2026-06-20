package com.odyssey.repository;

import com.odyssey.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailAndCodeAndUsedFalse(String email, String code);
    void deleteByEmail(String email);
}
