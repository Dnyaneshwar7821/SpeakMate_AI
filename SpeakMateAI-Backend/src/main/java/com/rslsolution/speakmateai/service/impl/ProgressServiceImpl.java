package com.rslsolution.speakmateai.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.ProgressRequest;
import com.rslsolution.speakmateai.dto.response.ProgressResponse;
import com.rslsolution.speakmateai.entity.Achievement;
import com.rslsolution.speakmateai.entity.LessonProgress;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.ProgressNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.AchievementRepository;
import com.rslsolution.speakmateai.repository.GrammarHistoryRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.VocabularyRepository;
import com.rslsolution.speakmateai.service.ProgressService;

@Service
@Transactional
public class ProgressServiceImpl implements ProgressService {

	private final ProgressRepository progressRepository;
	private final UserRepository userRepository;
	private final SpeakingSessionRepository speakingSessionRepository;
	private final VocabularyRepository vocabularyRepository;
	private final GrammarHistoryRepository grammarHistoryRepository;
	private final LessonProgressRepository lessonProgressRepository;
	private final AchievementRepository achievementRepository;

	public ProgressServiceImpl(ProgressRepository progressRepository, UserRepository userRepository,
			SpeakingSessionRepository speakingSessionRepository,
			VocabularyRepository vocabularyRepository,
			GrammarHistoryRepository grammarHistoryRepository) {
		this(progressRepository, userRepository, speakingSessionRepository, vocabularyRepository,
				grammarHistoryRepository, null, null);
	}

	@Autowired
	public ProgressServiceImpl(ProgressRepository progressRepository, UserRepository userRepository,
			SpeakingSessionRepository speakingSessionRepository,
			VocabularyRepository vocabularyRepository,
			GrammarHistoryRepository grammarHistoryRepository,
			@Autowired(required = false) LessonProgressRepository lessonProgressRepository,
			@Autowired(required = false) AchievementRepository achievementRepository) {
		this.progressRepository = progressRepository;
		this.userRepository = userRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.vocabularyRepository = vocabularyRepository;
		this.grammarHistoryRepository = grammarHistoryRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.achievementRepository = achievementRepository;
	}

	@Override
	public ProgressResponse createProgress(ProgressRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Progress progress = Progress.builder().user(user).xp(request.getXp()).level(request.getLevel())
				.currentStreak(request.getCurrentStreak()).longestStreak(request.getLongestStreak())
				.totalPracticeMinutes(request.getTotalPracticeMinutes())
				.totalSpeakingSessions(request.getTotalSpeakingSessions())
				.totalGrammarChecks(request.getTotalGrammarChecks())
				.totalVocabularyWords(request.getTotalVocabularyWords()).build();

		Progress savedProgress = progressRepository.save(progress);

		return mapToResponse(savedProgress);
	}

	@Override
	public ProgressResponse getProgress() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Progress progress = progressRepository.findByUserId(user.getId())
				.or(() -> progressRepository.findByUser(user))
				.orElseGet(() -> {
					Progress newProgress = Progress.builder()
							.user(user)
							.xp(0)
							.level(1)
							.currentStreak(0)
							.longestStreak(0)
							.totalPracticeMinutes(0)
							.totalSpeakingSessions(0)
							.totalGrammarChecks(0)
							.totalVocabularyWords(0)
							.build();
					return progressRepository.save(newProgress);
				});

		int liveSpeakingSessions = (int) speakingSessionRepository.countByUserIdAndCompletedTrue(user.getId());
		if (liveSpeakingSessions == 0) {
			liveSpeakingSessions = (int) speakingSessionRepository.countByUserAndCompletedTrue(user);
		}
		int liveVocabWords = (int) vocabularyRepository.countByUserId(user.getId());
		if (liveVocabWords == 0) {
			liveVocabWords = (int) vocabularyRepository.countByUser(user);
		}
		int liveGrammarChecks = (int) grammarHistoryRepository.countByUserId(user.getId());

