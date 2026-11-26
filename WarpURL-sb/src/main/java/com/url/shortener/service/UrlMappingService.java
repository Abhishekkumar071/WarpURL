package com.url.shortener.service;

import com.url.shortener.config.CacheConfig;
import com.url.shortener.dtos.ClickEventDTO;
import com.url.shortener.dtos.UrlMappingDTO;
import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.util.MurmurHash3;
import lombok.AllArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class UrlMappingService {

    private UrlMappingRepository urlMappingRepository;
    private ClickEventRepository clickEventRepository;
    private CacheManager cacheManager;

    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{3,30}$");
    private static final Set<String> RESERVED_KEYWORDS = Set.of(
            "api", "auth", "admin", "login", "register", "dashboard",
            "health", "metrics", "swagger-ui", "v3", "error", "public",
            "static", "assets", "favicon", "robots"
    );

    public UrlMappingDTO createShortUrl(String originalUrl, User user) {
        return createShortUrl(originalUrl, null, user);
    }

    public UrlMappingDTO createShortUrl(String originalUrl, String customAlias, User user) {
        String shortCode;

        if (customAlias != null && !customAlias.trim().isEmpty()) {
            String sanitizedAlias = customAlias.trim();
            validateCustomAlias(sanitizedAlias);
            if (urlMappingRepository.existsByShortUrl(sanitizedAlias)) {
                throw new IllegalArgumentException("Custom alias '" + sanitizedAlias + "' is already in use. Please choose another.");
            }
            shortCode = sanitizedAlias;
        } else {
            shortCode = generateUniqueShortCode(originalUrl);
        }

        UrlMapping urlMapping = new UrlMapping();
        urlMapping.setOriginalUrl(originalUrl);
        urlMapping.setShortUrl(shortCode);
        urlMapping.setUser(user);
        urlMapping.setCreatedDate(LocalDateTime.now());
        urlMapping.setClickCount(0);

        UrlMapping saved = urlMappingRepository.save(urlMapping);

        // Pre-warm cache for sub-millisecond initial redirect
        if (cacheManager != null && cacheManager.getCache(CacheConfig.URL_CACHE) != null) {
            cacheManager.getCache(CacheConfig.URL_CACHE).put(shortCode, originalUrl);
        }

        return convertToDto(saved);
    }

    private void validateCustomAlias(String alias) {
        if (!SLUG_PATTERN.matcher(alias).matches()) {
            throw new IllegalArgumentException("Custom alias must be 3-30 characters long and contain only letters, numbers, hyphens, or underscores.");
        }
        if (RESERVED_KEYWORDS.contains(alias.toLowerCase())) {
            throw new IllegalArgumentException("The alias '" + alias + "' is a reserved keyword and cannot be used.");
        }
    }

    private String generateUniqueShortCode(String originalUrl) {
        int collisionAttempt = 0;
        while (collisionAttempt < 10) {
            String input = (collisionAttempt == 0) ? originalUrl : originalUrl + ":" + collisionAttempt + ":" + System.nanoTime();
            int hash = MurmurHash3.hash32(input, collisionAttempt);
            long unsignedHash = hash & 0xFFFFFFFFL;
            String candidate = toBase62(unsignedHash);

            if (!urlMappingRepository.existsByShortUrl(candidate) && !RESERVED_KEYWORDS.contains(candidate.toLowerCase())) {
                return candidate;
            }
            collisionAttempt++;
        }
        return UUID.randomUUID().toString().replace("-", "").substring(0, 7);
    }

    private String toBase62(long value) {
        if (value == 0) return "000000";
        StringBuilder sb = new StringBuilder();
        long current = value;
        while (current > 0) {
            int rem = (int) (current % 62);
            sb.append(BASE62.charAt(rem));
            current /= 62;
        }
        while (sb.length() < 6) {
            sb.append('0');
        }
        return sb.reverse().toString();
    }

    public UrlMappingDTO convertToDto(UrlMapping urlMapping) {
        UrlMappingDTO urlMappingDTO = new UrlMappingDTO();
        urlMappingDTO.setId(urlMapping.getId());
        urlMappingDTO.setUsername(urlMapping.getUser().getUsername());
        urlMappingDTO.setCreatedDate(urlMapping.getCreatedDate());
        urlMappingDTO.setOriginalUrl(urlMapping.getOriginalUrl());
        urlMappingDTO.setShortUrl(urlMapping.getShortUrl());
        urlMappingDTO.setClickCount(urlMapping.getClickCount());
        return urlMappingDTO;
    }

    public List<UrlMappingDTO> getUrlsByUser(User user) {
        return urlMappingRepository.findByUserOrderByCreatedDateDesc(user).stream()
                .map(this::convertToDto)
                .toList();
    }

    public List<ClickEventDTO> getClickEventsByDate(String shortUrl, LocalDateTime start, LocalDateTime end) {
        UrlMapping urlMapping = urlMappingRepository.findByShortUrl(shortUrl);
        if (urlMapping != null) {
            return clickEventRepository.findByUrlMappingAndClickDateBetween(urlMapping, start, end)
                    .stream().collect(Collectors.groupingBy(click -> click.getClickDate().toLocalDate(), Collectors.counting()))
                    .entrySet().stream().map(
                            entry -> {
                                ClickEventDTO clickEventDTO = new ClickEventDTO();
                                clickEventDTO.setClickDate(entry.getKey());
                                clickEventDTO.setCount(entry.getValue());
                                return clickEventDTO;
                            }
                    ).collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    public Map<LocalDate, Long> getTotalClicksByUserAndDate(User user, LocalDate startDate, LocalDate endDate) {
        List<UrlMapping> urlMappings = urlMappingRepository.findByUser(user);
        List<ClickEvent> clickEvents = clickEventRepository.findByUrlMappingInAndClickDateBetween(
                urlMappings, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay()
        );
        return clickEvents.stream().collect(Collectors.groupingBy(
                click -> click.getClickDate().toLocalDate(), Collectors.counting()
        ));
    }

    /**
     * Resolves the target destination URL directly from Caffeine Cache in <0.5ms.
     * On cache miss, loads from PostgreSQL and populates cache.
     */
    @Cacheable(value = CacheConfig.URL_CACHE, key = "#shortUrl", unless = "#result == null")
    public String resolveDestinationUrl(String shortUrl) {
        UrlMapping urlMapping = urlMappingRepository.findByShortUrl(shortUrl);
        return urlMapping != null ? urlMapping.getOriginalUrl() : null;
    }

    /**
     * Records click events and increments the count.
     */
    public void recordClick(String shortUrl) {
        UrlMapping urlMapping = urlMappingRepository.findByShortUrl(shortUrl);
        if (urlMapping != null) {
            urlMapping.setClickCount(urlMapping.getClickCount() + 1);
            urlMappingRepository.save(urlMapping);

            ClickEvent clickEvent = new ClickEvent();
            clickEvent.setClickDate(LocalDateTime.now());
            clickEvent.setUrlMapping(urlMapping);
            clickEventRepository.save(clickEvent);
        }
    }

    /**
     * Evicts a slug from cache upon update or deletion.
     */
    public void evictFromCache(String shortUrl) {
        if (cacheManager != null && cacheManager.getCache(CacheConfig.URL_CACHE) != null) {
            cacheManager.getCache(CacheConfig.URL_CACHE).evict(shortUrl);
        }
    }

    @Deprecated
    public UrlMapping getOriginalUrl(String shortUrl) {
        String destination = resolveDestinationUrl(shortUrl);
        if (destination != null) {
            recordClick(shortUrl);
            return urlMappingRepository.findByShortUrl(shortUrl);
        }
        return null;
    }
}
