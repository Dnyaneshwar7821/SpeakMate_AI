package com.rslsolution.speakmateai.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.AppearanceSettingsRequest;
import com.rslsolution.speakmateai.dto.request.LanguageSettingsRequest;
import com.rslsolution.speakmateai.dto.request.NotificationSettingsRequest;
import com.rslsolution.speakmateai.dto.request.SecuritySettingsRequest;
import com.rslsolution.speakmateai.dto.response.AdminSettingsResponse;
import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.exception.ResourceNotFoundException;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.service.AdminSettingsService;

@Service
@Transactional
public class AdminSettingsServiceImpl implements AdminSettingsService {

    private final AdminRepository adminRepository;

    public AdminSettingsServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    private AdminSettingsResponse mapToResponse(Admin admin) {
        return AdminSettingsResponse.builder()
                .theme(admin.getTheme())
                .language(admin.getLanguage())
                .notificationsEnabled(admin.getNotificationsEnabled())
                .emailNotifications(admin.getEmailNotifications())
                .systemNotifications(admin.getSystemNotifications())
                .twoFactorEnabled(admin.getTwoFactorEnabled())
                .sessionTimeout(admin.getSessionTimeout())
                .sidebarCollapsed(admin.getSidebarCollapsed())
                .build();
    }

    @Override
    public AdminSettingsResponse getSettings(String email) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
        return mapToResponse(admin);
    }

    @Override
    public AdminSettingsResponse updateAppearance(String email, AppearanceSettingsRequest request) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        admin.setTheme(request.getTheme());
        if (request.getSidebarCollapsed() != null) {
            admin.setSidebarCollapsed(request.getSidebarCollapsed());
        }

        return mapToResponse(adminRepository.save(admin));
    }

    @Override
    public AdminSettingsResponse updateLanguage(String email, LanguageSettingsRequest request) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        admin.setLanguage(request.getLanguage());

        return mapToResponse(adminRepository.save(admin));
    }

    @Override
    public AdminSettingsResponse updateNotifications(String email, NotificationSettingsRequest request) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        admin.setNotificationsEnabled(request.getNotificationsEnabled());
        admin.setEmailNotifications(request.getEmailNotifications());
        admin.setSystemNotifications(request.getSystemNotifications());

        return mapToResponse(adminRepository.save(admin));
    }

    @Override
    public AdminSettingsResponse updateSecurity(String email, SecuritySettingsRequest request) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        admin.setTwoFactorEnabled(request.getTwoFactorEnabled());
        admin.setSessionTimeout(request.getSessionTimeout());

        return mapToResponse(adminRepository.save(admin));
    }
}
