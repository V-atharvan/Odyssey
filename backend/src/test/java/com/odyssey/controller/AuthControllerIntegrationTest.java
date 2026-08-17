package com.odyssey.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.odyssey.dto.request.LoginRequest;
import com.odyssey.dto.request.RegisterRequest;
import com.odyssey.dto.request.VerifyOtpRequest;
import com.odyssey.entity.AccountStatus;
import com.odyssey.entity.Otp;
import com.odyssey.entity.User;
import com.odyssey.repository.OtpRepository;
import com.odyssey.repository.UserRepository;
import com.odyssey.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        otpRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Complete Traditional Auth Integration Lifecycle: Register -> Send OTP -> Verify OTP -> Login -> Suspension Block")
    void testCompleteAuthenticationLifecycle() throws Exception {
        String testEmail = "lifecycle@test.com";

        // 1. Register
        RegisterRequest regReq = new RegisterRequest();
        regReq.setFullName("Lifecycle Student");
        regReq.setEmail(testEmail);
        regReq.setPassword("Password123!");
        regReq.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(testEmail));

        // Verify User created in PENDING_VERIFICATION state
        User user = userRepository.findByEmail(testEmail).orElseThrow();
        assertEquals(AccountStatus.PENDING_VERIFICATION, user.getStatus());

        // Verify OTP persisted
        Otp otp = otpRepository.findAll().stream()
                .filter(o -> o.getEmail().equals(testEmail))
                .findFirst()
                .orElseThrow();
        assertFalse(otp.isUsed());
        String otpCode = otp.getCode();

        // 2. Login BEFORE OTP Verification should fail
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 3. Verify OTP
        VerifyOtpRequest verifyReq = new VerifyOtpRequest();
        verifyReq.setEmail(testEmail);
        verifyReq.setCode(otpCode);

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.email").value(testEmail));

        // Verify User is now ACTIVE
        user = userRepository.findByEmail(testEmail).orElseThrow();
        assertEquals(AccountStatus.ACTIVE, user.getStatus());
        assertTrue(user.isEmailVerified());

        // 4. Login AFTER OTP Verification should succeed
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists());

        // 5. Suspend User and test login rejection
        user.setStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isBadRequest());
    }
}
