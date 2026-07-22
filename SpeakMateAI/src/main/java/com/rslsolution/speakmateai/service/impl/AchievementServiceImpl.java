package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.AchievementRequest;
import com.rslsolution.speakmateai.dto.response.AchievementResponse;
import com.rslsolution.speakmateai.entity.Achievement;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.AchievementNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.AchievementRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.AchievementService;
import com.rslsolution.speakmateai.service.NotificationService;

@Service
@Transactional
public class AchievementServiceImpl implements AchievementService {

	private final AchievementRepository achievementRepository;
	private final UserRepository userRepository;
	private final com.rslsolution.speakmateai.repository.ProgressRepository progressRepository;
	private final NotificationService notificationService;

	public AchievementServiceImpl(AchievementRepository achievementRepository, UserRepository userRepository,
			com.rslsolution.speakmateai.repository.ProgressRepository progressRepository,
			NotificationService notificationService) {
		this.achievementRepository = achievementRepository;
		this.userRepository = userRepository;
		this.progressRepository = progressRepository;
		this.notificationService = notificationService;
	}

	@Override
	public AchievementResponse createAchievement(AchievementRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Achievement achievement = Achievement.builder().user(user).title(request.getTitle())
				.description(request.getDescription()).xpReward(request.getXpReward())
				.tier(request.getTier() != null ? request.getTier() : 1)
				.unlocked(request.getUnlocked())
				.unlockedAt(request.getUnlocked() ? LocalDateTime.now() : null).build();

		Achievement savedAchievement = achievementRepository.save(achievement);

		return AchievementResponse.builder().id(savedAchievement.getId()).title(savedAchievement.getTitle())
				.description(savedAchievement.getDescription()).xpReward(savedAchievement.getXpReward())
				.tier(savedAchievement.getTier())
				.unlocked(savedAchievement.getUnlocked()).unlockedAt(savedAchievement.getUnlockedAt())
				.createdAt(savedAchievement.getCreatedAt()).build();
	}

	@Override
	public List<AchievementResponse> getAllAchievements() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		List<Achievement> userAchievements = achievementRepository.findByUser(user);

		if (userAchievements.isEmpty()) {
			userAchievements = generateTierAchievements(user, 1);
			userAchievements = achievementRepository.saveAll(userAchievements);
		}

		com.rslsolution.speakmateai.entity.Progress progress = progressRepository.findByUser(user)
				.orElseGet(() -> com.rslsolution.speakmateai.entity.Progress.builder().user(user).xp(0).level(1).currentStreak(0).longestStreak(0).totalPracticeMinutes(0).totalSpeakingSessions(0).totalGrammarChecks(0).totalVocabularyWords(0).build());

		boolean progressUpdated = false;

		for (Achievement achievement : userAchievements) {
			if (!Boolean.TRUE.equals(achievement.getUnlocked())) {
				boolean shouldUnlock = checkUnlockCondition(achievement, progress);

				if (shouldUnlock) {
					achievement.setUnlocked(true);
					achievement.setUnlockedAt(LocalDateTime.now());
					achievementRepository.save(achievement);

					progress.setXp((progress.getXp() == null ? 0 : progress.getXp()) + (achievement.getXpReward() == null ? 50 : achievement.getXpReward()));
					progressUpdated = true;

					try {
						notificationService.createSystemNotification(user,
								"Achievement Unlocked! 🏆",
								"You earned: \"" + achievement.getTitle() + "\" — " + achievement.getDescription()
										+ " (+" + achievement.getXpReward() + " XP)");
					} catch (Exception ignored) {}
				}
			}
		}

		// Check if the current highest tier has completed all 6 cases, and auto-renew next tier
		int maxTier = userAchievements.stream()
				.mapToInt(a -> a.getTier() != null ? a.getTier() : 1)
				.max().orElse(1);

		List<Achievement> maxTierAchievements = userAchievements.stream()
				.filter(a -> (a.getTier() != null ? a.getTier() : 1) == maxTier)
				.toList();

