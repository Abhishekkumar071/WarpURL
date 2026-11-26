package com.url.shortener.util;

import java.net.URI;
import java.util.Locale;

/**
 * Lightweight, zero-allocation-friendly HTTP header parser for click telemetry.
 * Extracts Device Type, OS, Browser, Referer source, and client IP safely.
 */
public final class UserAgentParser {

    private UserAgentParser() {}

    public static String extractDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Unknown";
        }
        String ua = userAgent.toLowerCase(Locale.ROOT);

        if (isBot(ua)) {
            return "Bot";
        }
        if (ua.contains("ipad") || ua.contains("tablet") || ua.contains("kindle")
                || ua.contains("silk") || ua.contains("playbook")
                || (ua.contains("android") && !ua.contains("mobile"))) {
            return "Tablet";
        }
        if (ua.contains("mobile") || ua.contains("iphone") || ua.contains("ipod")
                || ua.contains("android") || ua.contains("blackberry")
                || ua.contains("windows phone") || ua.contains("opera mini")
                || ua.contains("iemobile")) {
            return "Mobile";
        }
        return "Desktop";
    }

    public static String extractOs(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Unknown";
        }
        String ua = userAgent.toLowerCase(Locale.ROOT);

        // Order matters: iOS contains "like Mac OS X", Android contains "Linux"
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ipod") || ua.contains("cpu os")) {
            return "iOS";
        }
        if (ua.contains("android")) {
            return "Android";
        }
        if (ua.contains("windows")) {
            return "Windows";
        }
        if (ua.contains("mac os") || ua.contains("macintosh")) {
            return "macOS";
        }
        if (ua.contains("linux") || ua.contains("ubuntu") || ua.contains("x11")) {
            return "Linux";
        }
        return "Other";
    }

    public static String extractBrowser(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Unknown";
        }
        String ua = userAgent.toLowerCase(Locale.ROOT);

        if (isBot(ua)) {
            return "Bot/CLI";
        }
        // Order matters: Edge & Opera contain "Chrome"; Chrome contains "Safari"
        if (ua.contains("edg/") || ua.contains("edge/")) {
            return "Edge";
        }
        if (ua.contains("opr/") || ua.contains("opera")) {
            return "Opera";
        }
        if (ua.contains("chrome/") || ua.contains("crios/")) {
            return "Chrome";
        }
        if (ua.contains("firefox/") || ua.contains("fxios/")) {
            return "Firefox";
        }
        if (ua.contains("safari/")) {
            return "Safari";
        }
        return "Other";
    }

    public static String extractRefererSource(String referer) {
        if (referer == null || referer.isBlank()) {
            return "Direct";
        }
        try {
            String normalized = referer.trim();
            if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
                normalized = "https://" + normalized;
            }
            String host = URI.create(normalized).getHost();
            if (host == null || host.isBlank()) {
                return "Direct";
            }
            host = host.toLowerCase(Locale.ROOT);
            if (host.startsWith("www.")) {
                host = host.substring(4);
            }

            if (host.contains("google.")) return "Google";
            if (host.equals("t.co") || host.contains("twitter.com") || host.equals("x.com")) return "Twitter / X";
            if (host.contains("linkedin.com") || host.equals("lnkd.in")) return "LinkedIn";
            if (host.contains("github.com")) return "GitHub";
            if (host.contains("facebook.com") || host.equals("fb.me")) return "Facebook";
            if (host.contains("instagram.com")) return "Instagram";
            if (host.contains("reddit.com")) return "Reddit";
            if (host.contains("youtube.com") || host.equals("youtu.be")) return "YouTube";

            return host.length() > 100 ? host.substring(0, 100) : host;
        } catch (Exception e) {
            return "Direct";
        }
    }

    public static String extractClientIp(String xForwardedFor, String remoteAddr) {
        String ip = (xForwardedFor != null && !xForwardedFor.isBlank())
                ? xForwardedFor.split(",")[0].trim()
                : remoteAddr;
        if (ip == null || ip.isBlank()) {
            return "unknown";
        }
        return ip.length() > 45 ? ip.substring(0, 45) : ip;
    }

    private static boolean isBot(String ua) {
        return ua.contains("bot") || ua.contains("crawl") || ua.contains("spider")
                || ua.contains("slurp") || ua.contains("curl/") || ua.contains("wget/")
                || ua.contains("postman") || ua.contains("python-requests")
                || ua.contains("headless");
    }
}
