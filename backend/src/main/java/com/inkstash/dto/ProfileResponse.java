package com.inkstash.dto;

import com.inkstash.model.Role;
import java.math.BigDecimal;
import java.time.Instant;

public record ProfileResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        Instant createdAt,
        String studioName,
        BigDecimal depositPercent
) {}