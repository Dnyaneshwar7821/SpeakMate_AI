package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.AppearanceSettingsRequest;
import com.rslsolution.speakmateai.dto.request.LanguageSettingsRequest;
import com.rslsolution.speakmateai.dto.request.NotificationSettingsRequest;
import com.rslsolution.speakmateai.dto.request.SecuritySettingsRequest;
import com.rslsolution.speakmateai.dto.response.AdminSettingsResponse;

public interface AdminSettingsService {

    AdminSettingsResponse getSettings(String email);

    AdminSettingsResponse updateAppearance(String email, AppearanceSettingsRequest request);

    AdminSettingsResponse updateLanguage(String email, LanguageSettingsRequest request);

    AdminSettingsResponse updateNotifications(String email, NotificationSettingsRequest request);

    AdminSettingsResponse updateSecurity(String email, SecuritySettingsRequest request);
}
