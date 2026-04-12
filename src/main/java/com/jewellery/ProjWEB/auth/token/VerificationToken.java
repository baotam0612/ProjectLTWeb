package com.jewellery.ProjWEB.auth.token;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import com.jewellery.ProjWEB.user.entity.User;

@Entity
@Table(name = "verification_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken {

    /**
     * Persistence entity representing an email verification token.
     *
     * - Tokens are unique strings tied to a `User`.
     * - Token expires after `EXPIRATION_HOURS`.
     * - `used` flag prevents reuse after confirmation.
     */

    private static final int EXPIRATION_HOURS = 24;

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

    public VerificationToken(User user) {
        // Associate token with the provided user
        this.user = user;
        // Generate a cryptographically random token string (UUID)
        this.token = UUID.randomUUID().toString();
        // Set expiry to now + configured hours
        this.expiryDate = LocalDateTime.now().plusHours(EXPIRATION_HOURS);
    }

    public boolean isExpired() {
        // Returns true when the current time is strictly after the expiry time
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}
