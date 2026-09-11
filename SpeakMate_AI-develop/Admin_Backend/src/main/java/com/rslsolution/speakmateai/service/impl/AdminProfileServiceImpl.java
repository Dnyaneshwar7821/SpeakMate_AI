package com.rslsolution.speakmateai.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.AdminProfileUpdateRequest;
import com.rslsolution.speakmateai.dto.request.ChangePasswordRequest;
import com.rslsolution.speakmateai.dto.response.AdminProfileResponse;
import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.exception.ResourceNotFoundException;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.service.AdminProfileService;

@Service
@Transactional
public class AdminProfileServiceImpl implements AdminProfileService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminProfileServiceImpl(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private AdminProfileResponse mapToResponse(Admin admin) {
        return AdminProfileResponse.builder()
                .id(admin.getId())
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .department(admin.getDepartment())
                .designation(admin.getDesignation())
                .location(admin.getLocation())
                .role(admin.getRole().name())
                .status(admin.getStatus())
                .lastLogin(admin.getLastLogin())
                .createdAt(admin.getCreatedAt())
                .updatedAt(admin.getUpdatedAt())
                .build();
    }

    @Override
    public AdminProfileResponse getProfile(String email) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
        return mapToResponse(admin);
    }

    @Override
    public AdminProfileResponse updateProfile(String email, AdminProfileUpdateRequest request) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        admin.setFullName(request.getFullName());
        admin.setPhone(com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getPhone(), "Phone number"));
        admin.setDepartment(request.getDepartment());
        admin.setDesignation(request.getDesignation());
        admin.setLocation(request.getLocation());

        return mapToResponse(adminRepository.save(admin));
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepository.save(admin);
    }
}
