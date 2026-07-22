package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.LessonProgressRequest;
import com.rslsolution.speakmateai.dto.request.LessonRequest;
import com.rslsolution.speakmateai.dto.response.CategoryResponse;
import com.rslsolution.speakmateai.dto.response.LessonProgressResponse;
import com.rslsolution.speakmateai.dto.response.LessonResponse;
import com.rslsolution.speakmateai.entity.Lesson;
import com.rslsolution.speakmateai.entity.LessonProgress;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.LessonNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.LessonRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.LessonService;
import com.rslsolution.speakmateai.service.NotificationService;

@Service
@Transactional
public class LessonServiceImpl implements LessonService {

	private static final Map<String, String> CATEGORY_ICONS = Map.ofEntries(
			Map.entry("Grammar", "book-outline"),
			Map.entry("Vocabulary", "library-outline"),
			Map.entry("Speaking", "mic-outline"),
			Map.entry("Listening", "ear-outline"),
			Map.entry("Pronunciation", "volume-high-outline"),
			Map.entry("Conversation", "chatbubbles-outline"),
			Map.entry("Business English", "briefcase-outline"),
			Map.entry("Interview Preparation", "document-text-outline"),
			Map.entry("Travel English", "airplane-outline"),
			Map.entry("Daily English", "sunny-outline"));

	private final LessonRepository lessonRepository;
	private final LessonProgressRepository progressRepository;
	private final UserRepository userRepository;
	private final ProgressRepository userProgressRepository;
	private final NotificationService notificationService;

	public LessonServiceImpl(LessonRepository lessonRepository,
			LessonProgressRepository progressRepository,
			UserRepository userRepository,
			ProgressRepository userProgressRepository,
			NotificationService notificationService) {
		this.lessonRepository = lessonRepository;
		this.progressRepository = progressRepository;
		this.userRepository = userRepository;
		this.userProgressRepository = userProgressRepository;
		this.notificationService = notificationService;
	}

	// ── Helpers ───────────────────────────────────────────────────────

