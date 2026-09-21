package com.rslsolution.speakmateai.assistant;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.dto.assistant.AssistantRequest;
import com.rslsolution.speakmateai.dto.assistant.AssistantResponse;
import com.rslsolution.speakmateai.dto.assistant.SynthesizedAnswer;
import com.rslsolution.speakmateai.dto.groq.GroqChatRequest;

/**
 * Second leg of the assistant pipeline: given the classified intent and the
 * role-scoped, aggregated data (as JSON), produces a human-friendly answer in
 * structured form (markdown + stat cards + optional mini chart).
 *
 * <p>The synthesizer only re-phrases the provided DATA — it never has direct DB
 * access, so it cannot leak anything outside the provider-computed scope.
 */
@Component
public class AnswerSynthesizer {

	private final GroqChatClient groqChatClient;
	private final ObjectMapper objectMapper;

	private static final String OUTPUT_SHAPE = """
			Respond with strict JSON only, no markdown fences, in this shape:
			{
			  "markdown": "Your answer as markdown. Use short paragraphs, bullets, and bold for key numbers.",
			  "stats": [{"label":"Short label","value":"Number or short text","delta":"Optional +x%/-x%/vs text"}],
			  "chart": {"type":"doughnut|pie|line|horizontal-bar|bar","title":"Chart title","labels":["A","B","C"],"datasets":[{"label":"Series name","data":[1,2,3]}]},
			  "suggestDeepLink": true
			}
			Rules:
			- Always keep at most ONE chart per message. If no chart is relevant, set "chart": null.
			- Select the most appropriate dynamic chart type:
			  * "doughnut" or "pie": for distributions, completion ratios, role breakdowns, and proportions (e.g. speaking sessions completed vs remaining, user role breakdown, active vs inactive users).
			  * "line": for trends over time, progress histories, and weekly activity (e.g. speaking practice minutes, scores over time).
			  * "horizontal-bar": for rankings and comparisons among schools, classrooms, or teachers so names on the left axis are never cut off.
			  * "bar": for standard vertical counts.
			- Chart parameters must be well-formed:
			  * "title": Provide a clear, descriptive title (e.g. "Learning Activity by Module", "User Role Distribution").
			  * "labels": Short, distinct, properly capitalized category labels.
			  * "datasets": Must include a descriptive "label" (e.g. "Activities", "Users", "Score %") and numeric data matching the DATA exactly.
			  * For student learning progress or performance, NEVER create a narrow 'Completed vs Remaining' chart. Always break down activity across the 4 modules: Speaking (totalSpeakingSessions), Lessons (lessonsCompleted), Grammar (totalGrammarChecks), and Vocabulary (totalVocabularyWords).
			- For platform users and platform overview, always include key role breakdown cards in "stats": "Total Users", "Teachers" (totalTeachers), "Students" (totalStudents), and "School Admins" (totalSchoolAdmins). Never omit the Teachers card.
			- Only use numbers from the provided DATA. Never invent figures.
			- Keep markdown under 220 words.
			- "suggestDeepLink" must be true ONLY when the question is about metrics/statistics/performance and the user would clearly benefit from opening the full Analytics/Insights page (e.g., platform overview, school overview, class/student performance, billing). Set it false for navigation help, greetings, chit-chat, or when no data was available.
			""";

	public AnswerSynthesizer(GroqChatClient groqChatClient, ObjectMapper objectMapper) {
		this.groqChatClient = groqChatClient;
		this.objectMapper = objectMapper;
	}

	public SynthesizedAnswer synthesize(AssistantIntent intent, ActorContext actor,
			String userMessage, Map<String, Object> params, String dataJson) {
		return synthesize(intent, actor, userMessage, params, dataJson, null);
	}

	public SynthesizedAnswer synthesize(AssistantIntent intent, ActorContext actor,
			String userMessage, Map<String, Object> params, String dataJson,
			List<AssistantRequest.MessageTurn> history) {

		// A record that describes a real person who is NOT a student carries an
		// authoritative role field (personRole). The model has been observed to
		// paraphrase that role into a different one (e.g. reporting a "User" as a
		// "School Admin"). A person's role is a factual attribute, so render this
		// case from the provider's own wording deterministically instead of letting
		// the model rewrite it.
		// Similarly, multi-student duplicate name disambiguation and cross-student
		// privacy denials must be rendered deterministically with zero hallucination.
		if (describesNonStudentPerson(dataJson) || hasDisambiguationOrDenial(dataJson)) {
			return deterministicAnswer(intent, actor, userMessage, params, dataJson);
		}

		String systemPrompt = systemPrompt(intent, actor);
		List<GroqChatRequest.Message> messages = new ArrayList<>();
		messages.add(new GroqChatRequest.Message("system", systemPrompt));

		if (history != null && !history.isEmpty()) {
			int startIdx = Math.max(0, history.size() - 4);
			for (int i = startIdx; i < history.size(); i++) {
				AssistantRequest.MessageTurn turn = history.get(i);
				if (turn != null && turn.getContent() != null && !turn.getContent().isBlank()) {
					String roleName = "assistant".equalsIgnoreCase(turn.getRole()) ? "assistant" : "user";
					messages.add(new GroqChatRequest.Message(roleName, turn.getContent()));
				}
			}
		}

		messages.add(new GroqChatRequest.Message("user",
				"Question: " + userMessage + "\n\nDATA:\n" + dataJson));

		String raw = null;
		// Transient Groq failures (rate limits, timeouts) usually recover quickly;
		// retry with a short backoff (capped) before answering gracefully.
		for (int attempt = 1; attempt <= 3 && raw == null; attempt++) {
			try {
				raw = groqChatClient.chatJson(messages, 0.4);
			} catch (Exception e) {
				String msg = e.getMessage() != null ? e.getMessage() : "";
				if (msg.contains("401") || msg.contains("404")) {
					// Non-transient authentication or model failure; do not retry
					break;
				}
				if (attempt < 3) {
					try {
						Thread.sleep(Math.min(attempt * 300L, 800L));
					} catch (InterruptedException ie) {
						Thread.currentThread().interrupt();
						break;
					}
				}
			}
		}
		if (raw == null) {
			// The LLM leg is unavailable (e.g. Groq rate/quota exhaustion). Rather than
			// surfacing "I couldn't reach the AI service", render the real provider data
			// deterministically so the user still gets a correct, data-backed answer.
			return deterministicAnswer(intent, actor, userMessage, params, dataJson);
		}

		try {
			SynthesizedAnswer answer = objectMapper.readValue(extractJson(raw), SynthesizedAnswer.class);
			enrichPlatformStatsIfMissing(answer, intent, userMessage, dataJson);
			enrichClassStatsIfMissing(answer, intent, userMessage, dataJson);
			enrichStudentProgressChart(answer, intent, userMessage, dataJson);
			enrichPlatformOverviewChart(answer, intent, userMessage, params, dataJson);
			return answer;
		} catch (Exception e) {
			// Graceful fallback: keep the raw text so the user still gets an answer.
			SynthesizedAnswer answer = SynthesizedAnswer.builder()
					.markdown(raw == null || raw.isBlank() ? "I couldn't build a clean answer just now. Please try again."
							: stripFences(raw))
					.build();
			enrichPlatformStatsIfMissing(answer, intent, userMessage, dataJson);
			enrichClassStatsIfMissing(answer, intent, userMessage, dataJson);
			enrichStudentProgressChart(answer, intent, userMessage, dataJson);
			enrichPlatformOverviewChart(answer, intent, userMessage, params, dataJson);
			return answer;
		}
	}

	/**
	 * Extracts the JSON object from the model's response even when it is wrapped
	 * in markdown fences or surrounded by prose (json_object mode is not always
	 * strictly enforced by every model).
	 */
	private String extractJson(String raw) {
		if (raw == null) {
			throw new IllegalArgumentException("synthesizer response is empty");
		}
		String text = raw.trim();
		if (text.startsWith("```")) {
			int firstNewline = text.indexOf('\n');
			if (firstNewline >= 0) {
				text = text.substring(firstNewline + 1);
			}
			int endFence = text.lastIndexOf("```");
			if (endFence >= 0) {
				text = text.substring(0, endFence);
			}
		}
		int start = text.indexOf('{');
		int end = text.lastIndexOf('}');
		if (start < 0 || end <= start) {
			throw new IllegalArgumentException("no JSON object in synthesizer response");
		}
		return text.substring(start, end + 1);
	}

	private String stripFences(String raw) {
		String text = raw == null ? "" : raw.trim();
		if (text.startsWith("```")) {
			int firstNewline = text.indexOf('\n');
			if (firstNewline >= 0) {
				text = text.substring(firstNewline + 1);
			}
			int endFence = text.lastIndexOf("```");
			if (endFence >= 0) {
				text = text.substring(0, endFence);
			}
		}
		return text;
	}

	private String systemPrompt(AssistantIntent intent, ActorContext actor) {
		return """
				You are the SpeakMate AI assistant embedded inside the SpeakMate app. The user is a %s%s.
				You answer questions about the SpeakMate platform using ONLY the DATA provided below the question.
				Never mention that you received JSON. Never expose raw query data, ids, or internal field names.
				If DATA is empty or says "NO DATA", answer honestly that the information is not available.
				Do not invent numbers, names, or facts. Only discuss billing from the data provided for the
				caller's own allowed scope: Super Admins may discuss platform-wide billing, School Admins only
				their own school's billing, and other roles no billing at all.
				The caller's role already limits what data is provided — do not try to bypass it.

				%s

				%s
				""".formatted(roleLabel(actor), (actor != null && actor.getDisplayName() != null) ? " (" + actor.getDisplayName() + ")" : "",
				intentGuidance(intent), OUTPUT_SHAPE);
	}

	private String roleLabel(ActorContext actor) {
		if (actor == null || actor.getRole() == null) {
			return "User";
		}
		switch (actor.getRole().name()) {
			case "SUPER_ADMIN": return "Super Admin (platform-wide access)";
			case "SCHOOL_ADMIN": return "School Admin (access limited to their own school)";
			case "TEACHER": return "Teacher (access limited to their own assigned classes and students)";
			case "STUDENT": return "Student (access limited to their own progress)";
			case "USER": return "User (own account only)";
			default: return "User";
		}
	}

