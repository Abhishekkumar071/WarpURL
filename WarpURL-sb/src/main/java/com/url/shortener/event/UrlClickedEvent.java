package com.url.shortener.event;

import java.time.LocalDateTime;

/**
 * Immutable domain event dispatched immediately upon short URL resolution.
 */
public record UrlClickedEvent(
        String shortUrl,
        LocalDateTime clickedAt,
        String userAgent,
        String referer,
        String clientIp
) {
}
