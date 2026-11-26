package com.url.shortener.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.url.shortener.ratelimit.RateLimitTier;
import com.url.shortener.ratelimit.TokenBucket;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.LongSupplier;

/**
 * Bounded, self-evicting Caffeine-backed Token Bucket registry.
 * Caps memory footprint to 100,000 active client buckets with 15-minute idle eviction
 * to prevent memory exhaustion under distributed IP spoofing attacks.
 */
@Service
public class RateLimitConfig {

    public record RateLimitDecision(
            boolean allowed,
            long limit,
            long remaining,
            long retryAfterSeconds,
            RateLimitTier tier
    ) {}

    private final Cache<String, TokenBucket> buckets;
    private final LongSupplier nanoTimeSource;

    public RateLimitConfig() {
        this(System::nanoTime);
    }

    public RateLimitConfig(LongSupplier nanoTimeSource) {
        this.nanoTimeSource = nanoTimeSource;
        this.buckets = Caffeine.newBuilder()
                .initialCapacity(500)
                .maximumSize(100_000)
                .expireAfterAccess(15, TimeUnit.MINUTES)
                .recordStats()
                .build();
    }

    public RateLimitDecision tryConsume(RateLimitTier tier, String identityKey) {
        String compositeKey = tier.name() + ":" + identityKey;
        TokenBucket bucket = buckets.get(
                compositeKey,
                k -> new TokenBucket(tier.getCapacity(), tier.getRefillSeconds(), nanoTimeSource)
        );

        TokenBucket.ConsumeResult result = bucket.tryConsume();
        return new RateLimitDecision(
                result.allowed(),
                tier.getCapacity(),
                result.remainingTokens(),
                result.retryAfterSeconds(),
                tier
        );
    }

    public long getTrackedBucketCount() {
        return buckets.estimatedSize();
    }
}
