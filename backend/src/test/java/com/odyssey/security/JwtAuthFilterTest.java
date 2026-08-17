package com.odyssey.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private JwtAuthFilter jwtAuthFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "MySuperSecretTestKeyThatIsVeryLongAndSecureForHS25612345");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
        jwtAuthFilter = new JwtAuthFilter(jwtUtil, userDetailsService);
    }

    @Test
    @DisplayName("Should authenticate active user with valid JWT")
    void testDoFilterInternal_ActiveUser_Success() throws Exception {
        String username = "active@test.com";

        UserDetails userDetails = User.builder()
                .username(username)
                .password("password")
                .authorities(List.of())
                .disabled(false)
                .build();

        String token = jwtUtil.generateToken(userDetails, "STUDENT");

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(username, SecurityContextHolder.getContext().getAuthentication().getName());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should reject authentication for suspended/disabled user with valid JWT signature")
    void testDoFilterInternal_SuspendedUser_Rejected() throws Exception {
        String username = "suspended@test.com";

        UserDetails activeDetailsToGenToken = User.builder()
                .username(username)
                .password("password")
                .authorities(List.of())
                .disabled(false)
                .build();

        // Generate token when user was active
        String token = jwtUtil.generateToken(activeDetailsToGenToken, "STUDENT");

        UserDetails suspendedUserDetails = User.builder()
                .username(username)
                .password("password")
                .authorities(List.of())
                .disabled(true) // User is now suspended/disabled
                .build();

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(suspendedUserDetails);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        // SecurityContextHolder must remain null because account is disabled/suspended
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}

