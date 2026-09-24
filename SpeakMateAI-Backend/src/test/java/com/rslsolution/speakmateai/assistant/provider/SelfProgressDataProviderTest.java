package com.rslsolution.speakmateai.assistant.provider;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.GrammarHistoryRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.repository.VocabularyRepository;

class SelfProgressDataProviderTest {

	private UserRepository userRepository;
	private ProgressRepository progressRepository;
	private LessonProgressRepository lessonProgressRepository;
	private SpeakingSessionRepository speakingSessionRepository;
	private VocabularyRepository vocabularyRepository;
	private GrammarHistoryRepository grammarHistoryRepository;
	private UserSubscriptionRepository userSubscriptionRepository;
	private ObjectMapper objectMapper;

	private SelfProgressDataProvider provider;
	private User studentUser;
	private ActorContext studentActor;

	@BeforeEach
	void setUp() {
		userRepository = mock(UserRepository.class);
		progressRepository = mock(ProgressRepository.class);
		lessonProgressRepository = mock(LessonProgressRepository.class);
		speakingSessionRepository = mock(SpeakingSessionRepository.class);
		vocabularyRepository = mock(VocabularyRepository.class);
		grammarHistoryRepository = mock(GrammarHistoryRepository.class);
		userSubscriptionRepository = mock(UserSubscriptionRepository.class);
		objectMapper = new ObjectMapper();

		provider = new SelfProgressDataProvider(
				userRepository,
				progressRepository,
				lessonProgressRepository,
				speakingSessionRepository,
				vocabularyRepository,
				grammarHistoryRepository,
				userSubscriptionRepository,
				mock(com.rslsolution.speakmateai.repository.LessonRepository.class),
				mock(com.rslsolution.speakmateai.repository.AchievementRepository.class),
				mock(com.rslsolution.speakmateai.repository.AssignmentProgressRepository.class),
				mock(com.rslsolution.speakmateai.repository.AssignmentRepository.class),
				null,
				objectMapper
		);

		Student student = new Student();
		student.setId(101L);
		student.setEmail("student1@example.com");
		student.setFirstName("Alice");
		student.setLastName("Student");
		student.setRole(Role.STUDENT);
		studentUser = student;

		studentActor = ActorContext.builder()
				.userId(101L)
				.studentId(101L)
				.email("student1@example.com")
				.role(Role.STUDENT)
				.displayName("Alice Student")
				.build();

		when(userRepository.findById(101L)).thenReturn(Optional.of(studentUser));
		when(userRepository.findByEmail("student1@example.com")).thenReturn(Optional.of(studentUser));
		when(lessonProgressRepository.countByUserIdAndCompletedTrue(101L)).thenReturn(0L);
		when(lessonProgressRepository.findByUser(studentUser)).thenReturn(Collections.emptyList());
		when(speakingSessionRepository.findByUser(studentUser)).thenReturn(Collections.emptyList());
		when(vocabularyRepository.findByUserOrderByCreatedAtDesc(studentUser)).thenReturn(Collections.emptyList());
		when(grammarHistoryRepository.findByUserIdOrderByCreatedAtDesc(101L)).thenReturn(Collections.emptyList());
	}

	@Test
	@DisplayName("Test 1 — Existing Progress: Provider retrieves existing record without duplicate creation")
	void testExistingProgressRetrieved() throws Exception {
		Progress existing = Progress.builder()
				.user(studentUser)
				.xp(350)
				.level(2)
				.currentStreak(3)
				.longestStreak(5)
				.totalPracticeMinutes(45)
				.build();

		when(progressRepository.findByUser(studentUser)).thenReturn(Optional.of(existing));

		String json = provider.provide(studentActor, Collections.emptyMap());
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		assertEquals(350, data.get("xp"));
		assertEquals(2, data.get("level"));
		assertEquals(3, data.get("currentStreak"));
		assertEquals(5, data.get("longestStreak"));
		assertEquals(45, data.get("totalPracticeMinutes"));

		verify(progressRepository, never()).save(any(Progress.class));
	}

