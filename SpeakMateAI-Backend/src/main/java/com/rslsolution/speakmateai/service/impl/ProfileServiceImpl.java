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
import com.rslsolution.speakmateai.util.ValidationUtils;

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
		String newEmail = ValidationUtils.normalizeEmail(request.getEmail());
		if (newEmail != null && !newEmail.isEmpty() && !user.getEmail().equalsIgnoreCase(newEmail)) {
			if (userRepository.existsByEmail(newEmail) || userRepository.existsByEmailIgnoreCase(newEmail)) {
				throw new DuplicateEmailException("Email address is already in use by another account.");
			}
			user.setEmail(newEmail);
		}

		if (request.getFirstName() != null) {
			ValidationUtils.validateName(request.getFirstName());
			user.setFirstName(request.getFirstName().trim());
		}
		if (request.getLastName() != null) {
			ValidationUtils.validateName(request.getLastName());
			user.setLastName(request.getLastName().trim());
		}

		if (request.getAvatar() != null && !request.getAvatar().trim().isEmpty()) {
			validateAvatarPayload(request.getAvatar());
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

		validateAvatarPayload(request.getAvatar());

		user.setAvatar(request.getAvatar() != null ? request.getAvatar().trim() : null);

		User updatedUser = userRepository.save(user);

		return mapToProfileResponse(updatedUser);
	}

	public static final int MAX_AVATAR_LENGTH = 65536; // 64 KB limit

	private void validateAvatarPayload(String avatar) {
		if (avatar == null || avatar.trim().isEmpty()) {
			return;
		}
		String trimmed = avatar.trim();
		if (trimmed.length() > MAX_AVATAR_LENGTH) {
			throw new IllegalArgumentException("Avatar data exceeds maximum allowed size (64 KB). Please upload a compressed image.");
		}
		if (trimmed.startsWith("data:")) {
			int commaIdx = trimmed.indexOf(',');
			if (commaIdx == -1) {
				throw new IllegalArgumentException("Malformed image data URI. Missing base64 data separator.");
			}
			String header = trimmed.substring(0, commaIdx).toLowerCase();
			if (!header.startsWith("data:image/jpeg;base64") &&
				!header.startsWith("data:image/jpg;base64") &&
				!header.startsWith("data:image/png;base64") &&
				!header.startsWith("data:image/webp;base64")) {
				throw new IllegalArgumentException("Invalid avatar image format. Only JPEG, PNG, or WebP base64 images are supported.");
			}
			String base64Part = trimmed.substring(commaIdx + 1);
			try {
				java.util.Base64.getDecoder().decode(base64Part);
			} catch (IllegalArgumentException e) {
				throw new IllegalArgumentException("Invalid base64 encoding in avatar image data.");
			}
		}
	}
}