		// Self-healing: If user had inflated speaking sessions (e.g. 81 attempts instead of 6 completed),
		// perform full recalculation and sync of XP, practice minutes, level, and achievements.
		if (progress.getTotalSpeakingSessions() == null || progress.getTotalSpeakingSessions() > liveSpeakingSessions) {
			progress = recalculateUserProgressInternal(user, progress);
		} else {
			int totalXp = progress.getXp() != null ? progress.getXp() : 0;
			int calculatedLevel = Math.max(1, (totalXp / 500) + 1);
			boolean dirty = false;

			if (progress.getLevel() == null || progress.getLevel() != calculatedLevel) {
				progress.setLevel(calculatedLevel);
				dirty = true;
			}
			if (!progress.getTotalSpeakingSessions().equals(liveSpeakingSessions)) {
				progress.setTotalSpeakingSessions(liveSpeakingSessions);
				dirty = true;
			}
			if (progress.getTotalVocabularyWords() == null || progress.getTotalVocabularyWords() < liveVocabWords) {
				progress.setTotalVocabularyWords(liveVocabWords);
				dirty = true;
			}
			if (progress.getTotalGrammarChecks() == null || progress.getTotalGrammarChecks() < liveGrammarChecks) {
				progress.setTotalGrammarChecks(liveGrammarChecks);
				dirty = true;
			}
			if (dirty) {
				progress = progressRepository.save(progress);
			}
		}

