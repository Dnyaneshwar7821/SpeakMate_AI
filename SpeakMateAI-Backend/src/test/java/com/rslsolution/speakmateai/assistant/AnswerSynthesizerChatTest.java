package com.rslsolution.speakmateai.assistant;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.dto.assistant.SynthesizedAnswer;

public class AnswerSynthesizerChatTest {

	private AnswerSynthesizer synthesizer;
	private ObjectMapper objectMapper;

	@BeforeEach
	void setUp() {
		objectMapper = new ObjectMapper();
		// Passing null for groqChatClient causes it to exercise the deterministicAnswer path
		synthesizer = new AnswerSynthesizer(null, objectMapper);
	}

	@Test
	void testHowManyStudentsTargetedSynthesis() throws Exception {
		Map<String, Object> platformData = Map.of(
				"totalSchools", 13,
				"totalUsers", 32,
				"totalStudents", 6,
				"activeStudents", 6,
				"totalTeachers", 6,
				"activeTeachers", 6,
				"totalClasses", 46,
				"totalStandards", 60,
				"totalDivisions", 137,
				"schoolsByStudentCount", java.util.List.of(
						Map.of("schoolName", "DY Patil University", "studentCount", 5, "teacherCount", 3),
						Map.of("schoolName", "JSPM", "studentCount", 1, "teacherCount", 1)
				)
		);
		String dataJson = objectMapper.writeValueAsString(platformData);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.PLATFORM_OVERVIEW,
				null,
				"How many students are there?",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());

		// Must contain student information
		assertTrue(answer.getMarkdown().contains("Total students: 6") || answer.getMarkdown().contains("Platform students"));
		assertTrue(answer.getMarkdown().contains("DY Patil University"));

		// Must NOT dump unrelated metrics like revenue, classes, standards, divisions, total teachers
		assertFalse(answer.getMarkdown().contains("Total classes: 46"));
		assertFalse(answer.getMarkdown().contains("Total standards: 60"));
		assertFalse(answer.getMarkdown().contains("Revenue from subscriptions"));

		// Stat cards should only include students, NOT Total Users or Teachers
		assertNotNull(answer.getStats());
		boolean hasUserCard = answer.getStats().stream().anyMatch(s -> s.getLabel().equalsIgnoreCase("Total Users"));
		boolean hasStudentCard = answer.getStats().stream().anyMatch(s -> s.getLabel().toLowerCase().contains("student"));
		assertFalse(hasUserCard, "Should not contain Total Users card for single-metric student inquiry");
		assertTrue(hasStudentCard, "Should contain Student card");
	}

	@Test
	void testBroadOverviewSynthesis() throws Exception {
		Map<String, Object> platformData = Map.of(
				"totalSchools", 13,
				"totalUsers", 32,
				"totalStudents", 6,
				"activeStudents", 6,
				"totalTeachers", 6,
				"activeTeachers", 6,
				"totalClasses", 46,
				"totalStandards", 60,
				"totalDivisions", 137
		);
		String dataJson = objectMapper.writeValueAsString(platformData);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.PLATFORM_OVERVIEW,
				null,
				"Give me a platform overview.",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());

		// Broad overview must contain all core metrics
		assertTrue(answer.getMarkdown().contains("Total schools") && answer.getMarkdown().contains("13"));
		assertTrue(answer.getMarkdown().contains("Total users") && answer.getMarkdown().contains("32"));
		assertTrue(answer.getMarkdown().contains("Total students") && answer.getMarkdown().contains("6"));
		assertTrue(answer.getMarkdown().contains("Total teachers") && answer.getMarkdown().contains("6"));
	}

	@Test
	void testSpeakingSessionsPlatformSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"totalStudents", 6,
				"totalSpeakingSessions", 42
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.PLATFORM_OVERVIEW,
				null,
				"how many speaking session done students",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Total speaking sessions") && answer.getMarkdown().contains("42"));
	}

	@Test
	void testTopStudentsLeaderboardPlatformSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"bestStudent", Map.of("name", "Siddhi Narke", "xp", 250, "level", 3, "schoolName", "DY Patil"),
				"topStudents", java.util.List.of(
						Map.of("name", "Siddhi Narke", "xp", 250, "level", 3, "schoolName", "DY Patil"),
						Map.of("name", "Raj Varma", "xp", 180, "level", 2, "schoolName", "DY Patil")
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.PLATFORM_OVERVIEW,
				null,
				"best student currently",
				Map.of("leaderboard", true),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("250 XP"));
	}

	@Test
	void testSubscribersBillingSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"subscribers", java.util.List.of(
						Map.of(
								"userName", "Raj Malhotra",
								"userEmail", "raj@example.com",
								"schoolName", "DY Patil University",
								"planName", "School Pro",
								"amount", 1999,
								"status", "ACTIVE"
						)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.BILLING,
				null,
				"who has taken subscription",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Raj Malhotra"));
		assertTrue(answer.getMarkdown().contains("School Pro"));
		assertTrue(answer.getMarkdown().contains("1999"));
	}

	@Test
	void testTeacherClassCountRosterSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"teachers", java.util.List.of(
						Map.of(
								"name", "Pratik Patil",
								"subject", "English",
								"classCount", 8,
								"classes", java.util.List.of("6-A", "7-A", "8-A", "8-B", "9-A", "9-B", "10-A", "10-B"),
								"studentCount", 2
						)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_ROSTER,
				null,
				"how many classes does pratik patil have",
				Map.of("focusName", "pratik patil", "entityType", "TEACHERS"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Pratik Patil"));
		assertTrue(answer.getMarkdown().contains("8"));
		assertTrue(answer.getMarkdown().contains("6-A"));
	}

	@Test
	void testClassTeacherResolutionZeroStudentsSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"standard", "7",
				"division", "B",
				"classes", java.util.List.of("7-B"),
				"classAssignments", java.util.List.of(
						Map.of(
								"class", "7-B",
								"teacher", "Pratik Patil",
								"teachers", java.util.List.of("Pratik Patil"),
								"hasTeacher", true,
								"studentCount", 0
						)
				),
				"teachers", java.util.List.of(
						Map.of(
								"name", "Pratik Patil",
								"subject", "English",
								"classes", java.util.List.of("6-A", "7-A", "7-B")
						)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_ROSTER,
				null,
				"who is teacher of 7 B class",
				Map.of("standard", "7", "division", "B", "entityType", "TEACHERS"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Pratik Patil"));
		assertTrue(answer.getMarkdown().contains("7-B"));
		assertFalse(answer.getMarkdown().contains("not available"));
	}

	@Test
	void testMultiClassTeacherAssignmentsSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"classes", java.util.List.of("2-A", "10-A"),
				"classAssignments", java.util.List.of(
						Map.of(
								"class", "2-A",
								"teacher", "Chetan Mali",
								"teachers", java.util.List.of("Chetan Mali"),
								"hasTeacher", true,
								"studentCount", 1
						),
						Map.of(
								"class", "10-A",
								"teacher", "",
								"teachers", java.util.List.of(),
								"hasTeacher", false,
								"studentCount", 0
						)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_ROSTER,
				null,
				"who is teacher of 2-A and 10-A class",
				Map.of("classes", java.util.List.of("2-A", "10-A"), "entityType", "TEACHERS"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("2-A"));
		assertTrue(answer.getMarkdown().contains("Chetan Mali"));
		assertTrue(answer.getMarkdown().contains("10-A"));
		assertTrue(answer.getMarkdown().contains("No teacher information is available"));
	}
}
