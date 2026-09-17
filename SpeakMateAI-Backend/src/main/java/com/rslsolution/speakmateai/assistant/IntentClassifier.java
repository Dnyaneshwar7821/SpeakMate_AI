package com.rslsolution.speakmateai.assistant;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.dto.assistant.AssistantRequest;
import com.rslsolution.speakmateai.dto.groq.GroqChatRequest;
import com.rslsolution.speakmateai.enums.Role;

/**
 * First leg of the assistant pipeline: classifies the user's question into one
 * of the {@link AssistantIntent} values using Groq in JSON mode (low temperature).
 * The extracted entity params (student name, class, school, ...) are kept for the
 * data providers to resolve.
 */
@Component
public class IntentClassifier {

	private final GroqChatClient groqChatClient;
	private final ObjectMapper objectMapper;

	private static final String SYSTEM_PROMPT = """
			You are the intent classifier of the SpeakMate AI assistant.
			Classify the user's question into EXACTLY ONE of these intents:
			- PLATFORM_OVERVIEW  : platform-wide stats, totals, OR cross-school comparisons/rankings (total students/schools/teachers/revenue; registered teachers; active users; which schools have the most students; top schools by enrollment; compare schools; how many students does each school have; school-wise numbers; overall teaching staff; student population; school network; general student performance/progress across the platform).
			- SCHOOL_OVERVIEW    : statistics about ONE specific school (by school name/code), including its student/teacher strength, teaching staff, enrollment, or general student performance within that school.
			- CLASS_PERFORMANCE  : numbers/performance for a class, grade, standard, division or teacher.
			- STUDENT_PERFORMANCE: an individual student's progress or performance (by name, roll number, or id).
			- ACCOUNT_INFO       : the CALLER'S OWN account/identity only ("what is my logged-in email", "what is my name/role", "who am I logged in as", "which school am I in", "tell me about my account/profile").
			- BILLING            : revenue, subscriptions, plans, payments, invoices, billing.
			- SCHOOL_ROSTER      : actual names AND stored details of teachers/students ("name of the teacher", "list of students", "who are the teachers", "list of teachers", "show me the students", "which department is Digvijay Patil in", "which subject does he teach", "when did he join the school", "what is his qualification", "how much experience does he have", "tell me about Siddhi Narke", "details for Siddhi Narke").
			- NAVIGATION_HELP    : ONLY pure page-locating or navigation questions ("where is X", "how do I open Y", "how do I find Z", "take me to", "go to the page", "how do I navigate to").
			- SCHOOL_DASHBOARD   : the school-admin DASHBOARD page KPIs (total students/teachers/classes, active vs inactive students, lessons completed, result summary/tallies, average result percentage).
			- RESULTS_ANALYTICS  : the school-admin RESULTS page (pass/fail counts, pass %, average %, highest/lowest %, per-standard breakdown of exam/test results).
			- AI_INSIGHTS        : the AI INSIGHTS page (fluency, pronunciation, vocabulary, grammar, speaking time, top speakers, mispronounced words).
			- PROFILE_SETTINGS   : the caller's OWN profile/settings page (settings/preferences and profile extras: department, joining date, contact, appearance, two-factor).
			- PLATFORM_USERS     : a Super Admin asking for the actual LIST/NAMES of user accounts on the platform ("names of all users", "list of all users", "who are all the users", "show me all users", "every user on the platform", "list the accounts"). This is the All Users directory, NOT a count/total.
			- ACCESS_DENIED      : anything else, or anything outside the caller's role scope.

			MOST IMPORTANT RULE: any question about data, numbers, counts, totals, rankings, performance, progress, staff, student population, school networks, or person details is a DATA or ROSTER question and is NEVER NAVIGATION_HELP. Only pure page-locating or navigation questions ("where is the page", "take me to") are NAVIGATION_HELP.

			NATURAL LANGUAGE RULE: Natural, indirect, or conversational inquiries about data must resolve to the corresponding data intent:
			- "How large is our teaching staff?" -> PLATFORM_OVERVIEW
			- "What's our current student population?" -> PLATFORM_OVERVIEW
			- "What does our current school network look like?" -> PLATFORM_OVERVIEW
			- "Can you tell me about the educators currently on the platform?" -> PLATFORM_OVERVIEW
			- "How many learners are currently using the platform?" -> PLATFORM_OVERVIEW
			- "How many teachers does Ekvira Highschool have?" -> SCHOOL_OVERVIEW (params: {"schoolName":"Ekvira Highschool"})
			- "Can you tell me about the teaching staff at Ekvira Highschool?" -> SCHOOL_OVERVIEW (params: {"schoolName":"Ekvira Highschool"})
			- "What does the teacher strength look like at Ekvira Highschool?" -> SCHOOL_OVERVIEW (params: {"schoolName":"Ekvira Highschool"})
			- "Tell me about Siddhi Narke" -> SCHOOL_ROSTER (params: {"studentName":"Siddhi Narke"})
			- "What can you tell me about Siddhi Narke?" -> SCHOOL_ROSTER (params: {"studentName":"Siddhi Narke"})
			- "I want to see the details for Siddhi Narke" -> SCHOOL_ROSTER (params: {"studentName":"Siddhi Narke"})
			- "How is Siddhi Narke performing?" -> STUDENT_PERFORMANCE (params: {"studentName":"Siddhi Narke"})

			ROLE-SCOPING RULE: a generic count/total/performance question ("total students", "how many students do we have", "my school overview", "how are the students performing?", "can you give me an idea of how students are progressing?") asked by a non-Super-Admin refers to THEIR OWN scope: School Admin -> their own school (SCHOOL_OVERVIEW), Teacher -> their own classes/students (CLASS_PERFORMANCE), Student -> their own progress (STUDENT_PERFORMANCE). Never classify such questions as PLATFORM_OVERVIEW for non-super-admins. For Super Admin, generic questions without a specific school or student refer to the platform (PLATFORM_OVERVIEW).

			Examples:
			Q: "Which schools have the most students?" -> PLATFORM_OVERVIEW
			Q: "How many students does each school have?" -> PLATFORM_OVERVIEW
			Q: "How many total students are on the platform?" -> PLATFORM_OVERVIEW
			Q: "How many teachers are registered on the platform?" -> PLATFORM_OVERVIEW
			Q: "How many total teachers are on the platform?" -> PLATFORM_OVERVIEW
			Q: "How many active teachers are there?" -> PLATFORM_OVERVIEW
			Q: "How many total classes are on the platform?" -> PLATFORM_OVERVIEW
			Q: "How many standards exist across all schools?" -> PLATFORM_OVERVIEW
			Q: "How many school admins are there in total?" -> PLATFORM_OVERVIEW
			Q: "How many active users do we have?" -> PLATFORM_OVERVIEW
			Q: "What does our current school network look like?" -> PLATFORM_OVERVIEW
			Q: "How large is our teaching staff?" -> PLATFORM_OVERVIEW
			Q: "What's our current student population?" -> PLATFORM_OVERVIEW
			Q: "Can you tell me about the educators currently on the platform?" -> PLATFORM_OVERVIEW
			Q: "How many learners are currently using the platform?" -> PLATFORM_OVERVIEW
			Q: "What is the total revenue this month?" -> BILLING
			Q: "Name of the teacher" -> SCHOOL_ROSTER
			Q: "List of students" -> SCHOOL_ROSTER
			Q: "Who are the teachers?" -> SCHOOL_ROSTER
			Q: "What are the names of the students?" -> SCHOOL_ROSTER
			Q: "Give me the list of teachers" -> SCHOOL_ROSTER
			Q: "Names of all users" -> PLATFORM_USERS
			Q: "List of all users" -> PLATFORM_USERS
			Q: "Show me all the users" -> PLATFORM_USERS
			Q: "Which department is Digvijay Patil in?" -> SCHOOL_ROSTER
			Q: "In which department is Digvijay Patil allocated?" -> SCHOOL_ROSTER
			Q: "Which subject does Digvijay Patil teach?" -> SCHOOL_ROSTER
			Q: "When did he join the school?" -> SCHOOL_ROSTER
			Q: "What is Digvijay Patil's qualification and experience?" -> SCHOOL_ROSTER
			Q: "Tell me about Siddhi Narke" -> SCHOOL_ROSTER
			Q: "What can you tell me about Siddhi Narke?" -> SCHOOL_ROSTER
			Q: "I want to see the details for Siddhi Narke" -> SCHOOL_ROSTER
			Q: "How many students are in Green Valley High?" -> SCHOOL_OVERVIEW
			Q: "How many teachers does Ekvira Highschool have?" -> SCHOOL_OVERVIEW
			Q: "Can you tell me about the teaching staff at Ekvira Highschool?" -> SCHOOL_OVERVIEW
			Q: "What does the teacher strength look like at Ekvira Highschool?" -> SCHOOL_OVERVIEW
			Q: "How did class 5-A perform last month?" -> CLASS_PERFORMANCE
			Q: "How is Aarav Sharma's progress?" -> STUDENT_PERFORMANCE
			Q: "How is Siddhi Narke performing?" -> STUDENT_PERFORMANCE
			Q: "What is my logged-in email?" -> ACCOUNT_INFO
			Q: "Who am I logged in as?" -> ACCOUNT_INFO
			Q: "What is my name and role?" -> ACCOUNT_INFO
			Q: "Where can I find the analytics page?" -> NAVIGATION_HELP
			Q: "How do I open my dashboard?" -> NAVIGATION_HELP
			Q: "What are my dashboard KPIs?" -> SCHOOL_DASHBOARD
			Q: "How many lessons have been completed?" -> SCHOOL_DASHBOARD
			Q: "How many students passed their results?" -> RESULTS_ANALYTICS
			Q: "What is the average result percentage?" -> RESULTS_ANALYTICS
			Q: "What is the average fluency score?" -> AI_INSIGHTS
			Q: "Who are the top speakers?" -> AI_INSIGHTS
			Q: "What are my settings?" -> PROFILE_SETTINGS
			Q: "Is dark mode enabled on my profile?" -> PROFILE_SETTINGS

			Do NOT answer the user's question - you only classify it.
			Respond with strict JSON only, no markdown, no fences, no explanation, in this shape:
			{"intent":"PLATFORM_OVERVIEW","params":{"studentName":"...","className":"...","schoolName":"..."}}
			Use empty strings when a param is unknown. Do not invent values.
			""";

	// Deterministic school-name extraction patterns (used when Groq is
	// unavailable or returns empty entity params so a school question never
	// degrades to a "data not available" NO DATA reply). Fragments are captured
	// up to a clause/punctuation boundary and then cleaned by
	// cleanSchoolFragment, so trailing sentence words never leak into the name.
	// A period terminates the fragment ONLY when it actually ends a sentence:
	// followed by whitespace AND the first letter of the next sentence, or the end
	// of the message. An internal period belongs to a school-name abbreviation
	// ("St.Vincent High School", "St. Mary School"), so treating every period as a
	// boundary truncated the capture to "St" and the school question degraded to
	// the generic NO DATA reply whenever the LLM leg failed.
	private static final String SCHOOL_CLAUSE_BOUNDARY = "(?:\\s+(?:and|or|but|with|have|has|are|do|does|who|how|when|where|currently|please|tell)\\b|[,;:!?]|\\.(?=\\s[A-Za-z]|$)|$)";
	private static final Pattern SCHOOL_DOES_HAVE_PATTERN = Pattern.compile(
			"\\b(?:does|did|if)\\s+(.+?)\\s+(?:have|has)\\b",
			Pattern.CASE_INSENSITIVE);
	private static final Pattern SCHOOL_NAMED_PATTERN = Pattern.compile(
			"\\bschool\\s+(?:named|called)\\s+(.+?)" + SCHOOL_CLAUSE_BOUNDARY,
			Pattern.CASE_INSENSITIVE);
	private static final Pattern SCHOOL_PREPOSITION_PATTERN = Pattern.compile(
			"\\b(?:in|at|of|for|from|about)\\s+(.+?)" + SCHOOL_CLAUSE_BOUNDARY,
			Pattern.CASE_INSENSITIVE);
	private static final Pattern SCHOOL_BEFORE_TOKEN_PATTERN = Pattern.compile(
			"([A-Za-z][A-Za-z0-9'&.]*(?:\\s+[A-Za-z][A-Za-z0-9'&.]*){0,4}\\s+(?:school|highschool|high school|vidyalaya|academy|college|institute|university|convent|campus|polytechnic|vidyamandir|gurukul|high))\\b",
			Pattern.CASE_INSENSITIVE);
	/**
	 * Interrogative / domain words that can leak into the FRONT of a fallback
	 * name capture ("info of St.Vincent High" -> "St.Vincent High"). They can
	 * never start a school name.
	 */
	private static final Set<String> SCHOOL_NAME_LEADING_FILLER = Set.of(
			"info", "information", "details", "about", "summary", "overview",
			"tell", "me", "give", "show", "list", "please", "of", "in", "at",
			"for", "the", "a", "an", "my", "our", "this", "that", "which",
			"what", "how", "many", "all", "and", "teachers", "teacher", "students",
			"student", "educators", "educator", "learners", "learner", "staff",
			"classes", "class", "does", "do", "did", "has", "have", "are", "is",
			"can", "could", "would", "should", "strength", "number", "numbers",
			"count", "counts", "total", "totals", "performance", "performing",
			"progress", "progressing", "see", "view", "check", "know", "want",
			"like", "to", "there", "teaching", "current");
	private static final List<String> SCHOOL_NAME_TRAILING_FILLER = List.of(
			"and", "or", "with", "for", "at", "in", "the", "of", "to", "please",
			"tell", "me", "currently", "enrolled", "registered", "present",
			"today", "now", "have", "has", "had", "are", "is", "do", "does", "there",
			"offered", "providing", "located", "based", "running", "current");

