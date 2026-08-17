package com.odyssey.controller;

import com.odyssey.dto.request.LoginRequest;
import com.odyssey.dto.response.ApiResponse;
import com.odyssey.dto.response.AuthResponse;
import com.odyssey.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and Registration endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Initiate email registration and receive verification OTP")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> register(@Valid @RequestBody com.odyssey.dto.request.RegisterRequest request) {
        java.util.Map<String, String> result = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Registration initiated. OTP code sent.", result));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP code and complete account activation")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody com.odyssey.dto.request.VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend a fresh OTP verification code to unverified user")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> resendOtp(@RequestParam String email) {
        java.util.Map<String, String> result = authService.resendOtp(email);
        return ResponseEntity.ok(ApiResponse.success("New OTP code sent", result));
    }

    @PostMapping("/firebase-login")
    @Operation(summary = "Login using Firebase ID token (Google, etc.)")
    public ResponseEntity<ApiResponse<AuthResponse>> firebaseLogin(@Valid @RequestBody com.odyssey.dto.request.FirebaseLoginRequest request) {
        AuthResponse response = authService.firebaseLogin(request.getIdToken(), request.getRole());
        return ResponseEntity.ok(ApiResponse.success("Firebase login successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
