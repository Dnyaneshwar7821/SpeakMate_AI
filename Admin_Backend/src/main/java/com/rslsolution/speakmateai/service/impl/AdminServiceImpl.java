package com.rslsolution.speakmateai.service.impl;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
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
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
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
	private final StudentRepository studentRepository;
	private final SchoolRepository schoolRepository;

	public AdminServiceImpl(UserRepository userRepository, LessonRepository lessonRepository,
			SpeakingSessionRepository speakingSessionRepository, VocabularyRepository vocabularyRepository,
			AchievementRepository achievementRepository, NotificationRepository notificationRepository,
			StudentRepository studentRepository, SchoolRepository schoolRepository) {

		this.userRepository = userRepository;
		this.lessonRepository = lessonRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.vocabularyRepository = vocabularyRepository;
		this.achievementRepository = achievementRepository;
		this.notificationRepository = notificationRepository;
		this.studentRepository = studentRepository;
		this.schoolRepository = schoolRepository;
	}

	@Override
	public AdminDashboardResponse getDashboard() {
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
		LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).with(LocalTime.MIN);
		LocalDateTime startOfDay = now.with(LocalTime.MIN);

		long totalUsers = userRepository.count();
		long activeUsers = userRepository.countByActiveTrue();
		long inactiveUsers = userRepository.countByActiveFalse();
		long schoolUsers = studentRepository.count();
		long totalSchools = schoolRepository.count();
		long thisMonthRegistrations = userRepository.countByCreatedAtBetween(startOfMonth, now);
		long thisWeekRegistrations = userRepository.countByCreatedAtBetween(startOfWeek, now);
		long todayRegistrations = userRepository.countByCreatedAtBetween(startOfDay, now);
		long newUsers = thisMonthRegistrations;

		return AdminDashboardResponse.builder()
				.totalUsers(totalUsers)
				.activeUsers(activeUsers)
				.inactiveUsers(inactiveUsers)
				.schoolUsers(schoolUsers)
				.totalSchools(totalSchools)
				.newUsers(newUsers)
				.thisMonthRegistrations(thisMonthRegistrations)
				.thisWeekRegistrations(thisWeekRegistrations)
				.todayRegistrations(todayRegistrations)
				.totalLessons(lessonRepository.count())
				.activeLessons(lessonRepository.countByActiveTrue())
				.totalSpeakingSessions(speakingSessionRepository.count())
				.totalVocabularyWords(vocabularyRepository.count())
				.totalAchievements(achievementRepository.count())
				.totalNotifications(notificationRepository.count())
				.build();
	}

	@Override
	public List<UserResponse> getAllUsers() {

		return userRepository.findAll().stream().map(this::mapToUserResponse).toList();
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

		return UserResponse.builder().id(user.getId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.email(user.getEmail()).role(user.getRole()).avatar(user.getAvatar()).active(user.isActive())
				.createdAt(user.getCreatedAt()).build();
	}
}