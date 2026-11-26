package com.url.shortener.security;

import com.url.shortener.config.RateLimitConfig;
import com.url.shortener.config.RateLimitConfig.RateLimitDecision;
import com.url.shortener.ratelimit.RateLimitTier;
import com.url.shortener.util.UserAgentParser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Tiered API & Redirection Rate Limiting Filter.
 * Executed once per request directly after JwtAuthenticationFilter so user-scoped
 * tiers identify authenticated users while public routes key by client IP.
 */
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        return "/error".equals(path) || "/favicon.ico".equals(path);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        RateLimitTier tier = resolveTier(request);
        String identityKey = resolveIdentityKey(request, tier);

        RateLimitDecision decision = rateLimitConfig.tryConsume(tier, identityKey);
        response.setHeader("X-RateLimit-Limit", String.valueOf(decision.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(decision.remaining()));

        if (!decision.allowed()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(decision.retryAfterSeconds()));
            response.setHeader("X-RateLimit-Retry-After-Seconds", String.valueOf(decision.retryAfterSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            String json = String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"tier\":\"%s\",\"retryAfterSeconds\":%d,\"message\":\"%s\"}",
                    tier.name(),
                    decision.retryAfterSeconds(),
                    tier.getMessage()
            );
            response.getWriter().write(json);
            return;
        }

        filterChain.doFilter(request, response);
    }

    public RateLimitTier resolveTier(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth")) {
            return RateLimitTier.AUTH;
        }
        if ("/api/urls/shorten".equals(path) && HttpMethod.POST.matches(request.getMethod())) {
            return RateLimitTier.SHORTEN;
        }
        if (path.startsWith("/api/urls")) {
            return RateLimitTier.API_READ;
        }
        return RateLimitTier.PUBLIC_REDIRECT;
    }

    private String resolveIdentityKey(HttpServletRequest request, RateLimitTier tier) {
        if (tier == RateLimitTier.SHORTEN || tier == RateLimitTier.API_READ) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
                return "user:" + auth.getName();
            }
        }
        String clientIp = UserAgentParser.extractClientIp(
                request.getHeader("X-Forwarded-For"),
                request.getRemoteAddr()
        );
        return "ip:" + clientIp;
    }
}
