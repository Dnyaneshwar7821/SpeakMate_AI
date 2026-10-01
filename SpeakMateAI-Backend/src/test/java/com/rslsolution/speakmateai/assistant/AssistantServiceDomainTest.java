package com.rslsolution.speakmateai.assistant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.provider.AssistantDataProvider;
import com.rslsolution.speakmateai.assistant.provider.AssistantDataProviderRegistry;
import com.rslsolution.speakmateai.assistant.provider.NavigationDataProvider;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.dto.assistant.AssistantRequest;
import com.rslsolution.speakmateai.dto.assistant.AssistantResponse;
import com.rslsolution.speakmateai.enums.Role;

/**
 * Direct pipeline test suite for AssistantService domain boundary precedence,
 * proving that OUT_OF_DOMAIN questions (e.g. "what is hobby", "Who is MS Dhoni?")
 * receive the controlled SpeakMate-only refusal across all 5 roles and NEVER
 * reach role-scope access denials ("This question is outside your access").
 */
public class AssistantServiceDomainTest {

	private AssistantService assistantService;
	private ActorResolver actorResolver;
	private IntentClassifier intentClassifier;
	private AnswerSynthesizer answerSynthesizer;
	private AssistantDataProviderRegistry registry;

	@BeforeEach
	void setUp() {
		actorResolver = mock(ActorResolver.class);
		intentClassifier = new IntentClassifier(null, new ObjectMapper());
		answerSynthesizer = mock(AnswerSynthesizer.class);
		registry = mock(AssistantDataProviderRegistry.class);

		assistantService = new AssistantService(actorResolver, intentClassifier, answerSynthesizer, registry);

		// Setup mock actor contexts for each role
		when(actorResolver.resolve("schooladmin@speakmate.ai"))
				.thenReturn(ActorContext.builder().email("schooladmin@speakmate.ai").role(Role.SCHOOL_ADMIN).schoolId(1L).build());
		when(actorResolver.resolve("superadmin@speakmate.ai"))
				.thenReturn(ActorContext.builder().email("superadmin@speakmate.ai").role(Role.SUPER_ADMIN).adminId(1L).build());
		when(actorResolver.resolve("teacher@speakmate.ai"))
				.thenReturn(ActorContext.builder().email("teacher@speakmate.ai").role(Role.TEACHER).schoolId(1L).teacherId(10L).build());
		when(actorResolver.resolve("student@speakmate.ai"))
				.thenReturn(ActorContext.builder().email("student@speakmate.ai").role(Role.STUDENT).schoolId(1L).studentId(100L).build());
		when(actorResolver.resolve("user@speakmate.ai"))
				.thenReturn(ActorContext.builder().email("user@speakmate.ai").role(Role.USER).build());

		// Role permission configuration
		when(registry.isRoleAllowed(eq(AssistantIntent.ACCESS_DENIED), any())).thenReturn(false);
		when(registry.isRoleAllowed(eq(AssistantIntent.NAVIGATION_HELP), any())).thenReturn(true);
		when(registry.isRoleAllowed(eq(AssistantIntent.CASUAL_CHAT), any())).thenReturn(true);
		when(registry.isRoleAllowed(eq(AssistantIntent.ACCOUNT_INFO), any())).thenReturn(true);
		when(registry.isRoleAllowed(eq(AssistantIntent.SCHOOL_ROSTER), eq(Role.SCHOOL_ADMIN))).thenReturn(true);
		when(registry.isRoleAllowed(eq(AssistantIntent.SCHOOL_ROSTER), eq(Role.SUPER_ADMIN))).thenReturn(true);
		when(registry.isRoleAllowed(eq(AssistantIntent.SCHOOL_ROSTER), eq(Role.TEACHER))).thenReturn(true);
		when(registry.isRoleAllowed(eq(AssistantIntent.STUDENT_PERFORMANCE), eq(Role.STUDENT))).thenReturn(true);

		AnswerSynthesizer realSynthesizer = new AnswerSynthesizer(null, new ObjectMapper());
		when(answerSynthesizer.synthesize(any(), any(), any(), any(), any(), any()))
				.thenAnswer(inv -> realSynthesizer.synthesize(
						inv.getArgument(0), inv.getArgument(1), inv.getArgument(2),
						inv.getArgument(3), inv.getArgument(4), inv.getArgument(5)));

		NavigationDataProvider navProvider = new NavigationDataProvider(new ObjectMapper());
		when(registry.providerFor(eq(AssistantIntent.NAVIGATION_HELP), any())).thenReturn(Optional.of(navProvider));

		AssistantDataProvider mockCasualProvider = mock(AssistantDataProvider.class);
		when(mockCasualProvider.provide(any(), any())).thenReturn("{}");
		when(registry.providerFor(eq(AssistantIntent.CASUAL_CHAT), any())).thenReturn(Optional.of(mockCasualProvider));

		AssistantDataProvider mockAccountProvider = mock(AssistantDataProvider.class);
		when(mockAccountProvider.provide(any(), any())).thenAnswer(inv -> {
			ActorContext actor = inv.getArgument(0);
			Map<String, Object> map = new java.util.LinkedHashMap<>();
			map.put("scope", "SELF");
			map.put("role", actor != null && actor.getRole() != null ? actor.getRole().name() : "USER");
			if (actor != null && actor.getRole() == Role.STUDENT) {
				map.put("schoolName", "DY Patil");
			}
			return new ObjectMapper().writeValueAsString(map);
		});
		when(registry.providerFor(eq(AssistantIntent.ACCOUNT_INFO), any())).thenReturn(Optional.of(mockAccountProvider));

		AssistantDataProvider mockStudentProvider = mock(AssistantDataProvider.class);
		when(mockStudentProvider.provide(any(), any())).thenReturn("{\"scope\":\"SELF\",\"xp\":140,\"level\":1}");
		when(registry.providerFor(eq(AssistantIntent.STUDENT_PERFORMANCE), eq(Role.STUDENT))).thenReturn(Optional.of(mockStudentProvider));
	}

