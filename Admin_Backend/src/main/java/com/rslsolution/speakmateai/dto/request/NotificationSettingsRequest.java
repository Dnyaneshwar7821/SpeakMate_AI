package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettingsRequest {

    @NotNull(message = "Notifications enabled status is required")
    private Boolean notificationsEnabled;

    @NotNull(message = "Email notifications status is required")
    private Boolean emailNotifications;

    @NotNull(message = "System notifications status is required")
    private Boolean systemNotifications;
}
