package com.rslsolution.speakmateai.assistant;

import java.util.List;
import java.util.Map;
import static java.util.Map.entry;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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
	void testGeneralUserSelfSchoolAnswer() throws Exception {
		Map<String, Object> data = Map.of(
				"scope", "SELF",
				"role", "USER",
				"email", "user@speakmate.ai"
		);
		String dataJson = objectMapper.writeValueAsString(data);

		String[] selfSchoolQueries = {
			"Which school am I studying in?",
			"What school am I in?",
			"Which school am I from?",
			"Where do I study?",
			"What is my school?"
		};

		for (String q : selfSchoolQueries) {
			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.ACCOUNT_INFO,
					null,
					q,
					Map.of(),
					dataJson,
					null
			);
			assertNotNull(answer);
			assertEquals("**You are not a student. You are a general user.**", answer.getMarkdown());
		}
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

	@Test
	void testClassPerformanceSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"className", "Grade 9 - A",
				"grade", "Grade 9",
				"division", "A",
				"assignedTeacher", "Pratik Patil",
				"studentCount", 2,
				"studentsWithActiveStreak", 1,
				"totalXp", 409,
				"averageXpPerStudent", 204,
				"averagePracticeMinutesPerStudent", 2.0,
				"summary", "Class Grade 9 - A (Grade Grade 9, Division A) has 2 enrolled students. Assigned teacher: Pratik Patil. Total XP: 409, Average XP: 204."
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CLASS_PERFORMANCE,
				null,
				"How is 9-A performing?",
				Map.of("standard", "9", "division", "A"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Grade 9 - A"));
		assertTrue(answer.getMarkdown().contains("Pratik Patil"));
		assertTrue(answer.getMarkdown().contains("409"));
		assertTrue(answer.getMarkdown().contains("2"));
	}

	@Test
	void testSchoolLeaderboardSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"schoolName", "DY Patil University",
				"totalStudents", 4,
				"totalTeachers", 3,
				"bestStudent", Map.of(
						"name", "Siddhi Narke",
						"xp", 409,
						"standard", "9",
						"division", "A",
						"streak", 1
				),
				"topStudents", java.util.List.of(
						Map.of("name", "Siddhi Narke", "xp", 409, "standard", "9", "division", "A"),
						Map.of("name", "Vijay Patil", "xp", 50, "standard", "4", "division", "A")
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_OVERVIEW,
				null,
				"Who is the best student in my school?",
				Map.of("leaderboard", true),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Top Student at DY Patil University"));
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("409"));
		assertTrue(answer.getMarkdown().contains("Vijay Patil"));
	}

	@Test
	void testCasualChatGreetingSchoolAdmin() throws Exception {
		Map<String, Object> data = Map.of(
				"scope", "CASUAL_CHAT",
				"displayName", "Adinath",
				"role", "SCHOOL_ADMIN",
				"schoolName", "DY Patil University",
				"chatType", "GREETING"
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CASUAL_CHAT,
				null,
				"hi",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Adinath"));
		assertTrue(answer.getMarkdown().contains("DY Patil University"));
		assertFalse(answer.getMarkdown().contains("/school-admin/"));
	}

	@Test
	void testCasualChatWhoAmI() throws Exception {
		Map<String, Object> data = Map.of(
				"scope", "CASUAL_CHAT",
				"displayName", "Adinath",
				"role", "SCHOOL_ADMIN",
				"schoolName", "DY Patil University",
				"chatType", "GREETING"
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CASUAL_CHAT,
				null,
				"who am I?",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Adinath"));
		assertTrue(answer.getMarkdown().contains("School Admin"));
		assertTrue(answer.getMarkdown().contains("DY Patil University"));
	}

	@Test
	void testCasualChatCapabilities() throws Exception {
		Map<String, Object> data = Map.of(
				"scope", "CASUAL_CHAT",
				"displayName", "Adinath",
				"role", "SCHOOL_ADMIN",
				"schoolName", "DY Patil University",
				"chatType", "CAPABILITIES"
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CASUAL_CHAT,
				null,
				"what can you do?",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("School Overview"));
		assertTrue(answer.getMarkdown().contains("Teacher Workloads"));
		assertTrue(answer.getMarkdown().contains("Student Progress"));
	}

	@Test
	void testCleanNavigationGuide() throws Exception {
		Map<String, Object> data = Map.of(
				"role", "SCHOOL_ADMIN",
				"pages", java.util.List.of(
						Map.of("label", "Results", "route", "/school-admin/results"),
						Map.of("label", "Students", "route", "/school-admin/students")
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.NAVIGATION_HELP,
				null,
				"Where can I see results?",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Navigation Guide"));
		assertTrue(answer.getMarkdown().contains("Results"));
		assertFalse(answer.getMarkdown().contains("`/school-admin/results`"));
	}

	@Test
	void testXpRemainingSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"studentName", "Siddhi Narke",
				"standard", "9",
				"division", "A",
				"xp", 478,
				"level", 1,
				"nextLevel", 2,
				"nextLevelThreshold", 500,
				"xpRemaining", 22
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.STUDENT_PERFORMANCE,
				null,
				"How many xp remaining for siddhi to complete level 1",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("22"));
		assertTrue(answer.getMarkdown().contains("500"));
	}

	@Test
	void testStudentAssignedTeacherSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"studentAssignedTeacher", Map.of(
						"studentName", "Raj Varma",
						"standard", "9",
						"division", "A",
						"hasTeacher", true,
						"teacherName", "Pratik Patil",
						"details", "Assigned via Standard 9 Division A"
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_ROSTER,
				null,
				"who is teacher of Raj varma",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Raj Varma"));
		assertTrue(answer.getMarkdown().contains("Pratik Patil"));
	}

	@Test
	void testStudentSelfAssignedTeacherAccountInfo() throws Exception {
		Map<String, Object> data = Map.of(
				"fullName", "Siddhi Narke",
				"email", "siddhi.narke@example.com",
				"role", "STUDENT",
				"standard", "9",
				"division", "A",
				"assignedTeacher", "Pratik Patil"
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.ACCOUNT_INFO,
				null,
				"who is my teacher",
				Map.of("scope", "SELF", "field", "teacher"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Pratik Patil"));
	}

	@Test
	void testTeacherHandlingMostClassesSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"topTeacherByClasses", Map.of(
						"teacherName", "Pratik Patil",
						"classCount", 8,
						"classes", java.util.List.of("6-A", "7-A", "7-B", "8-A", "8-B", "9-A", "9-B", "10-B"),
						"department", "English"
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_ROSTER,
				null,
				"which teacher has many classes to handle",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Pratik Patil"));
		assertTrue(answer.getMarkdown().contains("8"));
	}

	@Test
	void testTeacherStudentsProgressSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"teacherStudentsProgress", Map.of(
						"teacherName", "Pratik Patil",
						"totalStudents", 4,
						"totalXp", 478,
						"students", java.util.List.of(
								Map.of("name", "Siddhi Narke", "standard", "9", "division", "A", "xp", 478, "level", 1, "streak", 1),
								Map.of("name", "Raj Varma", "standard", "9", "division", "A", "xp", 0, "level", 1, "streak", 0)
						)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_ROSTER,
				null,
				"give me progress of pratik patil's students",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Pratik Patil"));
		assertTrue(answer.getMarkdown().contains("478 XP"));
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("Raj Varma"));
	}

	@Test
	void testSchoolAdminStudentListRosterSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"schoolName", "DY Patil University",
				"entityType", "STUDENTS",
				"studentCount", 4,
				"students", java.util.List.of(
						Map.of("name", "Siddhi Narke", "standard", "9", "division", "A", "rollNumber", "23", "email", "siddhi.narke@gmail.com", "assignedTeacher", "Pratik Patil"),
						Map.of("name", "Vijay Patil", "standard", "4", "division", "A", "rollNumber", "1", "email", "vijay@gmail.com"),
						Map.of("name", "Kaustubh Salunkhe", "standard", "10", "division", "A", "rollNumber", "2", "email", "kaustubh@gmail.com"),
						Map.of("name", "Raj Varma", "standard", "10", "division", "A", "rollNumber", "1", "email", "raj@gmail.com", "assignedTeacher", "Pratik Patil")
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_ROSTER,
				null,
				"give me lsit of student",
				Map.of("entityType", "students"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("DY Patil University"));
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("Vijay Patil"));
		assertTrue(answer.getMarkdown().contains("Kaustubh Salunkhe"));
		assertTrue(answer.getMarkdown().contains("Raj Varma"));
		assertTrue(answer.getMarkdown().contains("Pratik Patil"));
	}

	@Test
	void testClassSpecificStudentListRosterNotHijackedByTeacherAssignment() throws Exception {
		Map<String, Object> data = Map.of(
				"schoolName", "DY Patil University",
				"entityType", "STUDENTS",
				"standard", "9",
				"division", "A",
				"classes", java.util.List.of("9-A"),
				"classAssignments", java.util.List.of(
						Map.of("class", "9-A", "hasTeacher", true, "teacher", "Pratik Patil", "studentCount", 1)
				),
				"studentCount", 1,
				"students", java.util.List.of(
						Map.of("name", "Siddhi Narke", "standard", "9", "division", "A", "rollNumber", "23", "email", "siddhi.narke@gmail.com", "assignedTeacher", "Pratik Patil")
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.SCHOOL_ROSTER,
				null,
				"give list of 9-A students",
				Map.of("entityType", "students", "standard", "9", "division", "A"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("Students in Standard 9-A"));
	}

	@Test
	void testTeacherAssignedClassesSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"totalAssignedClasses", 8,
				"totalStudentsAcrossClasses", 4,
				"assignedClassesList", java.util.List.of(
						Map.of("name", "Grade 9 - A", "studentCount", 4),
						Map.of("name", "Grade 6 - A", "studentCount", 0),
						Map.of("name", "Grade 8 - D", "studentCount", 0),
						Map.of("name", "Grade 7 - A", "studentCount", 0)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CLASS_PERFORMANCE,
				null,
				"Which classes are assigned to me?",
				Map.of("myClasses", true),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Assigned Classes (8)"));
		assertTrue(answer.getMarkdown().contains("Grade 9 - A"));
		assertTrue(answer.getMarkdown().contains("Grade 6 - A"));
		assertTrue(answer.getMarkdown().contains("Total Enrolled Students Across Your Classes"));
		assertTrue(answer.getMarkdown().contains("4"));
	}

	@Test
	void testTeacherStrugglingStudentsSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"strugglingStudents", java.util.List.of(
						Map.of(
								"name", "Siddhi Narke",
								"standard", "9",
								"division", "A",
								"speakingScore", 8.9,
								"xp", 1229,
								"reason", "Low speaking score (8.9%), Only 2 lessons completed"
						)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CLASS_PERFORMANCE,
				null,
				"Which learners need the most help?",
				Map.of("filter", "struggling"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Learners Needing Support & Attention"));
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("Low speaking score (8.9%)"));
	}

	@Test
	void testTeacherLowestSpeakingScoresSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"lowSpeakingStudents", java.util.List.of(
						Map.of(
								"name", "Siddhi Narke",
								"standard", "9",
								"division", "A",
								"speakingScore", 8.9,
								"fluencyScore", 8.5,
								"pronunciationScore", 9.0
						)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CLASS_PERFORMANCE,
				null,
				"Which students have low speaking scores?",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Students with Lowest Speaking Scores"));
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("Speaking Score: **8.9%**"));
		assertTrue(answer.getMarkdown().contains("Fluency: 8.5%"));
	}

	@Test
	void testTeacherClassEnrollmentSummary() throws Exception {
		Map<String, Object> data = Map.of(
				"totalStudentsAcrossClasses", 4,
				"assignedClassesList", java.util.List.of(
						Map.of("name", "Grade 9 - A", "studentCount", 4),
						Map.of("name", "Grade 6 - A", "studentCount", 0)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CLASS_PERFORMANCE,
				null,
				"How many students are in my classes?",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Class Enrollment Summary"));
		assertTrue(answer.getMarkdown().contains("4 students"));
		assertTrue(answer.getMarkdown().contains("Grade 9 - A"));
	}

	@Test
	void testTeacherSpeechAnalyticsSynthesis() throws Exception {
		Map<String, Object> data = Map.of(
				"className", "Grade 9 - A",
				"classAverageSpeakingScore", 8.9,
				"classAveragePronunciationScore", 9.0,
				"classAverageFluencyScore", 8.5,
				"classAverageGrammarScore", 86.7,
				"studentCount", 2,
				"studentsWithActiveStreak", 1
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CLASS_PERFORMANCE,
				null,
				"Average pronunciation score of my students",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Speech & Language Analytics: Grade 9 - A"));
		assertTrue(answer.getMarkdown().contains("Average Pronunciation Score:"));
		assertTrue(answer.getMarkdown().contains("9%"));
		assertTrue(answer.getMarkdown().contains("Average Fluency Score:"));
		assertTrue(answer.getMarkdown().contains("8.5%"));
	}

	@Test
	void testTeacherTopStudentsLeaderboard() throws Exception {
		Map<String, Object> data = Map.of(
				"topStudent", Map.of("name", "Siddhi Narke", "xp", 1229),
				"topStudents", java.util.List.of(
						Map.of("name", "Siddhi Narke", "xp", 1229, "streak", 1, "lessonsCompleted", 2),
						Map.of("name", "Onkar Awate", "xp", 350, "streak", 0, "lessonsCompleted", 1)
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.CLASS_PERFORMANCE,
				null,
				"Which students have the highest XP?",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Top Students Leaderboard"));
		assertTrue(answer.getMarkdown().contains("Siddhi Narke"));
		assertTrue(answer.getMarkdown().contains("1229 XP"));
		assertTrue(answer.getMarkdown().contains("Onkar Awate"));
	}

	@Test
	void testStudentGrammarLastCheckSentence() throws Exception {
		Map<String, Object> data = Map.of(
				"studentName", "Siddhi Narke",
				"standard", "9",
				"division", "A",
				"lastGrammarCheck", Map.of(
						"originalText", "how is your name",
						"correctedText", "What is your name?",
						"explanation", "Correction of grammar and capitalization",
						"grammarScore", 55
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.STUDENT_PERFORMANCE,
				null,
				"which sentence last check in grammer module by me",
				Map.of("scope", "SELF"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Latest Grammar Check"));
		assertTrue(answer.getMarkdown().contains("how is your name"));
		assertTrue(answer.getMarkdown().contains("What is your name?"));
		assertTrue(answer.getMarkdown().contains("55%"));
	}

	@Test
	void testStudentRollNumberAndClassInquiry() throws Exception {
		Map<String, Object> data = Map.of(
				"studentName", "Siddhi Narke",
				"standard", "9",
				"division", "A",
				"rollNumber", "23",
				"schoolName", "DY Patil University"
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.STUDENT_PERFORMANCE,
				null,
				"my roll number tell",
				Map.of("scope", "SELF"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Roll Number:") && answer.getMarkdown().contains("23"));
		assertTrue(answer.getMarkdown().contains("Standard:") && answer.getMarkdown().contains("9"));
		assertTrue(answer.getMarkdown().contains("Division A"));
	}

	@Test
	void testStudentCompletedLessonModulesList() throws Exception {
		Map<String, Object> data = Map.of(
				"studentName", "Siddhi Narke",
				"standard", "9",
				"division", "A",
				"lessonsCompleted", 2,
				"lessonsStarted", 2,
				"lessonsPending", 0,
				"completedLessonTitles", java.util.List.of("Present Tenses Mastery", "Essential 500 Words")
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.STUDENT_PERFORMANCE,
				null,
				"how many lesson completed and which are they",
				Map.of("scope", "SELF"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Lessons Completed:") && answer.getMarkdown().contains("2"));
		assertTrue(answer.getMarkdown().contains("Completed Lesson Modules:"));
		assertTrue(answer.getMarkdown().contains("Present Tenses Mastery"));
		assertTrue(answer.getMarkdown().contains("Essential 500 Words"));
	}

	@Test
	void testStudentTargetedNavigation() throws Exception {
		Map<String, Object> data = Map.of(
				"pages", java.util.List.of(
						Map.of("label", "Speaking", "route", "/speaking"),
						Map.of("label", "Grammar", "route", "/grammar")
				)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.NAVIGATION_HELP,
				null,
				"Where can I practice speaking?",
				Map.of(),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		assertTrue(answer.getMarkdown().contains("Speaking Practice"));
		assertTrue(answer.getMarkdown().contains("sidebar menu under **Speaking**") || answer.getMarkdown().contains("clicking **Speaking** in your sidebar menu"));
	}

	@Test
	void testActiveLearnerAcrossAllModulesOverview() throws Exception {
		Map<String, Object> data = new java.util.LinkedHashMap<>();
		data.put("studentName", "Gangu Algule");
		data.put("role", "USER");
		data.put("totalSpeakingSessions", 6);
		data.put("completedSpeakingSessions", 6);
		data.put("overallSpeakingScore", 71.9);
		data.put("fluencyScore", 68.8);
		data.put("pronunciationScore", 75.0);
		data.put("lessonsCompleted", 0);
		data.put("totalAvailableLessons", 20);
		data.put("recommendedNextLesson", "Present Tenses Mastery");
		data.put("totalGrammarChecks", 2);
		data.put("averageGrammarScore", 70.0);
		data.put("totalVocabularyWords", 7);
		data.put("masteredVocabularyWords", 0);
		data.put("level", 1);
		data.put("xp", 356);
		data.put("currentStreak", 0);
		data.put("longestStreak", 0);
		data.put("unlockedAchievementsCount", 4);
		data.put("totalAchievementsCount", 12);

		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.STUDENT_PERFORMANCE,
				null,
				"What have I done across all modules?",
				Map.of("scope", "SELF"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		String md = answer.getMarkdown();
		assertTrue(md.contains("Speaking Practice"));
		assertTrue(md.contains("Total Sessions") && md.contains("6"));
		assertTrue(md.contains("Fluency: 68.8%") && md.contains("Pronunciation: 75.0%"));
		assertTrue(md.contains("Curriculum Lessons"));
		assertTrue(md.contains("Present Tenses Mastery"));
		assertTrue(md.contains("Grammar Checks Done:") && md.contains("2"));
		assertTrue(md.contains("Vocabulary Words Added:") && md.contains("7"));
		assertTrue(md.contains("Achievements & Milestones"));
		assertTrue(md.contains("4 / 12"));

		// Stat cards must be present
		assertNotNull(answer.getStats());
		assertTrue(answer.getStats().stream().anyMatch(s -> "Level".equals(s.getLabel())));
		assertTrue(answer.getStats().stream().anyMatch(s -> "XP".equals(s.getLabel())));
	}

	@Test
	void testZeroProgressStudentAcrossAllModulesOverview() throws Exception {
		Map<String, Object> data = new java.util.LinkedHashMap<>();
		data.put("studentName", "Anuradha Patil");
		data.put("role", "STUDENT");
		data.put("standard", "8");
		data.put("division", "A");
		data.put("schoolName", "DY Patil High School");
		data.put("totalSpeakingSessions", 0);
		data.put("completedSpeakingSessions", 0);
		data.put("overallSpeakingScore", "Not yet evaluated");
		data.put("fluencyScore", "Not yet evaluated");
		data.put("pronunciationScore", "Not yet evaluated");
		data.put("lessonsCompleted", 0);
		data.put("totalAvailableLessons", 20);
		data.put("recommendedNextLesson", "Everyday Introductions & Small Talk");
		data.put("totalGrammarChecks", 0);
		data.put("averageGrammarScore", "Not yet evaluated");
		data.put("totalVocabularyWords", 0);
		data.put("masteredVocabularyWords", 0);
		data.put("level", 1);
		data.put("xp", 0);
		data.put("currentStreak", 0);
		data.put("longestStreak", 0);
		data.put("unlockedAchievementsCount", 0);
		data.put("totalAchievementsCount", 12);
		data.put("totalAssignedHomework", 0);
		data.put("pendingHomework", 0);
		data.put("isNewLearner", true);
		data.put("hasStartedLearning", false);

		String dataJson = objectMapper.writeValueAsString(data);

		SynthesizedAnswer answer = synthesizer.synthesize(
				AssistantIntent.STUDENT_PERFORMANCE,
				null,
				"What have I done across all modules?",
				Map.of("scope", "SELF"),
				dataJson,
				null
		);

		assertNotNull(answer);
		assertNotNull(answer.getMarkdown());
		String md = answer.getMarkdown();

		// MUST NEVER say no data available
		assertFalse(md.toLowerCase().contains("don't have any data"));
		assertFalse(md.toLowerCase().contains("no data available"));

		// Must format full multi-module snapshot
		assertTrue(md.contains("Speaking Practice"));
		assertTrue(md.contains("Total Sessions") && md.contains("0"));
		assertTrue(md.contains("Speech Evaluation:") && md.contains("Not yet evaluated"));
		assertTrue(md.contains("Curriculum Lessons"));
		assertTrue(md.contains("Everyday Introductions & Small Talk"));
		assertTrue(md.contains("Grammar Checks Done:") && md.contains("0"));
		assertTrue(md.contains("Vocabulary Words Added:") && md.contains("0"));
		assertTrue(md.contains("School Homework"));
		assertTrue(md.contains("0 tasks (You're all caught up!)"));
		assertTrue(md.contains("Welcome to SpeakMate AI!"));

		// Stat cards must be present
		assertNotNull(answer.getStats());
		assertEquals(4, answer.getStats().size());
		assertTrue(answer.getStats().stream().anyMatch(s -> "Level".equals(s.getLabel()) && "Level 1".equals(s.getValue())));
		assertTrue(answer.getStats().stream().anyMatch(s -> "XP".equals(s.getLabel()) && "0 XP".equals(s.getValue())));
		assertTrue(answer.getStats().stream().anyMatch(s -> "Streak".equals(s.getLabel()) && "0 days".equals(s.getValue())));
		assertTrue(answer.getStats().stream().anyMatch(s -> "Speaking Sessions".equals(s.getLabel()) && "0".equals(s.getValue())));
	}

	@Test
		void testJoiningDateQueryReturnsOnlyJoiningDate() throws Exception {
		Map<String, Object> accountData = Map.ofEntries(
				Map.entry("displayName", "Siddhi Narke"),
				Map.entry("email", "siddhi@speakmate.ai"),
				Map.entry("role", "STUDENT"),
				Map.entry("standard", "Standard 10"),
				Map.entry("division", "Division A"),
				Map.entry("rollNumber", "101"),
				Map.entry("phone", "9876543210"),
				Map.entry("schoolName", "Ekvira High School"),
				Map.entry("subscriptionPlan", "PRO Plan"),
				Map.entry("location", "Mumbai"),
				Map.entry("joinedAt", "07 Sep 2026")
		);
		String dataJson = objectMapper.writeValueAsString(accountData);

		String[] joiningQueries = {
			"When did I join SpeakMateAI?",
			"When did I join?",
			"What is my joining date?",
			"When did I register?",
			"When did I create my account?",
			"When was my account created?",
			"Tell me when I joined."
		};

		for (String q : joiningQueries) {
			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.ACCOUNT_INFO,
					null,
					q,
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer);
			assertEquals("**You joined SpeakMateAI on 07 Sep 2026.**", answer.getMarkdown());

			// Must NOT contain full account header or other personal fields
			assertFalse(answer.getMarkdown().contains("**Your account**"));
			assertFalse(answer.getMarkdown().contains("siddhi@speakmate.ai"));
			assertFalse(answer.getMarkdown().contains("Standard 10"));
			assertFalse(answer.getMarkdown().contains("Division A"));
			assertFalse(answer.getMarkdown().contains("9876543210"));
			assertFalse(answer.getMarkdown().contains("Ekvira High School"));
			assertFalse(answer.getMarkdown().contains("PRO Plan"));
			assertFalse(answer.getMarkdown().contains("Mumbai"));
		}
	}

	@Test
	void testMultipleUsersReceiveOwnJoiningDate() throws Exception {
		Map<String, String> testUsers = Map.of(
				"07 Sep 2026", "**You joined SpeakMateAI on 07 Sep 2026.**",
				"15 Jan 2025", "**You joined SpeakMateAI on 15 Jan 2025.**",
				"01 Oct 2024", "**You joined SpeakMateAI on 01 Oct 2024.**"
		);

		for (Map.Entry<String, String> entry : testUsers.entrySet()) {
			String joinedAt = entry.getKey();
			String expectedResponse = entry.getValue();

			Map<String, Object> accountData = Map.of(
					"displayName", "Test User",
					"email", "test@speakmate.ai",
					"role", "STUDENT",
					"joinedAt", joinedAt
			);
			String dataJson = objectMapper.writeValueAsString(accountData);

			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.ACCOUNT_INFO,
					null,
					"When did I join SpeakMateAI?",
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer);
			assertEquals(expectedResponse, answer.getMarkdown());
		}
	}

	@Test
	void testRollNumberQueryReturnsOnlyRollNumber() throws Exception {
		Map<String, Object> accountData = Map.of(
				"displayName", "Student User",
				"email", "student@speakmate.ai",
				"role", "STUDENT",
				"rollNumber", "23"
		);
		String dataJson = objectMapper.writeValueAsString(accountData);

		String[] rollQueries = {
			"What is my roll number?",
			"Tell me my roll num",
			"Tell me my roll number",
			"What is my roll no?",
			"My roll number",
			"My roll no",
			"Roll number",
			"Roll no"
		};

		for (String q : rollQueries) {
			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.ACCOUNT_INFO,
					null,
					q,
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer);
			assertEquals("**Your roll number is 23.**", answer.getMarkdown());

			// Must NOT contain performance metrics or activity modules
			assertFalse(answer.getMarkdown().contains("Learning Activity"));
			assertFalse(answer.getMarkdown().contains("Total activity count"));
			assertFalse(answer.getMarkdown().contains("Speaking"));
			assertFalse(answer.getMarkdown().contains("Lessons"));
			assertFalse(answer.getMarkdown().contains("Grammar"));
			assertFalse(answer.getMarkdown().contains("Vocabulary"));
			assertFalse(answer.getMarkdown().contains("View my progress"));
		}
	}

	@Test
	void testDailySpeakingTargetQueryReturnsOnlyTarget() throws Exception {
		Map<String, Object> accountData = Map.of(
				"displayName", "Siddhi Narke",
				"email", "siddhi@speakmate.ai",
				"role", "STUDENT",
				"dailyGoalMinutes", 15
		);
		String dataJson = objectMapper.writeValueAsString(accountData);

		String[] targetQueries = {
			"What is my daily speaking target?",
			"How many minutes should I speak every day?",
			"What is my daily speaking goal?",
			"How much speaking practice should I do each day?",
			"How long should I practice speaking daily?",
			"What is my speaking target?",
			"What is my daily practice target?"
		};

		for (String q : targetQueries) {
			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.ACCOUNT_INFO,
					null,
					q,
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer);
			assertEquals("**Your daily speaking target is 15 minutes.**", answer.getMarkdown());

			// Must NOT contain unrelated learning metrics, cards, or activity details
			assertFalse(answer.getMarkdown().contains("Learning Activity"));
			assertFalse(answer.getMarkdown().contains("Total activity"));
			assertFalse(answer.getMarkdown().contains("Lessons"));
			assertFalse(answer.getMarkdown().contains("Grammar"));
			assertFalse(answer.getMarkdown().contains("Vocabulary"));
			assertFalse(answer.getMarkdown().contains("XP"));
			assertFalse(answer.getMarkdown().contains("Streak"));
			assertFalse(answer.getMarkdown().contains("View my progress"));
			assertFalse(answer.getMarkdown().contains("Practice speaking"));
			assertFalse(answer.getMarkdown().contains("**Your account**"));
		}
	}

	@Test
	void testMultipleUsersDailySpeakingTargets() throws Exception {
		Map<Integer, String> testTargets = Map.of(
				15, "**Your daily speaking target is 15 minutes.**",
				20, "**Your daily speaking target is 20 minutes.**",
				30, "**Your daily speaking target is 30 minutes.**"
		);

		for (Map.Entry<Integer, String> entry : testTargets.entrySet()) {
			int minutes = entry.getKey();
			String expectedResponse = entry.getValue();

			Map<String, Object> accountData = Map.of(
					"displayName", "Student User",
					"email", "student" + minutes + "@speakmate.ai",
					"role", "STUDENT",
					"dailyGoalMinutes", minutes
			);
			String dataJson = objectMapper.writeValueAsString(accountData);

			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.ACCOUNT_INFO,
					null,
					"What is my daily speaking target?",
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer);
			assertEquals(expectedResponse, answer.getMarkdown());
		}
	}

	@Test
	void testXpQueryReturnsOnlyXp() throws Exception {
		Map<String, Object> accountData = Map.of(
				"displayName", "Siddhi Narke",
				"email", "siddhi@speakmate.ai",
				"role", "STUDENT",
				"totalXp", 1795,
				"xp", 1795,
				"level", 4,
				"currentStreak", 7
		);
		String dataJson = objectMapper.writeValueAsString(accountData);

		String[] xpQueries = {
			"How much XP do I have?",
			"What is my XP?",
			"How many XP do I have?",
			"How much experience points do I have?",
			"What are my experience points?",
			"How many experience points have I earned?",
			"Tell me my XP."
		};

		for (String q : xpQueries) {
			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.ACCOUNT_INFO,
					null,
					q,
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer);
			assertEquals("**You currently have 1795 XP.**", answer.getMarkdown());

			// Must NOT contain level, streak, activity modules, or action cards
			assertFalse(answer.getMarkdown().contains("Level 4"));
			assertFalse(answer.getMarkdown().contains("Intermediate"));
			assertFalse(answer.getMarkdown().contains("XP needed"));
			assertFalse(answer.getMarkdown().contains("Current Streak"));
			assertFalse(answer.getMarkdown().contains("Learning Activity"));
			assertFalse(answer.getMarkdown().contains("Total activity"));
			assertFalse(answer.getMarkdown().contains("View my progress"));
			assertFalse(answer.getMarkdown().contains("Practice speaking"));
			assertFalse(answer.getMarkdown().contains("Lessons"));
			assertFalse(answer.getMarkdown().contains("Grammar"));
			assertFalse(answer.getMarkdown().contains("Vocabulary"));
		}
	}

	@Test
	void testMultipleUsersDynamicXp() throws Exception {
		Map<Integer, String> testXpValues = Map.of(
				1795, "**You currently have 1795 XP.**",
				2450, "**You currently have 2450 XP.**",
				500, "**You currently have 500 XP.**"
		);

		for (Map.Entry<Integer, String> entry : testXpValues.entrySet()) {
			int xp = entry.getKey();
			String expectedResponse = entry.getValue();

			Map<String, Object> accountData = Map.of(
					"displayName", "Student User",
					"email", "student" + xp + "@speakmate.ai",
					"role", "STUDENT",
					"totalXp", xp,
					"xp", xp
			);
			String dataJson = objectMapper.writeValueAsString(accountData);

			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.ACCOUNT_INFO,
					null,
					"How much XP do I have?",
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer);
			assertEquals(expectedResponse, answer.getMarkdown());
		}
	}

	@Test
	void testCurrentStreakQueryReturnsOnlyCurrentStreak() throws Exception {
		List<String> queries = List.of(
				"What is my current streak?",
				"How many days is my current streak?",
				"What is my streak?",
				"How long is my current streak?",
				"Tell me my current streak.",
				"How many days have I practiced continuously?",
				"What is my active streak?"
		);

		Map<String, Object> data = Map.ofEntries(
				entry("studentName", "Student User"),
				entry("email", "student@speakmate.ai"),
				entry("role", "STUDENT"),
				entry("currentStreak", 1),
				entry("longestStreak", 5),
				entry("xp", 1795),
				entry("level", 4),
				entry("englishLevelLabel", "Intermediate"),
				entry("totalSpeakingSessions", 12),
				entry("lessonsCompleted", 8),
				entry("totalGrammarChecks", 15),
				entry("totalVocabularyWords", 20)
		);
		String dataJson = objectMapper.writeValueAsString(data);

		for (String q : queries) {
			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.STUDENT_PERFORMANCE,
					null,
					q,
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer, "Answer should not be null for query: " + q);
			assertEquals("**Your current streak is 1 day.**", answer.getMarkdown(),
					"Failed for query: " + q);
			assertNull(answer.getChart(), "Chart should be null for query: " + q);

			// Must NOT contain longest streak, level, XP, activity modules, or action cards
			assertFalse(answer.getMarkdown().contains("5 days"));
			assertFalse(answer.getMarkdown().contains("Longest streak"));
			assertFalse(answer.getMarkdown().contains("1795"));
			assertFalse(answer.getMarkdown().contains("Level 4"));
			assertFalse(answer.getMarkdown().contains("Intermediate"));
			assertFalse(answer.getMarkdown().contains("Learning Activity"));
			assertFalse(answer.getMarkdown().contains("Total activity"));
			assertFalse(answer.getMarkdown().contains("View my progress"));
			assertFalse(answer.getMarkdown().contains("Practice speaking"));
			assertFalse(answer.getMarkdown().contains("Lessons"));
			assertFalse(answer.getMarkdown().contains("Grammar"));
			assertFalse(answer.getMarkdown().contains("Vocabulary"));
		}
	}

	@Test
	void testLongestStreakQueryReturnsOnlyLongestStreak() throws Exception {
		List<String> queries = List.of(
				"What is my longest streak?",
				"How long is my longest streak?",
				"What is my best streak?",
				"Tell me my longest streak."
		);

		Map<String, Object> data = Map.of(
				"studentName", "Student User",
				"email", "student@speakmate.ai",
				"role", "STUDENT",
				"currentStreak", 1,
				"longestStreak", 5,
				"xp", 1795,
				"level", 4
		);
		String dataJson = objectMapper.writeValueAsString(data);

		for (String q : queries) {
			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.STUDENT_PERFORMANCE,
					null,
					q,
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer, "Answer should not be null for query: " + q);
			assertEquals("**Your longest streak is 5 days.**", answer.getMarkdown(),
					"Failed for query: " + q);
			assertNull(answer.getChart(), "Chart should be null for query: " + q);
			assertFalse(answer.getMarkdown().contains("Your current streak"));
		}
	}

	@Test
	void testMultipleUsersDynamicStreak() throws Exception {
		Map<Integer, String> testStreakValues = Map.of(
				1, "**Your current streak is 1 day.**",
				5, "**Your current streak is 5 days.**",
				0, "**Your current streak is 0 days.**"
		);

		for (Map.Entry<Integer, String> entry : testStreakValues.entrySet()) {
			int streak = entry.getKey();
			String expectedResponse = entry.getValue();

			Map<String, Object> accountData = Map.of(
					"displayName", "Student User",
					"email", "student" + streak + "@speakmate.ai",
					"role", "STUDENT",
					"currentStreak", streak
			);
			String dataJson = objectMapper.writeValueAsString(accountData);

			SynthesizedAnswer answer = synthesizer.synthesize(
					AssistantIntent.STUDENT_PERFORMANCE,
					null,
					"What is my current streak?",
					Map.of(),
					dataJson,
					null
			);

			assertNotNull(answer);
			assertEquals(expectedResponse, answer.getMarkdown());
		}

	}
}
