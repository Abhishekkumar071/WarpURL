package com.url.shortener.ratelimit;

import lombok.Getter;

/**
 * Tiered quota definitions separating public link clicks, authentication attempts,
 * API reads, and link creation bursts.
 */
@Getter
public enum RateLimitTier {
    SHORTEN(30, 60, "Link shortening rate limit exceeded. Please slow down."),
    AUTH(20, 60, "Too many authentication attempts. Please wait before trying again."),
    API_READ(120, 60, "API request rate limit exceeded. Please retry shortly."),
    PUBLIC_REDIRECT(300, 60, "Too many redirect requests from your network.");

    private final long capacity;
    private final long refillSeconds;
    private final String message;

    RateLimitTier(long capacity, long refillSeconds, String message) {
        this.capacity = capacity;
        this.refillSeconds = refillSeconds;
        this.message = message;
    }
}
