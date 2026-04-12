package com.jewellery.ProjWEB.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /**
     * Filter that runs once per request to extract a JWT from the `Authorization`
     * header, validate it, and populate the Spring Security `SecurityContext` with
     * an authenticated `UsernamePasswordAuthenticationToken` when valid.
     */

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Read Authorization header and verify Bearer token format
        // Read the raw Authorization header from the HTTP request
        final String authHeader = request.getHeader("Authorization");

        // Temporary debug logging to trace header parsing and token validation
        log.debug("Incoming request: {} {} from {} - Authorization header present: {}",
            request.getMethod(), request.getRequestURI(), request.getRemoteAddr(), authHeader != null);

        // If header is missing or does not follow the "Bearer <token>" format,
        // skip JWT processing and continue the filter chain as unauthenticated
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Bearer token found in Authorization header, skipping JWT processing.");
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the token portion by removing the "Bearer " prefix
        final String jwt = authHeader.substring(7);
        // Initialize username variable which will be populated from token
        String username = null;

        try {
            // Parse token and extract the subject (username). This may throw
            // if the token is malformed or signature verification fails inside the service.
            username = jwtService.extractUsername(jwt);
            log.debug("Extracted username from token: {}", username);
        } catch (Exception e) {
            // Token invalid - intentionally do not set authentication so request
            // proceeds as anonymous; downstream handlers can decide how to respond.
            log.debug("Failed to extract username from token: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        // Only attempt to authenticate via token if no existing authentication present
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.debug("SecurityContext authentication before processing: {}", SecurityContextHolder.getContext().getAuthentication());
            // Load user details (authorities, password hash, enabled flag) from DB
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            // Validate token against loaded user (checks expiration and subject match)
            if (jwtService.isTokenValid(jwt, userDetails)) {
                log.debug("JWT is valid for user {}", username);
                // Build an Authentication object with granted authorities
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // principal
                        null, // credentials not stored in token
                        userDetails.getAuthorities()); // authorities from DB

                // Attach request details (IP, session id) to auth token for auditing
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the authenticated principal into the SecurityContext so downstream
                // code treats this request as authenticated
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                log.debug("JWT is not valid for user {}", username);
            }
        }

        // Continue processing the filter chain whether authenticated or not
        log.debug("Continuing filter chain. Auth in context: {}", SecurityContextHolder.getContext().getAuthentication());
        filterChain.doFilter(request, response);
    }
}
