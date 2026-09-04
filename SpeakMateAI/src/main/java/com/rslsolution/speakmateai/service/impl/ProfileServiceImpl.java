package com.rslsolution.speakmateai.service.impl;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.AvatarRequest;
import com.rslsolution.speakmateai.dto.request.ProfileRequest;
import com.rslsolution.speakmateai.dto.response.ProfileResponse;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.DuplicateEmailException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.ProfileService;

@Service
@Transactional
public class ProfileServiceImpl implements ProfileService {

	private final UserRepository userRepository;
	private final ProgressRepository progressRepository;

	public ProfileServiceImpl(UserRepository userRepository, ProgressRepository progressRepository) {
		this.userRepository = userRepository;
		this.progressRepository = progressRepository;
	}

	private ProfileResponse mapToProfileResponse(User user) {
		Progress progress = progressRepository.findByUser(user).orElse(null);
		int xp = progress != null && progress.getXp() != null ? progress.getXp() : 0;
		int calculatedLevel = (xp / 500) + 1;
		if (progress != null && (progress.getLevel() == null || progress.getLevel() != calculatedLevel)) {
			progress.setLevel(calculatedLevel);
			progressRepository.save(progress);
		}
		String effectiveGrade = user.getSchoolGrade();
		String effectiveLevel = (effectiveGrade != null && !effectiveGrade.trim().isEmpty()) ? null : user.getEnglishLevel();
		boolean isStudent = (user.getSchoolId() != null) ||
				(user.getRole() != null && user.getRole() == com.rslsolution.speakmateai.enums.Role.STUDENT);

		return ProfileResponse.builder()
				.id(user.getId())
				.firstName(user.getFirstName())
				.lastName(user.getLastName())
				.email(user.getEmail())
				.role(user.getRole().name())
				.avatar(user.getAvatar())
				.englishLevel(effectiveLevel)
				.learningGoal(user.getLearningGoal())
				.ageGroup(user.getAgeGroup())
				.schoolGrade(effectiveGrade)
				.schoolId(user.getSchoolId())
				.isSchoolStudent(isStudent)
				.xp(xp)
				.level(calculatedLevel)
				.currentStreak(progress != null && progress.getCurrentStreak() != null ? progress.getCurrentStreak() : 0)
				.longestStreak(progress != null && progress.getLongestStreak() != null ? progress.getLongestStreak() : 0)
				.totalPracticeMinutes(progress != null && progress.getTotalPracticeMinutes() != null ? progress.getTotalPracticeMinutes() : 0)
				.totalSpeakingSessions(progress != null && progress.getTotalSpeakingSessions() != null ? progress.getTotalSpeakingSessions() : 0)
				.totalGrammarChecks(progress != null && progress.getTotalGrammarChecks() != null ? progress.getTotalGrammarChecks() : 0)
				.totalVocabularyWords(progress != null && progress.getTotalVocabularyWords() != null ? progress.getTotalVocabularyWords() : 0)
				.build();
	}

	@Override
	public ProfileResponse getProfile() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		return mapToProfileResponse(user);
	}

	@Override
	public ProfileResponse updateProfile(ProfileRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		if (request == null) {
			return mapToProfileResponse(user);
		}

		// Check if email is changing and if new email already exists
		if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !user.getEmail().equalsIgnoreCase(request.getEmail().trim())) {
			if (userRepository.findByEmail(request.getEmail().toLowerCase().trim()).isPresent()) {
				throw new DuplicateEmailException("Email address is already in use by another account.");
			}
			user.setEmail(request.getEmail().toLowerCase().trim());
		}

		if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
			user.setFirstName(request.getFirstName().trim());
		}
		if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
			user.setLastName(request.getLastName().trim());
		}

		if (request.getAvatar() != null && !request.getAvatar().trim().isEmpty()) {
			if (request.getAvatar().length() > 65536) {
				throw new IllegalArgumentException("Avatar data exceeds maximum allowed size (64 KB).");
			}
			user.setAvatar(request.getAvatar().trim());
		}
		if (request.getEnglishLevel() != null && !request.getEnglishLevel().trim().isEmpty()) {
			user.setEnglishLevel(request.getEnglishLevel().trim());
		}
		if (request.getLearningGoal() != null && !request.getLearningGoal().trim().isEmpty()) {
			user.setLearningGoal(request.getLearningGoal().trim());
		}
		if (request.getAgeGroup() != null && !request.getAgeGroup().trim().isEmpty()) {
			user.setAgeGroup(request.getAgeGroup().trim());
		}
		if (request.getSchoolGrade() != null) {
			user.setSchoolGrade(request.getSchoolGrade().trim().isEmpty() ? null : request.getSchoolGrade().trim());
		}

		User updatedUser = userRepository.save(user);

		return mapToProfileResponse(updatedUser);
	}

	@Override
	public ProfileResponse updateAvatar(AvatarRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		if (request.getAvatar() != null && request.getAvatar().length() > 65536) {
			throw new IllegalArgumentException("Avatar data exceeds maximum allowed size (64 KB). Please upload a smaller image.");
		}

		user.setAvatar(request.getAvatar());

		User updatedUser = userRepository.save(user);

		return mapToProfileResponse(updatedUser);
	}
}