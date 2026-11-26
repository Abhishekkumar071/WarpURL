package com.url.shortener.event;

import com.url.shortener.config.AsyncConfig;
import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.util.UserAgentParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Asynchronous listener that persists click telemetry out-of-band on the
 * dedicated telemetry executor without blocking the HTTP 302 redirection path.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ClickEventListener {

    private final UrlMappingRepository urlMappingRepository;
    private final ClickEventRepository clickEventRepository;

    @Async(AsyncConfig.TELEMETRY_EXECUTOR)
    @EventListener
    @Transactional
    public void handleUrlClicked(UrlClickedEvent event) {
        try {
            UrlMapping urlMapping = urlMappingRepository.findByShortUrl(event.shortUrl());
            if (urlMapping == null) {
                log.warn("Telemetry skipped: shortUrl '{}' no longer exists", event.shortUrl());
                return;
            }

            // Atomic database increment prevents lost updates under concurrent click bursts
            urlMappingRepository.incrementClickCountByShortUrl(event.shortUrl());

            ClickEvent clickEvent = new ClickEvent();
            clickEvent.setUrlMapping(urlMapping);
            clickEvent.setClickDate(event.clickedAt());
            clickEvent.setDeviceType(UserAgentParser.extractDeviceType(event.userAgent()));
            clickEvent.setOs(UserAgentParser.extractOs(event.userAgent()));
            clickEvent.setBrowser(UserAgentParser.extractBrowser(event.userAgent()));
            clickEvent.setReferer(UserAgentParser.extractRefererSource(event.referer()));
            clickEvent.setClientIp(event.clientIp());

            clickEventRepository.save(clickEvent);
        } catch (Exception ex) {
            log.error("Failed to record async click telemetry for shortUrl '{}': {}",
                    event.shortUrl(), ex.getMessage(), ex);
        }
    }
}