	@Test
	@DisplayName("School Admin Mandatory Bug Fix: 'what is hobby' returns SpeakMate-only refusal, NOT role access denial")
	void testSchoolAdminHobbyBugFix() {
		AssistantRequest request = AssistantRequest.builder()
				.message("what is hobby")
				.currentRoute("/school-admin/dashboard")
				.build();

		AssistantResponse response = assistantService.answer("schooladmin@speakmate.ai", request);
		assertNotNull(response);
		assertTrue(response.getMarkdown().contains("I can help only with questions related to SpeakMate AI"),
				"Response should be controlled SpeakMate refusal, got: " + response.getMarkdown());
		assertFalse(response.getMarkdown().contains("outside your access"),
				"Response MUST NOT mention 'outside your access'");
		assertEquals("ACCESS_DENIED", response.getIntent());
		assertFalse(response.isAccessDenied());
	}

	@Test
	@DisplayName("Out of domain generalization tests across all 5 roles")
	void testOutOfDomainAcrossAllRoles() {
		String[] outOfDomainQueries = {
			"what is hobby",
			"What is a hobby?",
			"Who is MS Dhoni?",
			"Who is Virat Kohli?",
			"Who is Rohit Sharma?",
			"Who is Elon Musk?",
			"Who is Albert Einstein?",
			"What is democracy?",
			"How does Docker work?",
			"What is chemistry?",
			"Explain blockchain.",
			"What is Python?",
			"Explain photosynthesis.",
			"Tell me a joke.",
			"What is 25 * 40?",
			"What's the weather today?",
			"Write me a poem."
		};

		String[] emails = {
			"schooladmin@speakmate.ai",
			"superadmin@speakmate.ai",
			"teacher@speakmate.ai",
			"student@speakmate.ai",
			"user@speakmate.ai"
		};

		for (String email : emails) {
			for (String q : outOfDomainQueries) {
				AssistantRequest req = AssistantRequest.builder().message(q).currentRoute("/dashboard").build();
				AssistantResponse res = assistantService.answer(email, req);
				assertNotNull(res, "Response should not be null for query: " + q);
				assertTrue(res.getMarkdown().contains("I can help only with questions related to SpeakMate AI"),
						"Query '" + q + "' for email " + email + " must produce domain refusal, got: " + res.getMarkdown());
				assertFalse(res.getMarkdown().contains("outside your access"),
						"Query '" + q + "' for email " + email + " must NOT contain 'outside your access'");
			}
		}
	}

