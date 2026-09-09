package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecuritySettingsRequest {

    @NotNull(message = "Two factor enabled status is required")
    private Boolean twoFactorEnabled;

    @NotNull(message = "Session timeout is required")
    @Min(value = 5, message = "Session timeout must be at least 5 minutes")
    private Integer sessionTimeout;
}