	private User currentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
			return null;
		}
		return userRepository.findByEmail(auth.getName())
				.orElse(null);
	}

	private LessonResponse mapToResponse(Lesson lesson) {
		return mapToResponse(lesson, null);
	}

	private LessonResponse mapToResponse(Lesson lesson, LessonProgress progress) {
		LessonResponse.LessonResponseBuilder b = LessonResponse.builder()
				.id(lesson.getId())
				.title(lesson.getTitle())
				.category(lesson.getCategory())
				.level(lesson.getLevel())
				.description(lesson.getDescription())
				.content(lesson.getContent())
				.duration(lesson.getDuration())
				.active(lesson.getActive())
				.createdAt(lesson.getCreatedAt())
				.updatedAt(lesson.getUpdatedAt())
				.xpReward(lesson.getXpReward())
				.thumbnail(lesson.getThumbnail())
				.coverImage(lesson.getCoverImage())
				.locked(lesson.getLocked())
				.requiredXP(lesson.getRequiredXP())
				.requiredLevel(lesson.getRequiredLevel())
				.estimatedMinutes(lesson.getEstimatedMinutes())
				.orderIndex(lesson.getOrderIndex())
				.skills(lesson.getSkills())
				.objectives(lesson.getObjectives())
				.requirements(lesson.getRequirements())
				.popular(lesson.getPopular())
				.featured(lesson.getFeatured());

		if (progress != null) {
			b.progressPercent(progress.getProgressPercent())
					.completed(progress.getCompleted())
					.lastSectionIndex(progress.getLastSectionIndex())
					.xpEarned(progress.getXpEarned())
					.lastOpenedAt(progress.getLastOpenedAt())
					.completedAt(progress.getCompletedAt());
		} else {
			b.progressPercent(0).completed(false).lastSectionIndex(0).xpEarned(0);
		}
		return b.build();
	}

	private LessonResponse mapWithUserProgress(Lesson lesson, User user) {
		if (user == null) return mapToResponse(lesson);
		Optional<LessonProgress> prog = progressRepository.findByUserAndLesson(user, lesson);
		return mapToResponse(lesson, prog.orElse(null));
	}

	private LessonProgressResponse mapProgressToResponse(LessonProgress p) {
		return LessonProgressResponse.builder()
				.id(p.getId())
				.lessonId(p.getLesson().getId())
				.lessonTitle(p.getLesson().getTitle())
				.lessonCategory(p.getLesson().getCategory())
				.lessonLevel(p.getLesson().getLevel())
				.progressPercent(p.getProgressPercent())
				.completed(p.getCompleted())
				.lastSectionIndex(p.getLastSectionIndex())
				.timeSpentMinutes(p.getTimeSpentMinutes())
				.xpEarned(p.getXpEarned())
				.lastOpenedAt(p.getLastOpenedAt())
				.completedAt(p.getCompletedAt())
				.createdAt(p.getCreatedAt())
				.updatedAt(p.getUpdatedAt())
				.build();
	}

	// ── Existing CRUD ─────────────────────────────────────────────────

	@Override
	public LessonResponse createLesson(LessonRequest request) {
		Lesson lesson = Lesson.builder()
				.title(request.getTitle())
				.category(request.getCategory())
				.level(request.getLevel())
				.description(request.getDescription())
				.content(request.getContent())
				.duration(request.getDuration() != null ? request.getDuration() : 10)
				.active(request.getActive() != null ? request.getActive() : true)
				.xpReward(request.getXpReward() != null ? request.getXpReward() : 50)
				.thumbnail(request.getThumbnail())
				.coverImage(request.getCoverImage())
				.locked(request.getLocked() != null ? request.getLocked() : false)
				.requiredXP(request.getRequiredXP() != null ? request.getRequiredXP() : 0)
				.requiredLevel(request.getRequiredLevel() != null ? request.getRequiredLevel() : 1)
				.estimatedMinutes(request.getEstimatedMinutes() != null ? request.getEstimatedMinutes() : request.getDuration())
				.orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
				.skills(request.getSkills())
				.objectives(request.getObjectives())
				.requirements(request.getRequirements())
				.popular(request.getPopular() != null ? request.getPopular() : false)
				.featured(request.getFeatured() != null ? request.getFeatured() : false)
				.build();
		return mapToResponse(lessonRepository.save(lesson));
	}

	@Override
	public List<LessonResponse> getAllLessons() {
		User user = currentUser();
		return lessonRepository.findAll().stream()
				.map(l -> mapWithUserProgress(l, user))
				.toList();
	}

	@Override
	public LessonResponse getLessonById(Long id) {
		Lesson lesson = lessonRepository.findById(id)
				.orElseThrow(() -> new LessonNotFoundException("Lesson not found"));
		User user = currentUser();
		return mapWithUserProgress(lesson, user);
	}

	@Override
	public List<LessonResponse> getLessonsByCategory(String category) {
		User user = currentUser();
		return lessonRepository.findByCategory(category).stream()
				.map(l -> mapWithUserProgress(l, user))
				.toList();
	}

	@Override
	public List<LessonResponse> getLessonsByLevel(String level) {
		User user = currentUser();
		return lessonRepository.findByLevel(level).stream()
				.map(l -> mapWithUserProgress(l, user))
				.toList();
	}

	@Override
	public List<LessonResponse> getLessonsByCategoryAndLevel(String category, String level) {
		User user = currentUser();
		return lessonRepository.findByCategoryAndLevel(category, level).stream()
				.map(l -> mapWithUserProgress(l, user))
				.toList();
	}

	@Override
	public List<LessonResponse> getActiveLessons() {
		User user = currentUser();
		return lessonRepository.findByActiveTrue().stream()
				.map(l -> mapWithUserProgress(l, user))
				.toList();
	}

	@Override
	public List<LessonResponse> getUpcomingLessons() {
		List<Lesson> active = lessonRepository.findByActiveTrue();
		if (active.size() <= 1) return active.stream().map(this::mapToResponse).toList();
		return active.stream().skip(1).map(this::mapToResponse).toList();
	}

	@Override
	public LessonResponse updateLesson(Long id, LessonRequest request) {
		Lesson lesson = lessonRepository.findById(id)
				.orElseThrow(() -> new LessonNotFoundException("Lesson not found"));
		lesson.setTitle(request.getTitle());
		lesson.setCategory(request.getCategory());
		lesson.setLevel(request.getLevel());
		lesson.setDescription(request.getDescription());
		lesson.setContent(request.getContent());
		if (request.getDuration() != null) lesson.setDuration(request.getDuration());
		if (request.getActive() != null) lesson.setActive(request.getActive());
		if (request.getXpReward() != null) lesson.setXpReward(request.getXpReward());
		if (request.getThumbnail() != null) lesson.setThumbnail(request.getThumbnail());
		if (request.getCoverImage() != null) lesson.setCoverImage(request.getCoverImage());
		if (request.getLocked() != null) lesson.setLocked(request.getLocked());
		if (request.getRequiredXP() != null) lesson.setRequiredXP(request.getRequiredXP());
		if (request.getRequiredLevel() != null) lesson.setRequiredLevel(request.getRequiredLevel());
		if (request.getEstimatedMinutes() != null) lesson.setEstimatedMinutes(request.getEstimatedMinutes());
		if (request.getOrderIndex() != null) lesson.setOrderIndex(request.getOrderIndex());
		if (request.getSkills() != null) lesson.setSkills(request.getSkills());
		if (request.getObjectives() != null) lesson.setObjectives(request.getObjectives());
		if (request.getRequirements() != null) lesson.setRequirements(request.getRequirements());
		if (request.getPopular() != null) lesson.setPopular(request.getPopular());
		if (request.getFeatured() != null) lesson.setFeatured(request.getFeatured());
		return mapToResponse(lessonRepository.save(lesson));
	}

	@Override
	public void deleteLesson(Long id) {
		Lesson lesson = lessonRepository.findById(id)
				.orElseThrow(() -> new LessonNotFoundException("Lesson not found"));
		lessonRepository.delete(lesson);
	}

	// ── Phase 2 ───────────────────────────────────────────────────────

	@Override
	public List<CategoryResponse> getCategories() {
		User user = currentUser();
		List<Lesson> allActive = lessonRepository.findByActiveTrue();

		// group by category
		Map<String, Long> countByCategory = allActive.stream()
				.collect(Collectors.groupingBy(Lesson::getCategory, Collectors.counting()));

		// user-completed counts
		Map<String, Long> completedByCategory = user == null
				? Map.of()
				: progressRepository.findByUserAndCompleted(user, true).stream()
						.collect(Collectors.groupingBy(p -> p.getLesson().getCategory(), Collectors.counting()));

		// total XP per category
		Map<String, Integer> xpByCategory = allActive.stream()
				.collect(Collectors.groupingBy(Lesson::getCategory,
						Collectors.summingInt(l -> l.getXpReward() != null ? l.getXpReward() : 0)));

		return Arrays.asList(
				"Grammar", "Vocabulary", "Speaking", "Listening", "Pronunciation",
				"Conversation", "Business English", "Interview Preparation",
				"Travel English", "Daily English")
				.stream()
				.filter(cat -> countByCategory.containsKey(cat))
				.map(cat -> CategoryResponse.builder()
						.name(cat)
						.icon(CATEGORY_ICONS.getOrDefault(cat, "book-outline"))
						.description(categoryDescription(cat))
						.lessonCount(countByCategory.getOrDefault(cat, 0L).intValue())
						.completedCount(completedByCategory.getOrDefault(cat, 0L).intValue())
						.totalXP(xpByCategory.getOrDefault(cat, 0))
						.build())
				.toList();
	}

	@Override
	public List<LessonResponse> getRecommended() {
		User user = currentUser();
		// Return popular or featured lessons not yet completed
		List<Lesson> pool = lessonRepository.findByActiveTrue().stream()
				.filter(l -> Boolean.TRUE.equals(l.getPopular()) || Boolean.TRUE.equals(l.getFeatured()))
				.limit(10)
				.toList();
		if (pool.isEmpty()) {
			// fallback: first 10 active
			pool = lessonRepository.findByActiveTrue().stream().limit(10).toList();
		}
		final User finalUser = user;
		return pool.stream().map(l -> mapWithUserProgress(l, finalUser)).toList();
	}

	@Override
	public List<LessonResponse> getContinueLearning() {
		User user = currentUser();
		if (user == null) return List.of();
		// lessons started but not completed, ordered by last opened
		return progressRepository.findByUserOrderByLastOpenedAtDesc(user).stream()
				.filter(p -> !Boolean.TRUE.equals(p.getCompleted()) && p.getProgressPercent() > 0)
				.map(p -> mapToResponse(p.getLesson(), p))
				.limit(5)
				.toList();
	}

	@Override
	public List<LessonResponse> search(String query, String category, String difficulty) {
		User user = currentUser();
		List<Lesson> base = lessonRepository.findByActiveTrue();

		if (query != null && !query.isBlank()) {
			String q = query.toLowerCase();
			base = base.stream()
					.filter(l -> l.getTitle().toLowerCase().contains(q)
							|| (l.getDescription() != null && l.getDescription().toLowerCase().contains(q))
							|| l.getCategory().toLowerCase().contains(q))
					.toList();
		}
		if (category != null && !category.isBlank() && !category.equalsIgnoreCase("All")) {
			base = base.stream().filter(l -> l.getCategory().equalsIgnoreCase(category)).toList();
		}
		if (difficulty != null && !difficulty.isBlank() && !difficulty.equalsIgnoreCase("All")) {
			base = base.stream().filter(l -> l.getLevel().equalsIgnoreCase(difficulty)).toList();
		}

		final User finalUser = user;
		return base.stream().map(l -> mapWithUserProgress(l, finalUser)).toList();
	}

	@Override
	public List<LessonResponse> getRecent() {
		User user = currentUser();
		if (user == null) return List.of();
		return progressRepository.findByUserOrderByLastOpenedAtDesc(user).stream()
				.map(p -> mapToResponse(p.getLesson(), p))
				.limit(10)
				.toList();
	}

	@Override
	public List<LessonResponse> getCompleted() {
		User user = currentUser();
		if (user == null) return List.of();
		return progressRepository.findByUserAndCompleted(user, true).stream()
				.map(p -> mapToResponse(p.getLesson(), p))
				.toList();
	}

	@Override
	public LessonResponse startLesson(Long id) {
		Lesson lesson = lessonRepository.findById(id)
				.orElseThrow(() -> new LessonNotFoundException("Lesson not found"));
		User user = currentUser();
		if (user == null) return mapToResponse(lesson);

		LessonProgress progress = progressRepository.findByUserAndLesson(user, lesson)
				.orElseGet(() -> LessonProgress.builder()
						.user(user)
						.lesson(lesson)
						.progressPercent(0)
						.completed(false)
						.lastSectionIndex(0)
						.timeSpentMinutes(0)
						.xpEarned(0)
						.build());
		progress.setLastOpenedAt(LocalDateTime.now());
		LessonProgress saved = progressRepository.save(progress);
		return mapToResponse(lesson, saved);
	}

	@Override
	public LessonProgressResponse updateProgress(LessonProgressRequest request) {
		User user = currentUser();
		if (user == null) throw new UserNotFoundException("Not authenticated");

		Lesson lesson = lessonRepository.findById(request.getLessonId())
				.orElseThrow(() -> new LessonNotFoundException("Lesson not found"));

		LessonProgress progress = progressRepository.findByUserAndLesson(user, lesson)
				.orElseGet(() -> LessonProgress.builder()
						.user(user)
						.lesson(lesson)
						.progressPercent(0)
						.completed(false)
						.lastSectionIndex(0)
						.timeSpentMinutes(0)
						.xpEarned(0)
						.build());

		if (request.getProgressPercent() != null)
			progress.setProgressPercent(request.getProgressPercent());
		if (request.getLastSectionIndex() != null)
			progress.setLastSectionIndex(request.getLastSectionIndex());
		if (request.getTimeSpentMinutes() != null)
			progress.setTimeSpentMinutes(progress.getTimeSpentMinutes() + request.getTimeSpentMinutes());
		progress.setLastOpenedAt(LocalDateTime.now());

		return mapProgressToResponse(progressRepository.save(progress));
	}

	@Override
	public LessonProgressResponse completeLesson(Long id) {
		User user = currentUser();
		if (user == null) throw new UserNotFoundException("Not authenticated");

		Lesson lesson = lessonRepository.findById(id)
				.orElseThrow(() -> new LessonNotFoundException("Lesson not found"));

		LessonProgress progress = progressRepository.findByUserAndLesson(user, lesson)
				.orElseGet(() -> LessonProgress.builder()
						.user(user)
						.lesson(lesson)
						.timeSpentMinutes(0)
						.build());

		if (!Boolean.TRUE.equals(progress.getCompleted())) {
			progress.setProgressPercent(100);
			progress.setCompleted(true);
			progress.setCompletedAt(LocalDateTime.now());
			progress.setLastOpenedAt(LocalDateTime.now());
			int xp = lesson.getXpReward() != null ? lesson.getXpReward() : 50;
			progress.setXpEarned(xp);

			// ── Credit XP to user Progress ────────────────────────────────
			userProgressRepository.findByUser(user).ifPresent(up -> {
				up.setXp((up.getXp() != null ? up.getXp() : 0) + xp);
				// Level up every 500 XP
				int totalXp = up.getXp();
				int newLevel = Math.max(1, totalXp / 500 + 1);
				up.setLevel(newLevel);
				userProgressRepository.save(up);
			});

			// ── Trigger completion notification ────────────────────────────
			try {
				notificationService.createSystemNotification(user,
						"Lesson Complete! 🎓",
						"You finished \"" + lesson.getTitle() + "\". You earned " + xp + " XP. Keep it up!");
			} catch (Exception ignored) {}
		}

		return mapProgressToResponse(progressRepository.save(progress));
	}

	// ── Category descriptions ─────────────────────────────────────────

	private String categoryDescription(String cat) {
		return switch (cat) {
			case "Grammar" -> "Master English grammar rules and structures";
			case "Vocabulary" -> "Expand your word bank with contextual learning";
			case "Speaking" -> "Improve fluency through guided speaking practice";
			case "Listening" -> "Sharpen your listening and comprehension skills";
			case "Pronunciation" -> "Perfect your accent and pronunciation clarity";
			case "Conversation" -> "Practice real-world conversational English";
			case "Business English" -> "Professional communication for the workplace";
			case "Interview Preparation" -> "Ace job interviews with confidence";
			case "Travel English" -> "Essential phrases for travelers worldwide";
			case "Daily English" -> "Everyday expressions for daily communication";
			default -> "Learn English the smart way";
		};
	}
}