	private String intentGuidance(AssistantIntent intent) {
		if (intent == null) {
			return "Give a helpful general answer.";
		}
		return switch (intent) {
			case CASUAL_CHAT -> "You are greeting or interacting casually with the logged-in user. The user's name is in 'displayName', role in 'role', and school in 'schoolName'.\n"
					+ "CRITICAL RULES:\n"
					+ "- ALWAYS greet them personally by their name if 'displayName' is present (e.g., 'Hello [displayName]!'). Never say a generic 'I am your SpeakMate AI assistant' without acknowledging them.\n"
					+ "- For SCHOOL_ADMIN: Welcome them to '[schoolName]'s assistant' and offer to assist with classes, teachers, students, exam results, or AI insights.\n"
					+ "- For SUPER_ADMIN: Welcome them to SpeakMate AI platform assistant and offer to assist with platform metrics, schools, teachers, or students.\n"
					+ "- If asked 'who are you' or what you can do: introduce yourself warmly as their dedicated SpeakMate assistant for their school/role and summarize the top capabilities (School Overview, Class Performance, Teacher Workloads, Student Progress, Exam Results).\n"
					+ "- If asked 'who am I' or 'what is my name': state their logged-in name, role, and school.\n"
					+ "- If they ask 'how are you' or say 'thanks': respond warmly and politely, addressing them by their name and mentioning their school if applicable.\n"
					+ "- NEVER dump internal navigation URLs, routes, or path strings like '/school-admin/...'. Keep it conversational, warm, and professional.";
			case PLATFORM_OVERVIEW -> "Answer questions about platform-wide statistics accurately using the provided data.\n"
					+ "- TARGETED METRIC RULE: When the user asks for ONE specific metric or category (e.g. 'How many students are there?', 'How many teachers are there?', 'How many schools are there?', 'How many classes are there?', 'How many users are there?'): answer that specific question concisely and directly first (e.g., \"There are 6 students on the platform across all schools (all 6 are active).\"). For student questions, include the breakdown of top schools by students. Do NOT dump unrelated metrics like revenue, classes, or divisions when only asked about students or teachers. In the 'stats' array, include ONLY the stat cards relevant to the asked metric (e.g. for students: 'Total Students' and 'Active Students'; for teachers: 'Total Teachers' and 'Active Teachers'; for schools: 'Total Schools'; for users: 'Total Users' and 'Active Users').\n"
					+ "- BROAD OVERVIEW RULE: When the user asks for a platform overview ('platform overview', 'give me a platform overview', 'summary of platform', etc.) or asks about multiple metrics simultaneously, summarize the key platform numbers across users, teachers, students, schools, and classes. In the 'stats' array, provide key cards: 'Total Users', 'Teachers' (totalTeachers), 'Students' (totalStudents), and 'School Admins' (totalSchoolAdmins).\n"
					+ "- SPEAKING SESSIONS: When asked about speaking sessions done across the platform or students (e.g. 'How many speaking session done students' or 'total speaking sessions'), report totalSpeakingSessions directly from the data.\n"
					+ "- TOP / BEST STUDENTS: When asked about the best student, top students, or student XP leaderboard (e.g. 'best student currently', 'how many XP does each student have', 'who has highest xp'): report the best student from bestStudent and list the top students from topStudents with their name, school, standard/division, XP, level, and streak.\n"
					+ "- If the question compares or ranks schools (e.g., which school has the most students or teachers), rank schools using schoolsByStudentCount and highlight the top schools, using a 'horizontal-bar' chart so school names on the axis are never cut off.\n"
					+ "Never say data is unavailable when the fields are present.";
			case SCHOOL_OVERVIEW -> "Summarize the specific school's statistics from the provided fields (totalStudents, totalTeachers, totalSchoolAdmins, activeStudents, activeTeachers, totalClasses, totalStandards, totalDivisions, standards). Answer count questions directly from those numbers — never say the data is unavailable when the fields are present. IMPORTANT: a count of 0 is a valid, real number — when the school exists but has no students or teachers, explicitly state that it has 0 students and 0 teachers (e.g., \"Greenwood High currently has 0 students and 0 teachers enrolled\"). Never reply that information is unavailable or not provided for an existing school just because a count is zero. Highlight strengths and one improvement area. "
					+ "TOP / BEST STUDENTS & LEADERBOARDS: When asked about the best student, top students, highest XP, or student leaderboard for the school, report the top student from bestStudent and list the top students from topStudents with their name, standard, division, XP, level, and streak.";
			case CLASS_PERFORMANCE -> "Answer questions about class performance, teacher's assigned classes, struggling students, and speech learning metrics.\n"
					+ "- ASSIGNED CLASSES RULE: When asked which classes are assigned to the teacher (e.g. 'which classes are assigned to me', 'classes do I teach', 'my classes', 'what classes are assigned'): list ALL classes from assignedClassesList (or availableClasses) with totalAssignedClasses, stating each class name and enrolled student count. Include stat card 'Total Assigned Classes'.\n"
					+ "- STRUGGLING STUDENTS RULE: When asked which learners need help or are struggling (e.g. 'which learners need the most help', 'show students who are struggling', 'low speaking scores', 'weak students', 'who is struggling'): report each student from strugglingStudents with their name, class, speaking score, lessons completed, XP, and specific reason they need attention. If strugglingStudents is empty, state that all students have healthy practice activity.\n"
					+ "- TOTAL STUDENTS IN CLASSES: When asked how many students are in classes (e.g. 'how many students are in my classes', 'how many students do I have'): state totalStudentsAcrossClasses and provide the per-class student enrollment breakdown from assignedClassesList.\n"
					+ "- CLASS PERFORMANCE SUMMARY: When asked for class performance summary, report enrolled student count, assigned teacher, total XP, average XP, average practice minutes, average speaking scores (classAverageSpeakingScore, classAverageFluencyScore, classAveragePronunciationScore), and highlight top students.\n"
					+ "- TOP STUDENTS / HIGHEST XP / MOST LESSONS: When asked for top students or highest XP in class, rank students from topStudents with their name, XP, streak, and lessons completed.";
			case STUDENT_PERFORMANCE -> "If scope is SELF (the caller is a student or learner asking about their own progress): greet them warmly and report their real learning stats with numbers. Report the metric(s) asked about clearly: lessons -> lessonsCompleted (plus lessonsStarted/lessonsPending); XP/level -> xp and level; streak -> currentStreak/longestStreak; practice time -> totalPracticeMinutes; speaking -> totalSpeakingSessions, completedSpeakingSessions, and speech scores (fluencyScore, pronunciationScore, speakingGrammarScore, speakingVocabularyScore, overallSpeakingScore); vocabulary -> totalVocabularyWords, masteredVocabularyWords, and recentVocabularyWords; grammar -> totalGrammarChecks and averageGrammarScore. When asked broadly ('how is my progress', 'how am I doing', 'my stats', etc.), present a comprehensive 5-pillar breakdown with clean headings or bullet points: 🎙️ Speaking Practice, 💡 Vocabulary, 📝 Grammar Checks, 📚 Lessons, and ⚡ XP & Streak. Always include stat cards for key metrics.\n"
					+ "If scope is a teacher or admin looking up an assigned student: provide a crisp, professional educator snapshot with the same 5-pillar structure. Report the student's name, standard, division, XP, current streak, speaking sessions breakdown (total sessions, completed sessions with AI evaluations, and average speaking scores), vocabulary words added (and recent words if asked), grammar checks completed (and average accuracy), and lessons completed/started/pending. Highlight their learning consistency and any areas needing practice. Include stat cards for XP, streak, speaking, and completed lessons.\n"
					+ "CHART RULE FOR STUDENT LEARNING: When adding a chart for learning progress or performance, NEVER create a narrow 'Completed vs Remaining' chart. Always break down activity across EACH MODULE: Speaking (totalSpeakingSessions), Lessons (lessonsCompleted), Grammar (totalGrammarChecks), and Vocabulary (totalVocabularyWords). Set labels: ['Speaking', 'Lessons', 'Grammar', 'Vocabulary'], title: 'Learning Activity by Module', dataset label: 'Activities', with dynamic chart type 'bar' or 'doughnut'. If the user specifically asks for speech scores progress, use labels ['Fluency', 'Pronunciation', 'Grammar', 'Vocabulary'] with speaking evaluation scores.\n"
					+ "A count of 0 is a valid number, so state 0 explicitly rather than saying data is unavailable. If the person is not a student (it carries a personRole field), state they are not a student and report their role EXACTLY as given in personRole."
					+ "\n- XP REMAINING / LEVEL PROGRESS: When the user asks how much XP is remaining or needed to complete a level (e.g. 'how many xp remaining for siddhi to complete level 1'), report xp, level, nextLevel, nextLevelThreshold, and xpRemaining directly from the data (e.g. \"Siddhi Narke has 478 XP at Level 1. She needs 22 XP to reach Level 2 (500 XP threshold)\").";
			case BILLING -> "Summarize billing/subscription/revenue numbers clearly.\n"
					+ "When asked who has taken a subscription or who the active subscribers are (e.g. 'who has taken subscription', 'who subscribed', 'active subscribers'), list each subscriber from the subscribers array with their name, email, school, plan name, amount, and dates. If the subscribers list is empty, state clearly that there are currently 0 active subscribers.";
			case SCHOOL_ROSTER -> "Answer ONLY from the provided teachers/students arrays, using every detail those entries contain. Never reply that a detail is unavailable when the field is present on the entry.\n"
					+ "Teacher entry fields: name, email, phone, employeeId, department, subject, designation, experience, qualification, joinedAt, classes (list of classes assigned), classCount (number of classes assigned), studentCount, hasStudents, assignedStudents. A teacher's teaching area is exposed as BOTH department and subject - treat 'subject' as the subject they teach and state it, they are the same stored value. If the caller asks which subject/department someone teaches, answer with the subject value (e.g. \"Digvijay Patil teaches English\"). If asked how many classes a teacher teaches (e.g. 'how many classes does pratik patil have/teach'), answer directly using classCount and list their assigned classes. If asked for teachers who have students or assigned classes, list the teachers along with their assigned classes and student counts.\n"
					+ "CLASS TEACHER INQUIRIES: When the caller asks who the teacher is for a class or multiple classes (e.g. 'who is teacher of 7 B class', 'who is teacher of 7-B class', 'who is teacher of 2-A and 10-A class'):\n"
					+ "- Always use classAssignments and the teachers array. State the teacher's name directly (e.g. \"Teacher for class 7-B: Pratik Patil (assigned teacher for class 7-B)\").\n"
					+ "- CRITICAL RULE: A class may have 0 enrolled students, but its teacher assignment exists independently! NEVER say a teacher is unavailable or not found just because the class has 0 students. If a teacher is listed in classAssignments or teachers, report them immediately.\n"
					+ "- For multi-class inquiries (e.g. '2-A and 10-A'), list each class: report the assigned teacher for classes that have one (e.g. \"2-A: Chetan Mali\"), and state that no teacher information is available for classes where hasTeacher is false (e.g. \"10-A: No teacher information is available for this class in the current data.\").\n"
					+ "- STUDENT'S ASSIGNED TEACHER: When studentAssignedTeacher is present, report the student's assigned teacher directly (e.g. \"Raj Varma's assigned teacher is Pratik Patil (Standard 9 - A)\").\n"
					+ "- TEACHER WORKLOAD / MOST CLASSES: When topTeacherByClasses is present, state clearly which teacher handles the most classes, their total class count, and their list of assigned classes.\n"
					+ "- TEACHER'S STUDENTS PROGRESS: When teacherStudentsProgress is present, summarize the teacher's students, total enrolled students, total combined XP, and provide the breakdown of each student with their XP, level, and streak.\n"
					+ "Student entry fields: name, email, phone, studentId, rollNumber, standard, division, assignedTeacher.\n"
					+ "When entityType is SINGLE_PERSON (or focusName is present), the arrays were narrowed to that one person: answer the specific question about them directly (e.g. \"Pratik Patil is assigned to 8 classes: 6-A, 7-A, ...\") and, when the question is a general 'details' question, list ALL of that person's fields as markdown bullets.\n"
					+ "When the caller asked for a name (e.g., 'name of the teacher'), state it directly - for example \"The teacher is John Doe\". For a roster list, present each person as a markdown bullet including their known details (name, plus email/department/subject/experience/qualification/classes for teachers; name, plus standard/division/assignedTeacher for students), grouping under Teachers / Students headings when both are present. Use teacherCount and studentCount as the real numbers - an empty list means no one is enrolled, so say \"0 teachers\" or \"0 students\" explicitly. Keep it concise.\n"
					+ "The payload may also contain otherUsers/otherUserCount for accounts that are neither students nor teachers (platform Users, School Admins, Admins); each entry has name, role, email, phone, schoolName and status. This directory is always available — never say the information is unavailable when these entries are present. Always state a person's role EXACTLY as given in their role field — never substitute, upgrade, or invent a different role (for example, never call a 'User' a 'School Admin').";
			case ACCOUNT_INFO -> "Answer with the caller's OWN account details from the provided fields (email, displayName, role, schoolName, location). When asked for the email, state it clearly (e.g., \"Your logged-in email is ...\"). When asked for their location/address/city (e.g. \"my location\"), answer directly from the location field (e.g., \"Your location is ...\") — never reply with navigation links or say the data is unavailable when the location field is present. Also give their name, role and school when asked. Never mention ids or internal field names, and never claim the data is unavailable — this is the caller's own account and is always available.";
			case NAVIGATION_HELP -> "Give a short, friendly navigation guide pointing to the relevant page.";
			case SCHOOL_DASHBOARD -> "Summarize the school-admin Dashboard KPIs from the provided fields: totalStudents, activeStudents, inactiveStudents, totalTeachers, totalClasses, totalResults, averageResultPercentage, excellentResults, goodResults, passResults, failResults and totalLessonsCompleted. Answer count questions directly from those numbers — a count of 0 is a valid, real number and must be stated as 0 (never 'unavailable'). Highlight the headline numbers and one area to watch.";
			case RESULTS_ANALYTICS -> "Summarize the school's Results page from the provided fields: totalResults, averagePercentage, passed, failed, passPercentage, failPercentage, highestPercentage, lowestPercentage, excellentResults, goodResults, passResults, failResults and any per-standard breakdown. When illustrating pass/fail distribution, use a 'doughnut' or 'pie' chart. Answer count/percentage questions directly from those numbers — 0 is a valid number. Present pass/fail clearly and note where the school can improve.";
			case AI_INSIGHTS -> "Summarize the school's AI Insights page from the provided fields: fluency, pronunciation, vocabulary and grammar scores, speakingTimeSeconds, speechMetrics, trends, topSpeakers and mispronouncedWords. Answer metric questions directly from those numbers (e.g. average fluency score) — a value of 0 is valid. When illustrating speech metric trends over time, use a 'line' chart. If mispronouncedWordsAvailable is false (or the mispronouncedWords list is empty), state plainly that word-level mispronunciation data is not available and DO NOT invent, guess or list any words. Be encouraging and call out the strongest and weakest area plus the top speakers.";
			case PROFILE_SETTINGS -> "Answer with the caller's OWN profile and settings from the provided fields (name, email, role, phone, schoolName, schoolCode, department, joinedAt and preference/security settings such as theme, notification preferences and two-factor status). State values directly (e.g. 'Your profile email is ...'); never mention ids or internal field names and never claim the data is unavailable — this is the caller's own profile.";
			case PLATFORM_USERS -> "The caller is a Super Admin, who can access every dataset on the platform (the All Users page at /admin/users). Answer ONLY from the provided users array, using every detail those entries contain (name, role, email, schoolName, phone, status, registeredDate). List the users as markdown bullets (name plus role/school). Use totalUsers and userCount as the real numbers — userCount is the number of users matching any roleFilter. If the user asks about recently added users, students, or school admins (e.g. 'which student recently added', 'which school admin recently added'), answer using the recentUsers list or list the most recently registered users with their registeredDate. In the 'stats' array, ALWAYS provide the core role cards: 'Total Users' (totalUsers), 'Teachers' (totalTeachers), 'Students' (totalStudents), and 'School Admins' (totalSchoolAdmins). Never omit Teachers. When showing user role breakdown, use a 'doughnut' or 'pie' chart with labels and counts from roleCounts. Never reply that the data is unavailable — this directory is always available to a Super Admin. When the question simply asks for the names of all users, list every name from the users array.";
			case ACCESS_DENIED -> "Politely explain the question is outside the caller's access and suggest what they CAN ask.";
		};
	}

	// ---------------------------------------------------------------------
	// Deterministic, data-driven fallback (no LLM dependency).
	//
	// Used only when every Groq synthesis attempt fails. It re-renders the
	// SAME role-scoped provider JSON the synthesizer would have phrased, so a
	// rate-limited / unreachable LLM never turns a perfectly answerable school
	// admin question into "I couldn't reach the AI service".
	// ---------------------------------------------------------------------

	private static final String NO_DATA_MESSAGE = "I don't have any data available for that question right now. "
			+ "Try asking about your dashboard, students, teachers, results, AI insights, profile or settings.";

	private SynthesizedAnswer deterministicAnswer(AssistantIntent intent, ActorContext actor, String userMessage,
			Map<String, Object> params, String dataJson) {
		Map<String, Object> data = parseData(dataJson);
		String markdown = renderData(intent, actor, data, userMessage);
		if (markdown == null || markdown.isBlank()) {
			markdown = NO_DATA_MESSAGE;
		}
		SynthesizedAnswer answer = SynthesizedAnswer.builder().markdown(markdown).build();
		enrichPlatformStatsIfMissing(answer, intent, userMessage, dataJson);
		enrichClassStatsIfMissing(answer, intent, userMessage, dataJson);
		enrichStudentProgressChart(answer, intent, userMessage, dataJson);
		enrichPlatformOverviewChart(answer, intent, userMessage, params, dataJson);
		return answer;
	}

	/**
	 * True when the provider payload describes a person who is explicitly NOT a
	 * student — it carries a {@code personRole} (and/or a {@code notStudent} flag).
	 * Such records must keep the authoritative role wording, so they bypass the
	 * LLM synthesis leg entirely.
	 */
	private boolean describesNonStudentPerson(String dataJson) {
		if (dataJson == null || dataJson.isBlank() || "NO DATA".equals(dataJson.trim())) {
			return false;
		}
		return isNonStudentPerson(parseData(dataJson));
	}

	/** True when a parsed provider payload describes a real, non-student person. */
	private boolean isNonStudentPerson(Map<String, Object> data) {
		if (data == null) {
			return false;
		}
		Object personRole = data.get("personRole");
		return (personRole != null && !personRole.toString().isBlank())
				|| Boolean.TRUE.equals(data.get("notStudent"));
	}