	@Test
	@DisplayName("Test 2 — Missing Progress: Provider initializes Progress with canonical defaults")
	void testMissingProgressInitialized() throws Exception {
		when(progressRepository.findByUser(studentUser)).thenReturn(Optional.empty());
		when(progressRepository.save(any(Progress.class))).thenAnswer(invocation -> invocation.getArgument(0));

		String json = provider.provide(studentActor, Collections.emptyMap());
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		assertEquals(0, data.get("xp"));
		assertEquals(1, data.get("level"));
		assertEquals(0, data.get("currentStreak"));
		assertEquals(0, data.get("longestStreak"));
		assertEquals(0, data.get("totalPracticeMinutes"));

		verify(progressRepository).save(any(Progress.class));
	}

	@Test
	@DisplayName("Test 3 — Self Scope: Authenticated Student A gets Student A's Progress")
	void testSelfScopeIsolation() throws Exception {
		Progress studentAProgress = Progress.builder()
				.user(studentUser)
				.xp(120)
				.level(1)
				.build();

		when(progressRepository.findByUser(studentUser)).thenReturn(Optional.of(studentAProgress));

		String json = provider.provide(studentActor, Map.of("scope", "SELF"));
		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});

		assertEquals(120, data.get("xp"));
		assertEquals("Alice Student", data.get("studentName"));
	}

	@Test
	@DisplayName("Test 4 — Cross Student: Access to another student's Progress returns CROSS_STUDENT_DENIED")
	void testCrossStudentAccessDenied() throws Exception {
		Student rohan = new Student();
		rohan.setId(202L);
		rohan.setEmail("rohan@example.com");
		rohan.setFirstName("Rohan");
		rohan.setLastName("Kumar");
		rohan.setRole(Role.STUDENT);

		when(userRepository.findByEmail("rohan@example.com")).thenReturn(Optional.of(rohan));
		when(userRepository.findByEmailIgnoreCase("rohan@example.com")).thenReturn(Optional.of(rohan));

		String json = provider.provide(studentActor, Map.of("studentEmail", "rohan@example.com"));
		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});

		assertTrue(Boolean.TRUE.equals(data.get("accessDenied")));
		assertEquals("CROSS_STUDENT_DENIED", data.get("reason"));

		verify(progressRepository, never()).findByUser(rohan);
		verify(progressRepository, never()).save(any(Progress.class));
	}

	@Test
	@DisplayName("Test 5 — English Level Mapping: Level 1-2 -> Beginner, Level 3-4 -> Intermediate, Level 5+ -> Advanced")
	void testEnglishLevelLabelMapping() throws Exception {
		int[][] testCases = {
			{1, 140}, // Level 1 -> Beginner
			{2, 600}, // Level 2 -> Beginner
			{3, 1100}, // Level 3 -> Intermediate
			{4, 1600}, // Level 4 -> Intermediate
			{5, 2100}  // Level 5 -> Advanced
		};

		String[] expectedLabels = {"Beginner", "Beginner", "Intermediate", "Intermediate", "Advanced"};

		for (int i = 0; i < testCases.length; i++) {
			int lvl = testCases[i][0];
			int xp = testCases[i][1];
			String expectedLabel = expectedLabels[i];

			Progress p = Progress.builder()
					.user(studentUser)
					.xp(xp)
					.level(lvl)
					.build();

			when(progressRepository.findByUser(studentUser)).thenReturn(Optional.of(p));

			String json = provider.provide(studentActor, Collections.emptyMap());
			Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});

			assertEquals(expectedLabel, data.get("englishLevelLabel"), "Level " + lvl + " should map to " + expectedLabel);
			assertEquals(expectedLabel, data.get("englishLevel"), "Level " + lvl + " englishLevel should be " + expectedLabel);
		}
	}
}

