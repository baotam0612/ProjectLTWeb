package com.jewellery.ProjWEB.auth.token;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import com.jewellery.ProjWEB.user.entity.User;

@Entity
@Table(name = "password_reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    /**
     * Persistence entity representing a password reset token.
     *
     * - Tokens are unique strings tied to a `User`.
     * - Token expires after `EXPIRATION_MINUTES` (short-lived).
     * - `used` flag prevents reuse after a reset.
     */

    private static final int EXPIRATION_MINUTES = 30;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private boolean used = false;

    public PasswordResetToken(User user) {
        // Associate this token with the provided user
        this.user = user;
        // Generate a random UUID token string
        this.token = UUID.randomUUID().toString();
        // Set the expiry time to a short window (configured minutes)
        this.expiryDate = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
    }

    public boolean isExpired() {
        // Token is expired when now is after expiryDate
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}