	private boolean hasDisambiguationOrDenial(String dataJson) {
		if (dataJson == null || dataJson.isBlank() || "NO DATA".equals(dataJson.trim())) {
			return false;
		}
		return dataJson.contains("\"hasMultipleMatches\":true")
				|| dataJson.contains("\"CROSS_STUDENT_DENIED\"")
				|| dataJson.contains("\"accessDenied\":true");
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> parseData(String dataJson) {
		if (dataJson == null || dataJson.isBlank() || "NO DATA".equals(dataJson.trim())) {
			return Map.of();
		}
		try {
			Object parsed = objectMapper.readValue(dataJson, new TypeReference<Map<String, Object>>() { });
			return parsed instanceof Map ? (Map<String, Object>) parsed : Map.of();
		} catch (Exception e) {
			return Map.of();
		}
	}

	private String renderData(AssistantIntent intent, ActorContext actor, Map<String, Object> data, String userMessage) {
		if (data == null || data.isEmpty()) {
			return NO_DATA_MESSAGE;
		}
		// Cross-Student Privacy Denial:
		if (Boolean.TRUE.equals(data.get("accessDenied")) || "CROSS_STUDENT_DENIED".equals(data.get("reason"))) {
			return "### 🔒 Access Restricted\n\n"
					+ "You do not have permission to view other students' learning progress.\n\n"
					+ "As a **Student**, your access is strictly limited to your own learning progress, personal metrics, and account details.";
		}
		// Provider signalled "no data" (e.g. {"message":"NO DATA","reason":...}).
		if (data.containsKey("message") && !data.containsKey("scope")) {
			String reason = str(data, "reason");
			if ("Student not found in the caller's scope.".equalsIgnoreCase(reason)) {
				String requested = str(data, "requestedStudent");
				if (actor != null && actor.getRole() == com.rslsolution.speakmateai.enums.Role.TEACHER) {
					return "No student named **" + (requested.isBlank() ? "this student" : requested)
							+ "** was found in your assigned classes. Please verify the name or check with your school administrator.";
				} else if (actor != null && actor.getRole() == com.rslsolution.speakmateai.enums.Role.SCHOOL_ADMIN) {
					return "No student named **" + (requested.isBlank() ? "this student" : requested) + "** was found in your school.";
				} else {
					return "No student named **" + (requested.isBlank() ? "this student" : requested) + "** was found in your scope.";
				}
			}
			return NO_DATA_MESSAGE;
		}
		if (intent == null) {
			return summaryOr(data, null);
		}
		return switch (intent) {
			case CASUAL_CHAT -> renderCasualChat(data, userMessage);
			case PLATFORM_OVERVIEW -> renderPlatform(data, userMessage);
			case SCHOOL_OVERVIEW -> renderSchool(data, userMessage);
			case SCHOOL_DASHBOARD -> renderDashboard(data);
			case RESULTS_ANALYTICS -> renderResults(data);
			case AI_INSIGHTS -> renderAiInsights(data);
			case PROFILE_SETTINGS -> renderProfile(data);
			case SCHOOL_ROSTER -> renderRoster(data);
			case PLATFORM_USERS -> renderUsers(data);
			case BILLING -> renderBilling(data);
			case ACCOUNT_INFO -> renderAccount(data);
			case NAVIGATION_HELP -> renderNavigation(data);
			case CLASS_PERFORMANCE -> renderClassPerformance(data, userMessage);
			case STUDENT_PERFORMANCE -> renderStudentPerformance(data, userMessage);
			case ACCESS_DENIED -> "This question is outside your access. Ask me about your own dashboard, students, "
					+ "teachers, results, AI insights, profile or settings.";
		};
	}

	private boolean isBroadOverview(String msg) {
		if (msg == null || msg.isBlank()) {
			return true;
		}
		String m = msg.toLowerCase(Locale.ROOT);
		if (m.contains("overview") || m.contains("summary") || m.contains("dashboard")
				|| m.contains("complete") || m.contains("everything") || m.contains("all schools")) {
			return true;
		}
		int entities = 0;
		if (m.contains("student") || m.contains("learner")) entities++;
		if (m.contains("teacher") || m.contains("educator") || m.contains("teaching staff")) entities++;
		if (m.contains("school") && !m.contains("school admin")) entities++;
		if (m.contains("class") || m.contains("standard") || m.contains("division")) entities++;
		if (m.contains("user") || m.contains("account")) entities++;
		return entities > 1;
	}

	private String renderPlatform(Map<String, Object> d, String userMessage) {
		String msg = (userMessage != null ? userMessage.toLowerCase(Locale.ROOT).trim() : "");
		boolean broad = isBroadOverview(msg);

		if (!broad) {
			boolean isSpeaking = (msg.contains("speaking") || msg.contains("speech") || msg.contains("session"));
			boolean isBestStudent = (msg.contains("best student") || msg.contains("top student") || msg.contains("highest xp") || msg.contains("leaderboard") || (msg.contains("xp") && msg.contains("student")));
			boolean isStudent = (msg.contains("student") || msg.contains("learner")) && !isSpeaking && !isBestStudent;
			boolean isTeacher = (msg.contains("teacher") || msg.contains("educator") || msg.contains("teaching staff"));
			boolean isSchool = msg.contains("school") && !isStudent && !isTeacher;
			boolean isClass = msg.contains("class") || msg.contains("standard") || msg.contains("division");
			boolean isUser = (msg.contains("user") || msg.contains("account"));

			if (isSpeaking) {
				StringBuilder sb = new StringBuilder("**Platform Speaking Practice**\n");
				addLine(sb, "Total speaking sessions", zeroIfBlank(num(d, "totalSpeakingSessions")));
				addLine(sb, "Total students", num(d, "totalStudents"));
				return trimOrNull(sb);
			} else if (isBestStudent) {
				StringBuilder sb = new StringBuilder("**Platform Top Students**\n");
				Map<String, Object> best = map(d, "bestStudent");
				if (best != null) {
					sb.append("🏆 **Top Performer:** **").append(str(best, "name")).append("** (").append(num(best, "xp")).append(" XP, Level ").append(num(best, "level")).append(")");
					String school = str(best, "schoolName");
					if (!school.isBlank()) {
						sb.append(" — ").append(school);
					}
					sb.append("\n\n");
				}
				List<Map<String, Object>> top = maps(d, "topStudents");
				if (!top.isEmpty()) {
					sb.append("**Leaderboard:**\n");
					int rank = 1;
					for (Map<String, Object> s : top) {
						sb.append(rank).append(". **").append(str(s, "name")).append("** — ").append(num(s, "xp")).append(" XP (Level ").append(num(s, "level")).append(")");
						String school = str(s, "schoolName");
						if (!school.isBlank()) {
							sb.append(" — ").append(school);
						}
						sb.append('\n');
						rank++;
					}
				}
				return trimOrNull(sb);
			} else if (isStudent) {
				StringBuilder sb = new StringBuilder("**Platform students**\n");
				addLine(sb, "Total students", num(d, "totalStudents"));
				addLine(sb, "Active students", num(d, "activeStudents"));
				List<Map<String, Object>> schools = maps(d, "schoolsByStudentCount");
				if (!schools.isEmpty()) {
					sb.append("\n**Top schools by students**\n");
					int rank = 1;
					for (Map<String, Object> school : schools) {
						if (rank > 5) break;
						String name = str(school, "schoolName");
						if (name.isBlank()) continue;
						sb.append("- **").append(name).append("** — ").append(num(school, "studentCount")).append(" students");
						String teachers = num(school, "teacherCount");
						if (!teachers.isBlank()) {
							sb.append(", ").append(teachers).append(" teachers");
						}
						sb.append('\n');
						rank++;
					}
				}
				return trimOrNull(sb);
			} else if (isTeacher) {
				StringBuilder sb = new StringBuilder("**Platform teachers**\n");
				addLine(sb, "Total teachers", num(d, "totalTeachers"));
				addLine(sb, "Active teachers", num(d, "activeTeachers"));
				return trimOrNull(sb);
			} else if (isSchool) {
				StringBuilder sb = new StringBuilder("**Platform schools**\n");
				addLine(sb, "Total schools", num(d, "totalSchools"));
				List<Map<String, Object>> schools = maps(d, "schoolsByStudentCount");
				if (!schools.isEmpty()) {
					sb.append("\n**Schools by student enrollment**\n");
					int rank = 1;
					for (Map<String, Object> school : schools) {
						if (rank > 5) break;
						String name = str(school, "schoolName");
						if (name.isBlank()) continue;
						sb.append("- **").append(name).append("** — ").append(num(school, "studentCount")).append(" students");
						String teachers = num(school, "teacherCount");
						if (!teachers.isBlank()) {
							sb.append(", ").append(teachers).append(" teachers");
						}
						sb.append('\n');
						rank++;
					}
				}
				return trimOrNull(sb);
			} else if (isClass) {
				StringBuilder sb = new StringBuilder("**Platform classes & curriculum**\n");
				addLine(sb, "Total classes", num(d, "totalClasses"));
				addLine(sb, "Total standards", num(d, "totalStandards"));
				addLine(sb, "Total divisions", num(d, "totalDivisions"));
				return trimOrNull(sb);
			} else if (isUser) {
				StringBuilder sb = new StringBuilder("**Platform users**\n");
				addLine(sb, "Total users", num(d, "totalUsers"));
				addLine(sb, "Active users", num(d, "activeUsers"));
				addLine(sb, "School admins", num(d, "totalSchoolAdmins"));
				addLine(sb, "Teachers", num(d, "totalTeachers"));
				addLine(sb, "Students", num(d, "totalStudents"));
				return trimOrNull(sb);
			}
		}

		StringBuilder sb = new StringBuilder("**Platform overview**\n");
		addLine(sb, "Total schools", num(d, "totalSchools"));
		addLine(sb, "Total users", num(d, "totalUsers"));
		addLine(sb, "Total students", num(d, "totalStudents"));
		addLine(sb, "Total teachers", num(d, "totalTeachers"));
		addLine(sb, "School admins", num(d, "totalSchoolAdmins"));
		addLine(sb, "Active users", num(d, "activeUsers"));
		addLine(sb, "Active students", num(d, "activeStudents"));
		addLine(sb, "Total classes", num(d, "totalClasses"));
		addLine(sb, "Total standards", num(d, "totalStandards"));
		addLine(sb, "Total divisions", num(d, "totalDivisions"));
		addLine(sb, "Total speaking sessions", num(d, "totalSpeakingSessions"));
		addLine(sb, "Revenue from payments", num(d, "totalRevenueFromPayments"));
		addLine(sb, "Revenue from subscriptions", num(d, "totalRevenueFromSubscriptions"));
		addLine(sb, "Active subscription plans", num(d, "activeSubscriptionPlans"));

		List<Map<String, Object>> schools = maps(d, "schoolsByStudentCount");
		if (!schools.isEmpty()) {
			sb.append("\n**Top schools by students**\n");
			int rank = 1;
			for (Map<String, Object> school : schools) {
				if (rank > 5) {
					break;
				}
				String name = str(school, "schoolName");
				if (name.isBlank()) {
					continue;
				}
				sb.append("- **").append(name).append("** — ").append(num(school, "studentCount"))
						.append(" students");
				String teachers = num(school, "teacherCount");
				if (!teachers.isBlank()) {
					sb.append(", ").append(teachers).append(" teachers");
				}
				sb.append('\n');
				rank++;
			}
		}
		return trimOrNull(sb);
	}

	private String renderSchool(Map<String, Object> d, String userMessage) {
		String schoolName = str(d, "schoolName");
		String msg = (userMessage != null ? userMessage.toLowerCase(Locale.ROOT).trim() : "");
		boolean isBestStudent = (msg.contains("best student") || msg.contains("top student") || msg.contains("highest xp")
				|| msg.contains("leaderboard") || msg.contains("top performer") || msg.contains("best performer")
				|| (msg.contains("xp") && (msg.contains("student") || msg.contains("who"))));

		if (isBestStudent && d.containsKey("bestStudent")) {
			Map<String, Object> best = map(d, "bestStudent");
			if (best != null) {
				StringBuilder sb = new StringBuilder();
				sb.append("**Top Student at ").append(schoolName.isBlank() ? "School" : schoolName).append("**\n");
			sb.append(str(best, "name")).append(" (XP: ").append(num(best, "xp")).append(")");
			String std = str(best, "standard");
			String div = str(best, "division");
			if (!std.isBlank() || !div.isBlank()) {
				sb.append(" — Class: ").append(std).append(!div.isBlank() ? "-" + div : "");
			}
			String streak = num(best, "streak");
			if (!streak.isBlank() && !"0".equals(streak)) {
				sb.append(", Streak: ").append(streak).append(" days");
			}
			sb.append('\n');

			List<Map<String, Object>> topList = maps(d, "topStudents");
			if (!topList.isEmpty()) {
				sb.append("\n**Top Students Leaderboard**\n");
				int rank = 1;
				for (Map<String, Object> s : topList) {
					sb.append(rank).append(". ").append(str(s, "name")).append(" — ").append(num(s, "xp")).append(" XP");
					String sStd = str(s, "standard");
					String sDiv = str(s, "division");
					if (!sStd.isBlank() || !sDiv.isBlank()) {
						sb.append(" (").append(sStd).append(!sDiv.isBlank() ? "-" + sDiv : "").append(")");
					}
					sb.append('\n');
					rank++;
				}
			}
				return trimOrNull(sb);
			}
		}

		StringBuilder sb = new StringBuilder();
		sb.append("**").append(schoolName.isBlank() ? "School overview" : schoolName).append("**\n");
		sb.append("- **Total students:** ").append(zeroIfBlank(num(d, "totalStudents"))).append('\n');
		sb.append("- **Active students:** ").append(zeroIfBlank(num(d, "activeStudents"))).append('\n');
		sb.append("- **Total teachers:** ").append(zeroIfBlank(num(d, "totalTeachers"))).append('\n');
		sb.append("- **Active teachers:** ").append(zeroIfBlank(num(d, "activeTeachers"))).append('\n');
		sb.append("- **Total classes:** ").append(zeroIfBlank(num(d, "totalClasses"))).append('\n');
		sb.append("- **Total standards:** ").append(zeroIfBlank(num(d, "totalStandards"))).append('\n');
		sb.append("- **Total divisions:** ").append(zeroIfBlank(num(d, "totalDivisions"))).append('\n');
		List<String> standards = strings(d, "standards");
		if (!standards.isEmpty()) {
			sb.append("- **Standards:** ").append(String.join(", ", standards)).append('\n');
		}
		String summary = str(d, "summary");
		if (!summary.isBlank()) {
			sb.append('\n').append(summary).append('\n');
		}
		return trimOrNull(sb);
	}

	private String renderClassPerformance(Map<String, Object> d, String userMessage) {
		String msg = (userMessage != null ? userMessage.toLowerCase(Locale.ROOT).trim() : "");
		StringBuilder sb = new StringBuilder();

		// 1. Inquiries about assigned classes ("which classes are assigned to me", "my classes", "classes do i teach")
		boolean isAssignedClassesQuery = msg.contains("which classes") || msg.contains("assigned classes")
				|| msg.contains("classes are assigned") || msg.contains("classes assigned")
				|| msg.contains("classes do i teach") || msg.contains("what classes are assigned")
				|| msg.equals("my classes") || msg.equals("my classes?") || msg.contains("list of classes")
				|| msg.contains("list my classes") || msg.contains("show my classes")
				|| Boolean.TRUE.equals(d.get("myClasses"));
		if (isAssignedClassesQuery && (d.containsKey("assignedClassesList") || d.containsKey("availableClasses") || d.containsKey("assignedClasses"))) {
			List<Map<String, Object>> classList = maps(d, "assignedClassesList");
			int total = d.containsKey("totalAssignedClasses") ? Integer.parseInt(num(d, "totalAssignedClasses")) : classList.size();
			sb.append("**Assigned Classes (").append(total).append(")**\n\n");
			sb.append("You are currently assigned to **").append(total).append(" classes**:\n\n");
			if (!classList.isEmpty()) {
				for (Map<String, Object> c : classList) {
					sb.append("- **").append(str(c, "name")).append("**");
					String sc = num(c, "studentCount");
					if (!sc.isBlank()) {
						sb.append(" (").append(sc).append(" enrolled student").append("1".equals(sc) ? "" : "s").append(")");
					}
					sb.append('\n');
				}
			} else {
				List<String> rawList = strings(d, "assignedClasses");
				if (rawList.isEmpty()) rawList = strings(d, "availableClasses");
				for (String cName : rawList) {
					sb.append("- **").append(cName).append("**\n");
				}
			}
			String totStuds = num(d, "totalStudentsAcrossClasses");
			if (!totStuds.isBlank() && !"0".equals(totStuds)) {
				sb.append("\n**Total Enrolled Students Across Your Classes:** ").append(totStuds).append('\n');
			}
			return trimOrNull(sb);
		}

		// 2. Inquiries about total student count across classes ("how many students are in my classes", "how many students do i have")
		boolean isTotalStudentCountQuery = (msg.contains("how many students") || msg.contains("total students") || msg.contains("count of students") || msg.contains("students do i have"))
				&& (msg.contains("my class") || msg.contains("my classes") || msg.contains("assigned") || msg.contains("do i have"));
		if (isTotalStudentCountQuery) {
			String totalAcross = num(d, "totalStudentsAcrossClasses");
			if (totalAcross.isBlank()) totalAcross = num(d, "studentCount");
			sb.append("**Class Enrollment Summary**\n\n");
			sb.append("You currently have **").append(zeroIfBlank(totalAcross)).append(" students** enrolled across your assigned classes.\n\n");
			List<Map<String, Object>> classList = maps(d, "assignedClassesList");
			if (!classList.isEmpty()) {
				sb.append("**Breakdown by Class:**\n");
				for (Map<String, Object> c : classList) {
					sb.append("- **").append(str(c, "name")).append(":** ")
					  .append(zeroIfBlank(num(c, "studentCount"))).append(" students\n");
				}
			}
			return trimOrNull(sb);
		}

		// 3. Inquiries about struggling / weak / learners needing help
		boolean isStrugglingQuery = msg.contains("struggling") || msg.contains("need help") || msg.contains("need the most help")
				|| msg.contains("needing help") || msg.contains("needing attention") || msg.contains("weak")
				|| msg.contains("at risk") || msg.contains("low performance") || msg.contains("low-performing");
		if (isStrugglingQuery) {
			List<Map<String, Object>> struggling = maps(d, "strugglingStudents");
			sb.append("**Learners Needing Support & Attention**\n\n");
			if (!struggling.isEmpty()) {
				sb.append("Here are the students who may need additional practice, coaching, or attention:\n\n");
				for (Map<String, Object> s : struggling) {
					sb.append("- **").append(str(s, "name")).append("**");
					String std = str(s, "standard");
					String div = str(s, "division");
					if (!std.isBlank() || !div.isBlank()) {
						sb.append(" (Class ").append(std).append(!div.isBlank() ? "-" + div : "").append(")");
					}
					String reason = str(s, "reason");
					if (!reason.isBlank()) {
						sb.append(" — ").append(reason);
					}
					String spScore = num(s, "speakingScore");
					if (!spScore.isBlank() && !"0".equals(spScore)) {
						sb.append(" | Speaking Score: ").append(spScore).append("%");
					}
					String xp = num(s, "xp");
					if (!xp.isBlank()) {
						sb.append(" | ").append(xp).append(" XP");
					}
					sb.append('\n');
				}
			} else {
				sb.append("Great news! None of your students are currently flagged as struggling. All enrolled students are maintaining regular practice activity.\n");
			}
			return trimOrNull(sb);
		}

		// 4. Inquiries about low speaking scores / pronunciation / fluency
		boolean isLowSpeakingQuery = msg.contains("low speaking") || msg.contains("low pronunciation") || msg.contains("lowest speaking")
				|| msg.contains("struggling in speaking") || msg.contains("poor speaking");
		if (isLowSpeakingQuery) {
			List<Map<String, Object>> lowSpeaking = maps(d, "lowSpeakingStudents");
			if (lowSpeaking.isEmpty()) lowSpeaking = maps(d, "strugglingStudents");
			sb.append("**Students with Lowest Speaking Scores**\n\n");
			if (!lowSpeaking.isEmpty()) {
				for (Map<String, Object> s : lowSpeaking) {
					sb.append("- **").append(str(s, "name")).append("**");
					String std = str(s, "standard");
					String div = str(s, "division");
					if (!std.isBlank() || !div.isBlank()) {
						sb.append(" (Class ").append(std).append(!div.isBlank() ? "-" + div : "").append(")");
					}
					String spk = num(s, "speakingScore");
					if (!spk.isBlank()) {
						sb.append(" — Speaking Score: **").append(spk).append("%**");
					}
					String flu = num(s, "fluencyScore");
					String pro = num(s, "pronunciationScore");
					if (!flu.isBlank() || !pro.isBlank()) {
						sb.append(" (Fluency: ").append(zeroIfBlank(flu)).append("% | Pronunciation: ").append(zeroIfBlank(pro)).append("%)");
					}
					sb.append('\n');
				}
			} else {
				sb.append("All students have satisfactory speaking evaluation scores.\n");
			}
			return trimOrNull(sb);
		}

		// 5. Inquiries about top students / highest XP / most lessons in class
		boolean isTopQuery = msg.contains("highest xp") || msg.contains("top student") || msg.contains("best student")
				|| msg.contains("most lessons") || msg.contains("leaderboard") || msg.contains("top students");
		if (isTopQuery) {
			List<Map<String, Object>> topList = maps(d, "topStudents");
			if (topList.isEmpty()) topList = maps(d, "students");
			sb.append("**Top Students Leaderboard**\n\n");
			if (!topList.isEmpty()) {
				int rank = 1;
				for (Map<String, Object> s : topList) {
					sb.append(rank).append(". **").append(str(s, "name")).append("** — ")
					  .append(zeroIfBlank(num(s, "xp"))).append(" XP");
					String streak = num(s, "streak");
					if (!streak.isBlank() && !"0".equals(streak)) {
						sb.append(" (Streak: ").append(streak).append(" days)");
					}
					String lessons = num(s, "lessonsCompleted");
					if (!lessons.isBlank()) {
						sb.append(" | ").append(lessons).append(" lessons completed");
					}
					sb.append('\n');
					rank++;
				}
			} else {
				sb.append("No student activity recorded yet for this class.\n");
			}
			return trimOrNull(sb);
		}

		// 6. General class performance summary or specific class card
		String summary = str(d, "summary");
		if (!summary.isBlank()) {
			sb.append(summary).append("\n\n");
		}
		String className = str(d, "className");
		sb.append("**Class Performance: ").append(className.isBlank() ? "Class Details" : className).append("**\n");
		addLine(sb, "Grade / Standard", str(d, "grade"));
		addLine(sb, "Division", str(d, "division"));
		addLine(sb, "Assigned Teacher", str(d, "assignedTeacher"));
		addLine(sb, "Enrolled Students", zeroIfBlank(num(d, "studentCount")));
		addLine(sb, "Learners with Active Streak", zeroIfBlank(num(d, "studentsWithActiveStreak")));
		addLine(sb, "Total XP", zeroIfBlank(num(d, "totalXp")));
		addLine(sb, "Average XP per Student", zeroIfBlank(num(d, "averageXpPerStudent")));
		addLine(sb, "Average Practice Minutes", zeroIfBlank(num(d, "averagePracticeMinutesPerStudent")));

		String avgSpk = num(d, "classAverageSpeakingScore");
		if (!avgSpk.isBlank() && !"0".equals(avgSpk)) {
			addLine(sb, "Average Speaking Score", avgSpk + "%");
		}
		String avgFlu = num(d, "classAverageFluencyScore");
		if (!avgFlu.isBlank() && !"0".equals(avgFlu)) {
			addLine(sb, "Average Fluency", avgFlu + "%");
		}
		String avgPro = num(d, "classAveragePronunciationScore");
		if (!avgPro.isBlank() && !"0".equals(avgPro)) {
			addLine(sb, "Average Pronunciation", avgPro + "%");
		}

		return trimOrNull(sb);
	}

	private String renderDashboard(Map<String, Object> d) {
		StringBuilder sb = new StringBuilder();
		String summary = str(d, "summary");
		if (!summary.isBlank()) {
			sb.append(summary).append('\n');
		} else {
			sb.append("**School dashboard**\n");
		}
		sb.append('\n');
		addLine(sb, "Total students", zeroIfBlank(num(d, "totalStudents")));
		addLine(sb, "Active students", zeroIfBlank(num(d, "activeStudents")));
		addLine(sb, "Inactive students", zeroIfBlank(num(d, "inactiveStudents")));
		addLine(sb, "Total teachers", zeroIfBlank(num(d, "totalTeachers")));
		addLine(sb, "Total classes", zeroIfBlank(num(d, "totalClasses")));
		addLine(sb, "Total results", zeroIfBlank(num(d, "totalResults")));
		addLine(sb, "Lessons completed", zeroIfBlank(num(d, "totalLessonsCompleted")));
		addLine(sb, "Average result", num(d, "averageResultPercentage").isBlank()
				? "" : num(d, "averageResultPercentage") + "%");
		return trimOrNull(sb);
	}

	private String renderResults(Map<String, Object> d) {
		StringBuilder sb = new StringBuilder();
		String summary = str(d, "summary");
		if (!summary.isBlank()) {
			sb.append(summary).append('\n');
		} else {
			sb.append("**Results overview**\n");
		}
		sb.append('\n');
		addLine(sb, "Total results", zeroIfBlank(num(d, "totalResults")));
		addLine(sb, "Average percentage", num(d, "averagePercentage").isBlank()
				? "" : num(d, "averagePercentage") + "%");
		addLine(sb, "Passed", zeroIfBlank(num(d, "passed")));
		addLine(sb, "Failed", zeroIfBlank(num(d, "failed")));
		addLine(sb, "Pass percentage", num(d, "passPercentage").isBlank()
				? "" : num(d, "passPercentage") + "%");
		addLine(sb, "Fail percentage", num(d, "failPercentage").isBlank()
				? "" : num(d, "failPercentage") + "%");
		addLine(sb, "Highest percentage", num(d, "highestPercentage").isBlank()
				? "" : num(d, "highestPercentage") + "%");
		addLine(sb, "Lowest percentage", num(d, "lowestPercentage").isBlank()
				? "" : num(d, "lowestPercentage") + "%");
		return trimOrNull(sb);
	}

	private String renderAiInsights(Map<String, Object> d) {
		StringBuilder sb = new StringBuilder();
		String summary = str(d, "summary");
		if (!summary.isBlank()) {
			sb.append(summary).append('\n');
		} else {
			sb.append("**AI insights**\n");
		}
		sb.append('\n');
		addLine(sb, "Speaking sessions", zeroIfBlank(num(d, "sessionCount")));
		addLine(sb, "Fluency", num(d, "fluency"));
		addLine(sb, "Pronunciation", num(d, "pronunciation"));
		addLine(sb, "Vocabulary", num(d, "vocabulary"));
		addLine(sb, "Grammar", num(d, "grammar"));
		addLine(sb, "Speaking seconds", zeroIfBlank(num(d, "speakingTimeSeconds")));
		addLine(sb, "Speaking minutes", zeroIfBlank(num(d, "speakingTimeMinutes")));

		List<Map<String, Object>> speakers = maps(d, "topSpeakers");
		if (!speakers.isEmpty()) {
			sb.append("\n**Top Speakers Leaderboard**\n");
			for (Map<String, Object> speaker : speakers) {
				String name = str(speaker, "name");
				if (name.isBlank()) {
					continue;
				}
				sb.append("- **").append(name).append("**");
				String score = num(speaker, "score");
				if (!score.isBlank()) {
					sb.append(" — pronunciation score ").append(score);
				}
				String sessions = num(speaker, "sessions");
				if (!sessions.isBlank()) {
					sb.append(" across ").append(sessions).append(" session(s)");
				}
				sb.append('\n');
			}
		}
		return trimOrNull(sb);
	}

	private String renderProfile(Map<String, Object> d) {
		StringBuilder sb = new StringBuilder("**Your profile**\n");
		addLine(sb, "Name", str(d, "name"));
		addLine(sb, "Email", str(d, "email"));
		addLine(sb, "Role", str(d, "role"));
		addLine(sb, "Phone", str(d, "phone"));
		addLine(sb, "Department", str(d, "department"));
		addLine(sb, "School", str(d, "schoolName"));
		addLine(sb, "School code", str(d, "schoolCode"));
		addLine(sb, "Joined", str(d, "joinedAt"));
		sb.append("\n**Your settings**\n");
		addLine(sb, "Language", str(d, "language"));
		addLine(sb, "AI voice", str(d, "aiVoice"));
		addLine(sb, "Dark mode", boolLabel(d, "darkMode"));
		addLine(sb, "Notifications", boolLabel(d, "notificationsEnabled"));
		addLine(sb, "Sound effects", boolLabel(d, "soundEffects"));
		addLine(sb, "Auto-play audio", boolLabel(d, "autoPlayAudio"));
		addLine(sb, "Daily reminder", boolLabel(d, "dailyReminder"));
		addLine(sb, "Two-factor authentication", boolLabel(d, "twoFactorEnabled"));
		return trimOrNull(sb);
	}

	private String renderRoster(Map<String, Object> d) {
		Map<String, Object> studentAssignedTeacher = map(d, "studentAssignedTeacher");
		if (studentAssignedTeacher != null && !studentAssignedTeacher.isEmpty()) {
			StringBuilder sb = new StringBuilder();
			String studentName = str(studentAssignedTeacher, "studentName");
			String standard = str(studentAssignedTeacher, "standard");
			String division = str(studentAssignedTeacher, "division");
			boolean hasTeacher = Boolean.TRUE.equals(studentAssignedTeacher.get("hasTeacher"));
			String teacherName = str(studentAssignedTeacher, "teacherName");
			sb.append("**Assigned Teacher for ").append(studentName);
			if (!standard.isBlank() || !division.isBlank()) {
				sb.append(" (Standard ").append(standard).append(" - ").append(division).append(")");
			}
			sb.append(":**\n\n");
			if (hasTeacher && !teacherName.isBlank()) {
				sb.append("Teacher: **").append(teacherName).append("**\n");
				String details = str(studentAssignedTeacher, "details");
				if (!details.isBlank()) {
					sb.append(details).append("\n");
				}
			} else {
				sb.append("No assigned teacher found for this student in the current records.\n");
			}
			return trimOrNull(sb);
		}

		Map<String, Object> topTeacher = map(d, "topTeacherByClasses");
		if (topTeacher != null && !topTeacher.isEmpty()) {
			StringBuilder sb = new StringBuilder();
			String tName = str(topTeacher, "teacherName");
			Object cCount = topTeacher.get("classCount");
			Object cList = topTeacher.get("classes");
			String dept = str(topTeacher, "department");
			sb.append("🏆 **Teacher Handling the Most Classes:**\n\n");
			sb.append("**").append(tName).append("** handles the highest number of classes with **").append(cCount).append(" classes** assigned");
			if (cList instanceof List<?> list && !list.isEmpty()) {
				sb.append(":\n\n**Assigned Classes:** ").append(String.join(", ", stringify(list)));
			} else {
				sb.append(".\n");
			}
			if (!dept.isBlank()) {
				sb.append("\n**Department / Subject:** ").append(dept);
			}
			sb.append("\n");
			return trimOrNull(sb);
		}

		Map<String, Object> tsp = map(d, "teacherStudentsProgress");
		if (tsp != null && !tsp.isEmpty()) {
			StringBuilder sb = new StringBuilder();
			String tName = str(tsp, "teacherName");
			String totalStudents = num(tsp, "totalStudents");
			String totalXp = num(tsp, "totalXp");
			sb.append("**Progress of Students Assigned to ").append(tName).append(":**\n\n");
			sb.append("- **Total Assigned Students:** ").append(totalStudents).append("\n");
			sb.append("- **Total Combined XP:** ").append(totalXp).append(" XP\n\n");
			List<Map<String, Object>> studs = maps(tsp, "students");
			if (!studs.isEmpty()) {
				sb.append("**Student Breakdown:**\n");
				int rank = 1;
				for (Map<String, Object> s : studs) {
					sb.append(rank++).append(". **").append(str(s, "name")).append("**");
					String st = str(s, "standard");
					String div = str(s, "division");
					if (!st.isBlank() || !div.isBlank()) {
						sb.append(" (Standard ").append(st).append(" - ").append(div).append(")");
					}
					sb.append(" — **").append(num(s, "xp")).append(" XP** (Level ").append(num(s, "level"))
					  .append(", ").append(num(s, "streak")).append("-day streak)\n");
				}
			}
			return trimOrNull(sb);
		}

		String schoolName = str(d, "schoolName");
		String standard = str(d, "standard");
		String division = str(d, "division");
		String entityType = str(d, "entityType");
		List<Map<String, Object>> classAssignments = maps(d, "classAssignments");
		StringBuilder sb = new StringBuilder();

		if (!classAssignments.isEmpty() && !"STUDENTS".equalsIgnoreCase(entityType)) {
			if (classAssignments.size() == 1) {
				Map<String, Object> ca = classAssignments.get(0);
				String cName = str(ca, "class");
				boolean hasTeacher = Boolean.TRUE.equals(ca.get("hasTeacher"));
				String teacherName = str(ca, "teacher");
				if (hasTeacher && !teacherName.isBlank()) {
					sb.append("**Teacher for class ").append(cName).append(":**\n\n")
					  .append(teacherName).append(" (assigned teacher for class ").append(cName).append(").\n\n");
				} else {
					sb.append("Sorry, the teacher for class ").append(cName).append(" is not available in the current data.\n\n");
				}
				String sCount = num(ca, "studentCount");
				if (!sCount.isBlank()) {
					sb.append("- **Students enrolled:** ").append(sCount).append('\n');
				}
			} else {
				sb.append("**Teacher assignments**\n\n");
				for (Map<String, Object> ca : classAssignments) {
					String cName = str(ca, "class");
					boolean hasTeacher = Boolean.TRUE.equals(ca.get("hasTeacher"));
					String teacherName = str(ca, "teacher");
					if (hasTeacher && !teacherName.isBlank()) {
						sb.append("- **").append(cName).append(":** ").append(teacherName).append('\n');
					} else {
						sb.append("- **").append(cName).append(":** No teacher information is available for this class in the current data.\n");
					}
				}
				sb.append('\n');
			}
			return trimOrNull(sb);
		}

		if (!standard.isBlank() || !division.isBlank()) {
			String classLabel = (!standard.isBlank() ? "Standard " + standard : "")
					+ (!division.isBlank() ? (!standard.isBlank() ? "-" : "Division ") + division : "");
			if ("TEACHERS".equalsIgnoreCase(entityType)) {
				sb.append("**Teachers for ").append(classLabel);
			} else {
				sb.append("**Students in ").append(classLabel);
			}
			if (!schoolName.isBlank() && !schoolName.equalsIgnoreCase("all schools")) {
				sb.append(" (").append(schoolName).append(")");
			}
			sb.append("**\n");
		} else {
			sb.append("**").append(schoolName.isBlank() ? "School roster" : schoolName + " roster").append("**\n");
		}

		List<Map<String, Object>> teachers = maps(d, "teachers");
		List<Map<String, Object>> students = maps(d, "students");
		String teacherCount = num(d, "teacherCount");
		String studentCount = num(d, "studentCount");
		if (!teacherCount.isBlank() && standard.isBlank() && division.isBlank()) {
			sb.append("- **Teachers:** ").append(teacherCount).append('\n');
		}
		if (!studentCount.isBlank()) {
			sb.append("- **Students:** ").append(studentCount).append('\n');
		}

		if (!teachers.isEmpty()) {
			if (teachers.size() == 1) {
				Map<String, Object> teacher = teachers.get(0);
				String name = str(teacher, "name");
				Object cCount = teacher.get("classCount");
				Object cList = teacher.get("classes");
				if (cCount != null) {
					sb.append("\n**").append(name).append("** is assigned to **").append(cCount).append("** classes");
					if (cList instanceof List<?> list && !list.isEmpty()) {
						sb.append(" (").append(String.join(", ", stringify(list))).append(")");
					}
					sb.append(".\n");
				}
			}
			sb.append("\n**Teachers**\n");
			for (Map<String, Object> teacher : teachers) {
				appendPerson(sb, teacher, "schoolName", "subject", "department", "designation", "experience",
						"qualification", "classCount", "classes", "studentCount", "email", "phone", "employeeId", "joinedAt");
			}
		}
		if (!students.isEmpty()) {
			sb.append("\n**Students**\n");
			for (Map<String, Object> student : students) {
				appendPerson(sb, student, "schoolName", "standard", "division", "rollNumber", "studentId",
						"assignedTeacher", "email", "phone");
			}
		} else if (!standard.isBlank() || !division.isBlank()) {
			String classLabel = (!standard.isBlank() ? "Standard " + standard : "")
					+ (!division.isBlank() ? (!standard.isBlank() ? "-" : "Division ") + division : "");
			if (!"TEACHERS".equalsIgnoreCase(entityType)) {
				sb.append("\nNo students were found currently enrolled in ").append(classLabel).append(".\n");
			}
		} else if (!"TEACHERS".equalsIgnoreCase(entityType)) {
			sb.append("\nNo students were found registered in ").append(schoolName.isBlank() ? "your school" : schoolName).append(".\n");
		}

		String summary = str(d, "summary");
		if (teachers.isEmpty() && students.isEmpty() && !summary.isBlank() && standard.isBlank() && division.isBlank()) {
			sb.append('\n').append(summary).append('\n');
		}
		return trimOrNull(sb);
	}

	private String renderUsers(Map<String, Object> d) {
		StringBuilder sb = new StringBuilder("**Platform users**\n");
		String roleFilter = str(d, "roleFilter");
		addLine(sb, "Total users", num(d, "totalUsers"));
		addLine(sb, "Total teachers", num(d, "totalTeachers"));
		addLine(sb, "Total students", num(d, "totalStudents"));
		addLine(sb, "School admins", num(d, "totalSchoolAdmins"));
		addLine(sb, "Users shown", num(d, "userCount"));
		if (!roleFilter.isBlank()) {
			addLine(sb, "Role filter", roleFilter);
		}

		List<Map<String, Object>> recent = maps(d, "recentUsers");
		if (!recent.isEmpty()) {
			sb.append("\n**Recently Registered Users**\n");
			for (Map<String, Object> u : recent) {
				appendPerson(sb, u, "role", "schoolName", "email", "phone", "status", "registeredDate");
			}
		}

		List<Map<String, Object>> users = maps(d, "users");
		if (!users.isEmpty()) {
			sb.append("\n**Users**\n");
			for (Map<String, Object> user : users) {
				appendPerson(sb, user, "role", "schoolName", "email", "phone", "status", "registeredDate");
			}
		}

		String summary = str(d, "summary");
		if (users.isEmpty() && !summary.isBlank()) {
			sb.append('\n').append(summary).append('\n');
		}
		return trimOrNull(sb);
	}

	private String renderBilling(Map<String, Object> d) {
		StringBuilder sb = new StringBuilder("**Billing summary**\n");
		addLine(sb, "Total revenue from payments", num(d, "totalRevenueFromPayments"));
		addLine(sb, "Payment revenue (last 30 days)", num(d, "revenueFromPaymentsLast30Days"));
		addLine(sb, "Paid payments", zeroIfBlank(num(d, "paidPaymentsCount")));
		addLine(sb, "Total revenue from subscriptions", num(d, "totalRevenueFromSubscriptions"));
		addLine(sb, "Subscription revenue (last 30 days)", num(d, "subscriptionRevenueLast30Days"));
		addLine(sb, "Active subscriptions", zeroIfBlank(num(d, "activeSubscriptions")));
		addLine(sb, "Expired subscriptions", zeroIfBlank(num(d, "expiredSubscriptions")));
		addLine(sb, "Cancelled subscriptions", zeroIfBlank(num(d, "cancelledSubscriptions")));
		addLine(sb, "Active plans", zeroIfBlank(num(d, "activePlans")));

		List<Map<String, Object>> subscribers = maps(d, "subscribers");
		if (!subscribers.isEmpty()) {
			sb.append("\n**Active Subscribers**\n");
			for (Map<String, Object> sub : subscribers) {
				sb.append("- **").append(str(sub, "userName")).append("**");
				String plan = str(sub, "planName");
				if (!plan.isBlank()) {
					sb.append(" — Plan: ").append(plan);
				}
				String amount = num(sub, "amount");
				if (!amount.isBlank()) {
					sb.append(" (₹").append(amount).append(")");
				}
				String email = str(sub, "userEmail");
				if (!email.isBlank()) {
					sb.append(", Email: ").append(email);
				}
				String school = str(sub, "schoolName");
				if (!school.isBlank()) {
					sb.append(", School: ").append(school);
				}
				String status = str(sub, "status");
				if (!status.isBlank()) {
					sb.append(", Status: ").append(status);
				}
				sb.append('\n');
			}
		}
		return trimOrNull(sb);
	}

	private String renderAccount(Map<String, Object> d) {
		if (Boolean.TRUE.equals(d.get("botIdentity"))) {
			return "I am **SpeakMate AI**, your dedicated assistant for English communication practice, classroom analytics, and platform administration.\n\n"
					+ "I can help you:\n"
					+ "- Explore users, teachers, and student rosters\n"
					+ "- Check individual and class-level speaking performance\n"
					+ "- Monitor fluency, pronunciation, grammar, and vocabulary progress\n"
					+ "- Review platform enrollment, school analytics, and subscriptions";
		}
		if (Boolean.TRUE.equals(d.get("nonStudentXp"))) {
			return "As an administrator, your account does not earn XP or track practice streaks. XP and streaks are recorded for students during their English speaking sessions and lesson activities.";
		}
		StringBuilder sb = new StringBuilder("**Your account**\n");
		addLine(sb, "Name", str(d, "displayName"));
		addLine(sb, "Email", str(d, "email"));
		String role = str(d, "role").replace('_', ' ');
		addLine(sb, "Role", role);
		addLine(sb, "Phone", str(d, "phone"));
		addLine(sb, "School", str(d, "schoolName"));
		addLine(sb, "Location", str(d, "location"));
		addLine(sb, "Joined", str(d, "joinedAt"));
		String summary = str(d, "summary");
		if (!summary.isBlank()) {
			sb.append('\n').append(summary).append('\n');
		}
		return trimOrNull(sb);
	}

	private String renderNavigation(Map<String, Object> d) {
		List<Map<String, Object>> pages = maps(d, "pages");
		if (pages.isEmpty()) {
			return summaryOr(d, null);
		}
		StringBuilder sb = new StringBuilder("**Navigation Guide**\n\n");
		sb.append("You can access the following sections from your sidebar menu:\n\n");
		for (Map<String, Object> page : pages) {
			String label = str(page, "label");
			if (label.isBlank()) {
				continue;
			}
			sb.append("- **").append(label).append("**: available in the sidebar menu under **").append(label).append("**\n");
		}
		return trimOrNull(sb);
	}

	/**
	 * Focused, deterministic rendering for a single student's metrics. Instead of
	 * dumping every field the provider returned, it echoes the student's identity
	 * once and then only the metric group the question actually asked about
	 * (lessons, XP/level, streak, practice time, speaking, grammar, vocabulary).
	 * A broad "how is this student doing?" question still falls back to the full
	 * summary.
	 */
	private String renderStudentPerformance(Map<String, Object> d, String userMessage) {
		if (Boolean.TRUE.equals(d.get("hasMultipleMatches"))) {
			return renderDisambiguationPrompt(d);
		}
		String m = userMessage == null ? "" : userMessage.toLowerCase(Locale.ROOT);
		StringBuilder sb = new StringBuilder();

		String name = str(d, "studentName");
		if (!name.isBlank()) {
			sb.append("**").append(name).append("**");
			List<String> context = new ArrayList<>();
			String standard = str(d, "standard");
			String division = str(d, "division");
			if (!standard.isBlank()) {
				context.add("Standard " + standard);
			}
			if (!division.isBlank()) {
				context.add("Division " + division);
			}
			if (!context.isEmpty()) {
				sb.append(" (").append(String.join(", ", context)).append(')');
			}
			sb.append('\n');
		}

		boolean matched = false;
		if (containsWord(m, "lesson", "lessons", "completed", "complete", "finished", "finish",
				"completion", "remaining", "pending", "done")) {
			matched |= metric(sb, d, "Lessons Completed", "lessonsCompleted");
			matched |= metric(sb, d, "Lessons Started", "lessonsStarted");
			matched |= metric(sb, d, "Lessons Pending", "lessonsPending");
		}
		if (containsWord(m, "xp", "exp", "experience", "points", "level", "levels")) {
			matched |= metric(sb, d, "XP", "xp");
			matched |= metric(sb, d, "Level", "level");
			if (d.get("xpRemaining") != null && containsWord(m, "remaining", "need", "needs", "needed", "left", "complete", "completion", "finish", "reach")) {
				Object rem = d.get("xpRemaining");
				Object nxtLvl = d.get("nextLevel") != null ? d.get("nextLevel") : 2;
				Object thresh = d.get("nextLevelThreshold") != null ? d.get("nextLevelThreshold") : 500;
				sb.append("- **XP Needed for Level ").append(nxtLvl).append(":** ")
				  .append(rem).append(" XP (needs ").append(rem).append(" more XP to reach Level ").append(nxtLvl).append(" at ").append(thresh).append(" XP threshold)\n");
				matched = true;
			}
		} else if (d.get("xpRemaining") != null && containsWord(m, "remaining", "need", "needs", "needed", "left", "complete", "completion", "finish", "reach")) {
			matched |= metric(sb, d, "XP", "xp");
			matched |= metric(sb, d, "Level", "level");
			Object rem = d.get("xpRemaining");
			Object nxtLvl = d.get("nextLevel") != null ? d.get("nextLevel") : 2;
			Object thresh = d.get("nextLevelThreshold") != null ? d.get("nextLevelThreshold") : 500;
			sb.append("- **XP Needed for Level ").append(nxtLvl).append(":** ")
			  .append(rem).append(" XP (needs ").append(rem).append(" more XP to reach Level ").append(nxtLvl).append(" at ").append(thresh).append(" XP threshold)\n");
			matched = true;
		}
		if (containsWord(m, "streak", "streaks")) {
			matched |= metric(sb, d, "Current Streak", "currentStreak");
			matched |= metric(sb, d, "Longest Streak", "longestStreak");
		}
		if (containsWord(m, "practice", "practiced", "practise", "practicing", "minutes", "minute", "time")) {
			matched |= metric(sb, d, "Total Practice Minutes", "totalPracticeMinutes");
		}
		if (containsWord(m, "speaking", "speak", "spoken", "session", "sessions", "fluency", "pronunciation", "pronounciation", "score", "scores", "skills")) {
			boolean specificPronun = containsWord(m, "pronunciation", "pronounciation");
			boolean specificFluency = containsWord(m, "fluency");
			if (specificPronun) {
				if (d.get("pronunciationScore") != null) {
					sb.append("- **Pronunciation Score:** ").append(d.get("pronunciationScore")).append("%\n");
					matched = true;
				}
			} else if (specificFluency) {
				if (d.get("fluencyScore") != null) {
					sb.append("- **Fluency Score:** ").append(d.get("fluencyScore")).append("%\n");
					matched = true;
				}
			} else {
				matched |= metric(sb, d, "Total Speaking Sessions", "totalSpeakingSessions");
				if (d.get("completedSpeakingSessions") != null) {
					sb.append("- **Completed Speaking Sessions (Evaluated):** ").append(d.get("completedSpeakingSessions")).append('\n');
					matched = true;
				}
				if (d.get("overallSpeakingScore") != null) {
					sb.append("- **Overall Speaking Score:** ").append(d.get("overallSpeakingScore")).append("%\n");
					matched = true;
				}
				if (d.get("fluencyScore") != null) {
					sb.append("- **Fluency Score:** ").append(d.get("fluencyScore")).append("%\n");
				}
				if (d.get("pronunciationScore") != null) {
					sb.append("- **Pronunciation Score:** ").append(d.get("pronunciationScore")).append("%\n");
				}
				if (d.get("speakingGrammarScore") != null) {
					sb.append("- **Speaking Grammar Score:** ").append(d.get("speakingGrammarScore")).append("%\n");
				}
				if (d.get("speakingVocabularyScore") != null) {
					sb.append("- **Speaking Vocabulary Score:** ").append(d.get("speakingVocabularyScore")).append("%\n");
				}
			}
		}
		if (containsWord(m, "grammar", "checks", "check")) {
			matched |= metric(sb, d, "Total Grammar Checks", "totalGrammarChecks");
			if (d.get("averageGrammarScore") != null) {
				sb.append("- **Average Grammar Accuracy:** ").append(d.get("averageGrammarScore")).append("%\n");
				matched = true;
			}
			if (d.get("speakingGrammarScore") != null && containsWord(m, "score", "speaking")) {
				sb.append("- **Speaking Grammar Score:** ").append(d.get("speakingGrammarScore")).append("%\n");
				matched = true;
			}
		}
		if (containsWord(m, "vocabulary", "vocab", "words", "word")) {
			matched |= metric(sb, d, "Total Vocabulary Words", "totalVocabularyWords");
			if (d.get("speakingVocabularyScore") != null && containsWord(m, "score", "average")) {
				sb.append("- **Speaking Vocabulary Score:** ").append(d.get("speakingVocabularyScore")).append("%\n");
				matched = true;
			}
			if (d.get("masteredVocabularyWords") != null) {
				sb.append("- **Mastered Words:** ").append(d.get("masteredVocabularyWords")).append('\n');
				matched = true;
			}
			Object recent = d.get("recentVocabularyWords");
			if (recent instanceof List<?> rList && !rList.isEmpty()) {
				sb.append("- **Recent Words Added:** ").append(String.join(", ", rList.stream().map(String::valueOf).toList())).append("\n");
				matched = true;
			}
		}

		if (!matched) {
			// Broad progress overview across the 5 pillars
			sb.append("\n**Overall Learning Progress**\n");
			sb.append("- **Level & XP:** Level ").append(zeroIfBlank(num(d, "level"))).append(" (").append(zeroIfBlank(num(d, "xp"))).append(" XP)\n");
			sb.append("- **Practice Streak:** ").append(zeroIfBlank(num(d, "currentStreak"))).append(" day(s) (Best: ").append(zeroIfBlank(num(d, "longestStreak"))).append(" days)\n");

			sb.append("\n**Speaking Practice**\n");
			sb.append("- **Total Sessions:** ").append(zeroIfBlank(num(d, "totalSpeakingSessions")));
			if (d.get("completedSpeakingSessions") != null) {
				sb.append(" (").append(d.get("completedSpeakingSessions")).append(" completed with AI evaluations)");
			}
			sb.append("\n");
			if (d.get("overallSpeakingScore") != null) {
				sb.append("- **Average Speaking Score:** ").append(d.get("overallSpeakingScore")).append("%");
				if (d.get("fluencyScore") != null && d.get("pronunciationScore") != null) {
					sb.append(" (Fluency: ").append(d.get("fluencyScore")).append("% | Pronunciation: ").append(d.get("pronunciationScore")).append("%)");
				}
				sb.append("\n");
			}

			sb.append("\n**Vocabulary & Grammar**\n");
			sb.append("- **Vocabulary Words Added:** ").append(zeroIfBlank(num(d, "totalVocabularyWords")));
			if (d.get("masteredVocabularyWords") != null) {
				sb.append(" (").append(d.get("masteredVocabularyWords")).append(" mastered)");
			}
			sb.append("\n");
			Object recent = d.get("recentVocabularyWords");
			if (recent instanceof List<?> rList && !rList.isEmpty()) {
				sb.append("- **Recent Words:** ").append(String.join(", ", rList.stream().limit(6).map(String::valueOf).toList())).append("\n");
			}
			sb.append("- **Grammar Checks Done:** ").append(zeroIfBlank(num(d, "totalGrammarChecks")));
			if (d.get("averageGrammarScore") != null) {
				sb.append(" (Accuracy: ").append(d.get("averageGrammarScore")).append("%)");
			}
			sb.append("\n");

			sb.append("\n**Curriculum Lessons**\n");
			sb.append("- **Lessons Completed:** ").append(zeroIfBlank(num(d, "lessonsCompleted"))).append(" of ").append(zeroIfBlank(num(d, "lessonsStarted"))).append(" started\n");

			if (isNonStudentPerson(d)) {
				String summary = str(d, "summary");
				if (!summary.isBlank()) {
					sb.append('\n').append(summary);
				}
			}
			return trimOrNull(sb);
		}
		// A real, non-student person now carries zeroed learning metrics so a focused
		// metric question returns a number. Keep the provider's authoritative role
		// explanation alongside those numbers so the reader also learns WHY the value
		// is 0 ("...is a User, not a student...").
		if (isNonStudentPerson(d)) {
			String summary = str(d, "summary");
			if (!summary.isBlank()) {
				sb.append('\n').append(summary);
			}
		}
		return trimOrNull(sb);
	}

	private String renderDisambiguationPrompt(Map<String, Object> data) {
		String studentName = str(data, "studentName");
		return "### 🔍 Clarification Needed\n\n"
				+ "I found multiple students named **" + (studentName.isBlank() ? "this student" : studentName)
				+ "**. Please specify the class, division, or another identifying detail so I can look up the correct student record.";
	}

	/**
	 * Appends a single metric line only when the provider actually supplied the
	 * field, so a focused answer never fabricates a 0 for a metric that was not
	 * computed. Returns true when a line was emitted.
	 */
	private boolean metric(StringBuilder sb, Map<String, Object> d, String label, String key) {
		if (d == null || d.get(key) == null) {
			return false;
		}
		addLine(sb, label, zeroIfBlank(num(d, key)));
		return true;
	}

	/** Whole-word, case-insensitive containment test (input already lower-cased). */
	private boolean containsWord(String text, String... words) {
		if (text == null || text.isBlank()) {
			return false;
		}
		for (String word : words) {
			String needle = word.toLowerCase(Locale.ROOT);
			int from = 0;
			int idx;
			while ((idx = text.indexOf(needle, from)) >= 0) {
				int end = idx + needle.length();
				boolean startOk = idx == 0 || !isWordChar(text.charAt(idx - 1));
				boolean endOk = end >= text.length() || !isWordChar(text.charAt(end));
				if (startOk && endOk) {
					return true;
				}
				from = end;
			}
		}
		return false;
	}

	private boolean isWordChar(char c) {
		return Character.isLetterOrDigit(c) || c == '_';
	}

	private String summaryOr(Map<String, Object> d, String prefix) {
		String summary = str(d, "summary");
		if (!summary.isBlank()) {
			return (prefix == null || prefix.isBlank() ? "" : prefix + "\n\n") + summary;
		}
		return generic(d);
	}

	private String generic(Map<String, Object> d) {
		StringBuilder sb = new StringBuilder();
		int emitted = 0;
		for (Map.Entry<String, Object> entry : d.entrySet()) {
			if (emitted >= 20) {
				break;
			}
			Object value = entry.getValue();
			if (value == null || value instanceof Map || value instanceof List) {
				continue;
			}
			String text = String.valueOf(value).trim();
			if (text.isEmpty() || "null".equals(text)) {
				continue;
			}
			sb.append("- **").append(humanize(entry.getKey())).append(":** ").append(text).append('\n');
			emitted++;
		}
		return sb.length() == 0 ? null : sb.toString().trim();
	}

	private void appendPerson(StringBuilder sb, Map<String, Object> person, String... keys) {
		String name = str(person, "name");
		if (name.isBlank()) {
			return;
		}
		sb.append("- **").append(name).append("**");
		StringBuilder details = new StringBuilder();
		for (String key : keys) {
			Object raw = person.get(key);
			if (raw == null) {
				continue;
			}
			String text = raw instanceof List<?> list ? String.join(", ", stringify(list)) : String.valueOf(raw).trim();
			if (text.isEmpty() || "null".equals(text)) {
				continue;
			}
			if (details.length() > 0) {
				details.append(", ");
			}
			details.append(humanize(key)).append(": ").append(text);
		}
		if (details.length() > 0) {
			sb.append(" — ").append(details);
		}
		sb.append('\n');
	}

	private List<String> stringify(List<?> list) {
		List<String> out = new ArrayList<>();
		for (Object o : list) {
			if (o != null) {
				out.add(String.valueOf(o));
			}
		}
		return out;
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> map(Map<String, Object> d, String key) {
		if (d == null) return null;
		Object value = d.get(key);
		if (value instanceof Map<?, ?> m) {
			return (Map<String, Object>) m;
		}
		return null;
	}

	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> maps(Map<String, Object> d, String key) {
		Object value = d.get(key);
		if (value instanceof List<?> list) {
			List<Map<String, Object>> out = new ArrayList<>();
			for (Object o : list) {
				if (o instanceof Map<?, ?> m) {
					out.add((Map<String, Object>) m);
				}
			}
			return out;
		}
		return List.of();
	}

	private List<String> strings(Map<String, Object> d, String key) {
		Object value = d.get(key);
		if (value instanceof List<?> list) {
			return stringify(list);
		}
		return List.of();
	}

	private String str(Map<String, Object> d, String key) {
		Object value = d == null ? null : d.get(key);
		if (value == null) {
			return "";
		}
		String text = String.valueOf(value).trim();
		return "null".equals(text) ? "" : text;
	}

	private String num(Map<String, Object> d, String key) {
		Object value = d == null ? null : d.get(key);
		if (value == null) {
			return "";
		}
		if (value instanceof Double dv) {
			if (!dv.isInfinite() && !dv.isNaN() && dv == Math.floor(dv)) {
				return String.valueOf(dv.longValue());
			}
			return String.valueOf(dv);
		}
		if (value instanceof Float fv) {
			double dv = fv.doubleValue();
			if (dv == Math.floor(dv)) {
				return String.valueOf((long) dv);
			}
			return String.valueOf(fv);
		}
		return String.valueOf(value);
	}

	private String boolLabel(Map<String, Object> d, String key) {
		Object value = d == null ? null : d.get(key);
		if (value == null) {
			return "";
		}
		if (value instanceof Boolean b) {
			return b ? "On" : "Off";
		}
		return String.valueOf(value);
	}

	private String zeroIfBlank(String value) {
		return value == null || value.isBlank() ? "0" : value;
	}

	private void addLine(StringBuilder sb, String label, String value) {
		if (value != null && !value.isBlank()) {
			sb.append("- **").append(label).append(":** ").append(value).append('\n');
		}
	}

	private String humanize(String key) {
		if (key == null || key.isBlank()) {
			return "";
		}
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < key.length(); i++) {
			char c = key.charAt(i);
			if (i > 0 && Character.isUpperCase(c) && !Character.isUpperCase(key.charAt(i - 1))) {
				sb.append(' ');
			}
			sb.append(i == 0 ? Character.toUpperCase(c) : c);
		}
		return sb.toString();
	}

	private String trimOrNull(StringBuilder sb) {
		if (sb == null) {
			return null;
		}
		String text = sb.toString().trim();
		return text.isEmpty() ? null : text;
	}

	private void enrichPlatformStatsIfMissing(SynthesizedAnswer answer, AssistantIntent intent, String userMessage, String dataJson) {
		if (answer == null || intent == null) {
			return;
		}
		if (intent != AssistantIntent.PLATFORM_USERS && intent != AssistantIntent.PLATFORM_OVERVIEW) {
			return;
		}
		Map<String, Object> data = parseData(dataJson);
		if (data.isEmpty()) {
			return;
		}

		List<AssistantResponse.StatCard> stats = answer.getStats();
		if (stats == null) {
			stats = new ArrayList<>();
			answer.setStats(stats);
		} else if (!(stats instanceof ArrayList)) {
			stats = new ArrayList<>(stats);
			answer.setStats(stats);
		}

		String teachers = num(data, "totalTeachers");
		String students = num(data, "totalStudents");
		String users = num(data, "totalUsers");
		String schoolAdmins = num(data, "totalSchoolAdmins");
		String activeStudents = num(data, "activeStudents");
		String activeTeachers = num(data, "activeTeachers");
		String activeUsers = num(data, "activeUsers");
		String schools = num(data, "totalSchools");
		String classes = num(data, "totalClasses");

		String msg = (userMessage != null ? userMessage.toLowerCase(Locale.ROOT).trim() : "");
		String roleFilter = str(data, "roleFilter");
		boolean broad = isBroadOverview(msg) || (intent == AssistantIntent.PLATFORM_USERS && roleFilter.isBlank());

		if (!broad) {
			boolean isStudent = (msg.contains("student") || msg.contains("learner") || "Student".equalsIgnoreCase(roleFilter));
			boolean isTeacher = (msg.contains("teacher") || msg.contains("educator") || msg.contains("teaching staff") || "Teacher".equalsIgnoreCase(roleFilter));
			boolean isSchoolAdmin = (msg.contains("school admin") || "School Admin".equalsIgnoreCase(roleFilter));
			boolean isSuperAdmin = (msg.contains("super admin") || "Super Admin".equalsIgnoreCase(roleFilter));
			boolean isSchool = msg.contains("school") && !isStudent && !isTeacher && !isSchoolAdmin && !isSuperAdmin;
			boolean isClass = msg.contains("class") || msg.contains("standard") || msg.contains("division");
			boolean isUser = (msg.contains("user") || msg.contains("account"));

			if (isStudent) {
				stats.removeIf(s -> s != null && s.getLabel() != null && !s.getLabel().toLowerCase(Locale.ROOT).contains("student"));
				boolean hasTotal = stats.stream().anyMatch(s -> s != null && s.getLabel() != null && s.getLabel().equalsIgnoreCase("Total Students"));
				boolean hasActive = stats.stream().anyMatch(s -> s != null && s.getLabel() != null && s.getLabel().equalsIgnoreCase("Active Students"));
				if (!hasTotal && !students.isBlank()) {
					stats.add(new AssistantResponse.StatCard("Total Students", students, null));
				}
				if (!hasActive && !activeStudents.isBlank()) {
					stats.add(new AssistantResponse.StatCard("Active Students", activeStudents, null));
				}
				answer.setStats(stats);
				return;
			} else if (isTeacher) {
				stats.removeIf(s -> s != null && s.getLabel() != null && !s.getLabel().toLowerCase(Locale.ROOT).contains("teacher"));
				boolean hasTotal = stats.stream().anyMatch(s -> s != null && s.getLabel() != null && s.getLabel().equalsIgnoreCase("Total Teachers"));
				boolean hasActive = stats.stream().anyMatch(s -> s != null && s.getLabel() != null && s.getLabel().equalsIgnoreCase("Active Teachers"));
				if (!hasTotal && !teachers.isBlank()) {
					stats.add(new AssistantResponse.StatCard("Total Teachers", teachers, null));
				}
				if (!hasActive && !activeTeachers.isBlank()) {
					stats.add(new AssistantResponse.StatCard("Active Teachers", activeTeachers, null));
				}
				answer.setStats(stats);
				return;
			} else if (isSchoolAdmin) {
				stats.removeIf(s -> s != null && s.getLabel() != null && !s.getLabel().toLowerCase(Locale.ROOT).contains("school admin"));
				if (!schoolAdmins.isBlank()) {
					stats.add(new AssistantResponse.StatCard("School Admins", schoolAdmins, null));
				}
				answer.setStats(stats);
				return;
			} else if (isSuperAdmin) {
				stats.removeIf(s -> s != null && s.getLabel() != null && !s.getLabel().toLowerCase(Locale.ROOT).contains("super admin"));
				String superAdmins = num(data, "totalSuperAdmins");
				if (!superAdmins.isBlank()) {
					stats.add(new AssistantResponse.StatCard("Super Admins", superAdmins, null));
				}
				answer.setStats(stats);
				return;
			} else if (isSchool) {
				stats.removeIf(s -> s != null && s.getLabel() != null && !s.getLabel().toLowerCase(Locale.ROOT).contains("school"));
				boolean hasTotal = stats.stream().anyMatch(s -> s != null && s.getLabel() != null && s.getLabel().toLowerCase(Locale.ROOT).contains("school"));
				if (!hasTotal && !schools.isBlank()) {
					stats.add(new AssistantResponse.StatCard("Total Schools", schools, null));
				}
				answer.setStats(stats);
				return;
			} else if (isClass) {
				stats.removeIf(s -> s != null && s.getLabel() != null && !s.getLabel().toLowerCase(Locale.ROOT).contains("class") && !s.getLabel().toLowerCase(Locale.ROOT).contains("standard") && !s.getLabel().toLowerCase(Locale.ROOT).contains("division"));
				if (!classes.isBlank()) {
					stats.add(new AssistantResponse.StatCard("Total Classes", classes, null));
				}
				answer.setStats(stats);
				return;
			} else if (isUser) {
				stats.removeIf(s -> s != null && s.getLabel() != null && !s.getLabel().toLowerCase(Locale.ROOT).contains("user"));
				if (!users.isBlank()) {
					stats.add(0, new AssistantResponse.StatCard("Total Users", users, null));
				}
				if (!activeUsers.isBlank()) {
					stats.add(new AssistantResponse.StatCard("Active Users", activeUsers, null));
				}
				answer.setStats(stats);
				return;
			}
		}

		boolean hasTeacher = stats.stream().anyMatch(s -> s != null && s.getLabel() != null
				&& s.getLabel().toLowerCase(Locale.ROOT).contains("teacher"));
		boolean hasStudent = stats.stream().anyMatch(s -> s != null && s.getLabel() != null
				&& s.getLabel().toLowerCase(Locale.ROOT).contains("student"));
		boolean hasUser = stats.stream().anyMatch(s -> s != null && s.getLabel() != null
				&& s.getLabel().toLowerCase(Locale.ROOT).contains("user"));
		boolean hasSchoolAdmin = stats.stream().anyMatch(s -> s != null && s.getLabel() != null
				&& s.getLabel().toLowerCase(Locale.ROOT).contains("school admin"));

		if (!hasUser && !users.isBlank()) {
			stats.add(0, new AssistantResponse.StatCard("Total Users", users, null));
		}
		if (!hasTeacher && !teachers.isBlank()) {
			stats.add(new AssistantResponse.StatCard("Teachers", teachers, null));
		}
		if (!hasStudent && !students.isBlank()) {
			stats.add(new AssistantResponse.StatCard("Students", students, null));
		}
		if (!hasSchoolAdmin && !schoolAdmins.isBlank()) {
			stats.add(new AssistantResponse.StatCard("School Admins", schoolAdmins, null));
		}

		// Order cards logically: Total Users -> Teachers -> Students -> School Admins -> Super Admins -> Others
		List<AssistantResponse.StatCard> ordered = new ArrayList<>();
		addFirstMatching(ordered, stats, "total user", "user");
		addFirstMatching(ordered, stats, "teacher");
		addFirstMatching(ordered, stats, "student");
		addFirstMatching(ordered, stats, "school admin");
		addFirstMatching(ordered, stats, "super admin");
		for (AssistantResponse.StatCard sc : stats) {
			if (!ordered.contains(sc)) {
				ordered.add(sc);
			}
		}
		answer.setStats(ordered);
		// Ensure dynamic chart type is optimal (use doughnut for user role distribution)
		if (answer.getChart() != null && intent == AssistantIntent.PLATFORM_USERS) {
			String cType = answer.getChart().getType();
			if ("bar".equalsIgnoreCase(cType)) {
				answer.getChart().setType("doughnut");
			}
		} else if (answer.getChart() == null && intent == AssistantIntent.PLATFORM_USERS && !data.isEmpty()) {
			if (roleFilter.isBlank()) {
				List<String> labels = new ArrayList<>();
				List<Double> counts = new ArrayList<>();
				addRoleSlice(labels, counts, "Users", num(data, "totalLearners"));
				addRoleSlice(labels, counts, "Teachers", num(data, "totalTeachers"));
				addRoleSlice(labels, counts, "Students", num(data, "totalStudents"));
				addRoleSlice(labels, counts, "School Admins", num(data, "totalSchoolAdmins"));
				addRoleSlice(labels, counts, "Super Admins", num(data, "totalSuperAdmins"));
				if (!labels.isEmpty()) {
					answer.setChart(AssistantResponse.ChartData.builder()
							.type("doughnut")
							.title("User Role Distribution")
							.labels(labels)
							.datasets(List.of(AssistantResponse.Dataset.builder().label("Users").data(counts).build()))
							.build());
				}
			}
		}
	}

	private void addRoleSlice(List<String> labels, List<Double> counts, String label, String valueStr) {
		if (valueStr != null && !valueStr.isBlank()) {
			try {
				double val = Double.parseDouble(valueStr.trim());
				if (val > 0) {
					labels.add(label);
					counts.add(val);
				}
			} catch (NumberFormatException ignored) {
			}
		}
	}

	private void addFirstMatching(List<AssistantResponse.StatCard> target, List<AssistantResponse.StatCard> source, String... keywords) {
		for (AssistantResponse.StatCard sc : source) {
			if (sc == null || sc.getLabel() == null || target.contains(sc)) {
				continue;
			}
			String label = sc.getLabel().toLowerCase(Locale.ROOT);
			for (String kw : keywords) {
				if (label.contains(kw)) {
					target.add(sc);
					return;
				}
			}
		}
	}

	private void enrichClassStatsIfMissing(SynthesizedAnswer answer, AssistantIntent intent, String userMessage, String dataJson) {
		if (answer == null || intent != AssistantIntent.CLASS_PERFORMANCE) {
			return;
		}
		Map<String, Object> data = parseData(dataJson);
		if (data.isEmpty()) {
			return;
		}

		List<AssistantResponse.StatCard> stats = answer.getStats();
		if (stats == null) {
			stats = new ArrayList<>();
			answer.setStats(stats);
		} else if (!(stats instanceof ArrayList)) {
			stats = new ArrayList<>(stats);
			answer.setStats(stats);
		}

		if (!stats.isEmpty()) {
			return; // Stat cards already supplied
		}

		String msg = (userMessage != null ? userMessage.toLowerCase(Locale.ROOT).trim() : "");
		boolean isAssignedClassesQuery = msg.contains("which classes") || msg.contains("assigned classes")
				|| msg.contains("classes are assigned") || msg.contains("classes assigned")
				|| msg.contains("classes do i teach") || msg.contains("what classes are assigned")
				|| msg.equals("my classes") || msg.equals("my classes?");

		if (isAssignedClassesQuery) {
			String totalClasses = num(data, "totalAssignedClasses");
			String totalStuds = num(data, "totalStudentsAcrossClasses");
			if (!totalClasses.isBlank()) {
				stats.add(new AssistantResponse.StatCard("Total Assigned Classes", totalClasses, null));
			}
			if (!totalStuds.isBlank() && !"0".equals(totalStuds)) {
				stats.add(new AssistantResponse.StatCard("Enrolled Students", totalStuds, null));
			}
		} else if (msg.contains("struggling") || msg.contains("need help") || msg.contains("needing help")) {
			List<Map<String, Object>> struggling = maps(data, "strugglingStudents");
			stats.add(new AssistantResponse.StatCard("Struggling Learners", String.valueOf(struggling.size()), null));
			String totalStuds = num(data, "totalStudentsAcrossClasses");
			if (totalStuds.isBlank()) totalStuds = num(data, "studentCount");
			stats.add(new AssistantResponse.StatCard("Total Students", totalStuds, null));
		} else {
			String studs = num(data, "studentCount");
			String totalXp = num(data, "totalXp");
			String avgXp = num(data, "averageXpPerStudent");
			String streaks = num(data, "studentsWithActiveStreak");
			if (!studs.isBlank()) stats.add(new AssistantResponse.StatCard("Enrolled Students", studs, null));
			if (!totalXp.isBlank() && !"0".equals(totalXp)) stats.add(new AssistantResponse.StatCard("Total XP", totalXp, null));
			if (!avgXp.isBlank() && !"0".equals(avgXp)) stats.add(new AssistantResponse.StatCard("Average XP per Student", avgXp, null));
			if (!streaks.isBlank() && !"0".equals(streaks)) stats.add(new AssistantResponse.StatCard("Students with Active Streak", streaks, null));
		}
	}

	private void enrichStudentProgressChart(SynthesizedAnswer answer, AssistantIntent intent, String userMessage, String dataJson) {
		if (answer == null || intent != AssistantIntent.STUDENT_PERFORMANCE) {
			return;
		}
		Map<String, Object> data = parseData(dataJson);
		if (data.isEmpty()) {
			return;
		}

		double speaking = parseDoubleOrZero(data.get("totalSpeakingSessions"));
		if (speaking == 0) {
			speaking = parseDoubleOrZero(data.get("completedSpeakingSessions"));
		}
		double lessons = parseDoubleOrZero(data.get("lessonsCompleted"));
		double grammar = parseDoubleOrZero(data.get("totalGrammarChecks"));
		double vocab = parseDoubleOrZero(data.get("totalVocabularyWords"));

		double totalActivities = speaking + lessons + grammar + vocab;
		if (totalActivities <= 0) {
			return;
		}

		AssistantResponse.ChartData existingChart = answer.getChart();
		boolean isCompletedRemaining = false;
		if (existingChart != null && existingChart.getLabels() != null) {
			for (String l : existingChart.getLabels()) {
				if (l != null) {
					String lower = l.toLowerCase(Locale.ROOT);
					if (lower.contains("completed") || lower.contains("remaining") || lower.contains("pending")) {
						isCompletedRemaining = true;
						break;
					}
				}
			}
		}

		// Replace chart if it's missing or if it was a narrow "completed vs remaining" chart
		if (existingChart == null || isCompletedRemaining) {
			String chartType = (existingChart != null && existingChart.getType() != null)
					? existingChart.getType() : "bar";
			if (userMessage != null && userMessage.toLowerCase(Locale.ROOT).contains("pie")) {
				chartType = "pie";
			} else if (userMessage != null && (userMessage.toLowerCase(Locale.ROOT).contains("doughnut") || userMessage.toLowerCase(Locale.ROOT).contains("donut"))) {
				chartType = "doughnut";
			} else if ("line".equalsIgnoreCase(chartType)) {
				chartType = "bar";
			}

			List<String> labels = List.of("Speaking", "Lessons", "Grammar", "Vocabulary");
			List<Double> counts = List.of(speaking, lessons, grammar, vocab);

			answer.setChart(AssistantResponse.ChartData.builder()
					.type(chartType)
					.title("Learning Activity by Module")
					.labels(labels)
					.datasets(List.of(AssistantResponse.Dataset.builder()
							.label("Activities")
							.data(counts)
							.build()))
					.build());
		} else if (userMessage != null) {
			if (userMessage.toLowerCase(Locale.ROOT).contains("pie")) {
				existingChart.setType("pie");
			} else if (userMessage.toLowerCase(Locale.ROOT).contains("doughnut") || userMessage.toLowerCase(Locale.ROOT).contains("donut")) {
				existingChart.setType("doughnut");
			}
		}
	}

	private void enrichPlatformOverviewChart(SynthesizedAnswer answer, AssistantIntent intent, String userMessage,
			Map<String, Object> params, String dataJson) {
		if (answer == null || intent != AssistantIntent.PLATFORM_OVERVIEW) {
			return;
		}
		Map<String, Object> data = parseData(dataJson);
		if (data.isEmpty()) {
			return;
		}

		String msg = (userMessage != null ? userMessage.toLowerCase(Locale.ROOT) : "");
		boolean wantsChart = Boolean.TRUE.equals(params != null ? params.get("wantsChart") : null)
				|| msg.contains("chart") || msg.contains("graph") || msg.contains("visualize")
				|| isBroadOverview(userMessage) || msg.contains("platform") || msg.contains("overall")
				|| msg.contains("performing") || msg.contains("performance");

		if (answer.getChart() != null) {
			if (msg.contains("pie")) {
				answer.getChart().setType("pie");
			} else if (msg.contains("doughnut") || msg.contains("donut")) {
				answer.getChart().setType("doughnut");
			} else if (msg.contains("bar") && !answer.getChart().getType().contains("bar")) {
				answer.getChart().setType("horizontal-bar");
			}
			return;
		}

		if (!wantsChart) {
			return;
		}

		boolean isPieRequested = msg.contains("pie");
		boolean isDoughnutRequested = msg.contains("doughnut") || msg.contains("donut");
		String chartType = isPieRequested ? "pie" : (isDoughnutRequested ? "doughnut" : "horizontal-bar");

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> schoolsList = data.get("schoolsByStudentCount") instanceof List
				? (List<Map<String, Object>>) data.get("schoolsByStudentCount")
				: List.of();

		if (!schoolsList.isEmpty()) {
			List<String> labels = new ArrayList<>();
			List<Double> counts = new ArrayList<>();
			double otherTotal = 0;
			int limit = (isPieRequested || isDoughnutRequested) ? 5 : 6;

			for (int i = 0; i < schoolsList.size(); i++) {
				Map<String, Object> schoolEntry = schoolsList.get(i);
				String name = String.valueOf(schoolEntry.getOrDefault("schoolName", "School " + (i + 1)));
				double studentCount = parseDoubleOrZero(schoolEntry.get("studentCount"));
				if (i < limit) {
					labels.add(name);
					counts.add(studentCount);
				} else {
					otherTotal += studentCount;
				}
			}

			if (otherTotal > 0 && (isPieRequested || isDoughnutRequested)) {
				labels.add("Other Schools");
				counts.add(otherTotal);
			}

			if (!labels.isEmpty()) {
				answer.setChart(AssistantResponse.ChartData.builder()
						.type(chartType)
						.title("Students by School")
						.labels(labels)
						.datasets(List.of(AssistantResponse.Dataset.builder()
								.label("Students")
								.data(counts)
								.build()))
						.build());
				return;
			}
		}

		double activeStudents = parseDoubleOrZero(data.get("activeStudents"));
		double totalStudents = parseDoubleOrZero(data.get("totalStudents"));
		double inactiveStudents = Math.max(0, totalStudents - activeStudents);

		if (msg.contains("student") && totalStudents > 0) {
			answer.setChart(AssistantResponse.ChartData.builder()
					.type(isDoughnutRequested ? "doughnut" : "pie")
					.title("Student Activity Status")
					.labels(List.of("Active Students", "Inactive Students"))
					.datasets(List.of(AssistantResponse.Dataset.builder()
							.label("Students")
							.data(List.of(activeStudents, inactiveStudents))
							.build()))
					.build());
		} else {
			List<String> labels = new ArrayList<>();
			List<Double> counts = new ArrayList<>();
			double teachers = parseDoubleOrZero(data.get("totalTeachers"));
			double schoolAdmins = parseDoubleOrZero(data.get("totalSchoolAdmins"));
			double admins = parseDoubleOrZero(data.get("totalAdmins"));

			if (totalStudents > 0) { labels.add("Students"); counts.add(totalStudents); }
			if (teachers > 0) { labels.add("Teachers"); counts.add(teachers); }
			if (schoolAdmins > 0) { labels.add("School Admins"); counts.add(schoolAdmins); }
			if (admins > 0) { labels.add("Admins"); counts.add(admins); }

			if (!labels.isEmpty()) {
				answer.setChart(AssistantResponse.ChartData.builder()
						.type(isPieRequested ? "pie" : (isDoughnutRequested ? "doughnut" : "bar"))
						.title("Platform Users by Role")
						.labels(labels)
						.datasets(List.of(AssistantResponse.Dataset.builder()
								.label("Users")
								.data(counts)
								.build()))
						.build());
			}
		}
	}

	private double parseDoubleOrZero(Object obj) {
		if (obj == null) return 0.0;
		if (obj instanceof Number num) return num.doubleValue();
		try {
			return Double.parseDouble(String.valueOf(obj).trim());
		} catch (Exception e) {
			return 0.0;
		}
	}

	private String renderCasualChat(Map<String, Object> d, String userMessage) {
		String displayName = str(d, "displayName");
		String role = str(d, "role");
		String schoolName = str(d, "schoolName");
		String chatType = str(d, "chatType");
		if (chatType.isBlank()) {
			chatType = "GREETING";
		}
		String m = userMessage == null ? "" : userMessage.toLowerCase(Locale.ROOT).trim();

		// "who am I" or "what is my name"
		if (m.contains("who am i") || m.contains("what is my name") || m.contains("my name")) {
			StringBuilder sb = new StringBuilder();
			if (!displayName.isBlank()) {
				sb.append("You are logged in as **").append(displayName).append("**");
			} else {
				sb.append("You are logged in");
			}
			if (!role.isBlank()) {
				sb.append(", **").append(formatRoleName(role)).append("**");
			}
			if (!schoolName.isBlank()) {
				sb.append(" at **").append(schoolName).append("**");
			}
			sb.append(".\n\nHow can I assist you today?");
			return sb.toString();
		}

		// Capabilities / "who are you" / "what can you do" / "help"
		if ("CAPABILITIES".equalsIgnoreCase(chatType) || m.contains("who are you") || m.contains("what can you do") || m.contains("help")) {
			if ("SUPER_ADMIN".equalsIgnoreCase(role)) {
				return "I'm your **SpeakMate Super Admin Assistant** 🎓\n\n"
						+ "I can help you with:\n"
						+ "- **Platform Overview** — total registered schools, students, teachers, and platform users\n"
						+ "- **User Directory** — search and filter platform administrators, teachers, and learners\n"
						+ "- **School Metrics** — explore individual school performance, enrollments, and top performers\n"
						+ "- **Subscriptions & Billing** — active plans, renewals, and revenue trends\n\n"
						+ "Feel free to ask a question or explore platform analytics!";
			} else if ("SCHOOL_ADMIN".equalsIgnoreCase(role)) {
				String prefix = !schoolName.isBlank() ? " for **" + schoolName + "**" : "";
				return "I'm your **SpeakMate School Admin Assistant**" + prefix + " 🎓\n\n"
						+ "I can help you with:\n"
						+ "- **School Overview** — total student & teacher counts, active ratios, and class distributions\n"
						+ "- **Class & Section Performance** — division analytics, student enrollments, and assigned teachers\n"
						+ "- **Teacher Workloads** — assigned classrooms, subjects, and department details\n"
						+ "- **Student Progress** — XP points, levels, learning streaks, and speech practice metrics\n"
						+ "- **Exam Results & AI Insights** — pass/fail rates, average scores, and top performers\n\n"
						+ "Feel free to ask a question or tap a suggestion below!";
			} else if ("TEACHER".equalsIgnoreCase(role)) {
				return "I'm your **SpeakMate Teacher Assistant** 🎓\n\n"
						+ "I can help you monitor your assigned classes, track student speech practice, inspect vocabulary & grammar progress, and view class exam performance.\n\n"
						+ "What would you like to review today?";
			} else {
				return "I'm your **SpeakMate AI Learning Assistant** 🎓\n\n"
						+ "I can help you track your lessons, speaking practice scores, vocabulary words, grammar exercises, and XP streak.\n\n"
						+ "Keep up the great work and let me know how I can help!";
			}
		}

		// Well-being / small talk ("how are you", "how's it going")
		if ("WELL_BEING".equalsIgnoreCase(chatType) || m.contains("how are you") || m.contains("how do you do") || m.contains("how's it going")) {
			String nameSuffix = !displayName.isBlank() ? ", " + displayName : "";
			if ("SCHOOL_ADMIN".equalsIgnoreCase(role)) {
				String sName = !schoolName.isBlank() ? "manage **" + schoolName + "**" : "manage your school";
				return "I'm doing well, thank you" + nameSuffix + "! 😊\n\n"
						+ "I'm ready to help you " + sName + ". Would you like to check today's student engagement, teacher workloads, or recent exam results?";
			} else if ("SUPER_ADMIN".equalsIgnoreCase(role)) {
				return "I'm doing well, thank you" + nameSuffix + "! 😊\n\n"
						+ "I'm ready to help you oversee the SpeakMate platform. Would you like to review overall school statistics, active users, or subscription trends?";
			} else {
				return "I'm doing great, thank you" + nameSuffix + "! 😊 How can I assist you with your SpeakMate activities today?";
			}
		}

		// Gratitude ("thanks", "thank you")
		if ("GRATITUDE".equalsIgnoreCase(chatType) || m.startsWith("thank") || m.startsWith("thx")) {
			String nameSuffix = !displayName.isBlank() ? ", " + displayName : "";
			if (!schoolName.isBlank()) {
				return "You're very welcome" + nameSuffix + "! Let me know if you need any more insights for **" + schoolName + "**.";
			}
			return "You're very welcome" + nameSuffix + "! Let me know if you need any further assistance.";
		}

		// Default Greeting ("hi", "hello", "hey", "good morning", etc.)
		String greetingTarget = !displayName.isBlank() ? " **" + displayName + "**" : "";
		if ("SCHOOL_ADMIN".equalsIgnoreCase(role)) {
			String welcome = !schoolName.isBlank() ? "Welcome to **" + schoolName + "**'s assistant." : "Welcome to SpeakMate AI.";
			return "Hello" + greetingTarget + "! 👋\n\n"
					+ welcome + " How can I assist you with your classes, teachers, or students today?";
		} else if ("SUPER_ADMIN".equalsIgnoreCase(role)) {
			return "Hello" + greetingTarget + "! 👋\n\n"
					+ "Welcome to SpeakMate AI platform assistant. How can I assist you with platform metrics, schools, teachers, or students today?";
		} else if ("TEACHER".equalsIgnoreCase(role)) {
			String welcome = !schoolName.isBlank() ? "Welcome to **" + schoolName + "**'s teacher assistant." : "Welcome to SpeakMate AI.";
			return "Hello" + greetingTarget + "! 👋\n\n"
					+ welcome + " How can I help you with your classes and students today?";
		} else {
			return "Hello" + greetingTarget + "! 👋\n\n"
					+ "Welcome to SpeakMate AI! How can I assist you with your learning journey today?";
		}
	}

	private String formatRoleName(String role) {
		if (role == null) return "User";
		switch (role.toUpperCase(Locale.ROOT)) {
			case "SUPER_ADMIN": return "Super Admin";
			case "SCHOOL_ADMIN": return "School Admin";
			case "TEACHER": return "Teacher";
			case "STUDENT": return "Student";
			default: return "User";
		}
	}
}