	/**
		* A capitalized multi-word PERSON name ("Digvijay Patil", "Nandini Patil"),
		* used to narrow a SCHOOL_ROSTER detail question to one teacher/student.
		*/
	private static final Pattern PERSON_NAME_PATTERN = Pattern.compile(
			"\\b([A-Z][a-z]{2,}(?:\\s+[A-Z][a-z]{2,}){1,2})\\b");
	/**
		* Words that can never START a person name. Rejecting them keeps an
		* interrogative or a domain noun ("Which Department ...", "What Subject ...",
		* "In Which Department ...") from being mistaken for a name, while still
		* allowing the real name that follows in the same sentence.
		*/
	private static final Set<String> NON_NAME_SENTENCE_STARTS = Set.of(
			"which", "what", "when", "where", "who", "whose", "whom", "how",
			"does", "did", "do", "the", "and", "give", "tell", "show", "list",
			"name", "names", "please", "about", "this", "that", "these", "those",
			"department", "departments", "subject", "subjects", "qualification",
			"experience", "designation", "teacher", "teachers", "student",
			"students", "school", "schools", "class", "classes", "standard",
			"division", "date", "joining", "joined", "employee", "roll",
			"number", "phone", "email", "find", "get", "search");

	/**
		* Stored per-person attributes that can be asked about a NAMED teacher or
		* student ("which department is Digvijay Patil in", "standard of Vijay
		* Patil", "what is the roll number of Tushar Pawar", "which class is he
		* in"). A question carrying one of these markers AND a person name is a
		* SCHOOL_ROSTER detail question - the roster provider is the only provider
		* holding that per-person profile. Kept in one place so the roster
		* detection and the roster param enrichment can never drift apart (a drift
		* previously left bare attribute questions such as "standard of Vijay
		* Patil" unrouted, producing a generic NO DATA reply).
		*/
	private static final List<String> PERSON_DETAIL_MARKERS = List.of(
			"department", "subject", "designation", "qualification",
			"experience", "employee id", "employeeid", "joined",
			"join the school", "join school", "date of joining", "when did",
			"standard", "division", "section", "roll number", "roll no", "roll",
			"class", "grade");

	/**
		* Tokens that mark a phrase as a SCHOOL name rather than a person name
		* ("Podar International School", "Bright Academy"). Used to reject a
		* school name that the capitalized {@link #PERSON_NAME_PATTERN} would
		* otherwise mistake for a person, so a school-scoped question ("list of
		* students in Podar International School") is never narrowed to a
		* non-existent person.
		*/
	private static final Set<String> SCHOOL_NAME_TOKENS = Set.of(
			"school", "schools", "academy", "college", "institute",
			"international", "public", "higher", "high", "secondary", "primary",
			"vidyalaya", "convent", "campus", "university", "board",
			// Concatenated institution words. Schools are frequently stored with
			// "high"+"school" run together ("Ekvira Highschool", "Mahajan
			// highschool"), and such a name carries no standalone "school"/
			// "high" token - without these the capitalized two-word phrase is
			// mistaken for a person ("Ekvira Highschool") and the school name is
			// dropped, degrading the question to a generic NO DATA reply.
			"highschool", "highschools", "vidyamandir", "polytechnic",
			"kindergarten", "preschool", "montessori", "gurukul");

	/**
		* An account EMAIL pasted into a question ("what is total xp of
		* siddhi.narke@gmail.com"). Used to resolve the named student when the
		* caller gives an email instead of (or in addition to) a name.
		*/
	private static final Pattern EMAIL_PATTERN = Pattern.compile(
			"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");

	/**
		* Words that can never be part of a student's NAME in a per-student
		* metric question ("what is total xp of onkar awate"). Used to peel the
		* question/metric words away from a LOWERCASE name, which the
		* capitalized {@link #PERSON_NAME_PATTERN} cannot see. Chatters rarely
		* capitalize names, so without this an all-lowercase name ("onkar
		* awate") would be missed and the question would degrade to the
		* navigation page list.
		*/
	private static final Set<String> NAME_METRIC_STOPWORDS = Set.of(
			// question / scaffolding words
			"what", "whats", "which", "who", "whos", "whose", "whom", "when",
			"where", "how", "is", "are", "was", "were", "am", "be", "been",
			"the", "a", "an", "of", "for", "to", "in", "on", "at", "by", "with",
			"and", "or", "please", "tell", "me", "give", "show", "list", "find",
			"get", "search", "about", "do", "does", "did", "can", "could",
			"would", "should", "has", "have",
			// domain nouns that are never a name
			"student", "students", "learner", "learners", "teacher", "teachers",
			"school", "schools", "class", "classes", "standard", "division",
			"roll", "number", "name", "names", "email", "mail", "user", "users",
			// pronouns / determiners
			"his", "her", "their", "him", "she", "he", "they", "them", "this",
			"that", "these", "those",
			// platform-wide qualifiers (must NOT be treated as a name)
			"all", "every", "each", "any", "across", "platform", "overall",
			"everything", "everyone", "everybody", "many", "much", "more",
			"most", "today", "now", "currently",
			// metric words
			"xp", "exp", "points", "point", "score", "scores", "level", "levels",
			"streak", "streaks", "progress", "practice", "practiced", "practise",
			"practicing", "session", "sessions", "grammar", "vocabulary", "word",
			"words", "minute", "minutes", "time", "total", "current", "longest",
			"speaking", "spoken", "checks", "check", "learned", "learnt",
			"lesson", "lessons", "topic", "topics", "module", "modules",
			"chapter", "chapters", "completed", "complete", "completes",
			"completing", "completion", "finished", "finish", "remaining",
			"pending", "done");

	/**
		* Extra scaffolding words that can never belong to a person's name in a
		* SCHOOL_ROSTER question, on top of {@link #NAME_METRIC_STOPWORDS}. These
		* are the verbs/nouns that surround a roster name ("classes ASSIGNED to
		* chetan mali", "when did chetan mali JOIN the school"); without them the
		* lowercase run would swallow the trailing scaffolding word and produce a
		* name the roster provider can never match.
		*/
	private static final Set<String> ROSTER_NAME_STOPWORDS = Set.of(
			"assign", "assigned", "assigning", "assigns", "teach", "teaches",
			"teaching", "taught", "join", "joined", "joining", "department",
			"departments", "subject", "subjects", "qualification",
			"qualifications", "experience", "designation", "designations",
			"id", "ids", "employee", "employeeid", "phone", "contact",
			"handle", "handles", "handling");

	public IntentClassifier(GroqChatClient groqChatClient, ObjectMapper objectMapper) {
		this.groqChatClient = groqChatClient;
		this.objectMapper = objectMapper;
	}

	public IntentResult classify(String message, Role role) {
		return classify(message, role, null);
	}

	public IntentResult classify(String message, Role role, List<AssistantRequest.MessageTurn> history) {
		List<GroqChatRequest.Message> messages = new ArrayList<>();
		messages.add(new GroqChatRequest.Message("system", SYSTEM_PROMPT));

		if (history != null && !history.isEmpty()) {
			int startIdx = Math.max(0, history.size() - 4);
			for (int i = startIdx; i < history.size(); i++) {
				AssistantRequest.MessageTurn turn = history.get(i);
				if (turn != null && turn.getContent() != null && !turn.getContent().isBlank()) {
					String turnRole = "assistant".equalsIgnoreCase(turn.getRole()) ? "assistant" : "user";
					messages.add(new GroqChatRequest.Message(turnRole, turn.getContent()));
				}
			}
		}

		String roleContext = role == null ? "UNKNOWN" : role.name();
		messages.add(new GroqChatRequest.Message("user",
				"Caller role: " + roleContext + ". Question: " + message));

		String raw;
		try {
			raw = groqChatClient.chatJson(messages, 0.2);
		} catch (Exception e) {
			// Transient Groq failure (429/5xx/413): never 500 - fall back to the
			// deterministic classifier so data questions still get answered.
			return deterministicFallback(message, null, role, history);
		}

		try {
			Map<String, Object> json = extractJson(raw);
			String intentName = json.get("intent") != null ? json.get("intent").toString() : null;
			AssistantIntent intent = parseIntent(intentName);

			IntentResult contextualFollowUp = contextualFollowUpCheck(message, role, history);
			if (contextualFollowUp != null) {
				return contextualFollowUp;
			}
			// Deterministic safety net: a data question must never be answered as
			// navigation help, even if the LLM misclassifies it.
			if (intent == AssistantIntent.NAVIGATION_HELP) {
				AssistantIntent override = dataQuestionOverride(message, role);
				if (override != null) {
					intent = override;
				}
			}
			// Platform-wide total questions ("on the platform", "across all schools",
			// or generic platform entity counts such as registered teachers / active
			// users) must never be answered by a per-school/per-student provider that
			// lacks the platform-wide totals.
			if (intent != AssistantIntent.PLATFORM_OVERVIEW) {
				AssistantIntent platformOverride = platformWideOverride(message, role);
				if (platformOverride != null) {
					intent = platformOverride;
				}
			}
			// Deterministic safety net for the caller's OWN account/identity:
			// "what is my logged-in email?", "who am I?", "my role" etc. must
			// never degrade to ACCESS_DENIED or navigation help — the account
			// provider answers these directly from the resolved ActorContext.
			AssistantIntent accountOverride = accountInfoOverride(message, role);
			if (accountOverride != null) {
				intent = accountOverride;
			}
			// Deterministic safety net for roster/name questions ("name of the
			// teacher", "list of students", "who are the teachers"): the roster
			// provider returns actual NAMES, so these must never degrade to the
			// old navigation punt ("go to the Teachers page").
			AssistantIntent roster = rosterOverride(message, role);
			if (roster != null) {
				intent = roster;
			}
			// Deterministic safety net for Super-Admin user-directory questions
			// ("names of all users", "list of all users"): a Super Admin can access
			// every dataset the web app exposes (the All Users page at /admin/users),
			// so these must reach the platform users provider instead of degrading to
			// a role-scope ACCESS_DENIED denial.
			AssistantIntent usersOverride = usersListOverride(message, role);
			if (usersOverride != null) {
				intent = usersOverride;
			}
			// Deterministic safety net for Super-Admin per-user ATTRIBUTE follow-ups
			// that name no dataset ("is he active", "what is his status?"). These are
			// pronoun-referential continuations of a user list and must reach the
			// platform users provider (which carries each account's status) rather
			// than degrading to the denial a Super Admin must never see.
			AssistantIntent userAttribute = superAdminUserAttributeOverride(message, role);
			if (userAttribute != null) {
				intent = userAttribute;
			}
			// Deterministic safety net for a NAMED student's individual metrics
			// ("what is total xp of Siddhi Narke", "what is the total xp of
			// siddhi.narke@gmail.com"). The word "total" makes the LLM treat these
			// as a count and return NAVIGATION_HELP, but the metrics (xp, level,
			// streak, ...) live on the student's Progress record, so they must
			// route to STUDENT_PERFORMANCE (which carries the XP) instead of the
			// navigation page list. A person name or email is required, so a
			// platform-wide "total xp" question is never hijacked.
			AssistantIntent studentMetric = studentMetricOverride(message, role);
			if (studentMetric != null) {
				intent = studentMetric;
			}
			// Action/process questions ("how do I add a teacher?", "how can I change
			// my password?") are navigation help, not data queries or denials. Only
			// applied when the LLM classified the question as a denial or navigation,
			// so a genuine data question already routed to a scoped provider (or
			// upgraded from NAVIGATION_HELP by the data override above) is never
			// downgraded back to navigation.
			if (intent == AssistantIntent.ACCESS_DENIED
					|| intent == AssistantIntent.NAVIGATION_HELP) {
				AssistantIntent nav = navigationOverride(message, role);
				if (nav != null) {
					intent = nav;
				}
			}
			// Role-aware scope safety net: generic data questions from non-super-admins
			// ("how many students do we have?", "total students", "my school overview")
			// must never reach a platform provider they cannot access — that degrades to
			// a confusing ACCESS_DENIED "no data". Route them to the caller's own scoped
			// provider, or to a graceful denial when the question is truly platform-wide.
			AssistantIntent scoped = scopedDataOverride(message, role);
			if (scoped != null) {
				intent = scoped;
			}
			// Page-data safety net: dashboard-KPI / results / AI-insights /
			// profile-settings questions map to their own page intents so the
			// chatbot answers from the same data shown on those pages.
			AssistantIntent page = pageDataOverride(message, role);
			if (page != null) {
				intent = page;
			}
			// Deterministic safety net for a named-SCHOOL info question that
			// carries no count/statistic marker ("info of Ekvira Highschool",
			// "details about St.Vincent High School", "tell me about Greenwood
			// High"). dataQuestionOverride only handles count/statistics
			// phrasings, so these used to depend entirely on the LLM: when the
			// LLM missed the entity (or returned NAVIGATION_HELP) the school name
			// was never extracted and the provider answered the generic NO DATA
			// reply. An explicit school entity word is required, so a person or
			// platform-directory question is never captured.
			AssistantIntent schoolInfo = schoolInfoOverride(message, role);
			if (schoolInfo != null) {
				intent = schoolInfo;
			}
			@SuppressWarnings("unchecked")
			Map<String, Object> params = json.get("params") instanceof Map
					? (Map<String, Object>) json.get("params")
					: Map.of();
			// Deterministic safety net for SCHOOL_OVERVIEW: even when Groq
			// returns valid JSON it may leave schoolName blank. Re-extract the
			// school name from the question so the provider can resolve it.
			if (intent == AssistantIntent.SCHOOL_OVERVIEW) {
				Object schoolName = params.get("schoolName");
				if (schoolName == null || schoolName.toString().isBlank()) {
					String extracted = extractSchoolName(message);
					if (extracted.isEmpty() && history != null && !history.isEmpty()) {
						extracted = resolvePreviousSchoolName(history);
					}
					if (!extracted.isEmpty()) {
						Map<String, Object> enriched = new java.util.LinkedHashMap<>(params);
						enriched.put("schoolName", extracted);
						params = enriched;
					}
				}
			}
			// Deterministic roster param enrichment: derive the entity type
			// ("teachers"/"students") and (Super Admin only) the school name so
			// the roster provider can resolve the right list even when Groq
			// returned empty params.
			if (intent == AssistantIntent.SCHOOL_ROSTER) {
				params = enrichRosterParams(message, role, params);
			}
			// Deterministic per-student metric enrichment: derive the student
			// name (or email) from the question so the STUDENT_PERFORMANCE
			// provider can resolve the single named student even when Groq
			// returned empty params.
			if (intent == AssistantIntent.STUDENT_PERFORMANCE) {
				params = enrichStudentMetricParams(message, params);
			}
			return new IntentResult(intent, params, raw);
		} catch (Exception e) {
			// Groq returned prose or unusable JSON: fall back to the deterministic
			// classifier instead of the old navigation-only "data not available" reply.
			return deterministicFallback(message, raw, role, history);
		}
	}

