package com.jewellery.ProjWEB;

import com.jewellery.ProjWEB.auth.service.AuthServiceImpl;
import com.jewellery.ProjWEB.auth.token.VerificationToken;
import com.jewellery.ProjWEB.mail.EmailService;
import com.jewellery.ProjWEB.security.CustomUserDetailsService;
import com.jewellery.ProjWEB.security.JwtService;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.repository.UserRepository;
import com.jewellery.ProjWEB.user.repository.VerificationTokenRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.MailSendException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.jewellery.ProjWEB.auth.controller.AuthController;
import com.jewellery.ProjWEB.exception.GlobalExceptionHandler;
import java.util.Set;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DataJpaTest(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl"
}, showSql = false)
@Import(AuthServiceImpl.class)
class VerificationResendIntegrationTest {
    @Autowired AuthServiceImpl auth;
    @Autowired UserRepository users;
    @Autowired VerificationTokenRepository tokens;
    @MockitoBean EmailService emails;
    @MockitoBean JwtService jwt;
    @MockitoBean CustomUserDetailsService details;
    @MockitoBean AuthenticationManager authentication;
    @MockitoBean PasswordEncoder encoder;

    @Test void resendReplacesExistingTokenWithoutUniqueConstraintFailure() {
        User user = users.saveAndFlush(User.builder().username("buyer").email("buyer@example.invalid")
            .password("encoded-password").enabled(false).roles(Set.of()).build());
        VerificationToken old = tokens.saveAndFlush(new VerificationToken(user));
        String oldValue = old.getToken();
        auth.resendVerificationEmail("buyer@example.invalid");
        tokens.flush();
        assertThat(tokens.count()).isEqualTo(1);
        var current = tokens.findByUser(user).orElseThrow();
        assertThat(current.getToken()).isNotEqualTo(oldValue);
        assertThat(current.isUsed()).isFalse();
        assertThat(current.isExpired()).isFalse();
        verify(emails).sendVerificationEmail(eq(user.getEmail()), eq(user.getUsername()), eq(current.getToken()));
    }

    @Test void missingTokenCanBeCreatedAndUnknownOrVerifiedAccountsDoNotSend() {
        User user = users.saveAndFlush(User.builder().username("missing_token").email("missing@example.invalid")
            .password("encoded-password").enabled(false).roles(Set.of()).build());
        auth.resendVerificationEmail(user.getEmail());
        assertThat(tokens.findByUser(user)).isPresent();
        verify(emails, times(1)).sendVerificationEmail(eq(user.getEmail()), eq(user.getUsername()), anyString());
        user.setEnabled(true); users.saveAndFlush(user);
        auth.resendVerificationEmail(user.getEmail()); auth.resendVerificationEmail("unknown@example.invalid");
        verifyNoMoreInteractions(emails);
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void failedDeliveryReturns503AndPreservesThePreviousToken() throws Exception {
        User user = users.saveAndFlush(User.builder().username("failed_delivery").email("failed@example.invalid")
            .password("encoded-password").enabled(false).roles(Set.of()).build());
        VerificationToken old = tokens.saveAndFlush(new VerificationToken(user));
        String oldValue = old.getToken();
        doThrow(new MailSendException("test SMTP unavailable")).when(emails).sendVerificationEmail(anyString(), anyString(), anyString());
        try {
            var mvc = MockMvcBuilders.standaloneSetup(new AuthController(auth))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
            mvc.perform(post("/api/auth/resend-verification").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"failed@example.invalid\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("VERIFICATION_EMAIL_UNAVAILABLE"));
            assertThat(tokens.findByUser(user).orElseThrow().getToken()).isEqualTo(oldValue);
        } finally {
            tokens.deleteById(old.getId()); users.deleteById(user.getId());
        }
    }
}