	@Test
	@DisplayName("Legitimate Navigation vs Domain vs Authorization Separation")
	void testDomainVsAuthorizationSeparation() {
		// 1. Out of domain query -> Domain refusal
		AssistantRequest reqHobby = AssistantRequest.builder().message("what is hobby").currentRoute("/school-admin/dashboard").build();
		AssistantResponse resHobby = assistantService.answer("schooladmin@speakmate.ai", reqHobby);
		assertTrue(resHobby.getMarkdown().contains("I can help only with questions related to SpeakMate AI"));
		assertFalse(resHobby.getMarkdown().contains("outside your access"));

		// 2. Legitimate Navigation -> NAVIGATION_HELP
		AssistantRequest reqNav = AssistantRequest.builder().message("Where can I find the Students page?").currentRoute("/school-admin/dashboard").build();
		AssistantResponse resNav = assistantService.answer("schooladmin@speakmate.ai", reqNav);
		assertEquals("NAVIGATION_HELP", resNav.getIntent());

		// 3. Unauthorized In-Domain request -> Role Access Restriction
		AssistantRequest reqUnauth = AssistantRequest.builder().message("Show students from another school.").currentRoute("/school-admin/dashboard").build();
		AssistantResponse resUnauth = assistantService.answer("schooladmin@speakmate.ai", reqUnauth);
		assertTrue(resUnauth.getMarkdown().contains("You do not have permission to access data from other schools"),
				"Unauthorized request should produce role scope restriction, got: " + resUnauth.getMarkdown());
		assertTrue(resUnauth.isAccessDenied());
	}

