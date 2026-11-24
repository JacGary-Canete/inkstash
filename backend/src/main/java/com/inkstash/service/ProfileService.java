package com.inkstash.service;

import com.inkstash.dto.ProfileResponse;
import com.inkstash.dto.UpdateProfileRequest;
import com.inkstash.model.ArtistProfile;
import com.inkstash.model.Role;
import com.inkstash.model.User;
import com.inkstash.repository.ArtistProfileRepository;
import com.inkstash.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final ArtistProfileRepository artistProfileRepository;

    public ProfileService(UserRepository userRepository, ArtistProfileRepository artistProfileRepository) {
        this.userRepository = userRepository;
        this.artistProfileRepository = artistProfileRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getOwnProfile(User principal) {
        User currentUser = requireAuthenticatedUser(principal);
        ArtistProfile profile = currentUser.getRole() == Role.ARTIST
                ? artistProfileRepository.findByUserId(currentUser.getId()).orElse(null)
                : null;
        return toResponse(currentUser, profile);
    }

    @Transactional
    public ProfileResponse updateOwnProfile(User principal, UpdateProfileRequest req) {
        User currentUser = requireAuthenticatedUser(principal);

        currentUser.setFullName(req.fullName().trim());
        User savedUser = userRepository.save(currentUser);

        ArtistProfile savedProfile = null;
        if (savedUser.getRole() == Role.ARTIST) {
            savedProfile = artistProfileRepository.findByUserId(savedUser.getId())
                    .orElseGet(() -> {
                        ArtistProfile created = new ArtistProfile();
                        created.setUser(savedUser);
                        return created;
                    });

            if (req.studioName() != null) {
                String trimmedStudio = req.studioName().trim();
                savedProfile.setStudioName(trimmedStudio.isEmpty() ? null : trimmedStudio);
            }
            if (req.depositPercent() != null) {
                savedProfile.setDepositPercent(req.depositPercent());
            } else if (savedProfile.getDepositPercent() == null) {
                savedProfile.setDepositPercent(BigDecimal.ZERO);
            }
            savedProfile = artistProfileRepository.save(savedProfile);
        }

        return toResponse(savedUser, savedProfile);
    }

    public void assertOwnership(User principal, Long targetUserId) {
        User currentUser = requireAuthenticatedUser(principal);
        if (targetUserId != null && !currentUser.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access or modify your own profile");
        }
    }

    private User requireAuthenticatedUser(User principal) {
        if (principal == null || principal.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private ProfileResponse toResponse(User user, ArtistProfile profile) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getCreatedAt(),
                profile != null ? profile.getStudioName() : null,
                profile != null ? profile.getDepositPercent() : null
        );
    }
}