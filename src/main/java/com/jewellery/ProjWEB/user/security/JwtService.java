package com.jewellery.ProjWEB.user.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
/**
 * Utility service for generating and validating JWT tokens.
 *
 * - Uses `app.jwt.secret` (base64-encoded) and `app.jwt.expiration-ms`.
 * - Tokens include the username as the subject and optional extra claims.
 */
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        // Build the JWT token step-by-step:
        // 1) start a builder
        // 2) attach any extra/custom claims
        // 3) set the subject (username)
        // 4) set issued-at and expiration timestamps
        // 5) sign with the configured HMAC key
        // 6) compact into the final String
        return Jwts.builder()
            // Attach custom claims provided by caller
            .claims(extraClaims)
            // Use username as the JWT subject
            .subject(userDetails.getUsername())
            // Set issuance time (now)
            .issuedAt(new Date(System.currentTimeMillis()))
            // Set expiration according to configured TTL
            .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            // Sign the token using the decoded secret key
            .signWith(getSigningKey())
            // Serialize to compact JWT string
            .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        // Parse claims and then apply the provided resolver function to extract specific claim
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        // Parse and verify the signed JWT using the signing key and return claims payload
        // JJWT v0.11.5 fluent parser usage:
        // - verifyWith provides the key for signature verification
        // - build() returns a configured parser
        // - parseSignedClaims parses the compact JWS and returns a SignedJWT-like structure
        // - getPayload retrieves the Claims payload as a Claims instance
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSigningKey() {
        // The configured `jwtSecret` is base64-encoded; decode before creating HMAC key
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
