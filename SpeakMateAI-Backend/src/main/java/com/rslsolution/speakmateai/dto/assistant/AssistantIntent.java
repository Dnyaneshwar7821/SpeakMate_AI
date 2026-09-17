package com.rslsolution.speakmateai.dto.assistant;

/**
 * The set of intents the SpeakMate AI assistant can answer.
 * {@code ACCESS_DENIED} is produced when a question is outside the caller's role scope.
 */
public enum AssistantIntent {

	PLATFORM_OVERVIEW,
	SCHOOL_OVERVIEW,
	CLASS_PERFORMANCE,
	STUDENT_PERFORMANCE,
	ACCOUNT_INFO,
	BILLING,
	SCHOOL_ROSTER,
	NAVIGATION_HELP,
	// --- School-Admin dashboard PAGE datasets (each maps 1:1 to a page) ---
	/** Dashboard page KPI bundle (students/teachers/classes/results + lesson completions). */
	SCHOOL_DASHBOARD,
	/** Results page aggregates (average score, pass/fail breakdown, totals). */
	RESULTS_ANALYTICS,
	/** AI Insights page speech metrics (fluency, pronunciation, speaking time, top speakers). */
	AI_INSIGHTS,
	/** Profile & Settings page data (profile details, school info, preferences, security). */
	PROFILE_SETTINGS,
	/**
	 * Super-Admin-only directory of every user account on the platform
	 * (names + role/school/status). Maps to the All Users page at /admin/users.
	 */
	PLATFORM_USERS,
	ACCESS_DENIED
}