	/**
	 * Deterministic classification used when Groq is unavailable or returns
	 * unusable output. Data questions keep their data intent; everything else
	 * degrades to a neutral navigation-help answer (never a 500).
	 */
	private IntentResult deterministicFallback(String message, String raw, Role role) {
		return deterministicFallback(message, raw, role, null);
	}

	private IntentResult deterministicFallback(String message, String raw, Role role, List<AssistantRequest.MessageTurn> history) {
		IntentResult contextual = contextualFollowUpCheck(message, role, history);
		if (contextual != null) {
			return contextual;
		}
		// Page-data questions map to their own page intents even without Groq.
		AssistantIntent page = pageDataOverride(message, role);
		if (page != null) {
			return new IntentResult(page, Map.of(), raw);
		}
		AssistantIntent accountOverride = accountInfoOverride(message, role);
		if (accountOverride != null) {
			return new IntentResult(accountOverride, Map.of(), raw);
		}
		// Deterministic per-student metric questions ("what is total xp of
		// Siddhi Narke") keep their STUDENT_PERFORMANCE intent (with the
		// extracted name/email) even when Groq is unavailable, otherwise they
		// would degrade to the navigation page list.
		AssistantIntent studentMetric = studentMetricOverride(message, role);
		if (studentMetric != null) {
			Map<String, Object> metricParams = enrichStudentMetricParams(message, new java.util.LinkedHashMap<>());
			return new IntentResult(studentMetric, metricParams, raw);
		}
		// Super-Admin user-directory questions ("names of all users") keep their
		// platform-users intent in the deterministic path too. Evaluated BEFORE the
		// roster override so this path mirrors classify(), where the later
		// usersListOverride wins over rosterOverride (e.g. "give me the list of all
		// users" is PLATFORM_USERS, not SCHOOL_ROSTER).
		AssistantIntent usersOverride = usersListOverride(message, role);
		if (usersOverride != null) {
			return new IntentResult(usersOverride, Map.of(), raw);
		}
		// Super-Admin per-user attribute follow-ups ("is he active") keep their
		// platform-users intent in the deterministic path too.
		AssistantIntent userAttribute = superAdminUserAttributeOverride(message, role);
		if (userAttribute != null) {
			return new IntentResult(userAttribute, Map.of(), raw);
		}
		// Roster/name questions ("name of the teacher", "list of students") keep
		// their roster intent and carry the derived entity params even in the
		// deterministic path, otherwise the provider cannot resolve a list.
		AssistantIntent roster = rosterOverride(message, role);
		if (roster != null) {
			Map<String, Object> params = new java.util.LinkedHashMap<>();
			params = enrichRosterParams(message, role, params);
			return new IntentResult(roster, params, raw);
		}
		AssistantIntent platformOverride = platformWideOverride(message, role);
		if (platformOverride != null) {
			return new IntentResult(platformOverride, Map.of(), raw);
		}
		// Role-aware scope safety net (deterministic path): generic data questions
		// from school admins/teachers/students route to their own scoped provider
		// instead of a platform provider they cannot access.
		AssistantIntent scoped = scopedDataOverride(message, role);
		if (scoped != null) {
			return new IntentResult(scoped, Map.of(), raw);
		}
		AssistantIntent override = dataQuestionOverride(message, role);
		if (override != null) {
			// Data questions must carry their entity params even in the
			// deterministic path, otherwise per-entity providers (school,
			// student, class) cannot resolve anything and answer "NO DATA".
			Map<String, Object> params = new java.util.LinkedHashMap<>();
			if (override == AssistantIntent.SCHOOL_OVERVIEW) {
				String extracted = extractSchoolName(message);
				if (!extracted.isEmpty()) {
					params.put("schoolName", extracted);
				}
			}
			if (override == AssistantIntent.STUDENT_PERFORMANCE) {
				params = enrichStudentMetricParams(message, params);
			}
			return new IntentResult(override, params, raw);
		}
		// A named-school INFO question ("info of Ekvira Highschool") carries no
		// count/statistic marker, so dataQuestionOverride above does not catch it
		// and it used to degrade to NAVIGATION_HELP whenever Groq was
		// unavailable. Route it to SCHOOL_OVERVIEW carrying the extracted school
		// name so the school provider can answer from real data.
		AssistantIntent schoolInfo = schoolInfoOverride(message, role);
		if (schoolInfo != null) {
			Map<String, Object> infoParams = new java.util.LinkedHashMap<>();
			String extractedSchool = extractSchoolName(message);
			if (!extractedSchool.isEmpty()) {
				infoParams.put("schoolName", extractedSchool);
			}
			return new IntentResult(schoolInfo, infoParams, raw);
		}
		return new IntentResult(AssistantIntent.NAVIGATION_HELP, Map.of(), raw);
	}

	/**
	 * Deterministic school-name extraction used when Groq is unavailable or
	 * returns empty entity params. Handles the common phrasings:
	 * "school named X" / "school called X", "... in/at/of/for X ...", and
	 * "... X school". Returns "" when no school name can be detected.
	 */
	private String extractSchoolName(String message) {
		if (message == null || message.isBlank()) {
			return "";
		}
		String m = message.trim();
		Matcher doesHaveMatcher = SCHOOL_DOES_HAVE_PATTERN.matcher(m);
		if (doesHaveMatcher.find()) {
			String doesHave = cleanSchoolFragment(doesHaveMatcher.group(1));
			if (isPlausibleSchoolName(doesHave)) {
				return doesHave;
			}
		}
		Matcher namedMatcher = SCHOOL_NAMED_PATTERN.matcher(m);
		if (namedMatcher.find()) {
			String named = cleanSchoolFragment(namedMatcher.group(1));
			if (isPlausibleSchoolName(named)) {
				return named;
			}
		}
		Matcher prepMatcher = SCHOOL_PREPOSITION_PATTERN.matcher(m);
		if (prepMatcher.find()) {
			String prep = cleanSchoolFragment(prepMatcher.group(1));
			// "standard of Vijay Patil" captures the PERSON name after "of"; that is
			// not a school, so keep looking instead of returning a name that can
			// never resolve (the question is then answered from the person's own
			// record instead of degrading to a generic NO DATA reply).
			if (isPlausibleSchoolName(prep)) {
				return prep;
			}
		}
		Matcher beforeMatcher = SCHOOL_BEFORE_TOKEN_PATTERN.matcher(m);
		if (beforeMatcher.find()) {
			String before = cleanSchoolFragment(beforeMatcher.group(1));
			if (isPlausibleSchoolName(before)) {
				return before;
			}
		}
		return "";
	}

	/**
	 * True when a fragment is a plausible school name: not an abbreviation,
	 * not a person name, not a generic system entity (e.g. "active accounts"),
	 * and either containing a recognized institution token or having at least
	 * one capitalized proper noun.
	 */
	private boolean isPlausibleSchoolName(String fragment) {
		if (fragment == null || fragment.isBlank()) {
			return false;
		}
		String trimmed = fragment.trim();
		if (isAbbreviationFragment(trimmed) || looksLikePersonName(trimmed)) {
			return false;
		}
		String lower = trimmed.toLowerCase(Locale.ROOT);
		if (lower.equals("school") || lower.equals("schools") || lower.equals("highschool")
				|| lower.equals("high school") || lower.equals("academy") || lower.equals("college")
				|| lower.contains("network") || lower.equals("the school") || lower.equals("a school")) {
			return false;
		}
		if (containsAnyWord(lower, List.of(
				"active accounts", "all accounts", "all users", "active users",
				"all teachers", "all students", "our teachers", "our students",
				"account", "accounts", "user", "users", "student", "students",
				"teacher", "teachers", "staff", "teaching staff", "everyone",
				"everything", "population", "network", "overview", "dashboard",
				"progress", "performance", "result", "results", "score", "scores",
				"lesson", "lessons", "billing", "subscription", "revenue", "plan", "plans",
				"fee", "fees", "invoice", "invoices", "payment", "payments"))) {
			boolean hasInstitutionWord = false;
			for (String token : lower.split("\\s+")) {
				if (SCHOOL_NAME_TOKENS.contains(token)) {
					hasInstitutionWord = true;
					break;
				}
			}
			if (!hasInstitutionWord) {
				return false;
			}
		}
		boolean hasSchoolToken = false;
		for (String token : lower.split("\\s+")) {
			if (SCHOOL_NAME_TOKENS.contains(token)) {
				hasSchoolToken = true;
				break;
			}
		}
		boolean hasCapital = trimmed.chars().anyMatch(Character::isUpperCase);
		return hasSchoolToken || hasCapital;
	}

	/**
		* True when a fragment is a bare abbreviation ("St", "St.", "Dr") instead of
		* a complete school name. Such a fragment can never resolve to a school, so it
		* must not be stored as the schoolName (the lookup would fail and the question
		* would degrade to the generic NO DATA reply).
		*/
	private boolean isAbbreviationFragment(String fragment) {
		if (fragment == null || fragment.isBlank()) {
			return true;
		}
		return fragment.trim().matches("(?i)^(?:st|dr|sr|mr|mrs|ms|shri|smt)\\.?$");
	}

