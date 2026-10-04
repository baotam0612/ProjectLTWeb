package com.jewellery.ProjWEB;

import com.jewellery.ProjWEB.auth.controller.AuthController;
import com.jewellery.ProjWEB.auth.dto.RegisterRequest;
import com.jewellery.ProjWEB.auth.exception.RegistrationConflictException;
import com.jewellery.ProjWEB.auth.service.AuthServiceImpl;
import com.jewellery.ProjWEB.exception.GlobalExceptionHandle;
import com.jewellery.ProjWEB.exception.GlobalExceptionHandler;
import com.jewellery.ProjWEB.mail.EmailService;
import com.jewellery.ProjWEB.security.CustomUserDetailsService;
import com.jewellery.ProjWEB.security.JwtService;
import com.jewellery.ProjWEB.user.entity.Role;
import com.jewellery.ProjWEB.user.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RegistrationTest {
    @Mock UserRepository users;
    @Mock AccountRepository accounts;
    @Mock RoleRepository roles;
    @Mock VerificationTokenRepository verificationTokens;
    @Mock PasswordResetTokenRepository passwordTokens;
    @Mock PasswordEncoder encoder;
    @Mock JwtService jwt;
    @Mock CustomUserDetailsService userDetails;
    @Mock AuthenticationManager authentication;
    @Mock EmailService emails;
    @InjectMocks AuthServiceImpl service;

    RegisterRequest request() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("buyer"); request.setEmail("BUYER@example.invalid");
        request.setPassword("test-password"); request.setFullName("Buyer Name");
        request.setAddress("Address"); request.setPhoneNumber("0123456789"); return request;
    }

    void allowRegistration() {
        Role role = new Role(); role.setName(Role.ERole.ROLE_USER);
        when(roles.findByName(Role.ERole.ROLE_USER)).thenReturn(Optional.of(role));
        when(encoder.encode("test-password")).thenReturn("encoded-password");
    }

    @Test void duplicateEmailReturnsRecoverableConflictWithoutCreatingOrSendingAnything() throws Exception {
        when(users.existsByEmail("buyer@example.invalid")).thenReturn(true);
        var mvc = MockMvcBuilders.standaloneSetup(new AuthController(service))
            .setControllerAdvice(new GlobalExceptionHandler(), new GlobalExceptionHandle()).build();
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
            {"username":"buyer","email":"BUYER@example.invalid","password":"test-password",
             "fullName":"Buyer Name","address":"Address","phoneNumber":"0123456789"}
            """))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("REGISTRATION_CONFLICT"));
        verify(users, never()).save(any()); verify(accounts, never()).save(any()); verifyNoInteractions(emails);
    }

    @Test void legacyAccountUsernameCollisionIsHandledBeforeDatabaseWrites() {
        when(accounts.existsByUsername("buyer")).thenReturn(true);
        assertThatThrownBy(() -> service.register(request())).isInstanceOf(RegistrationConflictException.class);
        verify(users, never()).save(any()); verifyNoInteractions(emails);
    }

    @Test void successfulRegistrationReturnsEmailDeliveryStatusAndCreatesUnverifiedUser() {
        allowRegistration();
        var response = service.register(request());
        assertThat(response.getVerificationEmailSent()).isTrue();
        verify(users).save(argThat(user -> user.getEmail().equals("buyer@example.invalid") && !user.isEnabled()));
        verify(accounts).save(argThat(account -> account.getUser() != null && account.getUsername().equals("buyer")));
        verify(emails).sendVerificationEmail(eq("buyer@example.invalid"), eq("buyer"), anyString());
    }

    @Test void failedEmailDeliveryReportsCreatedAccountWithoutClaimingEmailWasSent() {
        allowRegistration();
        doThrow(new MailSendException("test SMTP unavailable")).when(emails).sendVerificationEmail(anyString(), anyString(), anyString());
        var response = service.register(request());
        assertThat(response.getVerificationEmailSent()).isFalse();
        assertThat(response.getMessage()).contains("chưa gửi được email");
        verify(users).save(any()); verify(verificationTokens).save(any());
    }

    @Test void invalidRegistrationDoesNotCreateAccountOrSendEmail() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new AuthController(service))
            .setControllerAdvice(new GlobalExceptionHandler()).build();
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors").isArray());
        verifyNoInteractions(users, accounts, emails);
    }
}
