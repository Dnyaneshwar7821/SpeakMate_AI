package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.AdminProfileUpdateRequest;
import com.rslsolution.speakmateai.dto.request.ChangePasswordRequest;
import com.rslsolution.speakmateai.dto.response.AdminProfileResponse;

public interface AdminProfileService {

    AdminProfileResponse getProfile(String email);

    AdminProfileResponse updateProfile(String email, AdminProfileUpdateRequest request);

    AdminProfileResponse updateAvatar(String email, String profileImage);

    void changePassword(String email, ChangePasswordRequest request);
}