		return mapToResponse(progress);
	}

	@Override
	public ProgressResponse updateProgress(ProgressRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Progress progress = progressRepository.findByUserId(user.getId())
				.or(() -> progressRepository.findByUser(user))
				.orElseGet(() -> {
					Progress newProgress = Progress.builder()
							.user(user)
							.xp(0)
							.level(1)
							.currentStreak(0)
							.longestStreak(0)
							.totalPracticeMinutes(0)
							.totalSpeakingSessions(0)
							.totalGrammarChecks(0)
							.totalVocabularyWords(0)
							.build();
					return progressRepository.save(newProgress);
				});

		progress.setXp(request.getXp());
		progress.setLevel(request.getLevel());
		progress.setCurrentStreak(request.getCurrentStreak());
		progress.setLongestStreak(request.getLongestStreak());
		progress.setTotalPracticeMinutes(request.getTotalPracticeMinutes());
		// Total speaking sessions is authoritative from completed speaking sessions in DB
		int completedSpeaking = (int) speakingSessionRepository.countByUserIdAndCompletedTrue(user.getId());
		if (completedSpeaking == 0) {
			completedSpeaking = (int) speakingSessionRepository.countByUserAndCompletedTrue(user);
		}
		progress.setTotalSpeakingSessions(completedSpeaking);
		progress.setTotalGrammarChecks(request.getTotalGrammarChecks());
		progress.setTotalVocabularyWords(request.getTotalVocabularyWords());

		Progress updatedProgress = progressRepository.save(progress);

		return mapToResponse(updatedProgress);
	}

	@Override
	public void deleteProgress() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Progress progress = progressRepository.findByUser(user)
				.orElseThrow(() -> new ProgressNotFoundException("Progress not found"));

		progressRepository.delete(progress);
	}

	@Override
	public ProgressResponse syncProgress() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Progress progress = progressRepository.findByUser(user).orElse(null);
		Progress updated = recalculateUserProgressInternal(user, progress);
		return mapToResponse(updated);
	}

	@Override
	public ProgressResponse recalculateUserProgress(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

		Progress progress = progressRepository.findByUser(user).orElse(null);
		Progress updated = recalculateUserProgressInternal(user, progress);
		return mapToResponse(updated);
	}

	@Override
	public Map<String, Object> recalculateAllUsers() {
		List<User> allUsers = userRepository.findAll();
		int updatedCount = 0;
		List<Map<String, Object>> details = new ArrayList<>();

		for (User user : allUsers) {
			try {
				Progress p = progressRepository.findByUser(user).orElse(null);
				int oldSessions = p != null && p.getTotalSpeakingSessions() != null ? p.getTotalSpeakingSessions() : 0;
				int oldXp = p != null && p.getXp() != null ? p.getXp() : 0;

				Progress updated = recalculateUserProgressInternal(user, p);

				int newSessions = updated.getTotalSpeakingSessions() != null ? updated.getTotalSpeakingSessions() : 0;
				int newXp = updated.getXp() != null ? updated.getXp() : 0;

				boolean changed = (oldSessions != newSessions) || (oldXp != newXp);
				if (changed) {
					updatedCount++;
					String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + 
							(user.getLastName() != null ? " " + user.getLastName() : "")).trim();
					Map<String, Object> item = new HashMap<>();
					item.put("userId", user.getId());
					item.put("name", fullName);
					item.put("email", user.getEmail());
					item.put("oldSpeakingSessions", oldSessions);
					item.put("newSpeakingSessions", newSessions);
					item.put("oldXp", oldXp);
					item.put("newXp", newXp);
					item.put("newLevel", updated.getLevel());
					details.add(item);
				}
			} catch (Exception ex) {
				System.err.println("Error recalculating progress for user " + user.getId() + ": " + ex.getMessage());
			}
		}

		Map<String, Object> response = new HashMap<>();
		response.put("success", true);
		response.put("totalUsersProcessed", allUsers.size());
		response.put("usersUpdated", updatedCount);
		response.put("updatedUsers", details);
		return response;
	}

	/**
	 * Core calculation: Computes legitimate XP, level, speaking sessions, practice minutes,
	 * vocabulary words, grammar checks, and syncs achievements for a user.
	 */
	private Progress recalculateUserProgressInternal(User user, Progress progress) {
		if (user == null) {
			return progress;
		}

		if (progress == null) {
			progress = progressRepository.findByUser(user)
					.orElseGet(() -> Progress.builder()
							.user(user)
							.xp(0)
							.level(1)
							.currentStreak(0)
							.longestStreak(0)
							.totalPracticeMinutes(0)
							.totalSpeakingSessions(0)
							.totalGrammarChecks(0)
							.totalVocabularyWords(0)
							.build());
		}

		// 1. Authoritative completed speaking sessions & minutes & XP & distinct scenarios
		int liveSpeakingSessions = 0;
		int speakingMinutes = 0;
		int speakingXp = 0;
		int distinctScenarios = 0;

		if (speakingSessionRepository != null) {
			liveSpeakingSessions = (int) speakingSessionRepository.countByUserAndCompletedTrue(user);
			List<SpeakingSession> completedSessions = speakingSessionRepository.findByUserAndCompletedTrue(user);
			if (completedSessions != null) {
				for (SpeakingSession s : completedSessions) {
					int duration = s.getDuration() != null ? s.getDuration() : 0;
					speakingMinutes += (int) Math.max(1, Math.ceil(duration / 60.0));
					int sxp = s.getXpEarned() != null ? s.getXpEarned() : 0;
					if (sxp <= 0) {
						sxp = 15;
					}
					speakingXp += sxp;
				}
				distinctScenarios = (int) completedSessions.stream()
						.map(s -> {
							String sc = s.getScenario() != null && !s.getScenario().trim().isEmpty() ? s.getScenario() : s.getTopic();
							return sc != null ? sc.trim().toLowerCase() : "";
						})
						.filter(sc -> !sc.isEmpty())
						.distinct()
						.count();
			}
		}

		// 2. Lesson progress minutes & XP
		int lessonMinutes = 0;
		int lessonXp = 0;
		if (lessonProgressRepository != null) {
			List<LessonProgress> lessonList = lessonProgressRepository.findByUser(user);
			if (lessonList != null) {
				for (LessonProgress lp : lessonList) {
					if (Boolean.TRUE.equals(lp.getCompleted()) || (lp.getProgressPercent() != null && lp.getProgressPercent() == 100)) {
						if (lp.getTimeSpentMinutes() != null) {
							lessonMinutes += lp.getTimeSpentMinutes();
						}
						int lx = lp.getXpEarned() != null ? lp.getXpEarned() : 0;
						if (lx <= 0 && lp.getLesson() != null && lp.getLesson().getXpReward() != null) {
							lx = lp.getLesson().getXpReward();
						}
						lessonXp += lx;
					}
				}
			}
		}

		// 3. Vocabulary & Grammar counts & XP
		int liveVocabWords = vocabularyRepository != null ? (int) vocabularyRepository.countByUser(user) : 0;
		int liveGrammarChecks = grammarHistoryRepository != null ? (int) grammarHistoryRepository.countByUserId(user.getId()) : 0;
		int vocabXp = liveVocabWords * 5;
		int grammarXp = liveGrammarChecks * 5;

		// 4. Re-evaluate and re-lock achievements if conditions are not legitimately met
		int achievementXp = 0;
		if (achievementRepository != null) {
			List<Achievement> achievements = achievementRepository.findByUser(user);
			if (achievements != null) {
				for (Achievement a : achievements) {
					if (Boolean.TRUE.equals(a.getUnlocked())) {
						boolean relock = false;
						String title = a.getTitle();
						if ("First Voice Conversation".equalsIgnoreCase(title) && liveSpeakingSessions < 1) relock = true;
						if ("Confident Conversationalist".equalsIgnoreCase(title) && distinctScenarios < 5) relock = true;
						if ("Fluency Champion".equalsIgnoreCase(title) && liveSpeakingSessions < 15) relock = true;
						if ("Orator Supreme".equalsIgnoreCase(title) && liveSpeakingSessions < 30) relock = true;
						if ("Level 5 Achiever".equalsIgnoreCase(title)) {
							int reward = a.getXpReward() != null ? a.getXpReward() : 200;
							int otherXp = speakingXp + lessonXp + vocabXp + grammarXp + achievementXp;
							int potentialLevel = Math.max(1, ((otherXp + reward) / 500) + 1);
							if (potentialLevel < 5) {
								relock = true;
							}
						}

						if (relock) {
							a.setUnlocked(false);
							a.setUnlockedAt(null);
							achievementRepository.save(a);
						} else {
							achievementXp += (a.getXpReward() != null ? a.getXpReward() : 50);
						}
					}
				}
			}
		}

		// 5. Total accurate XP & minutes calculation
		int calculatedXp = speakingXp + lessonXp + achievementXp + vocabXp + grammarXp;
		int totalMinutes = speakingMinutes + lessonMinutes;

		progress.setTotalSpeakingSessions(liveSpeakingSessions);
		progress.setTotalPracticeMinutes(Math.max(totalMinutes, 0));
		progress.setTotalVocabularyWords(liveVocabWords);
		progress.setTotalGrammarChecks(liveGrammarChecks);

		if (lessonProgressRepository != null || achievementRepository != null) {
			progress.setXp(calculatedXp);
			progress.setLevel(Math.max(1, (calculatedXp / 500) + 1));
		} else {
			// Test/minimal context fallback: keep existing XP if secondary repositories are not wired
			int currentXp = progress.getXp() != null ? progress.getXp() : calculatedXp;
			progress.setXp(currentXp);
			progress.setLevel(Math.max(1, (currentXp / 500) + 1));
		}

		return progressRepository.save(progress);
	}

	private ProgressResponse mapToResponse(Progress progress) {
		int totalXp = progress.getXp() != null ? progress.getXp() : 0;
		int level = progress.getLevel() != null ? progress.getLevel() : Math.max(1, (totalXp / 500) + 1);
		int distinctScenarios = 0;
		if (progress.getUser() != null && speakingSessionRepository != null) {
			List<SpeakingSession> completed = speakingSessionRepository.findByUserAndCompletedTrue(progress.getUser());
			if (completed != null) {
				distinctScenarios = (int) completed.stream()
						.map(s -> {
							String sc = s.getScenario() != null && !s.getScenario().trim().isEmpty() ? s.getScenario() : s.getTopic();
							return sc != null ? sc.trim().toLowerCase() : "";
						})
						.filter(sc -> !sc.isEmpty())
						.distinct()
						.count();
			}
		}
		return ProgressResponse.builder().id(progress.getId()).xp(totalXp).level(level)
				.currentStreak(progress.getCurrentStreak()).longestStreak(progress.getLongestStreak())
				.totalPracticeMinutes(progress.getTotalPracticeMinutes())
				.totalSpeakingSessions(progress.getTotalSpeakingSessions())
				.distinctSpeakingScenarios(distinctScenarios)
				.totalGrammarChecks(progress.getTotalGrammarChecks())
				.totalVocabularyWords(progress.getTotalVocabularyWords()).createdAt(progress.getCreatedAt())
				.updatedAt(progress.getUpdatedAt()).build();
	}
}