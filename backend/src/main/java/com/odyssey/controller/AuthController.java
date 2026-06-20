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
