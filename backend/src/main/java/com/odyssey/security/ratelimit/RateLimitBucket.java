package com.odyssey.security.ratelimit;

/**
 * Thread-safe implementation of the Token Bucket algorithm for rate limiting.
 */
public class RateLimitBucket {
    private final double capacity;
    private final double refillRatePerSecond;
    private double tokens;
    private long lastRefillTimestamp;

    public RateLimitBucket(double capacity, double refillRatePerSecond) {
        this.capacity = capacity;
        this.refillRatePerSecond = refillRatePerSecond;
        this.tokens = capacity;
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    /**
     * Tries to consume 1 token.
     * @return true if token was consumed, false if bucket is empty
     */
    public synchronized boolean tryConsume() {
        refill();
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }

    /**
     * Refills the bucket based on the time elapsed since the last refill.
     */
    private void refill() {
        long now = System.currentTimeMillis();
        double deltaSeconds = (now - lastRefillTimestamp) / 1000.0;
        if (deltaSeconds > 0) {
            tokens = Math.min(capacity, tokens + deltaSeconds * refillRatePerSecond);
            lastRefillTimestamp = now;
        }
    }

    /**
     * Calculates the time in milliseconds until a token will be available.
     * @return time to wait in milliseconds, or 0 if a token is already available
     */
    public synchronized long getResetTimeMs() {
        refill();
        if (tokens >= 1.0) {
            return 0;
        }
        double needed = 1.0 - tokens;
        return (long) Math.ceil((needed / refillRatePerSecond) * 1000.0);
    }
}
