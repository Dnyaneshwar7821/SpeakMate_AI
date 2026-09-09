package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.OnboardingRequest;
import com.rslsolution.speakmateai.dto.response.OnboardingResponse;

public interface OnboardingService {

	OnboardingResponse createOnboarding(OnboardingRequest request);

	OnboardingResponse getOnboarding();

	OnboardingResponse updateOnboarding(OnboardingRequest request);

	void deleteOnboarding();

}