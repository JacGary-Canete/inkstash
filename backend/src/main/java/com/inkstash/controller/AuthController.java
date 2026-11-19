package com.inkstash.controller;

import com.inkstash.dto.AuthResponse;
import com.inkstash.dto.LoginRequest;
import com.inkstash.dto.RegisterRequest;
import com.inkstash.model.User;
import com.inkstash.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final long expirationMinutes;
    private final boolean cookieSecure;

    public AuthController(
            AuthService authService,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes,
            @Value("${app.cookie.secure}") boolean cookieSecure) {
        this.authService = authService;
        this.expirationMinutes = expirationMinutes;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse res = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(res.token(), Duration.ofMinutes(expirationMinutes)).toString())
                .body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse res = authService.login(req);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(res.token(), Duration.ofMinutes(expirationMinutes)).toString())
                .body(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie("", Duration.ZERO).toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), null));
    }

    private ResponseCookie buildAuthCookie(String token, Duration maxAge) {
        return ResponseCookie.from("inkstash_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}