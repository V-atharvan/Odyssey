package com.odyssey.config;

import com.odyssey.entity.AccountStatus;
import com.odyssey.entity.User;
import com.odyssey.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "v.atharvanadmin@gmail.com";
        
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            log.info("Seeding main portal admin user: {}", adminEmail);
            
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("aaaaaaaa"))
                    .fullName("Atharva | Odyssey Architect")
                    .role(User.Role.ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .active(true)
                    .emailVerified(true)
                    .build();
            
            userRepository.save(admin);
            log.info("Main portal admin user created successfully.");
        } else {
            log.info("Main portal admin user already exists.");
        }
    }
}
