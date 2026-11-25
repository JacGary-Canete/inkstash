package com.inkstash.service;

import com.inkstash.dto.*;
import com.inkstash.model.ArtistProfile;
import com.inkstash.model.PasswordResetToken;
import com.inkstash.model.Role;
import com.inkstash.model.User;
import com.inkstash.repository.ArtistProfileRepository;
import com.inkstash.repository.PasswordResetTokenRepository;
import com.inkstash.repository.UserRepository;
import com.inkstash.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final Duration RESET_TOKEN_TTL = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final ArtistProfileRepository artistProfileRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            ArtistProfileRepository artistProfileRepository,
            PasswordResetTokenRepository resetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.artistProfileRepository = artistProfileRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String normalizedEmail = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName().trim());
        user.setRole(req.role());
        User saved = userRepository.save(user);

        if (req.role() == Role.ARTIST) {
            ArtistProfile profile = new ArtistProfile();
            profile.setUser(saved);
            profile.setStudioName(req.studioName());
            profile.setDepositPercent(req.depositPercent());
            artistProfileRepository.save(profile);
        }

        String token = jwtService.generateToken(saved);
        return new AuthResponse(saved.getId(), saved.getEmail(), saved.getFullName(), saved.getRole(), token);
    }

    public AuthResponse login(LoginRequest req) {
        String normalizedEmail = req.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), token);
    }

    @Transactional
    public Map<String, String> requestPasswordReset(ForgotPasswordRequest req) {
        String normalizedEmail = req.email().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "If an account exists for that email, a password reset token has been generated.");

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            resetTokenRepository.deleteByUserId(user.getId());

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiresAt(Instant.now().plus(RESET_TOKEN_TTL));
            resetToken.setUsed(false);
            resetTokenRepository.save(resetToken);

            String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken.getToken();
            log.info("Password reset link for {}: {}", normalizedEmail, resetUrl);
            response.put("resetToken", resetToken.getToken());
            response.put("resetUrl", resetUrl);
        }

        return response;
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest req) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(req.token().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        if (passwordEncoder.matches(req.newPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from your current password");
        }

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        return Map.of("message", "Password has been reset successfully. You can now log in.");
    }

    @Transactional
    public Map<String, String> changePassword(User principal, ChangePasswordRequest req) {
        if (principal == null || principal.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        if (passwordEncoder.matches(req.newPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        return Map.of("message", "Password changed successfully.");
    }
}