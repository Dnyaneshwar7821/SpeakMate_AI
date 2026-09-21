package com.rslsolution.speakmateai.assistant;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.dto.assistant.AssistantRequest;
import com.rslsolution.speakmateai.enums.Role;

public class IntentClassifierChatTest {

	private IntentClassifier classifier;

	@BeforeEach
	void setUp() {
		// Mock GroqChatClient as null since fast-path executes 100% deterministically
		classifier = new IntentClassifier(null, new ObjectMapper());
	}

	@Test
	void testClassSpecificStudentLists() {
		IntentResult r1 = classifier.classify("give list of 9th A students", Role.SUPER_ADMIN, null);
		assertNotNull(r1);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r1.getIntent());
		assertEquals("9", r1.getParams().get("standard"));
		assertEquals("A", r1.getParams().get("division"));
		assertEquals("students", r1.getParams().get("entityType"));

		IntentResult r2 = classifier.classify("give list of 9-A students", Role.SUPER_ADMIN, null);
		assertNotNull(r2);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r2.getIntent());
		assertEquals("9", r2.getParams().get("standard"));
		assertEquals("A", r2.getParams().get("division"));

		IntentResult r3 = classifier.classify("give list of 9 standard 'A' Division students", Role.SUPER_ADMIN, null);
		assertNotNull(r3);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r3.getIntent());
		assertEquals("9", r3.getParams().get("standard"));
		assertEquals("A", r3.getParams().get("division"));
	}

	@Test
	void testPlatformOverviewAndGeneralCounts() {
		IntentResult r1 = classifier.classify("Give me a platform overview.", Role.SUPER_ADMIN, null);
		assertNotNull(r1);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r1.getIntent());

		IntentResult r2 = classifier.classify("How many total users are there?", Role.SUPER_ADMIN, null);
		assertNotNull(r2);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r2.getIntent());

		IntentResult r3 = classifier.classify("how many students are", Role.SUPER_ADMIN, null);
		assertNotNull(r3);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r3.getIntent());

		IntentResult r4 = classifier.classify("How many students are there?", Role.SUPER_ADMIN, null);
		assertNotNull(r4);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r4.getIntent());

		IntentResult r5 = classifier.classify("How many teachers are there?", Role.SUPER_ADMIN, null);
		assertNotNull(r5);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r5.getIntent());

		IntentResult r6 = classifier.classify("How many schools are there?", Role.SUPER_ADMIN, null);
		assertNotNull(r6);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r6.getIntent());
	}

	@Test
	void testHistoryFromAssistantDoesNotHijackGeneralCounts() {
		// Simulate assistant previously responding with DY Patil University details in platform overview
		List<AssistantRequest.MessageTurn> history = new ArrayList<>();
		AssistantRequest.MessageTurn userTurn1 = new AssistantRequest.MessageTurn();
		userTurn1.setRole("user");
		userTurn1.setContent("How many total users are there?");
		history.add(userTurn1);

		AssistantRequest.MessageTurn botTurn1 = new AssistantRequest.MessageTurn();
		botTurn1.setRole("assistant");
		botTurn1.setContent("Platform overview\nTotal schools: 13\nTotal users: 32\nTop schools by students:\nDY Patil University — 5 students, 3 teachers");
		history.add(botTurn1);

		// Now user asks general counts
		IntentResult r1 = classifier.classify("How many students are there? How many teachers are there? How many schools are there?", Role.SUPER_ADMIN, history);
		assertNotNull(r1);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r1.getIntent());

		IntentResult r2 = classifier.classify("How many students are there?", Role.SUPER_ADMIN, history);
		assertNotNull(r2);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r2.getIntent());

		IntentResult r3 = classifier.classify("how many students are", Role.SUPER_ADMIN, history);
		assertNotNull(r3);
		assertEquals(AssistantIntent.PLATFORM_OVERVIEW, r3.getIntent());
	}

	@Test
	void testGeneralStudentRosterQueriesWithTypoAndSingular() {
		// School Admin queries
		IntentResult r1 = classifier.classify("give me lsit of student", Role.SCHOOL_ADMIN, null);
		assertNotNull(r1);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r1.getIntent());
		assertEquals("students", r1.getParams().get("entityType"));
		assertFalse(r1.getParams().containsKey("standard"), "Should not contain standard");
		assertFalse(r1.getParams().containsKey("division"), "Should not contain division");

		IntentResult r2 = classifier.classify("give me list of student", Role.SCHOOL_ADMIN, null);
		assertNotNull(r2);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r2.getIntent());
		assertEquals("students", r2.getParams().get("entityType"));

		IntentResult r3 = classifier.classify("list of students", Role.SCHOOL_ADMIN, null);
		assertNotNull(r3);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r3.getIntent());
		assertEquals("students", r3.getParams().get("entityType"));

		IntentResult r4 = classifier.classify("students list", Role.SCHOOL_ADMIN, null);
		assertNotNull(r4);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r4.getIntent());
		assertEquals("students", r4.getParams().get("entityType"));

		IntentResult r5 = classifier.classify("show students", Role.SCHOOL_ADMIN, null);
		assertNotNull(r5);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r5.getIntent());
		assertEquals("students", r5.getParams().get("entityType"));

		// Teacher query
		IntentResult r6 = classifier.classify("give me lsit of teacher", Role.SCHOOL_ADMIN, null);
		assertNotNull(r6);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r6.getIntent());
		assertEquals("teachers", r6.getParams().get("entityType"));
	}

	@Test
	void testHistoryClassDoesNotBleedIntoGeneralStudentList() {
		List<AssistantRequest.MessageTurn> history = new ArrayList<>();
		AssistantRequest.MessageTurn userTurn = new AssistantRequest.MessageTurn();
		userTurn.setRole("user");
		userTurn.setContent("which teacher is assigned to 9-A");
		history.add(userTurn);

		AssistantRequest.MessageTurn botTurn = new AssistantRequest.MessageTurn();
		botTurn.setRole("assistant");
		botTurn.setContent("Teacher for class 9-A: Pratik Patil");
		history.add(botTurn);

		// Now user asks "give me lsit of student"
		IntentResult r = classifier.classify("give me lsit of student", Role.SCHOOL_ADMIN, history);
		assertNotNull(r);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r.getIntent());
		assertEquals("students", r.getParams().get("entityType"));
		assertFalse(r.getParams().containsKey("standard"), "Must not inherit standard from previous 9-A turn");
		assertFalse(r.getParams().containsKey("division"), "Must not inherit division from previous 9-A turn");
		assertFalse(r.getParams().containsKey("classes"), "Must not inherit classes from previous 9-A turn");
	}

	@Test
	void testTeacherRoleFastPathQueries() {
		// 1. Who are my assigned students
		IntentResult r1 = classifier.classify("Who are my assigned students?", Role.TEACHER, null);
		assertNotNull(r1);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r1.getIntent());
		assertEquals("students", r1.getParams().get("entityType"));

		// 2. Show roster for 9-A
		IntentResult r2 = classifier.classify("Show roster for 9-A", Role.TEACHER, null);
		assertNotNull(r2);
		assertEquals(AssistantIntent.SCHOOL_ROSTER, r2.getIntent());
		assertEquals("students", r2.getParams().get("entityType"));
		assertEquals("9", r2.getParams().get("standard"));
		assertEquals("A", r2.getParams().get("division"));

		// 3. Which classes are assigned to me
		IntentResult r3 = classifier.classify("Which classes are assigned to me?", Role.TEACHER, null);
		assertNotNull(r3);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r3.getIntent());
		assertEquals(true, r3.getParams().get("myClasses"));

		// 4. How many students are in my classes
		IntentResult r4 = classifier.classify("How many students are in my classes?", Role.TEACHER, null);
		assertNotNull(r4);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r4.getIntent());

		// 5. Which learners need the most help
		IntentResult r5 = classifier.classify("Which learners need the most help?", Role.TEACHER, null);
		assertNotNull(r5);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r5.getIntent());
		assertEquals("struggling", r5.getParams().get("filter"));

		// 6. Show students who are struggling
		IntentResult r6 = classifier.classify("Show students who are struggling", Role.TEACHER, null);
		assertNotNull(r6);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r6.getIntent());
		assertEquals("struggling", r6.getParams().get("filter"));

		// 7. Which students have low speaking scores
		IntentResult r7 = classifier.classify("Which students have low speaking scores?", Role.TEACHER, null);
		assertNotNull(r7);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r7.getIntent());
		assertEquals("struggling", r7.getParams().get("filter"));

		// 8. Show my class performance summary
		IntentResult r8 = classifier.classify("Show my class performance summary", Role.TEACHER, null);
		assertNotNull(r8);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r8.getIntent());

		// 9. Single student name & follow-up queries
		IntentResult r9 = classifier.classify("what about Onkar", Role.TEACHER, null);
		assertNotNull(r9);
		assertEquals(AssistantIntent.STUDENT_PERFORMANCE, r9.getIntent());
		assertEquals("onkar", r9.getParams().get("studentName").toString().toLowerCase());

		IntentResult r10 = classifier.classify("how is Siddhi doing?", Role.TEACHER, null);
		assertNotNull(r10);
		assertEquals(AssistantIntent.STUDENT_PERFORMANCE, r10.getIntent());
		assertEquals("siddhi", r10.getParams().get("studentName").toString().toLowerCase());

		IntentResult r11 = classifier.classify("give me progress of Siddhi Narke", Role.TEACHER, null);
		assertNotNull(r11);
		assertEquals(AssistantIntent.STUDENT_PERFORMANCE, r11.getIntent());
		assertEquals("siddhi narke", r11.getParams().get("studentName").toString().toLowerCase());

		// 10. Analytical queries with "my students" should NOT route to SCHOOL_ROSTER
		IntentResult r12 = classifier.classify("What is the average grammar score of my students?", Role.TEACHER, null);
		assertNotNull(r12);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r12.getIntent());

		IntentResult r13 = classifier.classify("Average pronunciation score of my students", Role.TEACHER, null);
		assertNotNull(r13);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r13.getIntent());

		IntentResult r14 = classifier.classify("Average fluency score of my class", Role.TEACHER, null);
		assertNotNull(r14);
		assertEquals(AssistantIntent.CLASS_PERFORMANCE, r14.getIntent());
	}
}
