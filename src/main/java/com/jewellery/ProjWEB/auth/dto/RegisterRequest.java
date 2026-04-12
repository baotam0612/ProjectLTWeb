package com.jewellery.ProjWEB.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    /**
     * DTO for user registration data: username, email and password.
     */

    // Desired username for the new account; validated for presence and length
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    // Contact email used for verification and login reset flows
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // Raw password supplied by user; will be encoded before persisting
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;
}