		boolean maxTierCompleted = !maxTierAchievements.isEmpty() && maxTierAchievements.stream().allMatch(a -> Boolean.TRUE.equals(a.getUnlocked()));

		if (maxTierCompleted) {
			int nextTier = maxTier + 1;
			List<Achievement> newTierAchievements = generateTierAchievements(user, nextTier);
			List<Achievement> savedNewTier = achievementRepository.saveAll(newTierAchievements);
			userAchievements.addAll(savedNewTier);

			try {
				notificationService.createSystemNotification(user,
						"Medal Case Renewed! 🏆",
						"Congratulations! You completed all Tier " + maxTier + " achievement medals! Tier " + nextTier + " challenges are now unlocked!");
			} catch (Exception ignored) {}
		}

		if (progressUpdated) {
			progressRepository.save(progress);
		}

		return userAchievements.stream()
				.map(achievement -> AchievementResponse.builder()
						.id(achievement.getId())
						.title(achievement.getTitle())
						.description(achievement.getDescription())
						.xpReward(achievement.getXpReward())
						.tier(achievement.getTier() != null ? achievement.getTier() : 1)
						.unlocked(achievement.getUnlocked())
						.unlockedAt(achievement.getUnlockedAt())
						.createdAt(achievement.getCreatedAt())
						.build())
				.toList();
	}

	private List<Achievement> generateTierAchievements(User user, int tier) {
		if (tier == 1) {
			return List.of(
				Achievement.builder().user(user).tier(1).title("First Steps").description("Complete your first lesson!").xpReward(50).unlocked(false).build(),
				Achievement.builder().user(user).tier(1).title("Speak Up").description("Complete your first speaking session!").xpReward(50).unlocked(false).build(),
				Achievement.builder().user(user).tier(1).title("Word Collector").description("Save 5 words to your vocabulary!").xpReward(50).unlocked(false).build(),
				Achievement.builder().user(user).tier(1).title("Grammar Guru").description("Perform 3 grammar corrections!").xpReward(50).unlocked(false).build(),
				Achievement.builder().user(user).tier(1).title("Hot Streak").description("Reach a 3-day learning streak!").xpReward(50).unlocked(false).build(),
				Achievement.builder().user(user).tier(1).title("Super Scholar").description("Earn 500 total learning XP!").xpReward(100).unlocked(false).build()
			);
		} else if (tier == 2) {
			return List.of(
				Achievement.builder().user(user).tier(2).title("Lesson Master I").description("Complete 5 practice sessions or 60 minutes!").xpReward(75).unlocked(false).build(),
				Achievement.builder().user(user).tier(2).title("Fluent Speaker I").description("Complete 5 speaking sessions!").xpReward(75).unlocked(false).build(),
				Achievement.builder().user(user).tier(2).title("Vocabulary Builder").description("Save 15 words to your vocabulary!").xpReward(75).unlocked(false).build(),
				Achievement.builder().user(user).tier(2).title("Grammar Expert").description("Perform 10 grammar corrections!").xpReward(75).unlocked(false).build(),
				Achievement.builder().user(user).tier(2).title("Weekly Warrior").description("Reach a 7-day learning streak!").xpReward(100).unlocked(false).build(),
				Achievement.builder().user(user).tier(2).title("Knowledge Elite").description("Earn 1,000 total learning XP!").xpReward(150).unlocked(false).build()
			);
		} else if (tier == 3) {
			return List.of(
				Achievement.builder().user(user).tier(3).title("Lesson Master II").description("Practice for 150 total minutes!").xpReward(100).unlocked(false).build(),
				Achievement.builder().user(user).tier(3).title("Fluent Speaker II").description("Complete 15 speaking sessions!").xpReward(100).unlocked(false).build(),
				Achievement.builder().user(user).tier(3).title("Lexicon Master").description("Save 30 words to your vocabulary!").xpReward(100).unlocked(false).build(),
				Achievement.builder().user(user).tier(3).title("Grammar Master").description("Perform 25 grammar corrections!").xpReward(100).unlocked(false).build(),
				Achievement.builder().user(user).tier(3).title("Dedicated Learner").description("Reach a 14-day learning streak!").xpReward(150).unlocked(false).build(),
				Achievement.builder().user(user).tier(3).title("Master Scholar").description("Earn 2,500 total learning XP!").xpReward(200).unlocked(false).build()
			);
		} else {
			int minutesGoal = tier * 60;
			int speakingGoal = tier * 5;
			int vocabGoal = tier * 10;
			int grammarGoal = tier * 8;
			int streakGoal = tier * 5;
			int xpGoal = tier * 1000;

			return List.of(
				Achievement.builder().user(user).tier(tier).title("Practice Marathon Tier " + tier).description("Practice for " + minutesGoal + " total minutes!").xpReward(120).unlocked(false).build(),
				Achievement.builder().user(user).tier(tier).title("Orator Tier " + tier).description("Complete " + speakingGoal + " speaking sessions!").xpReward(120).unlocked(false).build(),
				Achievement.builder().user(user).tier(tier).title("Vocabulary Giant Tier " + tier).description("Save " + vocabGoal + " vocabulary words!").xpReward(120).unlocked(false).build(),
				Achievement.builder().user(user).tier(tier).title("Grammar Virtuoso Tier " + tier).description("Perform " + grammarGoal + " grammar checks!").xpReward(120).unlocked(false).build(),
				Achievement.builder().user(user).tier(tier).title("Unstoppable Streak Tier " + tier).description("Reach a " + streakGoal + "-day streak!").xpReward(150).unlocked(false).build(),
				Achievement.builder().user(user).tier(tier).title("Grandmaster Tier " + tier).description("Earn " + xpGoal + " total learning XP!").xpReward(250).unlocked(false).build()
			);
		}
	}

	private boolean checkUnlockCondition(Achievement achievement, com.rslsolution.speakmateai.entity.Progress progress) {
		String title = achievement.getTitle();
		int tier = achievement.getTier() != null ? achievement.getTier() : 1;

		if (tier == 1) {
			if ("First Steps".equalsIgnoreCase(title)) {
				return (progress.getTotalPracticeMinutes() != null && progress.getTotalPracticeMinutes() > 0) || (progress.getXp() != null && progress.getXp() >= 20);
			} else if ("Speak Up".equalsIgnoreCase(title)) {
				return progress.getTotalSpeakingSessions() != null && progress.getTotalSpeakingSessions() > 0;
			} else if ("Word Collector".equalsIgnoreCase(title)) {
				return progress.getTotalVocabularyWords() != null && progress.getTotalVocabularyWords() >= 5;
			} else if ("Grammar Guru".equalsIgnoreCase(title)) {
				return progress.getTotalGrammarChecks() != null && progress.getTotalGrammarChecks() >= 3;
			} else if ("Hot Streak".equalsIgnoreCase(title)) {
				return progress.getLongestStreak() != null && progress.getLongestStreak() >= 3;
			} else if ("Super Scholar".equalsIgnoreCase(title)) {
				return progress.getXp() != null && progress.getXp() >= 500;
			}
		} else if (tier == 2) {
			if ("Lesson Master I".equalsIgnoreCase(title)) {
				return (progress.getTotalPracticeMinutes() != null && progress.getTotalPracticeMinutes() >= 60) || (progress.getTotalSpeakingSessions() != null && progress.getTotalSpeakingSessions() >= 3);
			} else if ("Fluent Speaker I".equalsIgnoreCase(title)) {
				return progress.getTotalSpeakingSessions() != null && progress.getTotalSpeakingSessions() >= 5;
			} else if ("Vocabulary Builder".equalsIgnoreCase(title)) {
				return progress.getTotalVocabularyWords() != null && progress.getTotalVocabularyWords() >= 15;
			} else if ("Grammar Expert".equalsIgnoreCase(title)) {
				return progress.getTotalGrammarChecks() != null && progress.getTotalGrammarChecks() >= 10;
			} else if ("Weekly Warrior".equalsIgnoreCase(title)) {
				return progress.getLongestStreak() != null && progress.getLongestStreak() >= 7;
			} else if ("Knowledge Elite".equalsIgnoreCase(title)) {
				return progress.getXp() != null && progress.getXp() >= 1000;
			}
		} else if (tier == 3) {
			if ("Lesson Master II".equalsIgnoreCase(title)) {
				return progress.getTotalPracticeMinutes() != null && progress.getTotalPracticeMinutes() >= 150;
			} else if ("Fluent Speaker II".equalsIgnoreCase(title)) {
				return progress.getTotalSpeakingSessions() != null && progress.getTotalSpeakingSessions() >= 15;
			} else if ("Lexicon Master".equalsIgnoreCase(title)) {
				return progress.getTotalVocabularyWords() != null && progress.getTotalVocabularyWords() >= 30;
			} else if ("Grammar Master".equalsIgnoreCase(title)) {
				return progress.getTotalGrammarChecks() != null && progress.getTotalGrammarChecks() >= 25;
			} else if ("Dedicated Learner".equalsIgnoreCase(title)) {
				return progress.getLongestStreak() != null && progress.getLongestStreak() >= 14;
			} else if ("Master Scholar".equalsIgnoreCase(title)) {
				return progress.getXp() != null && progress.getXp() >= 2500;
			}
		} else {
			if (title.startsWith("Practice Marathon")) {
				return progress.getTotalPracticeMinutes() != null && progress.getTotalPracticeMinutes() >= tier * 60;
			} else if (title.startsWith("Orator")) {
				return progress.getTotalSpeakingSessions() != null && progress.getTotalSpeakingSessions() >= tier * 5;
			} else if (title.startsWith("Vocabulary Giant")) {
				return progress.getTotalVocabularyWords() != null && progress.getTotalVocabularyWords() >= tier * 10;
			} else if (title.startsWith("Grammar Virtuoso")) {
				return progress.getTotalGrammarChecks() != null && progress.getTotalGrammarChecks() >= tier * 8;
			} else if (title.startsWith("Unstoppable Streak")) {
				return progress.getLongestStreak() != null && progress.getLongestStreak() >= tier * 5;
			} else if (title.startsWith("Grandmaster")) {
				return progress.getXp() != null && progress.getXp() >= tier * 1000;
			}
		}

		return false;
	}

	@Override
	public AchievementResponse getAchievementById(Long id) {

		Achievement achievement = achievementRepository.findById(id)
				.orElseThrow(() -> new AchievementNotFoundException("Achievement not found"));

		return AchievementResponse.builder().id(achievement.getId()).title(achievement.getTitle())
				.description(achievement.getDescription()).xpReward(achievement.getXpReward())
				.unlocked(achievement.getUnlocked()).unlockedAt(achievement.getUnlockedAt())
				.createdAt(achievement.getCreatedAt()).build();
	}

	@Override
	public List<AchievementResponse> getUnlockedAchievements() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		return achievementRepository.findByUserAndUnlockedTrue(user).stream()
				.map(achievement -> AchievementResponse.builder().id(achievement.getId()).title(achievement.getTitle())
						.description(achievement.getDescription()).xpReward(achievement.getXpReward())
						.unlocked(achievement.getUnlocked()).unlockedAt(achievement.getUnlockedAt())
						.createdAt(achievement.getCreatedAt()).build())
				.toList();
	}

	@Override
	public void deleteAchievementById(Long id) {

		Achievement achievement = achievementRepository.findById(id)
				.orElseThrow(() -> new AchievementNotFoundException("Achievement not found"));

		achievementRepository.delete(achievement);
	}
}