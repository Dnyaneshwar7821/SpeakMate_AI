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
			  "chart": {"type":"bar|line|doughnut","title":"Chart title","labels":["A","B","C"],"datasets":[{"label":"Series name","data":[1,2,3]}]},
			  "suggestDeepLink": true
			}
			Rules:
			- stats and chart are optional; include stats when you cite 2+ concrete numbers, chart when a series exists.
			- If no chart is relevant, set "chart": null.
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
		if (describesNonStudentPerson(dataJson)) {
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
		Exception lastFailure = null;
		// Transient Groq failures (rate limits, timeouts) usually recover quickly;
		// retry with a short backoff (capped) before answering gracefully.
		for (int attempt = 1; attempt <= 3 && raw == null; attempt++) {
			try {
				raw = groqChatClient.chatJson(messages, 0.4);
			} catch (Exception e) {
				lastFailure = e;
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
			return objectMapper.readValue(extractJson(raw), SynthesizedAnswer.class);
		} catch (Exception e) {
			// Graceful fallback: keep the raw text so the user still gets an answer.
			return SynthesizedAnswer.builder()
					.markdown(raw == null || raw.isBlank() ? "I couldn't build a clean answer just now. Please try again."
							: stripFences(raw))
					.build();
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
				""".formatted(roleLabel(actor), actor.getDisplayName() != null ? " (" + actor.getDisplayName() + ")" : "",
				intentGuidance(intent), OUTPUT_SHAPE);
	}

	private String roleLabel(ActorContext actor) {
		switch (actor.getRole() == null ? "USER" : actor.getRole().name()) {
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
			case PLATFORM_OVERVIEW -> "Summarize platform-wide statistics in a dashboard-style overview. When the question asks for a platform-wide total or count (e.g., total students, registered teachers, active users, schools, classes, standards, divisions, revenue, active subscription plans), answer directly from the provided fields such as totalStudents, totalTeachers, totalSchoolAdmins, totalUsers, totalSchools, totalClasses, totalStandards, totalDivisions, activeUsers, activeStudents, activeTeachers, studentsWithActiveStreak, totalRevenueFromPayments, totalRevenueFromSubscriptions, activeSubscriptionPlans — never say the data is unavailable when these fields are present. If the question compares or ranks schools (e.g., which school has the most students or teachers), rank schools using schoolsByStudentCount (which contains schoolName, studentCount and teacherCount for every school) and highlight the top schools, including a bar chart when a ranking series exists.";
			case SCHOOL_OVERVIEW -> "Summarize the specific school's statistics from the provided fields (totalStudents, totalTeachers, totalSchoolAdmins, activeStudents, activeTeachers, totalClasses, totalStandards, totalDivisions, standards). Answer count questions directly from those numbers — never say the data is unavailable when the fields are present. IMPORTANT: a count of 0 is a valid, real number — when the school exists but has no students or teachers, explicitly state that it has 0 students and 0 teachers (e.g., \"Greenwood High currently has 0 students and 0 teachers enrolled\"). Never reply that information is unavailable or not provided for an existing school just because a count is zero. Highlight strengths and one improvement area.";
			case CLASS_PERFORMANCE -> "Summarize the class/grade/division performance. Highlight top areas and areas to improve.";
			case STUDENT_PERFORMANCE -> "If scope is SELF (the caller is a student or learner asking about their own progress): greet them warmly and report their real learning stats. Report the metric(s) asked about: lessons -> lessonsCompleted (plus lessonsStarted/lessonsPending); XP/level -> xp and level; streak -> currentStreak/longestStreak; practice time -> totalPracticeMinutes; speaking -> totalSpeakingSessions; fluency/pronunciation -> fluencyScore and pronunciationScore; vocabulary -> totalVocabularyWords; grammar -> totalGrammarChecks. When broad ('how is my progress', 'how am I doing', 'my stats'), give an uplifting summary with 3-4 key metrics and recommend their next step (e.g. daily speaking practice or completing the next lesson). Always include stat cards for key metrics.\n"
					+ "If scope is a teacher or admin looking up an assigned student: provide a crisp, professional educator snapshot including the student's name, standard, division, XP, current streak, lessons completed/started/pending, and practice time. Highlight their learning consistency and any areas needing practice. Include stat cards for XP, streak, and completed lessons.\n"
					+ "A count of 0 is a valid number, so state 0 explicitly rather than saying data is unavailable. If the person is not a student (it carries a personRole field), state they are not a student and report their role EXACTLY as given in personRole.";
			case BILLING -> "Summarize billing/subscription/revenue numbers clearly.";
			case SCHOOL_ROSTER -> "Answer ONLY from the provided teachers/students arrays, using every detail those entries contain. Never reply that a detail is unavailable when the field is present on the entry.\n"
					+ "Teacher entry fields: name, email, phone, employeeId, department, subject, designation, experience, qualification, joinedAt, classes (list of classes assigned). A teacher's teaching area is exposed as BOTH department and subject - treat 'subject' as the subject they teach and state it, they are the same stored value. If the caller asks which subject/department someone teaches, answer with the subject value (e.g. \"Digvijay Patil teaches English\"). If asked when someone joined, use joinedAt; only if joinedAt is absent from the entry, say the joining date is not recorded (do not say the whole record is unavailable).\n"
					+ "Student entry fields: name, email, phone, studentId, rollNumber, standard, division, assignedTeacher.\n"
					+ "When entityType is SINGLE_PERSON (or focusName is present), the arrays were narrowed to that one person: answer the specific question about them directly (e.g. \"Digvijay Patil is in the English department\") and, when the question is a general 'details' question, list ALL of that person's fields as markdown bullets.\n"
					+ "When the caller asked for a name (e.g., 'name of the teacher'), state it directly - for example \"The teacher is John Doe\". For a roster list, present each person as a markdown bullet including their known details (name, plus email/department/subject/experience/qualification/classes for teachers; name, plus standard/division/assignedTeacher for students), grouping under Teachers / Students headings when both are present. Use teacherCount and studentCount as the real numbers - an empty list means no one is enrolled, so say \"0 teachers\" or \"0 students\" explicitly. Keep it concise.\n"
					+ "The payload may also contain otherUsers/otherUserCount for accounts that are neither students nor teachers (platform Users, School Admins, Admins); each entry has name, role, email, phone, schoolName and status. This directory is always available — never say the information is unavailable when these entries are present. Always state a person's role EXACTLY as given in their role field — never substitute, upgrade, or invent a different role (for example, never call a 'User' a 'School Admin').";
			case ACCOUNT_INFO -> "Answer with the caller's OWN account details from the provided fields (email, displayName, role, schoolName, location). When asked for the email, state it clearly (e.g., \"Your logged-in email is ...\"). When asked for their location/address/city (e.g. \"my location\"), answer directly from the location field (e.g., \"Your location is ...\") — never reply with navigation links or say the data is unavailable when the location field is present. Also give their name, role and school when asked. Never mention ids or internal field names, and never claim the data is unavailable — this is the caller's own account and is always available.";
			case NAVIGATION_HELP -> "Give a short, friendly navigation guide pointing to the relevant page.";
			case SCHOOL_DASHBOARD -> "Summarize the school-admin Dashboard KPIs from the provided fields: totalStudents, activeStudents, inactiveStudents, totalTeachers, totalClasses, totalResults, averageResultPercentage, excellentResults, goodResults, passResults, failResults and totalLessonsCompleted. Answer count questions directly from those numbers — a count of 0 is a valid, real number and must be stated as 0 (never 'unavailable'). Highlight the headline numbers and one area to watch.";
			case RESULTS_ANALYTICS -> "Summarize the school's Results page from the provided fields: totalResults, averagePercentage, passed, failed, passPercentage, failPercentage, highestPercentage, lowestPercentage, excellentResults, goodResults, passResults, failResults and any per-standard breakdown. Answer count/percentage questions directly from those numbers — 0 is a valid number. Present pass/fail clearly and note where the school can improve.";
			case AI_INSIGHTS -> "Summarize the school's AI Insights page from the provided fields: fluency, pronunciation, vocabulary and grammar scores, speakingTimeSeconds, speechMetrics, trends, topSpeakers and mispronouncedWords. Answer metric questions directly from those numbers (e.g. average fluency score) — a value of 0 is valid. If mispronouncedWordsAvailable is false (or the mispronouncedWords list is empty), state plainly that word-level mispronunciation data is not available and DO NOT invent, guess or list any words. Be encouraging and call out the strongest and weakest area plus the top speakers.";
			case PROFILE_SETTINGS -> "Answer with the caller's OWN profile and settings from the provided fields (name, email, role, phone, schoolName, schoolCode, department, joinedAt and preference/security settings such as theme, notification preferences and two-factor status). State values directly (e.g. 'Your profile email is ...'); never mention ids or internal field names and never claim the data is unavailable — this is the caller's own profile.";
			case PLATFORM_USERS -> "The caller is a Super Admin, who can access every dataset on the platform (the All Users page at /admin/users). Answer ONLY from the provided users array, using every detail those entries contain (name, role, email, schoolName, phone, status). List the users as markdown bullets (name plus role/school). Use totalUsers and userCount as the real numbers — userCount is the number of users matching any roleFilter. Never reply that the data is unavailable — this directory is always available to a Super Admin. When the question simply asks for the names of all users, list every name from the users array.";
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
		return SynthesizedAnswer.builder().markdown(markdown).build();
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
		// Provider signalled "no data" (e.g. {"message":"NO DATA","reason":...}).
		if (data.containsKey("message") && !data.containsKey("scope")) {
			return NO_DATA_MESSAGE;
		}
		if (intent == null) {
			return summaryOr(data, null);
		}
		return switch (intent) {
			case PLATFORM_OVERVIEW -> renderPlatform(data);
			case SCHOOL_OVERVIEW -> renderSchool(data);
			case SCHOOL_DASHBOARD -> renderDashboard(data);
			case RESULTS_ANALYTICS -> renderResults(data);
			case AI_INSIGHTS -> renderAiInsights(data);
			case PROFILE_SETTINGS -> renderProfile(data);
			case SCHOOL_ROSTER -> renderRoster(data);
			case PLATFORM_USERS -> renderUsers(data);
			case BILLING -> renderBilling(data);
			case ACCOUNT_INFO -> renderAccount(data);
			case NAVIGATION_HELP -> renderNavigation(data);
			case CLASS_PERFORMANCE -> summaryOr(data, null);
			case STUDENT_PERFORMANCE -> renderStudentPerformance(data, userMessage);
			case ACCESS_DENIED -> "This question is outside your access. Ask me about your own dashboard, students, "
					+ "teachers, results, AI insights, profile or settings.";
		};
	}

	private String renderPlatform(Map<String, Object> d) {
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

	private String renderSchool(Map<String, Object> d) {
		String schoolName = str(d, "schoolName");
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
		String schoolName = str(d, "schoolName");
		StringBuilder sb = new StringBuilder();
		sb.append("**").append(schoolName.isBlank() ? "School roster" : schoolName + " roster").append("**\n");

		List<Map<String, Object>> teachers = maps(d, "teachers");
		List<Map<String, Object>> students = maps(d, "students");
		String teacherCount = num(d, "teacherCount");
		String studentCount = num(d, "studentCount");
		if (!teacherCount.isBlank()) {
			sb.append("- **Teachers:** ").append(teacherCount).append('\n');
		}
		if (!studentCount.isBlank()) {
			sb.append("- **Students:** ").append(studentCount).append('\n');
		}

		if (!teachers.isEmpty()) {
			sb.append("\n**Teachers**\n");
			for (Map<String, Object> teacher : teachers) {
				appendPerson(sb, teacher, "schoolName", "subject", "department", "designation", "experience",
						"qualification", "email", "phone", "employeeId", "joinedAt", "classes");
			}
		}
		if (!students.isEmpty()) {
			sb.append("\n**Students**\n");
			for (Map<String, Object> student : students) {
				appendPerson(sb, student, "schoolName", "standard", "division", "rollNumber", "studentId",
						"assignedTeacher", "email", "phone");
			}
		}

		String summary = str(d, "summary");
		if (teachers.isEmpty() && students.isEmpty() && !summary.isBlank()) {
			sb.append('\n').append(summary).append('\n');
		}
		return trimOrNull(sb);
	}

	private String renderUsers(Map<String, Object> d) {
		StringBuilder sb = new StringBuilder("**Platform users**\n");
		String roleFilter = str(d, "roleFilter");
		addLine(sb, "Total users", num(d, "totalUsers"));
		addLine(sb, "Users shown", num(d, "userCount"));
		if (!roleFilter.isBlank()) {
			addLine(sb, "Role filter", roleFilter);
		}

		List<Map<String, Object>> users = maps(d, "users");
		if (!users.isEmpty()) {
			sb.append("\n**Users**\n");
			for (Map<String, Object> user : users) {
				appendPerson(sb, user, "role", "schoolName", "email", "phone", "status");
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
		return trimOrNull(sb);
	}

	private String renderAccount(Map<String, Object> d) {
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
		StringBuilder sb = new StringBuilder("**Quick navigation for your role**\n");
		for (Map<String, Object> page : pages) {
			String label = str(page, "label");
			if (label.isBlank()) {
				continue;
			}
			sb.append("- **").append(label).append("**");
			String route = str(page, "route");
			if (!route.isBlank()) {
				sb.append(" — `").append(route).append('`');
			}
			sb.append('\n');
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
		}
		if (containsWord(m, "streak", "streaks")) {
			matched |= metric(sb, d, "Current Streak", "currentStreak");
			matched |= metric(sb, d, "Longest Streak", "longestStreak");
		}
		if (containsWord(m, "practice", "practiced", "practise", "practicing", "minutes", "minute", "time")) {
			matched |= metric(sb, d, "Total Practice Minutes", "totalPracticeMinutes");
		}
		if (containsWord(m, "speaking", "speak", "spoken", "session", "sessions")) {
			matched |= metric(sb, d, "Total Speaking Sessions", "totalSpeakingSessions");
		}
		if (containsWord(m, "grammar", "checks", "check")) {
			matched |= metric(sb, d, "Total Grammar Checks", "totalGrammarChecks");
		}
		if (containsWord(m, "vocabulary", "vocab", "words", "word")) {
			matched |= metric(sb, d, "Total Vocabulary Words", "totalVocabularyWords");
		}

		if (!matched) {
			// Broad question ("how is this student doing?") — fall back to the full picture.
			return summaryOr(d, null);
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
}
