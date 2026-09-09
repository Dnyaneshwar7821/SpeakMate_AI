package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSettingsResponse {
    
    private String theme;
    private String language;
    private Boolean notificationsEnabled;
    private Boolean emailNotifications;
    private Boolean systemNotifications;
    private Boolean twoFactorEnabled;
    private Integer sessionTimeout;
    private Boolean sidebarCollapsed;
}
