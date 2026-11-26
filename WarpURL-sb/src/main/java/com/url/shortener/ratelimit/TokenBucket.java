package com.url.shortener.ratelimit;

import java.util.concurrent.atomic.AtomicReference;
import java.util.function.LongSupplier;

/**
 * Lock-free, thread-safe Token Bucket implementation using AtomicReference CAS loops.
 * Supports continuous nanosecond-precision token replenishment with burst capacity.
 */
public class TokenBucket {

    private record BucketState(double tokens, long lastRefillNano) {}

    public record ConsumeResult(boolean allowed, long remainingTokens, long retryAfterSeconds) {
        public static ConsumeResult granted(long remaining) {
            return new ConsumeResult(true, remaining, 0L);
        }

        public static ConsumeResult rejected(long retryAfterSeconds) {
            return new ConsumeResult(false, 0L, retryAfterSeconds);
        }
    }

    private final long capacity;
    private final double refillTokensPerNano;
    private final LongSupplier nanoTimeSource;
    private final AtomicReference<BucketState> state;

    public TokenBucket(long capacity, long refillPeriodSeconds) {
        this(capacity, refillPeriodSeconds, System::nanoTime);
    }

    public TokenBucket(long capacity, long refillPeriodSeconds, LongSupplier nanoTimeSource) {
        if (capacity <= 0 || refillPeriodSeconds <= 0) {
            throw new IllegalArgumentException("Capacity and refillPeriodSeconds must be positive");
        }
        this.capacity = capacity;
        this.refillTokensPerNano = (double) capacity / (refillPeriodSeconds * 1_000_000_000.0);
        this.nanoTimeSource = nanoTimeSource;
        this.state = new AtomicReference<>(new BucketState((double) capacity, nanoTimeSource.getAsLong()));
    }

    public ConsumeResult tryConsume() {
        long now = nanoTimeSource.getAsLong();
        while (true) {
            BucketState current = state.get();
            long elapsedNanos = Math.max(0L, now - current.lastRefillNano());
            double refilledTokens = Math.min(capacity, current.tokens() + (elapsedNanos * refillTokensPerNano));

            if (refilledTokens >= 1.0) {
                long nextRefillNano = Math.max(now, current.lastRefillNano());
                BucketState next = new BucketState(refilledTokens - 1.0, nextRefillNano);
                if (state.compareAndSet(current, next)) {
                    return ConsumeResult.granted((long) Math.floor(next.tokens()));
                }
            } else {
                double deficit = 1.0 - refilledTokens;
                long nanosUntilNextToken = (long) Math.ceil(deficit / refillTokensPerNano);
                long retryAfterSeconds = Math.max(1L, (nanosUntilNextToken + 999_999_999L) / 1_000_000_000L);
                return ConsumeResult.rejected(retryAfterSeconds);
            }
        }
    }

    public long getCapacity() {
        return capacity;
    }

    public long getAvailableTokens() {
        long now = nanoTimeSource.getAsLong();
        BucketState current = state.get();
        long elapsedNanos = Math.max(0L, now - current.lastRefillNano());
        double refilled = Math.min(capacity, current.tokens() + (elapsedNanos * refillTokensPerNano));
        return (long) Math.floor(refilled);
    }
}
