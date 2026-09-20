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
}