	/**
	 * Cleans a raw school-name fragment captured from the question: collapses
	 * whitespace, strips a leading filler article ("the/my/our/this school"),
	 * and trims trailing filler words or numbers so only the school name remains.
	 */
	private String cleanSchoolFragment(String fragment) {
		if (fragment == null) {
			return "";
		}
		String f = fragment.replaceAll("\\s+", " ").trim();
		// Re-attach a period to the abbreviation it belongs to ("St . Vincent" ->
		// "St.Vincent") so the dotted school name is preserved verbatim.
		f = f.replaceAll("\\.\\s+", ".").trim();
		if (f.isEmpty()) {
			return "";
		}
		f = f.replaceFirst("^(?:the|a|an|my|our|this|that|which)\\s+", "").trim();
		// Strip leading interrogative / domain words leaked in by a fallback
		// capture ("info of St.Vincent High" -> "St.Vincent High").
		boolean stripped = true;
		while (stripped && !f.isEmpty()) {
			stripped = false;
			int firstSpace = f.indexOf(' ');
			String first = firstSpace >= 0 ? f.substring(0, firstSpace) : f;
			if (SCHOOL_NAME_LEADING_FILLER.contains(first.toLowerCase(Locale.ROOT))) {
				f = firstSpace >= 0 ? f.substring(firstSpace + 1).trim() : "";
				stripped = true;
			}
		}
		if (f.isEmpty()) {
			return "";
		}
		// Trim trailing filler tokens / digit groups (e.g. "... for 100 enrolled").
		boolean changed = true;
		while (changed && !f.isEmpty()) {
			changed = false;
			int lastSpace = f.lastIndexOf(' ');
			String last = lastSpace >= 0 ? f.substring(lastSpace + 1) : f;
			boolean filler = last.matches("\\d+") || SCHOOL_NAME_TRAILING_FILLER.contains(last.toLowerCase(Locale.ROOT));
			if (filler) {
				f = lastSpace >= 0 ? f.substring(0, lastSpace).trim() : "";
				changed = true;
			}
		}
		return f;
	}

	/**
	 * Extracts a JSON object from the model's response. Some models ignore
	 * json_object mode and wrap the JSON in markdown fences or prose, so we
	 * locate the outermost braces instead of requiring a bare JSON body.
	 */
	private Map<String, Object> extractJson(String raw) {
		if (raw == null) {
			throw new IllegalArgumentException("classifier response is empty");
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
			throw new IllegalArgumentException("no JSON object in classifier response");
		}
		try {
			return objectMapper.readValue(text.substring(start, end + 1),
					new TypeReference<Map<String, Object>>() {});
		} catch (Exception e) {
			throw new IllegalArgumentException("classifier response is not valid JSON: " + e.getMessage(), e);
		}
	}

	/**
		* Deterministic roster detection: questions that ask for the actual NAMES of
		* teachers/students ("name of the teacher", "list of students", "who are the
		* teachers") route to SCHOOL_ROSTER, whose provider returns the real names
		* instead of the old navigation punt. Gated to the roles that can see roster
		* data (Super Admin, School Admin, Teacher). Count questions ("how many
		* teachers", "which teacher has the most students") are data questions, not
		* roster questions, and are skipped.
		* Returns {@code null} when no roster question is detected.
		*/
	private AssistantIntent rosterOverride(String message, Role role) {
		if (message == null || role == null) {
			return null;
		}
		if (role != Role.SUPER_ADMIN && role != Role.SCHOOL_ADMIN && role != Role.TEACHER) {
			return null;
		}
		// A self-anchored account question ("my phone", "my joined date",
		// "my location") belongs to accountInfoOverride, which answers from the
		// already-resolved ActorContext. "joined" is a PERSON_DETAIL_MARKER, so
		// without this guard the lone detailMarker fall-through at the bottom of
		// this method (return (roster || detailMarker) ? SCHOOL_ROSTER : null)
		// would clobber ACCOUNT_INFO and send "my joined date" to the school
		// roster, which replies with roster data instead of the caller's own
		// join date (reported: "my joined date ... I don't have that information").
		if (accountInfoOverride(message, role) != null) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		// A question about a SPECIFIC person's stored attributes ("which department
		// is Digvijay Patil in", "which subject does he teach", "when did he join
		// the school", "his qualification", "standard of Vijay Patil") must reach the
		// roster provider - it is the only provider that holds the per-person
		// teacher/student profile. The word "teacher"/"student" is optional here
		// because the person is named (or referred to with a pronoun), so relying on
		// the name-list phrases below is not enough.
		//
		// This check runs BEFORE the count-marker bail below because a person's
		// "roll number of <name>" phrase contains the substring "number of", which
		// would otherwise be mistaken for a count/stats question and drop the
		// person-detail question before the roster provider could answer it.
		boolean detailMarker = containsAny(m, PERSON_DETAIL_MARKERS);
		boolean pronounReference = containsAny(m, List.of(" he ", " she ", " him ", " her "));
		if (detailMarker && (pronounReference || !extractAnyPersonFocusName(message).isBlank())) {
			return AssistantIntent.SCHOOL_ROSTER;
		}
		// A question that asks ABOUT a named person ("tell me about Siddhi
		// Narke", "what can you tell me about Siddhi Narke?", "I want to see the
		// details for Siddhi Narke") names no attribute keyword, so PERSON_DETAIL_MARKERS
		// does not fire and the question used to degrade to navigation help. The
		// about/details wording plus a resolvable PERSON name is the semantic
		// signal that the per-person roster profile is wanted. A person name is
		// required, so a school ("tell me about Ekvira Highschool") is rejected
		// here (looksLikeSchoolName -> blank focus name) and is still handled by
		// schoolInfoOverride, and a self-anchored phrasing ("info about me") was
		// already returned to accountInfoOverride by the guard above.
		boolean personAboutMarker = containsAny(m, List.of(
				"tell me about", "tell me more about", "what can you tell me about",
				"details for", "details about", "details of", "details on",
				"information about", "info about", "info of", "everything about",
				"more about", "profile of", "want to see the details for",
				"want to see details for", "show details for", "show me details for"));
		if (personAboutMarker && !extractAnyPersonFocusName(message).isBlank()) {
			return AssistantIntent.SCHOOL_ROSTER;
		}
		// A count/stats question is a data question, not a name-list question:
		// "how many teachers", "which teacher has the most students".
		boolean countMarker = containsAny(m, List.of(
				"how many", "how much", "total", "count", "number of", "most",
				"top ", "highest", "lowest", "average", "ranking", "ranked",
				"compare", "comparison", "percentage", "marks", "scores",
				"attendance", "stats", "overview", "performance"));
		if (countMarker) {
			return null;
		}
		boolean roster = containsAny(m, List.of(
				"name of the teacher", "name of the teachers", "name of teacher",
				"name of teachers", "name of the student", "name of the students",
				"name of student", "name of students", "name of my teacher",
				"name of my teachers", "name of my student", "name of my students",
				"teacher's name", "teachers' name", "teacher name", "teachers name",
				"student's name", "students' name", "student name", "students name",
				"names of the teachers", "names of the students", "names of teachers",
				"names of students", "names of my teachers", "names of my students",
				"list of teachers", "list of students", "list of the teachers",
				"list of the students", "list my teachers", "list my students",
				"list of all teachers", "list of all students",
				"list of all the teachers", "list of all the students",
				"list of my teachers", "list of my students",
				"give me the list of teachers", "give me the list of students",
				"give me a list of teachers", "give me a list of students",
				"names of all the teachers", "names of all the students",
				"who are the teachers", "who are the students", "who is the teacher",
				"who is the student", "who are my teachers", "who are my students",
				"who teaches me", "who is my teacher", "who is my student",
				"which teacher", "which student", "which teachers", "which students",
				"tell me the name of", "tell me the names of",
				"show me the teachers", "show me the students", "show me my teachers",
				"show me my students", "show the teachers", "show the students",
				"give me the list of", "give me a list of", "give me the names of",
				"teachers in my school", "students in my school"));
		return (roster || detailMarker) ? AssistantIntent.SCHOOL_ROSTER : null;
	}

	/**
		* Deterministic Super-Admin user-directory detection: "names of all users",
		* "list of all users", "who are all the users". A Super Admin can access
		* every dataset the web app exposes (the All Users page at /admin/users), so
		* these name-list questions must reach the platform users provider instead of
		* degrading to a role-scope ACCESS_DENIED denial. Count/stats questions
		* ("how many users") are deliberately left to PLATFORM_OVERVIEW.
		*/
	private AssistantIntent usersListOverride(String message, Role role) {
		if (message == null || role != Role.SUPER_ADMIN) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		// A count/stats question is a platform-overview question, not a name list.
		// Whole-word matching is required here: a plain substring test would let the
		// "count" token match inside "account"/"accounts", so an account question
		// ("show all accounts", "is that account active") would wrongly bail out.
		if (containsAnyWord(m, List.of(
				"how many", "how much", "total", "count", "number of", "most",
				"top", "highest", "lowest", "average", "active users", "inactive users",
				"stats", "overview", "breakdown", "percentage"))) {
			return null;
		}
		// Teacher/student roster questions belong to SCHOOL_ROSTER.
		if (containsAny(m, List.of("teacher", "student"))) {
			return null;
		}
		boolean userToken = containsAny(m, List.of(
				"user", "users", "account", "accounts", "member", "members",
				"login", "logins", "people", "person", "everyone"));
		if (!userToken) {
			return null;
		}
		boolean listPhrase = containsAny(m, List.of(
				"name of", "names of", "list of", "list all", "list the",
				"list every", "all the", "all of the", "every", "who are",
				"who is", "show me", "show all", "show the", "give me",
				"tell me", "display", "directory", "all users", "all accounts"));
		return listPhrase ? AssistantIntent.PLATFORM_USERS : null;
	}

	/**
		* Deterministic Super-Admin follow-up detection for per-user ATTRIBUTE
		* questions that do not name a dataset: above all the pronoun-referential
		* status follow-up asked right after a user list ("is he active",
		* "is she active", "what is his status", "is this user active?"). The
		* platform users provider returns every account with its status, so these
		* must resolve to PLATFORM_USERS instead of degrading to the role-scope
		* ACCESS_DENIED denial a Super Admin must never see. Count/stats questions
		* are left to PLATFORM_OVERVIEW. Returns {@code null} when no per-user
		* attribute follow-up is detected.
		*/
	private AssistantIntent superAdminUserAttributeOverride(String message, Role role) {
		if (message == null || role != Role.SUPER_ADMIN) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		String padded = " " + m + " ";
		// A count/stats question is a platform-overview question, not a per-user lookup.
		// Whole-word matching prevents the "count" token from matching inside
		// "account"/"accounts" ("is that account active" is a per-user lookup).
		if (containsAnyWord(m, List.of("how many", "how much", "total", "count", "number of"))) {
			return null;
		}
		boolean attributeMarker = containsAny(m, List.of(
				"active", "inactive", "activated", "deactivated", "enabled", "disabled",
				"status", "blocked", "suspended", "banned", "verified"));
		if (!attributeMarker) {
			return null;
		}
		boolean pronounReference = containsAny(padded, List.of(
				" he ", " she ", " him ", " his ", " her ", " they ", " them ",
				" this user", " that user", " the user", " this person", " that person",
				" the person", " this account", " that account", " this member"));
		boolean userToken = containsAny(m, List.of(
				"user", "users", "account", "accounts", "member", "members",
				"login", "logins", "people", "person", "everyone"));
		return (pronounReference || userToken) ? AssistantIntent.PLATFORM_USERS : null;
	}

	/**
		* Deterministic per-student metric detection: questions that ask for a
		* NAMED student's individual metrics ("what is total xp of Siddhi Narke",
		* "what is the total xp of siddhi.narke@gmail.com", "show level and streak
		* of Siddhi Narke"). The word "total" makes the LLM treat these as a count
		* and return NAVIGATION_HELP, but the metrics live on the student's
		* Progress record (the STUDENT_PERFORMANCE provider), so they must route
		* there instead of the navigation page list. A person name or email is
		* required, so a platform-wide "total xp" question is never hijacked.
		* Returns {@code null} when no named-student metric question is detected.
		*/
	private AssistantIntent studentMetricOverride(String message, Role role) {
		if (extractStudentMetricName(message).isEmpty()) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		return containsAnyWord(m, List.of(
				"xp", "level", "streak", "progress", "practice", "session",
				"sessions", "grammar", "vocabulary", "lesson", "lessons",
				"completed", "complete", "finished", "completion",
				"performance", "performing", "progressing", "doing", "score", "scores", "mark", "marks"))
				? AssistantIntent.STUDENT_PERFORMANCE
				: null;
	}

	/**
		* Enriches STUDENT_PERFORMANCE params with the student name (or email)
		* derived from the question so the provider can resolve the named student
		* even when Groq returned empty params. Existing params are preserved.
		*/
	private Map<String, Object> enrichStudentMetricParams(String message, Map<String, Object> params) {
		Map<String, Object> enriched = new java.util.LinkedHashMap<>(params == null ? Map.of() : params);
		String name = extractStudentMetricName(message);
		if (!name.isEmpty()) {
			enriched.put("studentName", name);
		}
		return enriched;
	}

