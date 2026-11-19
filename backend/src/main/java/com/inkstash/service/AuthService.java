package com.inkstash.service;

import com.inkstash.dto.AuthResponse;
import com.inkstash.dto.LoginRequest;
import com.inkstash.dto.RegisterRequest;
import com.inkstash.model.ArtistProfile;
import com.inkstash.model.Role;
import com.inkstash.model.User;
import com.inkstash.repository.ArtistProfileRepository;
import com.inkstash.repository.UserRepository;
import com.inkstash.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ArtistProfileRepository artistProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            ArtistProfileRepository artistProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.artistProfileRepository = artistProfileRepository;
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
}