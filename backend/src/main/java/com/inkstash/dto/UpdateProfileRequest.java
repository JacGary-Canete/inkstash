package com.inkstash.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record UpdateProfileRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String fullName,

        @Size(max = 120, message = "Studio name must be at most 120 characters")
        String studioName,

        @DecimalMin(value = "0.00", message = "Deposit percent cannot be negative")
        @DecimalMax(value = "100.00", message = "Deposit percent cannot exceed 100")
        BigDecimal depositPercent
) {}