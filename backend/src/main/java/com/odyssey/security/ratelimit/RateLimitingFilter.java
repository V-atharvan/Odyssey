package com.odyssey.security.ratelimit;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filter that intercepts incoming servlet requests to enforce rate limits per IP.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitingFilter implements Filter {

    // Map of clientKey (IP + ":" + category) -> RateLimitBucket
    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    // Rate Limit Configurations
    private static final double AUTH_CAPACITY = 5.0;
    private static final double AUTH_REFILL_RATE = 5.0 / 900.0; // 5 requests per 15 mins (900s)

    private static final double UPLOAD_CAPACITY = 5.0;
    private static final double UPLOAD_REFILL_RATE = 5.0 / 60.0; // 5 requests per minute

    private static final double GENERAL_CAPACITY = 60.0;
    private static final double GENERAL_REFILL_RATE = 60.0 / 60.0; // 60 requests per minute

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // No init needed
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (!(request instanceof HttpServletRequest) || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();
        
        // Exclude Swagger, Actuator, or public static assets if needed, but let's rate limit all API calls
        if (!path.startsWith("/api")) {
            chain.doFilter(request, response);
            return;
        }

        String ip = getClientIp(httpRequest);
        String category = determineLimitCategory(path);
        String key = ip + ":" + category;

        RateLimitBucket bucket = buckets.computeIfAbsent(key, k -> createBucketForCategory(category));

        if (!bucket.tryConsume()) {
            long waitTimeMs = bucket.getResetTimeMs();
            long retryAfterSeconds = Math.max(1, (long) Math.ceil(waitTimeMs / 1000.0));

            log.warn("Rate limit exceeded for IP: {} on path: {} (Category: {})", ip, path, category);

            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(String.format(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again in %d seconds.\",\"data\":null}",
                    retryAfterSeconds
            ));
            return;
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // No cleanup needed
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private String determineLimitCategory(String path) {
        if (path.startsWith("/api/auth")) {
            return "auth";
        } else if (path.startsWith("/api/files/upload") || path.startsWith("/api/colleges/upload-media")) {
            return "upload";
        }
        return "general";
    }

    private RateLimitBucket createBucketForCategory(String category) {
        switch (category) {
            case "auth":
                return new RateLimitBucket(AUTH_CAPACITY, AUTH_REFILL_RATE);
            case "upload":
                return new RateLimitBucket(UPLOAD_CAPACITY, UPLOAD_REFILL_RATE);
            default:
                return new RateLimitBucket(GENERAL_CAPACITY, GENERAL_REFILL_RATE);
        }
    }
}
