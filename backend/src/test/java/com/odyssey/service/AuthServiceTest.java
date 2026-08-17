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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private CollegeRepository collegeRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private OtpRepository otpRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserDetailsService userDetailsService;
    private FirebaseService firebaseService;
    @Mock
    private EmailService emailService;

    private AuthService authService;

    private RegisterRequest studentRegisterReq;
    private User studentUser;
    private Otp validOtp;

    @BeforeEach
    void setUp() {
        firebaseService = new FirebaseService();
        jwtUtil = new JwtUtil();
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtil, "secret", "MySuperSecretTestKeyThatIsVeryLongAndSecureForHS25612345");
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);

        authService = new AuthService(
                userRepository,
                studentProfileRepository,
                collegeRepository,
                companyRepository,
                otpRepository,
                passwordEncoder,
                jwtUtil,
                authenticationManager,
                userDetailsService,
                firebaseService,
                emailService
        );

        studentRegisterReq = new RegisterRequest();
        studentRegisterReq.setFullName("Test Student");
        studentRegisterReq.setEmail("student@test.com");
        studentRegisterReq.setPassword("Password123!");
        studentRegisterReq.setRole("STUDENT");

        studentUser = User.builder()
                .id(1L)
                .email("student@test.com")
                .fullName("Test Student")
                .password("hashed_password")
                .role(User.Role.STUDENT)
                .status(AccountStatus.PENDING_VERIFICATION)
                .active(true)
                .emailVerified(false)
                .build();

        validOtp = Otp.builder()
                .id(10L)
                .email("student@test.com")
                .code("123456")
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();
    }

    @Test
    @DisplayName("Should successfully initiate traditional student registration and send OTP")
    void testRegister_Success() {
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        Map<String, String> response = authService.register(studentRegisterReq);

        assertNotNull(response);
        assertEquals("student@test.com", response.get("email"));
        verify(otpRepository).save(any(Otp.class));
        verify(emailService).sendVerificationOtp(eq("student@test.com"), anyString());
    }

    @Test
    @DisplayName("Should reject registration with self-assigned ADMIN role")
    void testRegister_AdminRole_Forbidden() {
        studentRegisterReq.setRole("ADMIN");

        assertThrows(BadRequestException.class, () -> authService.register(studentRegisterReq));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject registration for already active email")
    void testRegister_DuplicateEmail() {
        studentUser.setStatus(AccountStatus.ACTIVE);
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(studentUser));

        assertThrows(BadRequestException.class, () -> authService.register(studentRegisterReq));
    }

    @Test
    @DisplayName("Should successfully verify OTP and activate account")
    void testVerifyOtp_Success() {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("student@test.com");
        req.setCode("123456");

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username("student@test.com")
                .password("hashed_password")
                .authorities("ROLE_STUDENT")
                .build();

        when(otpRepository.findByEmailAndCodeAndUsedFalse("student@test.com", "123456"))
                .thenReturn(Optional.of(validOtp));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(studentUser));
        when(userDetailsService.loadUserByUsername("student@test.com")).thenReturn(userDetails);

        AuthResponse res = authService.verifyOtp(req);

        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("student@test.com", res.getEmail());
        assertTrue(validOtp.isUsed());
        assertEquals(AccountStatus.ACTIVE, studentUser.getStatus());
        assertTrue(studentUser.isEmailVerified());
    }

    @Test
    @DisplayName("Should reject invalid or non-existent OTP")
    void testVerifyOtp_InvalidCode() {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("student@test.com");
        req.setCode("999999");

        when(otpRepository.findByEmailAndCodeAndUsedFalse("student@test.com", "999999"))
                .thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> authService.verifyOtp(req));
    }

    @Test
    @DisplayName("Should reject expired OTP code")
    void testVerifyOtp_ExpiredCode() {
        validOtp.setExpiryTime(LocalDateTime.now().minusMinutes(1));
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("student@test.com");
        req.setCode("123456");

        when(otpRepository.findByEmailAndCodeAndUsedFalse("student@test.com", "123456"))
                .thenReturn(Optional.of(validOtp));

        assertThrows(BadRequestException.class, () -> authService.verifyOtp(req));
    }
}
