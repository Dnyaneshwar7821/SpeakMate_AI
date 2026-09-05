package com.rslsolution.speakmateai.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.response.AdminDashboardResponse;
import com.rslsolution.speakmateai.dto.response.UserResponse;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.AchievementRepository;
import com.rslsolution.speakmateai.repository.LessonRepository;
import com.rslsolution.speakmateai.repository.NotificationRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.VocabularyRepository;
import com.rslsolution.speakmateai.service.AdminService;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

	private final UserRepository userRepository;
	private final LessonRepository lessonRepository;
	private final SpeakingSessionRepository speakingSessionRepository;
	private final VocabularyRepository vocabularyRepository;
	private final AchievementRepository achievementRepository;
	private final NotificationRepository notificationRepository;

	public AdminServiceImpl(UserRepository userRepository, LessonRepository lessonRepository,
			SpeakingSessionRepository speakingSessionRepository, VocabularyRepository vocabularyRepository,
			AchievementRepository achievementRepository, NotificationRepository notificationRepository) {

		this.userRepository = userRepository;
		this.lessonRepository = lessonRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.vocabularyRepository = vocabularyRepository;
		this.achievementRepository = achievementRepository;
		this.notificationRepository = notificationRepository;
	}

	@Override
	public AdminDashboardResponse getDashboard() {

		return AdminDashboardResponse.builder().totalUsers(userRepository.count())
				.activeUsers(userRepository.countByActiveTrue()).totalLessons(lessonRepository.count())
				.activeLessons(lessonRepository.countByActiveTrue())
				.totalSpeakingSessions(speakingSessionRepository.count())
				.totalVocabularyWords(vocabularyRepository.count()).totalAchievements(achievementRepository.count())
				.totalNotifications(notificationRepository.count()).build();
	}

	@Override
	public List<UserResponse> getAllUsers() {

		return userRepository.findAll().stream().map(user -> {
			UserResponse response = mapToUserResponse(user);
			response.setAvatar(null);
			return response;
		}).toList();
	}

	@Override
	public UserResponse getUserById(Long id) {

		User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));

		return mapToUserResponse(user);
	}

	@Override
	public UserResponse activateUser(Long id) {

		User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));

		user.setActive(true);

		User updatedUser = userRepository.save(user);

		return mapToUserResponse(updatedUser);
	}

	@Override
	public UserResponse deactivateUser(Long id) {

		User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));

		user.setActive(false);

		User updatedUser = userRepository.save(user);

		return mapToUserResponse(updatedUser);
	}

	private UserResponse mapToUserResponse(User user) {
		String effectiveGrade = user.getSchoolGrade();
		String effectiveLevel = (effectiveGrade != null && !effectiveGrade.trim().isEmpty()) ? null : user.getEnglishLevel();

		return UserResponse.builder().id(user.getId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.email(user.getEmail()).role(user.getRole()).avatar(user.getAvatar()).active(user.isActive())
				.createdAt(user.getCreatedAt()).welcomeCompleted(user.isWelcomeCompleted())
				.onboardingCompleted(user.isOnboardingCompleted())
				.authProvider(user.getAuthProvider()).nativeLanguage(user.getNativeLanguage())
				.englishLevel(effectiveLevel).learningGoal(user.getLearningGoal())
				.dailyGoalMinutes(user.getDailyGoalMinutes()).preferredVoice(user.getPreferredVoice())
				.preferredAccent(user.getPreferredAccent()).ageGroup(user.getAgeGroup())
				.schoolGrade(effectiveGrade).interests(user.getInterests()).build();
	}
}