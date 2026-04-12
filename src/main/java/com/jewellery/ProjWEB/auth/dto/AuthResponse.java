package com.jewellery.ProjWEB.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /**
     * Response DTO returned after authentication-related operations.
     * For login it contains a JWT `token` plus basic user info and roles.
     * For non-login flows it may carry a `message` describing the outcome.
     */

    private String token;
    // JWT token string returned on successful login
    // Token type prefix (commonly "Bearer")
    private String type = "Bearer";
    // Basic identifying info returned to client
    private Long id;
    private String username;
    private String email;
    // Role names for the authenticated user
    private List<String> roles;
    // Optional message for non-login flows (e.g., registration success)
    private String message;

    public AuthResponse(String token, Long id, String username, String email, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
}
