package com.rslsolution.speakmateai.service.impl;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.OnboardingRequest;
import com.rslsolution.speakmateai.dto.response.OnboardingResponse;
import com.rslsolution.speakmateai.entity.Onboarding;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.OnboardingNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.OnboardingRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.OnboardingService;

@Service
@Transactional
public class OnboardingServiceImpl implements OnboardingService {

	private final OnboardingRepository onboardingRepository;
	private final UserRepository userRepository;

	public OnboardingServiceImpl(OnboardingRepository onboardingRepository, UserRepository userRepository) {
		this.onboardingRepository = onboardingRepository;
		this.userRepository = userRepository;
	}

	@Override
	public OnboardingResponse createOnboarding(OnboardingRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Onboarding onboarding = Onboarding.builder().user(user).englishLevel(request.getEnglishLevel())
				.learningGoal(request.getLearningGoal()).dailyGoalMinutes(request.getDailyGoalMinutes())
				.nativeLanguage(request.getNativeLanguage()).preferredLearningTime(request.getPreferredLearningTime())
				.interests(request.getInterests()).ageGroup(request.getAgeGroup())
				.onboardingCompleted(request.getOnboardingCompleted()).build();

		Onboarding savedOnboarding = onboardingRepository.save(onboarding);
		syncUserOnboarding(user, request);

		return mapToResponse(savedOnboarding);
	}

	@Override
	public OnboardingResponse getOnboarding() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		// For a brand-new user who has not yet completed the onboarding flow,
		// auto-create a default Onboarding record instead of returning 404.
		Onboarding onboarding = onboardingRepository.findByUser(user)
				.orElseGet(() -> {
					Onboarding defaultOnboarding = Onboarding.builder()
							.user(user)
							.englishLevel("Beginner")
							.learningGoal("Improve English speaking skills")
							.dailyGoalMinutes(15)
							.nativeLanguage("English")
							.preferredLearningTime("Morning")
							.interests("General")
							.ageGroup("Professional")
							.onboardingCompleted(false)
							.build();
					return onboardingRepository.save(defaultOnboarding);
				});

		return mapToResponse(onboarding);
	}

	@Override
	public OnboardingResponse updateOnboarding(OnboardingRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		// Create-then-update pattern: never throw 404 for a missing onboarding record.
		Onboarding onboarding = onboardingRepository.findByUser(user)
				.orElseGet(() -> {
					Onboarding defaultOnboarding = Onboarding.builder()
							.user(user)
							.englishLevel("Beginner")
							.learningGoal("Improve English speaking skills")
							.dailyGoalMinutes(15)
							.nativeLanguage("English")
							.preferredLearningTime("Morning")
							.interests("General")
							.ageGroup("Professional")
							.onboardingCompleted(false)
							.build();
					return onboardingRepository.save(defaultOnboarding);
				});

		onboarding.setEnglishLevel(request.getEnglishLevel());
		onboarding.setLearningGoal(request.getLearningGoal());
		onboarding.setDailyGoalMinutes(request.getDailyGoalMinutes());
		onboarding.setNativeLanguage(request.getNativeLanguage());
		onboarding.setPreferredLearningTime(request.getPreferredLearningTime());
		onboarding.setInterests(request.getInterests());
		if (request.getAgeGroup() != null) {
			onboarding.setAgeGroup(request.getAgeGroup());
		}
		onboarding.setOnboardingCompleted(request.getOnboardingCompleted());

		Onboarding updatedOnboarding = onboardingRepository.save(onboarding);
		syncUserOnboarding(user, request);

		return mapToResponse(updatedOnboarding);
	}

	@Override
	public void deleteOnboarding() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Onboarding onboarding = onboardingRepository.findByUser(user)
				.orElseThrow(() -> new OnboardingNotFoundException("Onboarding not found"));

		onboardingRepository.delete(onboarding);
	}

	private OnboardingResponse mapToResponse(Onboarding onboarding) {

		return OnboardingResponse.builder().id(onboarding.getId()).englishLevel(onboarding.getEnglishLevel())
				.learningGoal(onboarding.getLearningGoal()).dailyGoalMinutes(onboarding.getDailyGoalMinutes())
				.nativeLanguage(onboarding.getNativeLanguage())
				.preferredLearningTime(onboarding.getPreferredLearningTime()).interests(onboarding.getInterests())
				.ageGroup(onboarding.getAgeGroup())
				.onboardingCompleted(onboarding.getOnboardingCompleted()).createdAt(onboarding.getCreatedAt())
				.updatedAt(onboarding.getUpdatedAt()).build();
	}

	private void syncUserOnboarding(User user, OnboardingRequest request) {

		user.setNativeLanguage(request.getNativeLanguage());
		user.setEnglishLevel(request.getEnglishLevel());
		user.setLearningGoal(request.getLearningGoal());
		user.setDailyGoalMinutes(request.getDailyGoalMinutes());
		user.setPreferredVoice(request.getPreferredVoice());
		user.setPreferredAccent(request.getPreferredAccent());
		if (request.getAgeGroup() != null) {
			user.setAgeGroup(request.getAgeGroup());
		}
		user.setInterests(request.getInterests());
		user.setOnboardingCompleted(Boolean.TRUE.equals(request.getOnboardingCompleted()));
		userRepository.save(user);
	}
}