	/**
		* Extracts the student identifier from a per-student metric question: the
		* pasted account EMAIL when present ("siddhi.narke@gmail.com"), otherwise
		* the first plausible capitalized person name ("Siddhi Narke"), otherwise
		* a LOWERCASE multi-word name ("onkar awate") — users rarely capitalize
		* names in chat, and the capitalized-only pattern would miss them and let
		* the question degrade to the navigation page list. The email wins because
		* it is unambiguous and the STUDENT_PERFORMANCE provider can match it
		* directly. Returns "" when none is present.
		*/
	private String extractStudentMetricName(String message) {
		if (message == null || message.isBlank()) {
			return "";
		}
		Matcher emailMatcher = EMAIL_PATTERN.matcher(message);
		if (emailMatcher.find()) {
			return emailMatcher.group();
		}
		String capitalized = extractPersonFocusName(message);
		if (!capitalized.isEmpty()) {
			return capitalized;
		}
		return extractLowercaseMetricName(message);
	}

	/**
		* Lowercase-name fallback: finds the first run of 2-3 alphabetic tokens
		* that are neither question words nor metric words ("what is total xp of
		* onkar awate" -> "onkar awate"). Requires at least two tokens so that a
		* lone qualifier ("all", "students") is never mistaken for a name and a
		* platform-wide "total xp" question is not hijacked.
		*/
	private String extractLowercaseMetricName(String message) {
		String cleaned = message.replaceAll("[^A-Za-z0-9'\\-\\s]", " ");
		String[] tokens = cleaned.split("\\s+");
		List<String> run = new ArrayList<>();
		for (int i = 0; i <= tokens.length; i++) {
			String token = i < tokens.length ? tokens[i] : "";
			String lower = token.toLowerCase(Locale.ROOT);
			boolean nameToken = !lower.isEmpty()
					&& !lower.contains("@")
					&& lower.matches("[a-z][a-z'\\-]*")
					&& !NAME_METRIC_STOPWORDS.contains(lower);
			if (nameToken && run.size() < 3) {
				run.add(token);
				continue;
			}
			if (run.size() >= 2) {
				return String.join(" ", run);
			}
			run.clear();
		}
		return "";
	}

	/**
		* Deterministic navigation/process detection: "how do I ...", "how can I ...",
		* "steps to ...", "guide me ..." are action-questions whose answer is a
		* pointer to the relevant page (NAVIGATION_HELP), never a data query and
		* never a denial. Used only to rescue a misclassification (the LLM returned
		* ACCESS_DENIED / NAVIGATION_HELP), so a correctly routed data question is
		* never downgraded. Returns {@code null} when no action phrase is present.
		*/
	private AssistantIntent navigationOverride(String message, Role role) {
		if (message == null) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		if (containsAny(m, List.of(
				"how do i", "how do we", "how can i", "how can we", "how to",
				"where do i", "where can i", "steps to", "guide me",
				"walk me through", "show me how", "what do i need to do",
				"how would i", "how would we", "how should i"))) {
			return AssistantIntent.NAVIGATION_HELP;
		}
		return null;
	}

