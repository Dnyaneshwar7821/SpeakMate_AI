package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.AvatarRequest;
import com.rslsolution.speakmateai.dto.request.ProfileRequest;
import com.rslsolution.speakmateai.dto.response.ProfileResponse;

public interface ProfileService {

	ProfileResponse getProfile();

	ProfileResponse updateProfile(ProfileRequest request);

	ProfileResponse updateAvatar(AvatarRequest request);
}