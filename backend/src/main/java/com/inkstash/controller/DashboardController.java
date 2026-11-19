package com.inkstash.controller;

import com.inkstash.model.ArtistProfile;
import com.inkstash.model.User;
import com.inkstash.repository.ArtistProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final ArtistProfileRepository artistProfileRepository;

    public DashboardController(ArtistProfileRepository artistProfileRepository) {
        this.artistProfileRepository = artistProfileRepository;
    }

    @GetMapping("/client/dashboard")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Map<String, Object>> clientDashboard(@AuthenticationPrincipal User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("role", user.getRole());
        payload.put("fullName", user.getFullName());
        payload.put("email", user.getEmail());
        payload.put("memberSince", user.getCreatedAt());
        payload.put("allowedModules", List.of("Browse Flash Designs", "My Bookings", "Saved Artists", "Account Settings"));
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/artist/dashboard")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<Map<String, Object>> artistDashboard(@AuthenticationPrincipal User user) {
        ArtistProfile profile = artistProfileRepository.findByUserId(user.getId()).orElse(null);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("role", user.getRole());
        payload.put("fullName", user.getFullName());
        payload.put("email", user.getEmail());
        payload.put("studioName", profile != null && profile.getStudioName() != null ? profile.getStudioName() : "Independent Artist");
        payload.put("depositPercent", profile != null ? profile.getDepositPercent() : null);
        payload.put("allowedModules", List.of("Manage Flash Catalog", "Client Bookings & Deposits", "Availability Calendar", "Studio Profile"));
        return ResponseEntity.ok(payload);
    }
}