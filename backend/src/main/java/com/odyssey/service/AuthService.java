package com.odyssey.service;

import com.odyssey.dto.request.LoginRequest;
import com.odyssey.dto.request.RegisterRequest;
import com.odyssey.dto.request.VerifyOtpRequest;
import com.odyssey.dto.response.AuthResponse;
import com.odyssey.entity.*;
import com.odyssey.exception.BadRequestException;
import com.odyssey.exception.ResourceNotFoundException;
import com.odyssey.repository.*;
import com.odyssey.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CollegeRepository collegeRepository;
    private final CompanyRepository companyRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    private final FirebaseService firebaseService;
    private final EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Role validation - forbid self-assigning ADMIN
        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
            if (role == User.Role.ADMIN) {
                throw new BadRequestException("Self-registration as ADMIN is forbidden");
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role specified: " + request.getRole());
        }

        // 2. Duplicate email check
        var existingUserOpt = userRepository.findByEmail(email);
        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (user.getStatus() != AccountStatus.PENDING_VERIFICATION) {
                throw new BadRequestException("Email is already registered. Please sign in.");
            }
            // User exists but pending verification - update details
            user.setFullName(request.getFullName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(role);
            user = userRepository.save(user);
        } else {
            // Create new User in PENDING_VERIFICATION state
            user = User.builder()
                    .email(email)
                    .fullName(request.getFullName())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(role)
                    .status(AccountStatus.PENDING_VERIFICATION)
                    .active(true)
                    .emailVerified(false)
                    .build();
            user = userRepository.save(user);
            initProfile(user, role, request);
        }

        // 3. Generate secure 6-digit OTP code
        String otpCode = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        // 4. Remove previous OTPs for this email and save new OTP
        otpRepository.deleteByEmail(email);
        Otp otp = Otp.builder()
                .email(email)
                .code(otpCode)
                .expiryTime(expiryTime)
                .used(false)
                .build();
        otpRepository.save(otp);

        // 5. Send OTP Email
        emailService.sendVerificationOtp(email, otpCode);
        log.info("Registration initiated for {}. OTP code sent.", email);

        return Map.of(
            "email", email,
            "message", "Verification code sent to " + email
        );
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();

        Otp otp = otpRepository.findByEmailAndCodeAndUsedFalse(email, code)
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP code"));

        if (otp.isExpired()) {
            throw new BadRequestException("OTP code has expired. Please register or request a new code.");
        }

        // Mark OTP as used
        otp.setUsed(true);
        otpRepository.save(otp);

        // Activate User account
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        user.setStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        log.info("User {} successfully verified OTP and activated account.", email);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .profileId(getProfileId(user))
                .message("Verification successful")
                .build();
    }

    @Transactional
    public AuthResponse firebaseLogin(String idToken, String chosenRole) {
        try {
            var decodedToken = firebaseService.verifyToken(idToken);
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                // Determine role: use chosenRole if valid, else default to STUDENT
                User.Role role = User.Role.STUDENT;
                if (chosenRole != null) {
                    try {
                        role = User.Role.valueOf(chosenRole.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid role {} passed, defaulting to STUDENT", chosenRole);
                    }
                }

                // Auto-register new social users
                User newUser = User.builder()
                        .email(email)
                        .fullName(name != null ? name : email.split("@")[0])
                        .password(passwordEncoder.encode("FIREBASE_AUTH_" + Math.random())) // Random password
                        .role(role)
                        .status(AccountStatus.ACTIVE)
                        .build();
                newUser = userRepository.save(newUser);
                initProfile(newUser, role, new RegisterRequest());
                log.info("Auto-registered new Firebase user: {} as {}", email, role);
                return newUser;
            });

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtUtil.generateToken(userDetails, user.getRole().name());

            return AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .profileId(getProfileId(user))
                    .message("Login successful via Firebase")
                    .build();
        } catch (Exception e) {
            log.error("Firebase login failed", e);
            throw new BadRequestException("Invalid Firebase token: " + e.getMessage());
        }
    }


    private void initProfile(User user, User.Role role, RegisterRequest request) {
        switch (role) {
            case STUDENT -> {
                StudentProfile profile = StudentProfile.builder()
                        .user(user)
                        .build();
                if (request.getCollegeCode() != null) {
                    collegeRepository.findByCollegeCode(request.getCollegeCode())
                            .ifPresent(profile::setCollege);
                }
                studentProfileRepository.save(profile);
            }
            case COLLEGE_ADMIN -> {
                College college = College.builder()
                        .user(user)
                        .collegeName(request.getOrganizationName() != null ? request.getOrganizationName() : "Institution Name")
                        .collegeCode(request.getCollegeCode())
                        .verificationStatus(College.VerificationStatus.PENDING)
                        .build();
                collegeRepository.save(college);
            }
            case COMPANY -> {
                Company company = Company.builder()
                        .user(user)
                        .companyName(request.getOrganizationName() != null ? request.getOrganizationName() : "Company Name")
                        .verificationStatus(Company.VerificationStatus.PENDING)
                        .build();
                companyRepository.save(company);
            }
            default -> log.warn("Unknown role {} for profile initialization", role);
        }
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getStatus() == AccountStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Email not verified. Please verify your email first.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        Long profileId = getProfileId(user);

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .profileId(profileId)
                .build();
    }

    private Long getProfileId(User user) {
        return switch (user.getRole()) {
            case STUDENT -> studentProfileRepository.findByUserId(user.getId())
                    .map(StudentProfile::getId).orElse(null);
            case COLLEGE_ADMIN -> collegeRepository.findByUserId(user.getId())
                    .map(College::getId).orElse(null);
            case COMPANY -> companyRepository.findByUserId(user.getId())
                    .map(Company::getId).orElse(null);
            default -> null;
        };
    }
}
