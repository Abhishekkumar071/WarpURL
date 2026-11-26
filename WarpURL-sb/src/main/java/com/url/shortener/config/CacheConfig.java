package com.url.shortener.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * High-performance In-Memory Caching Configuration using Caffeine.
 * Provides sub-millisecond O(1) slug resolution, LFU eviction, and TTL expiration.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String URL_CACHE = "urlCache";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(URL_CACHE);
        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .initialCapacity(1000)
                        .maximumSize(50_000)
                        .expireAfterWrite(24, TimeUnit.HOURS)
                        .recordStats()
        );
        return cacheManager;
    }
}
