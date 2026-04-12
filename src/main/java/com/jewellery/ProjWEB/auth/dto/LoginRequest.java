package com.jewellery.ProjWEB.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    /**
     * DTO for login requests. Contains username and password.
     */


    // Username for authentication (cannot be blank)
    @NotBlank(message = "Username is required")
    private String username;
    // Plain-text password supplied by user (validated server-side, not persisted here)
    @NotBlank(message = "Password is required")
    private String password;
}
