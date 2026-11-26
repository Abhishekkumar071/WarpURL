package com.url.shortener.controller;

import com.url.shortener.service.UrlMappingService;
import com.url.shortener.util.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
public class RedirectController {

    private UrlMappingService urlMappingService;

    @GetMapping("/{shortUrl}")
    public ResponseEntity<Void> redirect(@PathVariable String shortUrl, HttpServletRequest request) {
        String destinationUrl = urlMappingService.resolveDestinationUrl(shortUrl);
        if (destinationUrl != null) {
            String userAgent = request.getHeader("User-Agent");
            String referer = request.getHeader("Referer");
            String clientIp = UserAgentParser.extractClientIp(
                    request.getHeader("X-Forwarded-For"),
                    request.getRemoteAddr()
            );

            // Fire-and-forget async event: returns HTTP 302 immediately (<5ms)
            urlMappingService.publishClickTelemetry(shortUrl, userAgent, referer, clientIp);

            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add("Location", destinationUrl);
            return ResponseEntity.status(302).headers(httpHeaders).build();
        }
        return ResponseEntity.notFound().build();
    }
}