	@Test
	@DisplayName("Comprehensive Student Authorization Matrix (24 Required Test Cases)")
	void testStudentRoleFullAuthorizationMatrix() {
		String studentEmail = "student@speakmate.ai";

		// SELF — MUST REMAIN ALLOWED (1..5)
		String[] selfQueries = {
			"How is my progress?",
			"What is my XP?",
			"What is my current English level?",
			"How many words I added?",
			"How many speaking sessions done?"
		};
		for (String q : selfQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertNotNull(res, "Response should not be null for: " + q);
			assertFalse(res.isAccessDenied(), "Self query '" + q + "' must be allowed");
			assertFalse(res.getMarkdown().contains("Access Restricted"), "Self query '" + q + "' must not return Access Restricted");
		}

		// ANOTHER STUDENT — MUST BE RESTRICTED (6..9)
		String[] anotherStudentQueries = {
			"Onkar Awate's progress",
			"Show Rohan's XP",
			"Show another student's progress",
			"Show all students"
		};
		for (String q : anotherStudentQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertTrue(res.isAccessDenied(), "Query '" + q + "' must be access denied for Student");
			assertTrue(res.getMarkdown().contains("You do not have permission to view other students' learning progress")
					|| res.getMarkdown().contains("Access Restricted"), "Query '" + q + "' must return Access Restricted markdown");
			assertFalse(res.getMarkdown().contains("I can help only with questions related to SpeakMate AI"),
					"Query '" + q + "' must NOT return domain refusal");
		}

		// SCHOOL — MUST BE RESTRICTED (10..13)
		String[] schoolQueries = {
			"Tell me about my school",
			"Show my school's details",
			"Tell me about another school",
			"Show all schools"
		};
		for (String q : schoolQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertTrue(res.isAccessDenied(), "School query '" + q + "' must be access denied for Student");
			assertTrue(res.getMarkdown().contains("Access Restricted"), "School query '" + q + "' must return Access Restricted markdown");
			assertFalse(res.getMarkdown().contains("I can help only with questions related to SpeakMate AI"),
					"School query '" + q + "' must NOT return domain refusal");
		}

		// TEACHER — MUST BE RESTRICTED (14..16)
		String[] teacherQueries = {
			"Tell me about my teacher",
			"Show my teacher's details",
			"Show all teachers"
		};
		for (String q : teacherQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertTrue(res.isAccessDenied(), "Teacher query '" + q + "' must be access denied for Student");
			assertTrue(res.getMarkdown().contains("Access Restricted"), "Teacher query '" + q + "' must return Access Restricted markdown");
			assertFalse(res.getMarkdown().contains("I can help only with questions related to SpeakMate AI"),
					"Teacher query '" + q + "' must NOT return domain refusal");
		}

		// SCHOOL ADMIN — MUST BE RESTRICTED (17..18)
		String[] schoolAdminQueries = {
			"Tell me about the school admin",
			"Show school admin details"
		};
		for (String q : schoolAdminQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertTrue(res.isAccessDenied(), "School Admin query '" + q + "' must be access denied for Student");
			assertTrue(res.getMarkdown().contains("Access Restricted"), "School Admin query '" + q + "' must return Access Restricted markdown");
			assertFalse(res.getMarkdown().contains("I can help only with questions related to SpeakMate AI"),
					"School Admin query '" + q + "' must NOT return domain refusal");
		}

		// SUPER ADMIN — MUST BE RESTRICTED (19..20)
		String[] superAdminQueries = {
			"Tell me about the super admin",
			"Show super admin details"
		};
		for (String q : superAdminQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertTrue(res.isAccessDenied(), "Super Admin query '" + q + "' must be access denied for Student");
			assertTrue(res.getMarkdown().contains("Access Restricted"), "Super Admin query '" + q + "' must return Access Restricted markdown");
			assertFalse(res.getMarkdown().contains("I can help only with questions related to SpeakMate AI"),
					"Super Admin query '" + q + "' must NOT return domain refusal");
		}

		// OUT OF DOMAIN — MUST KEEP DOMAIN REFUSAL (21..22)
		String[] outOfDomainQueries = {
			"What is Python?",
			"Explain photosynthesis"
		};
		for (String q : outOfDomainQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertFalse(res.isAccessDenied(), "Out of domain query '" + q + "' should not set accessDenied=true");
			assertTrue(res.getMarkdown().contains("I can help only with questions related to SpeakMate AI"),
					"Out of domain query '" + q + "' must return generic domain refusal");
		}

		// GENERAL SPEAKMATE — MUST REMAIN ALLOWED (23..24)
		String[] generalSpeakMateQueries = {
			"How does progress work in SpeakMate AI?",
			"What features does SpeakMate provide?"
		};
		for (String q : generalSpeakMateQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertFalse(res.isAccessDenied(), "General SpeakMate query '" + q + "' must be allowed");
			assertFalse(res.getMarkdown().contains("Access Restricted"), "General SpeakMate query '" + q + "' must not return Access Restricted");
		}

		// SELF SCHOOL — MUST BE ALLOWED FOR STUDENT (25..33)
		String[] selfSchoolQueries = {
			"Which school am I studying in?",
			"What school do I study in?",
			"Which school am I from?",
			"What is my school?",
			"Tell me my school",
			"Where do I study?",
			"Which school am I enrolled in?",
			"What school am I enrolled in?",
			"Show my school"
		};
		for (String q : selfSchoolQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer(studentEmail, req);
			assertFalse(res.isAccessDenied(), "Self school query '" + q + "' must be allowed for Student");
			assertFalse(res.getMarkdown().contains("Access Restricted"), "Self school query '" + q + "' must not return Access Restricted");
		}
	}

	@Test
	@DisplayName("General User Self School Queries Return Exact '**You are not a student. You are a general user.**'")
	void testGeneralUserSelfSchoolQueries() {
		String[] selfSchoolQueries = {
			"Which school am I studying in?",
			"What school am I in?",
			"Which school am I from?",
			"Where do I study?",
			"What is my school?"
		};
		for (String q : selfSchoolQueries) {
			AssistantRequest req = AssistantRequest.builder().message(q).build();
			AssistantResponse res = assistantService.answer("user@speakmate.ai", req);
			assertFalse(res.isAccessDenied(), "Self school query '" + q + "' must be allowed for General User");
			assertEquals("**You are not a student. You are a general user.**", res.getMarkdown(), "General user self school query '" + q + "' must return exact response for: " + q);
		}
	}
}