	/**
		* Enriches SCHOOL_ROSTER params with the entity type ("teachers"/"students")
		* derived from the question, plus (for Super Admin only) the school name so
		* the provider can resolve which school the caller means. School Admins and
		* Teachers always resolve from their own ActorContext instead.
		*/
	private Map<String, Object> enrichRosterParams(String message, Role role, Map<String, Object> params) {
		if (message == null) {
			return params;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		boolean wantsTeachers = m.contains("teacher");
		boolean wantsStudents = m.contains("student") || m.contains("learner");
		// A per-person attribute question ("which department is Digvijay Patil in",
		// "when did he join the school", "which subject Digvijay Patil teach") often
		// contains neither the word "teacher" nor "student". Detect the person name
		// (or the detail wording) so the roster provider receives the list that
		// contains that person, plus the name to narrow the answer with.
		// Names are usually typed in lowercase ("classes assigned to chetan
		// mali"), which the capitalized-only pattern cannot see. Fall back to the
		// lowercase run extractor so the roster provider receives the name to
		// narrow on instead of degrading to a generic NO DATA reply.
		String focusName = extractAnyPersonFocusName(message);
		boolean detailMarker = containsAny(m, PERSON_DETAIL_MARKERS);
		boolean pronounReference = containsAny(m, List.of(" he ", " she ", " him ", " her "));
		// The entity word ("student"/"teacher") must not defeat a person-detail
		// question: "what is the standard of the student Vijay Patil" names both,
		boolean personAboutMarker = containsAny(m, List.of(
				"tell me about", "tell me more about", "what can you tell me about",
				"details for", "details about", "details of", "details on",
				"information about", "info about", "info of", "everything about",
				"more about", "profile of", "want to see the details for",
				"want to see details for", "show details for", "show me details for"));
		boolean personDetailQuestion = !focusName.isBlank()
				&& (detailMarker || pronounReference || wantsTeachers || wantsStudents || personAboutMarker || !focusName.isBlank());
		Map<String, Object> enriched = new java.util.LinkedHashMap<>(params == null ? Map.of() : params);
		if (personDetailQuestion) {
			// Leave entityType unset so the provider returns BOTH lists and then
			// narrows to the single matching person via focusName.
			enriched.remove("entityType");
			enriched.put("focusName", focusName);
		} else if (wantsTeachers && !wantsStudents) {
			enriched.put("entityType", "teachers");
		} else if (wantsStudents && !wantsTeachers) {
			enriched.put("entityType", "students");
		}
		if (role == Role.SUPER_ADMIN) {
			// A person-detail question ("standard of Vijay Patil") leaves the school
			// unnamed; extractSchoolName would otherwise misread the person's name as
			// the school ("... of Vijay Patil"), no school would resolve and the
			// answer would degrade to a generic NO DATA reply. Skipping the
			// extraction lets the provider resolve the person across every school.
			Object existing = enriched.get("schoolName");
			if (!personDetailQuestion && (existing == null || existing.toString().isBlank())) {
				String extracted = extractSchoolName(message);
				if (!extracted.isEmpty()) {
					enriched.put("schoolName", extracted);
				}
			}
		}
		return enriched;
	}

	private String extractAnyPersonFocusName(String message) {
		String school = extractSchoolName(message);
		String cap = extractPersonFocusName(message);
		if (!cap.isBlank()) {
			if (!isSubsequenceOrContained(cap, school)) {
				return cap;
			}
		}
		String lower = extractLowercaseFocusName(message);
		if (!lower.isBlank()) {
			if (!isSubsequenceOrContained(lower, school)) {
				return lower;
			}
		}
		return "";
	}

	private boolean isSubsequenceOrContained(String personName, String schoolName) {
		if (personName == null || personName.isBlank() || schoolName == null || schoolName.isBlank()) {
			return false;
		}
		String p = personName.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
		String s = schoolName.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
		return !p.isEmpty() && (s.contains(p) || p.contains(s));
	}

	/**
		* Extracts a person's name from a question ("which department is Digvijay
		* Patil in" -> "Digvijay Patil") so a roster detail question can be narrowed
		* to that one teacher/student. Requires consecutive capitalized words and
		* rejects interrogative/domain words in the first position, so "Which
		* Department Digvijay Patil is allocated" still yields "Digvijay Patil".
		* Returns "" when no plausible name is present.
		*/
	private String extractPersonFocusName(String message) {
		if (message == null || message.isBlank()) {
			return "";
		}
		Matcher matcher = PERSON_NAME_PATTERN.matcher(message);
		while (matcher.find()) {
			String candidate = matcher.group(1).trim();
			String first = candidate.split("\\s+")[0].toLowerCase(Locale.ROOT);
			if (NON_NAME_SENTENCE_STARTS.contains(first)) {
				continue;
			}
			// "Podar International School" is capitalized like a name but is a
			// school, so it must never be stored as the person to narrow on.
			if (looksLikeSchoolName(candidate)) {
				continue;
			}
			return candidate;
		}
		return "";
	}

	/**
		* Lowercase fallback for {@link #extractPersonFocusName(String)}: finds the
		* first run of 2-3 alphabetic tokens that are neither scaffolding/question
		* words nor domain nouns ("classes assigned to chetan mali" -> "chetan
		* mali"). Chatters rarely capitalize names, so without this a SCHOOL_ROSTER
		* detail question about a lowercase name would carry no focusName, no
		* school would resolve and the roster provider would degrade to the generic
		* NO DATA reply. Requires at least two tokens so a lone qualifier is never
		* mistaken for a name, and rejects a run that looks like a school name so a
		* school-scoped name-list question ("list of students in Podar
		* International School") still resolves as a school, not a person.
		*/
	private String extractLowercaseFocusName(String message) {
		if (message == null || message.isBlank()) {
			return "";
		}
		String cleaned = message.replaceAll("[^A-Za-z0-9'\\-\\s]", " ");
		String[] tokens = cleaned.split("\\s+");
		List<String> run = new ArrayList<>();
		for (int i = 0; i <= tokens.length; i++) {
			String token = i < tokens.length ? tokens[i] : "";
			String lower = token.toLowerCase(Locale.ROOT);
			boolean nameToken = !lower.isEmpty()
					&& !lower.contains("@")
					&& lower.matches("[a-z][a-z'\\-]*")
					&& !NAME_METRIC_STOPWORDS.contains(lower)
					&& !ROSTER_NAME_STOPWORDS.contains(lower)
					&& !SCHOOL_NAME_TOKENS.contains(lower);
			if (nameToken && run.size() < 3) {
				run.add(token);
				continue;
			}
			String candidate = String.join(" ", run);
			if (run.size() >= 2 && !looksLikeSchoolName(candidate)) {
				return candidate;
			}
			run.clear();
		}
		return "";
	}

	/**
		* True when a phrase is a capitalized PERSON name ("Vijay Patil") - the shape
		* captured after "of"/"in"/"at" in "standard of Vijay Patil". Such a fragment
		* is rejected as a school name: the only school phrasing that shares this
		* shape is "<Name> School", which carries a school token ("school", "academy",
		* ...) and is caught by {@link #looksLikeSchoolName(String)}.
		*/
	private boolean looksLikePersonName(String phrase) {
		if (phrase == null || phrase.isBlank()) {
			return false;
		}
		return PERSON_NAME_PATTERN.matcher(phrase.trim()).matches()
				&& !looksLikeSchoolName(phrase);
	}

	/**
		* True when a capitalized phrase is really a SCHOOL (or another institution)
		* name rather than a person: it carries an institution word such as "school",
		* "academy", "college" or "international". Used to keep a school-scoped
		* question ("list of students in Podar International School") from being
		* narrowed to a non-existent person.
		*/
	private boolean looksLikeSchoolName(String phrase) {
		for (String token : phrase.toLowerCase(Locale.ROOT).split("\\s+")) {
			if (SCHOOL_NAME_TOKENS.contains(token)) {
				return true;
			}
		}
		return false;
	}

	/**
		* Deterministic fallback for the classifier. If the LLM answered
	 * NAVIGATION_HELP but the question clearly asks for data (counts, rankings,
	 * comparisons), route it to the correct data intent so the answer is computed
	 * from the database instead of the old "data not available" navigation reply.
	 * Returns {@code null} when no data intent can be determined with confidence.
	 */
	/**
	 * Deterministic account-info detection: any question about the caller's OWN
	 * account/identity (email, name, role, school membership, ids) routes to
	 * ACCOUNT_INFO, whose provider always answers from the already-resolved
	 * {@link ActorContext}. This guarantees "what is my email?" never degrades
	 * to ACCESS_DENIED or navigation help, even when Groq is unavailable.
	 * Returns {@code null} when no account question is detected.
	 */
	private AssistantIntent accountInfoOverride(String message, Role role) {
		if (message == null) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		boolean account = containsAny(m, List.of(
				"my email", "my e-mail", "my mail", "email id", "email address",
				"logged in email", "logged-in email", "login email", "sign in email",
				// email-first phrasings ("what email am I logged in with?",
				// "which email do I use?") — the email token precedes "logged in".
				"email am i", "email do i", "email is my", "email did i",
				"logged in with", "logged-in with", "signed in with", "sign in with",
				"which email", "what email",
				"my account", "account details", "account info", "my profile",
				// Self-anchored "my info" family. Without these the LLM's
				// NAVIGATION_HELP for a bare "my info" was never upgraded, so the
				// chatbot answered with the navigation page list instead of the
				// caller's own account record. Every token here is anchored to the
				// caller ("my ..." / "... about me") so it can never capture a
				// platform-directory question such as "account info of all users".
				"my info", "my information", "my details", "my personal info",
				"my personal information", "my profile info", "my profile information",
				"info about me", "information about me", "details about me",
				"profile details", "who am i", "who i am", "my role", "role am i",
				"which school am i", "my user id", "my user-id", "my username",
				"my user name", "my login id", "what is my name", "tell me my name",
				"do you know my name", "my display name",
				// Self-anchored location/address family. Without these a bare
				// "my location" fell through EVERY override and kept the LLM's
				// NAVIGATION_HELP, so the chatbot answered with the navigation page
				// list instead of the caller's own location. Every token below is
				// anchored to the caller ("my ..." / "where am i ...") so it can never
				// capture a directory question such as "location of all schools".
				"my location", "my current location", "my address", "my full address",
				"my city", "my town", "my state", "my country", "my branch",
				"my office", "my office location", "my work location", "my region",
				"where am i", "where am i located", "where am i based", "where do i live",
				// Self-anchored contact + join-date family. Without these a bare
				// "my phone" / "my joined date" matched NO override at all, so the
				// chatbot answered "I don't have a phone number on file for your
				// account." / "I'm sorry, but I don't have that information." even
				// though the value sits on the caller's own record. Every token here
				// is "my ..."-anchored, so it can never capture a directory question
				// such as "phone number of all teachers".
				"my phone", "my mobile", "my contact", "my contact number",
				"my phone number", "my mobile number", "my telephone",
				"my joined date", "my joining date", "my join date",
				"my date of joining", "when did i join", "when i joined"));
		// Bare (un-anchored) location token. A user may type just "location"
		// (or "address"/"city") with no "my ..." prefix; the LLM then returns
		// NAVIGATION_HELP and the chatbot replies with the navigation page list
		// instead of the caller's own location (reported: "location ... still
		// same not giving proper answer"). Only the caller's OWN record is
		// implied, so directory/scope phrasings must be excluded and keep their
		// existing cross-school routing:
		//   * "location of all schools", "location of every school" -> platform
		//   * "address of Green Valley High", "address of the school" -> school
		//   * "which schools are in <city>", "students in <city>" -> directory
		// The scope guards (isSpecificScope / mentionsSpecificScope) plus an
		// explicit directory-noun exclusion implement those carve-outs.
		boolean bareLocation = !account
				&& containsAnyWord(m, List.of("location", "address", "city"));
		if (bareLocation
				&& !isSpecificScope(m)
				&& !mentionsSpecificScope(message)
				&& !containsAny(m, List.of("all school", "each school", "every school",
						"across all", "per school", "compare school", "schools",
						"students", "teachers", "users", "platform", "roster"))) {
			account = true;
		}
		if (!account) {
			return null;
		}
		// "my school" on its own is a SCHOOL_OVERVIEW question; only explicit
		// membership phrasings ("which school am I in") are account questions.
		if (m.contains("my school") && !m.contains("which school am i")
				&& !m.contains("what is my school name") && !m.contains("my school name is")) {
			return null;
		}
		return AssistantIntent.ACCOUNT_INFO;
	}

	private AssistantIntent dataQuestionOverride(String message, Role role) {
		if (message == null) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();

		boolean dataMarker = containsAny(m, List.of(
				"how many", "how much", "total", "count", "number of", "most", "highest", "lowest", "top ",
				"largest", "smallest", "average", "compare", "comparison", "ranking", "ranked", "enrollment",
				"student count", "each school", "per school", "school-wise", "which school", "which schools",
				"revenue", "billing", "subscription", "payment", "invoice", "fees", "plans", "percentage", "marks",
				"scores", "attendance",
				// "strength" is the natural synonym for a headcount ("teacher
				// strength at Ekvira Highschool", "teacher strength of ..."),
				// so it is a data marker even though it is not a literal
				// count word. Without it the whole phrase carried no marker and
				// fell through to navigation help.
				"strength",
				"performance", "performing", "progress", "progressing", "how are", "how well", "look like",
				"teaching staff", "teacher strength", "staff", "student population", "school network"));
		if (!dataMarker) {
			return null;
		}

		boolean hasSchoolName = !extractSchoolName(message).isEmpty();
		boolean school = m.contains("school") || hasSchoolName;
		boolean classLike = m.contains("class") || m.contains("grade") || m.contains("standard")
				|| m.contains("division") || m.contains("section");
		boolean billing = containsAny(m, List.of("revenue", "billing", "subscription", "payment", "invoice", "fees", "plans"));
		boolean studentEntity = m.contains("student") || m.contains("roll number") || m.contains("learner");

		boolean crossSchool = school && (m.contains("schools") || m.contains("each school") || m.contains("per school")
				|| m.contains("compare") || m.contains("most") || m.contains("highest") || m.contains("top ")
				|| m.contains("ranking") || m.contains("which school"));

		if (billing && !school && !classLike && !studentEntity) {
			return AssistantIntent.BILLING;
		}
		// A pure count of classes ("how many classes do we have?", "total classes",
		// "number of classes", "class count") is a school-level statistic — the
		// SCHOOL_OVERVIEW provider exposes totalClasses — not a drill-down into one
		// class's performance (CLASS_PERFORMANCE only lists a capped availableClasses).
		if (containsAny(m, List.of("how many classes", "total classes", "number of classes",
				"class count", "count of classes", "classes do we have", "how many class"))) {
			return AssistantIntent.SCHOOL_OVERVIEW;
		}
		// Generic platform entity counts ("how many teachers are registered?",
		// "how many active users do we have?") belong to the platform overview.
		if (role == Role.SUPER_ADMIN && genericPlatformCountQuestion(m, message) && !isSpecificScope(m) && !hasSchoolName) {
			return AssistantIntent.PLATFORM_OVERVIEW;
		}
		if (crossSchool) {
			return AssistantIntent.PLATFORM_OVERVIEW;
		}
		if (school && !classLike) {
			return AssistantIntent.SCHOOL_OVERVIEW;
		}
		if (classLike) {
			return AssistantIntent.CLASS_PERFORMANCE;
		}
		if (studentEntity) {
			boolean namedStudent = !extractStudentMetricName(message).isEmpty();
			if (namedStudent) {
				return AssistantIntent.STUDENT_PERFORMANCE;
			}
			if (role == Role.SUPER_ADMIN) {
				return AssistantIntent.PLATFORM_OVERVIEW;
			}
			return AssistantIntent.STUDENT_PERFORMANCE;
		}
		return null;
	}

	/**
		* Deterministic platform-wide override: questions that clearly refer to the
		* whole platform ("on the platform", "across all schools", "in total") must
		* route to PLATFORM_OVERVIEW, whose provider includes platform-wide totals
		* (totalStudents, totalSchools, totalTeachers, ...). This prevents the LLM
		* (or the keyword fallback) from misrouting such questions to a per-school
		* or per-student provider that lacks the platform-wide totals.
		*/
	private AssistantIntent platformWideOverride(String message, Role role) {
		// Platform-wide totals are a Super Admin privilege; for every other role an
		// ambiguous "total/count" question means the caller's OWN scope and is
		// handled by scopedDataOverride (never PLATFORM_OVERVIEW, which they cannot
		// access and which would degrade to a confusing "no data" denial).
		if (message == null || role != Role.SUPER_ADMIN) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		boolean platformSignal = m.contains("platform") || m.contains("across all")
				|| m.contains("all schools") || m.contains("whole platform") || m.contains("entire platform")
				|| m.contains("on the app") || m.contains("in total")
				|| m.contains("which one has the most") || m.contains("which has the most")
				|| m.contains("which one has more") || m.contains("which one has highest")
				|| m.contains("which school has the most") || m.contains("which schools have the most")
				// Natural synonyms for the whole platform ("our current school
				// network", "our teaching staff", "our current student
				// population") that do not literally contain "platform".
				|| m.contains("network") || m.contains("staff") || m.contains("population")
				|| m.contains("performance") || m.contains("progress") || m.contains("progressing")
				|| m.contains("performing");
		boolean genericCount = role == Role.SUPER_ADMIN && genericPlatformCountQuestion(m, message);
		if (!platformSignal && !genericCount) {
			return null;
		}
		// A class/grade/division/roll-number mention, a single-school reference, or
		// a role-scoped mention ("my school", "my students") means it is about
		// something specific, not the whole platform.
		if (isSpecificScope(m) || !extractSchoolName(message).isEmpty() || !extractStudentMetricName(message).isEmpty()) {
			return null;
		}
		boolean entity = m.contains("student") || m.contains("school") || m.contains("teacher")
				|| m.contains("user") || m.contains("revenue") || m.contains("subscription")
				|| m.contains("billing") || m.contains("enrollment") || m.contains("count")
				|| m.contains("how many") || m.contains("how much")
				|| m.contains("class") || m.contains("standard") || m.contains("division")
				|| m.contains("admin")
				// Same entities under their natural synonyms: the
				// PLATFORM_OVERVIEW provider counts educators, learners and
				// staff exactly as it counts teachers/students.
				|| m.contains("educator") || m.contains("learner") || m.contains("staff")
				|| m.contains("performance") || m.contains("progress") || m.contains("network")
				|| m.contains("population");
		return entity ? AssistantIntent.PLATFORM_OVERVIEW : null;
	}

	/**
	 * Role-aware scope override for non-super-admins. A generic data question
	 * ("how many students do we have?", "total students", "my school overview")
	 * is ambiguous: it must never be routed to PLATFORM_OVERVIEW (which only
	 * Super Admins can access) — for everyone else that would degrade to a
	 * confusing ACCESS_DENIED/"no data" reply. Instead it is routed to the
	 * caller's own scoped provider (School Admin -> own school, Teacher -> own
	 * classes/students, Student -> own progress), or to a graceful ACCESS_DENIED
	 * when the question is truly platform-wide or cross-school.
	 * Returns {@code null} when no scoped route applies.
	 */
	private AssistantIntent scopedDataOverride(String message, Role role) {
		if (message == null || role == null || role == Role.SUPER_ADMIN) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		boolean dataMarker = containsAny(m, List.of(
				"how many", "how much", "total", "count", "number of", "stats",
				"statistics", "overview", "performance", "performing", "enrolled",
				"enrollment", "do we have", "do i have", "we have", "i have",
				"revenue", "billing", "subscription", "payment", "invoice", "fees", "plans",
				// Natural quality/trend phrasings for the caller's OWN school
				// ("How well are our students doing?", "How are our learners
				// progressing?") are data questions for the scoped provider,
				// not navigation. Kept OUT of dataQuestionOverride so a Super
				// Admin "how well are our students doing" is not pulled into
				// STUDENT_PERFORMANCE here.
				"how well", "progressing", "progress", "strength", "staff", "teaching staff",
				"how are", "how is", "doing"));
		boolean platformWide = m.contains("platform") || m.contains("across all")
				|| m.contains("all schools") || m.contains("all the schools")
				|| m.contains("on the app") || m.contains("whole platform") || m.contains("entire platform")
				|| m.contains("every school") || m.contains("from all schools") || m.contains("from every school")
				|| m.contains("other school") || m.contains("other schools") || m.contains("another school")
				|| m.contains("across schools") || m.contains("across the schools")
				|| m.contains("different school") || m.contains("different schools");
		boolean crossSchool = containsAny(m, List.of("schools", "each school", "per school",
				"compare", "comparison", "which school", "which schools", "ranking", "ranked",
				"most ", "top ", "highest", "largest", "smallest",
				"every school", "other school", "other schools", "another school", "all schools"));
		// The AI Insights page sections (the "Top Speakers Leaderboard", the
		// speaker ranking, speech metrics) are the caller's OWN school data, so a
		// bare "top speakers"/"leaderboard" question must NOT trip the
		// cross-school "top "/"highest"/"ranking" denial below. Only deny when the
		// question genuinely reaches beyond the caller's scope (platform-wide or
		// an explicit other-schools reference).
		boolean ownSchoolInsights = !platformWide && containsAny(m, List.of(
				"ai insight", "ai insights", "insights page", "leaderboard",
				"top speaker", "top speakers", "speaker leaderboard",
				"speakers leaderboard", "top speakers leaderboard"));
		if ((platformWide || crossSchool) && !ownSchoolInsights) {
			// Out of the caller's scoped access: a graceful denial beats answering
			// with unavailable or wrong data.
			return AssistantIntent.ACCESS_DENIED;
		}
		switch (role) {
			case SCHOOL_ADMIN: {
				// Billing & subscriptions are visible to a School Admin for their
				// OWN school only (access matrix). Revenue/subscription/payment
				// questions must route to BILLING — whose provider is school-scoped
				// for SCHOOL_ADMIN — never to SCHOOL_OVERVIEW, which has no billing
				// numbers. This guard runs first because "my school's revenue"
				// contains both billing and school tokens.
				if (containsAny(m, List.of("revenue", "billing", "subscription", "payment",
						"invoice", "fees", "plans"))) {
					return dataMarker ? AssistantIntent.BILLING : null;
				}
				// A pure count of classes ("how many classes do we have?", "total
				// classes", "number of classes") is a SCHOOL_OVERVIEW statistic
				// (totalClasses), not a CLASS_PERFORMANCE drill-down into one class.
				if (containsAny(m, List.of("how many classes", "total classes", "number of classes",
						"class count", "count of classes", "classes do we have", "how many class"))) {
					return dataMarker ? AssistantIntent.SCHOOL_OVERVIEW : null;
				}
				if (containsAny(m, List.of("class", "grade", "standard", "division", "section"))) {
					return dataMarker ? AssistantIntent.CLASS_PERFORMANCE : null;
				}
				boolean schoolEntity = m.contains("school") || m.contains("student")
						|| m.contains("teacher") || m.contains("learner") || m.contains("staff")
						|| m.contains("educator") || m.contains("population") || m.contains("strength");
				return dataMarker && schoolEntity ? AssistantIntent.SCHOOL_OVERVIEW : null;
			}
			case TEACHER: {
				if (containsAny(m, List.of("revenue", "billing", "subscription", "payment",
						"invoice", "fees", "plans"))) {
					return AssistantIntent.ACCESS_DENIED;
				}
				boolean classEntity = containsAny(m, List.of("class", "grade", "standard",
						"division", "section", "student", "learner"));
				return dataMarker && classEntity ? AssistantIntent.CLASS_PERFORMANCE
						: (dataMarker && !m.contains("how do i") && !m.contains("how to") ? AssistantIntent.ACCESS_DENIED : null);
			}
			case STUDENT: {
				if (containsAny(m, List.of("revenue", "billing", "subscription", "payment",
						"invoice", "fees", "plans"))) {
					return AssistantIntent.ACCESS_DENIED;
				}
				boolean selfEntity = containsAny(m, List.of("progress", "streak", "xp", "lesson",
						"score", "mark", "performance", "practice minutes", "speaking session",
						"grammar", "vocabulary", "how am i doing", "i have completed", "my stats",
						"performing", "progressing", "doing"));
				return selfEntity ? AssistantIntent.STUDENT_PERFORMANCE
						: (dataMarker && !m.contains("how do i") && !m.contains("how to") ? AssistantIntent.ACCESS_DENIED : null);
			}
			default: {
				// General users have no school/class/student/billing data scope: a
				// data question must be gracefully denied (ACCESS_DENIED) instead of
				// leaking through as NAVIGATION_HELP, which would be answered by the
				// navigation provider and imply the data exists for them.
				//
				// Out-of-scope platform user-directory requests ("names of all users",
				// "list every account", "who are all the users") are the clearest case:
				// a general USER cannot see the platform directory, so the answer must
				// be the graceful ACCESS_DENIED, never a navigation punt that implies
				// the data exists for them. Own-account phrasings ("my email",
				// "my account details") are already handled by accountInfoOverride
				// above and never reach this branch.
				boolean platformUserDirectory = containsAny(m, List.of(
						"all users", "all the users", "all of the users",
						"every user", "all accounts", "all the accounts",
						"every account", "all members", "all the members",
						"names of users", "names of all users", "list of all users",
						"list of users", "list every user", "who are all the users",
						"who are the users", "all the people", "everyone on the"));
				if (platformUserDirectory) {
					return AssistantIntent.ACCESS_DENIED;
				}
				boolean actionQuestion = containsAny(m, List.of(
						"how do i", "how do we", "how can i", "how can we", "how to",
						"where do i", "where can i", "steps to", "guide me",
						"walk me through", "show me how", "what do i need to do",
						"how would i", "how would we", "how should i"));
				if (actionQuestion) {
					return null;
				}
				// Self-membership/account phrasings are already handled by
				// accountInfoOverride and must never be downgraded to a data denial.
				boolean selfAccount = containsAny(m, List.of(
						"which school am i", "what is my school", "my school name",
						"school am i in", "which class am i", "what class am i",
						"am i a student", "am i a teacher"));
				if (selfAccount) {
					return null;
				}
				boolean userDataMarker = dataMarker || containsAny(m, List.of(
						"progress", "streak", "performance", "performing", "overview",
						"class", "grade", "standard", "division", "section",
						"student", "learner", "teacher", "school", "roster",
						"list of", "who are", "enrolled",
						// platform-directory entities a general USER cannot see
						"users", "user ", "accounts", "account ", "members", "member ",
						"everyone", "directory"));
				return userDataMarker ? AssistantIntent.ACCESS_DENIED : null;
			}
		}
	}

	/**
	 * True when the message reads like a generic platform-wide entity count
	 * ("how many teachers are registered?", "total active users", "how many
	 * schools are there?") as opposed to a named/specific scope question.
	 */
	private boolean genericPlatformCountQuestion(String m, String original) {
		boolean countMarker = containsAny(m, List.of(
				"how many", "how much", "total", "count", "number of", "registered",
				"active users", "active user", "enrolled", "enrollment", "signed up", "onboarded",
				"performance", "performing", "progress", "progressing", "how are", "how well",
				"look like", "population", "network", "staff", "strength", "overview"));
		if (!countMarker) {
			return false;
		}
		// Only entities the PLATFORM_OVERVIEW provider can actually answer with a
		// real count. Revenue/subscription are routed to BILLING before this runs.
		boolean entity = containsAny(m, List.of(
				"student", "teacher", "users", "user ", "account", "accounts",
				"member", "members", "school", "enrollment",
				"class", "standard", "division", "admin",
				// Natural synonyms for the countable platform entities.
				"learner", "educator", "staff", "network", "population", "performance", "progress"));
		if (!entity) {
			return false;
		}
		return !mentionsSpecificScope(original);
	}

	/**
	 * True when the message points at a specific scope: a class/grade/division,
	 * a single school ("my school", "the school", "school code"), or a role-scoped
	 * collection ("my students", "our teachers").
	 */
	private boolean isSpecificScope(String m) {
		if ((m.contains("my school") && !m.contains("my school network"))
				|| (m.contains("our school") && !m.contains("our school network"))
				|| m.contains("this school")
				|| m.contains("the school") || m.contains("school named") || m.contains("school called")
				|| m.contains("school code") || m.contains("my students") || m.contains("our students")
				|| m.contains("my teachers") || m.contains("our teachers")
				|| m.contains("roll number")
				// Only a POSSESSIVE learner reference is a specific scope ("my
				// learners", "our learners"). A bare "learner(s)" is the
				// platform's student population ("How many learners are
				// currently using the platform?"), so treating it as specific
				// used to block the platform-wide count. Mirrors the existing
				// "my students"/"our students" scoping above.
				|| m.contains("my learners") || m.contains("our learners")
				|| m.contains("my learner") || m.contains("our learner")) {
			return true;
		}
		// A class/grade/standard/division/section is specific only when it is
		// qualified ("my class", "class 5-A", "grade 3", "division B"). A bare
		// plural count ("how many classes", "total standards") is platform-wide.
		return isSpecificClassToken(m, "class") || isSpecificClassToken(m, "grade")
				|| isSpecificClassToken(m, "standard") || isSpecificClassToken(m, "division")
				|| isSpecificClassToken(m, "section");
	}

	/**
	 * True when the token refers to a specific class/grade/standard/division,
	 * e.g. "my class", "class 5-A", "grade 3", "division B". A metric phrase
	 * ("class count", "total standards") or a bare plural is NOT specific.
	 */
	private boolean isSpecificClassToken(String m, String token) {
		int idx = 0;
		while ((idx = m.indexOf(token, idx)) >= 0) {
			int after = idx + token.length();
			// qualified before the token: "my class", "our standard", "the division"
			if (idx > 0 && m.charAt(idx - 1) == ' ') {
				String prefix = m.substring(0, idx - 1);
				if (prefix.endsWith("my") || prefix.endsWith("our") || prefix.endsWith("this")
						|| prefix.endsWith("the") || prefix.endsWith("your")
						|| prefix.endsWith("his") || prefix.endsWith("her")) {
					return true;
				}
			}
			// qualified after the token: "class 5-A", "grade 3", "division B"
			if (after < m.length()) {
				char next = m.charAt(after);
				if (next == ':' && after + 1 < m.length()
						&& (Character.isDigit(m.charAt(after + 1)) || Character.isLetter(m.charAt(after + 1)))) {
					return true;
				}
				if (next == ' ') {
					String rest = m.substring(after + 1);
					if (rest.isEmpty()) {
						idx += token.length();
						continue;
					}
					char designator = rest.charAt(0);
					if (Character.isDigit(designator)) {
						return true;
					}
					if (Character.isLetter(designator)) {
						// single-letter designator ("division B") vs a metric phrase
						// ("class count", "standard performance")
						if (rest.length() == 1 || rest.charAt(1) == '-' || rest.charAt(1) == ' ') {
							return true;
						}
					}
				}
			}
			idx += token.length();
		}
		return false;
	}

	/**
	 * True when a count phrase is followed by a named scope, e.g. "students in
	 * Green Valley High", "teachers at Delhi Public School". Prevents a generic
	 * platform count from hijacking a specific-school question.
	 */
	private boolean mentionsSpecificScope(String original) {
		if (original == null) {
			return false;
		}
		String text = original;
		List<String> scopePreps = List.of(" in ", " at ", " of ", " for ");
		for (String prep : scopePreps) {
			int idx = 0;
			while ((idx = text.indexOf(prep, idx)) >= 0) {
				int after = idx + prep.length();
				if (after < text.length()) {
					char next = text.charAt(after);
					if (Character.isUpperCase(next)) {
						return true;
					}
					String rest = text.substring(after).toLowerCase(Locale.ROOT);
					for (String noun : List.of("school", "class", "grade", "standard", "division",
							"section", "academy", "college", "institute", "university", "high")) {
						if (rest.startsWith(noun)) {
							return true;
						}
					}
				}
				idx += prep.length();
			}
		}
		return false;
	}

	private boolean containsAny(String text, List<String> needles) {
		for (String needle : needles) {
			if (text.contains(needle)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Whole-word variant of {@link #containsAny}: a needle only matches when it is
	 * delimited by non-alphanumeric characters (or the string edges). This stops a
	 * short token such as "count" from matching inside an unrelated word such as
	 * "account"/"accounts"/"discount", which previously made the Super-Admin
	 * count-skip guards swallow account questions and degrade them to
	 * navigation help instead of the PLATFORM_USERS directory a Super Admin may
	 * access.
	 */
	private boolean containsAnyWord(String text, List<String> needles) {
		for (String needle : needles) {
			String token = needle == null ? "" : needle.trim();
			if (!token.isEmpty() && containsToken(text, token)) {
				return true;
			}
		}
		return false;
	}

	private boolean containsToken(String text, String token) {
		int idx = 0;
		while ((idx = text.indexOf(token, idx)) >= 0) {
			int before = idx - 1;
			int after = idx + token.length();
			boolean leftBoundary = before < 0 || !isWordChar(text.charAt(before));
			boolean rightBoundary = after >= text.length() || !isWordChar(text.charAt(after));
			if (leftBoundary && rightBoundary) {
				return true;
			}
			idx += token.length();
		}
		return false;
	}

	private boolean isWordChar(char c) {
		return Character.isLetterOrDigit(c);
	}

	/**
	 * Deterministic mapping of the school-admin page datasets onto their own
	 * intents so questions about the DASHBOARD, RESULTS, AI INSIGHTS and
	 * PROFILE/SETTINGS pages are answered from the same data shown on those
	 * pages. Only school admins and super admins own these pages, so every other
	 * role returns {@code null} and keeps its existing scoped routing. A
	 * platform-wide / cross-school question is never hijacked here (the caller
	 * cannot access it), and a question naming a specific person is left to the
	 * existing per-person routing. Returns {@code null} when no page applies.
	 */
	private AssistantIntent pageDataOverride(String message, Role role) {
		if (message == null || (role != Role.SCHOOL_ADMIN && role != Role.SUPER_ADMIN)) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		boolean platformWide = m.contains("platform") || m.contains("across all")
				|| m.contains("all schools") || m.contains("every school")
				|| m.contains("each school") || m.contains("per school")
				|| m.contains("which school") || m.contains("compare school");
		if (platformWide) {
			return null;
		}
		// PROFILE_SETTINGS: the caller's OWN settings/preferences and profile
		// extras. Checked first so a settings question is never absorbed by the
		// broader account override.
		//
		// The self-anchored phone/join-date phrases ("my phone number",
		// "my contact", "my joining date", "when did i join") were DELIBERATELY
		// removed from this list and live in accountInfoOverride instead. A
		// Super Admin has NO `users` row, so PROFILE_SETTINGS (which reads one)
		// answered NO DATA for "my phone number" / "my joining date" even though
		// the value sits on the caller's own `admins` record. accountInfoOverride
		// answers from ActorContext, which now carries the Super Admin's phone
		// and join date. Removing them here matters because deterministicFallback
		// runs pageDataOverride BEFORE accountInfoOverride — leaving them would
		// keep hijacking the query to the always-empty PROFILE_SETTINGS path.
		if (containsAny(m, List.of(
				"my settings", "my preferences", "profile settings", "my profile settings",
				"my profile name", "my profile email", "profile name and email",
				"my name and email", "my email and name",
				"account settings", "app settings", "appearance settings", "theme setting",
				"notification settings", "notification preference", "my notifications",
				"dark mode", "light mode", "two factor", "two-factor", "2fa",
				"ai voice", "sound effects", "sound effect", "auto play", "autoplay",
				"daily reminder", "daily reminders", "my language", "language setting",
				"language preference", "my department", "which department am i",
				"my roll number", "my standard", "my division"))) {
			return AssistantIntent.PROFILE_SETTINGS;
		}
		// A bare, NON-self-anchored "join date" ("join date", "what is the join
		// date") is a settings/profile extra for school admins, who DO have a
		// `users` row, so it stays a PROFILE_SETTINGS question. It is guarded with
		// accountInfoOverride so the self-anchored "my join date" / "my joined
		// date" / "my joining date" is never hijacked here: deterministicFallback
		// runs pageDataOverride BEFORE accountInfoOverride, so an unguarded
		// substring token would route "my join date" to the always-empty
		// PROFILE_SETTINGS path for a Super Admin (a Super Admin has no `users`
		// row) instead of ACCOUNT_INFO, which answers from ActorContext.
		if (accountInfoOverride(message, role) == null && m.contains("join date")) {
			return AssistantIntent.PROFILE_SETTINGS;
		}
		// AI_INSIGHTS: speaking-quality metrics and the "Top Speakers
		// Leaderboard" section shown on the AI Insights page. Checked BEFORE the
		// person-name gate below because a page-section title such as "Top
		// Speakers Leaderboard" is several capitalized words and would otherwise
		// be mistaken for a person's name, suppressing the page answer.
		if (containsAny(m, List.of(
				"ai insight", "ai insights", "insights page", "fluency", "pronunciation",
				"pronounce", "vocabulary", "grammar score", "grammar scores",
				"speaking time", "top speaker", "top speakers", "leaderboard",
				"speaker leaderboard", "speakers leaderboard", "top speakers leaderboard",
				"mispronounced", "mispronunciation", "speech metric", "speech metrics",
				"speaking score", "speaking scores", "speaking quality"))) {
			return AssistantIntent.AI_INSIGHTS;
		}
		boolean personSpecific = PERSON_NAME_PATTERN.matcher(message).find();
		if (personSpecific) {
			return null;
		}
		// RESULTS_ANALYTICS: the Results page aggregates.
		if (containsAny(m, List.of(
				"pass percentage", "fail percentage", "pass rate", "fail rate",
				"how many passed", "how many failed", "highest marks", "lowest marks",
				"highest score", "lowest score", "average percentage", "average marks",
				"average score", "overall percentage", "results by standard",
				"result breakdown", "exam result", "test result", "results page",
				"result percentage", "marks obtained", "total results"))) {
			return AssistantIntent.RESULTS_ANALYTICS;
		}
		// SCHOOL_DASHBOARD: the Dashboard KPIs that are not already covered by the
		// existing school-overview routing (result tallies and the dashboard page
		// itself are always the school-wide dashboard).
		if (containsAny(m, List.of(
				"dashboard", "kpi", "kpis", "excellent results", "good results",
				"result summary", "school summary", "school dashboard",
				"inactive students", "active students"))) {
			return AssistantIntent.SCHOOL_DASHBOARD;
		}
		// Lesson-completion KPIs are shown on the Dashboard, but a question that
		// NAMES a specific student ("how many lessons completed by siddhi narke",
		// "how many lessons completed by onkar awate") is about that student, not
		// the school-wide dashboard. The capitalized-only person gate above cannot
		// see an all-lowercase name, so guard the lesson needles explicitly and
		// leave the question to the per-student metric routing
		// (studentMetricOverride), which already ran. A platform-wide / unnamed
		// "total lessons completed" (no student named) still maps here.
		if (containsAny(m, List.of("lessons completed", "total lessons", "lesson completion"))
				&& extractStudentMetricName(message).isEmpty()) {
			return AssistantIntent.SCHOOL_DASHBOARD;
		}
		return null;
	}

	/**
	 * Deterministic detection of a named-SCHOOL info question phrased without a
	 * count/statistic marker ("info of Ekvira Highschool", "information about
	 * St.Vincent High School", "details about Greenwood High", "tell me about
	 * Mahajan highschool", "school overview of Ekvira Highschool").
	 *
	 * <p>A count/statistic question ("how many students in Ekvira Highschool")
	 * is already handled by {@link #dataQuestionOverride}, which requires a
	 * dataMarker such as "how many"/"total". A bare info phrase carries no such
	 * marker, so it was previously routed only when the LLM happened to
	 * identify the intent - and even then the school name was dropped for a
	 * concatenated name such as "Ekvira Highschool" (which carried no standalone
	 * "school"/"high" token and was therefore mistaken for a person name),
	 * producing the generic NO DATA reply. This override supplies the missing
	 * deterministic route.
	 *
	 * <p>An explicit school entity word is required, so a person question
	 * ("info of Vijay Patil") or a platform-directory question ("info about all
	 * users") is never captured.
	 *
	 * @return {@link AssistantIntent#SCHOOL_OVERVIEW} when the question is a
	 *         named-school info question, otherwise {@code null}
	 */
	private AssistantIntent schoolInfoOverride(String message, Role role) {
		if (message == null) {
			return null;
		}
		// Only roles that may read a school overview: Super Admin (any school) and
		// School Admin (own school). Teachers/students have no such scope.
		if (role != Role.SUPER_ADMIN && role != Role.SCHOOL_ADMIN) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		// Must reference a school (or a synonym institution word). "highschool" is
		// listed explicitly because the substring "school" already covers it, but
		// keeping it documents the concatenated stored form.
		boolean schoolEntity = m.contains("school") || containsAny(m, List.of(
				"highschool", "vidyalaya", "academy", "college", "institute",
				"university", "convent", "campus", "polytechnic"));
		if (!schoolEntity) {
			return null;
		}
		// Must ask FOR information, not for a count/statistic (which
		// dataQuestionOverride already routes).
		boolean infoMarker = containsAny(m, List.of(
				"info", "information", "details", "about", "overview",
				"tell me about", "describe", "summary", "summarize", "profile of"));
		if (!infoMarker) {
			return null;
		}
		// The extracted fragment must read like a school, not a person or an
		// unresolved pronoun. This is the guard that lets "info of Ekvira
		// Highschool" through (the phrase no longer parses as a person now that
		// "highschool" is a school token) while rejecting "info of Vijay Patil".
		String candidate = extractSchoolName(message);
		if (candidate.isEmpty() || looksLikePersonName(candidate)) {
			return null;
		}
		// Exclusions that belong to other providers: the caller's own school, a
		// class/standard drill-down, or a billing
		// question. A self-anchored ("my ...") phrasing is always excluded.
		if (isSpecificScope(m) || containsAny(m, List.of(
				"my school", "our school", "this school",
				"fee", "fees", "billing", "subscription", "payment", "invoice", "revenue", "plans",
				"class", "classes", "standard", "standards", "division", "divisions", "section",
				"roll number", "admin", "admins", "user", "users", "account", "accounts",
				"my ", "our "))) {
			return null;
		}
		// Only a genuine single-school reference is a school overview; an
		// aggregate/multi-school question ("info about all schools") is not.
		if (containsAny(m, List.of("all school", "all the school", "every school",
				"each school", "per school", "which school", "which schools",
				"compare school", "across all", "schools", "platform"))) {
			return null;
		}
		return AssistantIntent.SCHOOL_OVERVIEW;
	}

	/**
	 * Resolves follow-up questions that refer to a school or person from recent
	 * conversation history (e.g. "How many teachers does it have?", "Which one
	 * has the most students?", "How is she performing?").
	 */
	private IntentResult contextualFollowUpCheck(String message, Role role, List<AssistantRequest.MessageTurn> history) {
		if (message == null || message.isBlank()) {
			return null;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		String padded = " " + m + " ";

		// 1. Cross-school ranking follow-up: "Which one has the most students?", "Which has the most teachers?"
		boolean whichOneRanking = containsAny(m, List.of(
				"which one has the most", "which has the most", "which one has more",
				"which one has highest", "which school has the most", "which schools have the most"));
		if (whichOneRanking && (m.contains("student") || m.contains("teacher") || m.contains("enrolled") || m.contains("school") || m.contains("class"))) {
			return new IntentResult(AssistantIntent.PLATFORM_OVERVIEW, Map.of(), null);
		}

		if (history == null || history.isEmpty()) {
			return null;
		}

		// If a new specific school or person is explicitly named in the current message,
		// do NOT hijack it with previous history context.
		boolean hasNewSchoolName = !extractSchoolName(message).isEmpty();
		boolean hasNewStudentName = !extractStudentMetricName(message).isEmpty();

		// 2. School follow-up with pronouns or count inquiries:
		// "How many teachers does it have?", "Tell me about it", "How many students does it have?",
		// "What about its classes?", "Teacher strength in that school", "Does it have classes?"
		boolean schoolPronoun = containsAny(padded, List.of(
				" it ", " it?", " it.", " its ", " they ", " they?", " them ",
				" that school ", " that school?", " this school ", " this school?",
				" the school ", " the school?", " that one ", " that one?"));
		boolean schoolMetricFollowUp = containsAny(m, List.of(
				"how many teachers", "how many students", "how many classes", "teacher count",
				"student count", "teacher strength", "student population", "teaching staff",
				"tell me about it", "details about it", "more about it", "what about it",
				"does it have", "did it have", "does it possess", "are there in it"));

		if (!hasNewSchoolName && (schoolPronoun || schoolMetricFollowUp)) {
			String prevSchool = resolvePreviousSchoolName(history);
			if (!prevSchool.isEmpty()) {
				Map<String, Object> p = new java.util.LinkedHashMap<>();
				p.put("schoolName", prevSchool);
				return new IntentResult(AssistantIntent.SCHOOL_OVERVIEW, p, null);
			}
		}

		// 3. Student/person follow-up with pronouns:
		// "How is she performing?", "What is her XP?", "When did he join?", "Which department is he in?"
		boolean personPronoun = containsAny(padded, List.of(
				" he ", " he?", " he.", " she ", " she?", " she.", " him ", " him?", " her ", " her?", " his "));
		if (!hasNewStudentName && personPronoun && extractAnyPersonFocusName(message).isBlank()) {
			String prevPerson = resolvePreviousStudentName(history);
			if (!prevPerson.isEmpty()) {
				Map<String, Object> p = new java.util.LinkedHashMap<>();
				p.put("studentName", prevPerson);
				boolean metricQuestion = containsAny(m, List.of("xp", "streak", "level", "performance", "performing", "progress", "progressing", "score", "lessons"));
				AssistantIntent targetIntent = metricQuestion ? AssistantIntent.STUDENT_PERFORMANCE : AssistantIntent.SCHOOL_ROSTER;
				return new IntentResult(targetIntent, p, null);
			}
		}

		return null;
	}

	private String resolvePreviousSchoolName(List<AssistantRequest.MessageTurn> history) {
		if (history == null || history.isEmpty()) {
			return "";
		}
		for (int i = history.size() - 1; i >= 0; i--) {
			AssistantRequest.MessageTurn turn = history.get(i);
			if (turn == null || turn.getContent() == null || turn.getContent().isBlank()) {
				continue;
			}
			String content = turn.getContent().trim();
			String school = extractSchoolName(content);
			if (isPlausibleSchoolName(school)) {
				return school;
			}
			Matcher matcher = SCHOOL_BEFORE_TOKEN_PATTERN.matcher(content);
			if (matcher.find()) {
				String candidate = cleanSchoolFragment(matcher.group(1));
				if (isPlausibleSchoolName(candidate)) {
					return candidate;
				}
			}
		}
		return "";
	}

	private String resolvePreviousStudentName(List<AssistantRequest.MessageTurn> history) {
		if (history == null || history.isEmpty()) {
			return "";
		}
		for (int i = history.size() - 1; i >= 0; i--) {
			AssistantRequest.MessageTurn turn = history.get(i);
			if (turn == null || turn.getContent() == null || turn.getContent().isBlank()) {
				continue;
			}
			String content = turn.getContent().trim();
			String student = extractStudentMetricName(content);
			if (!student.isBlank()) {
				return student;
			}
			String person = extractAnyPersonFocusName(content);
			if (!person.isBlank()) {
				return person;
			}
		}
		return "";
	}

	private AssistantIntent parseIntent(String name) {
		if (name == null) {
			return AssistantIntent.NAVIGATION_HELP;
		}
		try {
			return AssistantIntent.valueOf(name.trim().toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException e) {
			return AssistantIntent.NAVIGATION_HELP;
		}
	}
}
