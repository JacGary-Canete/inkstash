package com.inkstash.controller;

import com.inkstash.dto.ProfileResponse;
import com.inkstash.dto.UpdateProfileRequest;
import com.inkstash.model.User;
import com.inkstash.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getOwnProfile(user));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(profileService.updateOwnProfile(user, req));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ProfileResponse> updateProfileById(
            @AuthenticationPrincipal User user,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest req) {
        profileService.assertOwnership(user, userId);
        return ResponseEntity.ok(profileService.updateOwnProfile(user, req));
    }
}