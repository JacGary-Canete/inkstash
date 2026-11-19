package com.inkstash.dto;

import com.inkstash.model.Role;

public record AuthResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        String token
) {}