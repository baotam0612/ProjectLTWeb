package com.jewellery.ProjWEB.security;

import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_TRACKED_KEYS = 10_000;
    private final ObjectMapper objectMapper;
    private final LinkedHashMap<String, Window> windows = new LinkedHashMap<>(128, 0.75f, true);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Rule rule = ruleFor(request.getRequestURI());
        if (rule == null) {
            filterChain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();
        long retryAfterMillis = acquire(request.getRemoteAddr() + ":" + request.getRequestURI(), rule, now);
        if (retryAfterMillis > 0) {
            response.setStatus(429);
            response.setHeader("Retry-After", Long.toString(Math.max(1, (retryAfterMillis + 999) / 1000)));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(), Map.of("message", "Too many authentication requests. Try again later."));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Rule ruleFor(String path) {
        if (path.endsWith("/login")) return new Rule(10, Duration.ofMinutes(1));
        if (path.endsWith("/register")) return new Rule(5, Duration.ofHours(1));
        if (path.endsWith("/verify")) return new Rule(20, Duration.ofMinutes(1));
        if (path.endsWith("/resend-verification") || path.endsWith("/forgot-password")) {
            return new Rule(3, Duration.ofMinutes(15));
        }
        if (path.endsWith("/reset-password")) return new Rule(10, Duration.ofHours(1));
        return null;
    }

    private synchronized long acquire(String key, Rule rule, long now) {
        Window current = windows.get(key);
        if (current == null || now - current.startedAt >= rule.window().toMillis()) {
            windows.put(key, new Window(now, 1));
            trimOldestEntries();
            return 0;
        }
        if (current.count >= rule.limit()) {
            return rule.window().toMillis() - (now - current.startedAt);
        }
        windows.put(key, new Window(current.startedAt, current.count + 1));
        return 0;
    }

    private void trimOldestEntries() {
        while (windows.size() > MAX_TRACKED_KEYS) {
            String oldestKey = windows.keySet().iterator().next();
            windows.remove(oldestKey);
        }
    }

    private record Rule(int limit, Duration window) {}
    private record Window(long startedAt, int count) {}
}
