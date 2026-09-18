package com.rslsolution.speakmateai.assistant;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.rslsolution.speakmateai.assistant.provider.AssistantDataProvider;
import com.rslsolution.speakmateai.assistant.provider.AssistantDataProviderRegistry;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.dto.assistant.AssistantRequest;
import com.rslsolution.speakmateai.dto.assistant.AssistantResponse;
import com.rslsolution.speakmateai.dto.assistant.AssistantResponse.Suggestion;
import com.rslsolution.speakmateai.dto.assistant.SynthesizedAnswer;
import com.rslsolution.speakmateai.enums.Role;

/**
 * Orchestrates the SpeakMate AI assistant pipeline for a single question:
 *
 * <pre>
 *  1. Resolve the authenticated actor (role + scope ids) - read only.
 *  2. Classify the question into an {@link AssistantIntent} (Groq, JSON mode).
 *  3. Enforce the role-access matrix - out-of-scope questions never reach a
 *     provider and never reach the DB; they get a graceful ACCESS_DENIED answer.
 *  4. Ask the role-scoped {@link AssistantDataProvider} for aggregated JSON.
 *  5. Synthesize a friendly markdown + stats + optional chart answer (Groq).
 *  6. Attach deterministic deep-link navigation suggestions.
 * </pre>
 *
 * <p>The whole pipeline is stateless: no persistence, no schema changes, no
 * writes of any kind. Conversation history lives in the frontend React state.
 */
@Service
public class AssistantService {

	private final ActorResolver actorResolver;
	private final IntentClassifier intentClassifier;
	private final AnswerSynthesizer answerSynthesizer;
	private final AssistantDataProviderRegistry registry;

	public AssistantService(ActorResolver actorResolver, IntentClassifier intentClassifier,
			AnswerSynthesizer answerSynthesizer, AssistantDataProviderRegistry registry) {
		this.actorResolver = actorResolver;
		this.intentClassifier = intentClassifier;
		this.answerSynthesizer = answerSynthesizer;
		this.registry = registry;
	}

	/**
	 * Answers a single assistant message for the authenticated principal (email).
	 * Never writes to the database; never exposes data outside the caller's scope.
	 */
	public AssistantResponse answer(String email, AssistantRequest request) {
		ActorContext actor = actorResolver.resolve(email);

		// Security hardening: unauthorized requests for passwords, credentials, tokens, or secrets
		// are strictly denied immediately across all roles (including SUPER_ADMIN) without calling
		// any data provider or the LLM.
		if (isCredentialOrSecretRequest(request.getMessage())) {
			return credentialDenialResponse(request, actor);
		}

		IntentResult classified = intentClassifier.classify(request.getMessage(), actor.getRole(), request.getHistory());
		AssistantIntent intent = classified.getIntent();

		// Attach frontend currentRoute to params so navigation can contextualize suggestions if needed
		if (request.getCurrentRoute() != null && !request.getCurrentRoute().isBlank()) {
			classified.getParams().put("currentRoute", request.getCurrentRoute().trim());
		}

		// Graceful denial for out-of-scope / unrecognized questions (no data, no Groq answer call).
		// A Super Admin can access every dataset the web app exposes, so a Super Admin
		// must NEVER be shown the role-scope denial: re-route the question to the
		// closest platform-wide provider instead of returning denialResponse.
		if (intent == AssistantIntent.ACCESS_DENIED || !registry.isRoleAllowed(intent, actor.getRole())) {
			if (actor.getRole() == Role.SUPER_ADMIN) {
				intent = superAdminFallbackIntent(request.getMessage());
			} else {
				return denialResponse(request, actor);
			}
		}

		Optional<AssistantDataProvider> provider = registry.providerFor(intent, actor.getRole());
		if (provider.isEmpty()) {
			return denialResponse(request, actor);
		}

		String dataJson = provider.get().provide(actor, classified.getParams());

		SynthesizedAnswer synthesized = answerSynthesizer.synthesize(
				intent, actor, request.getMessage(), classified.getParams(), dataJson, request.getHistory());

		return AssistantResponse.builder()
				.markdown(synthesized.getMarkdown())
				.intent(intent.name())
				.accessDenied(false)
				.sessionId(request.getSessionId())
				.stats(synthesized.getStats())
				.chart(synthesized.getChart())
				.suggestions(suggestionsFor(intent, actor.getRole(), synthesized.getSuggestDeepLink()))
				.build();
	}

	private boolean isCredentialOrSecretRequest(String message) {
		if (message == null || message.isBlank()) {
			return false;
		}
		String m = message.toLowerCase(Locale.ROOT).trim();
		// Benign navigation / self-service password reset questions:
		boolean benignAction = containsAnyPhrase(m, List.of(
				"how do i change", "how can i change", "how to change",
				"how do i reset", "how can i reset", "how to reset",
				"how do i update", "how can i update", "how to update",
				"where do i change", "where can i change", "where do i reset",
				"where can i reset", "steps to change", "steps to reset"));
		if (benignAction) {
			return false;
		}
		// Unauthorized inquiries asking for passwords, tokens, API keys, or system credentials
		return containsAnyPhrase(m, List.of(
				"password", "passwords", "passwd",
				"jwt secret", "jwt token", "jwt_secret", "jwt",
				"secret token", "secret tokens", "secret key", "secret_key", "secret keys",
				"access token", "access tokens", "bearer token", "bearer tokens",
				"token", "tokens", "private key", "private keys",
				"api key", "apikey", "api_key", "api keys", "apikeys",
				"database password", "db password", "database credentials", "db credentials",
				"smtp password", "smtp credentials", "mail password",
				"reset token", "reset tokens", "verification token", "verification tokens",
				"auth token", "auth tokens", "authentication token", "authentication tokens",
				"credentials", "credential", "login credentials", "admin credentials"));
	}

	private boolean containsAnyPhrase(String text, List<String> needles) {
		if (text == null || needles == null) {
			return false;
		}
		for (String needle : needles) {
			if (text.contains(needle)) {
				return true;
			}
		}
		return false;
	}

	private AssistantResponse credentialDenialResponse(AssistantRequest request, ActorContext actor) {
		return AssistantResponse.builder()
				.markdown("### 🔒 Access Denied\n\nPasswords, credentials, authentication tokens, and API secrets are strictly confidential and cannot be retrieved, viewed, or disclosed through the assistant.\n\nIf you need to update your password or access keys, please visit your account Settings.")
				.intent(AssistantIntent.ACCESS_DENIED.name())
				.accessDenied(true)
				.sessionId(request.getSessionId())
				.suggestions(suggestionsFor(AssistantIntent.NAVIGATION_HELP, actor.getRole(), false))
				.build();
	}

	private AssistantResponse denialResponse(AssistantRequest request, ActorContext actor) {
		return AssistantResponse.builder()
				.markdown(denialMarkdown(actor.getRole()))
				.intent(AssistantIntent.ACCESS_DENIED.name())
				.accessDenied(true)
				.sessionId(request.getSessionId())
				.suggestions(suggestionsFor(AssistantIntent.NAVIGATION_HELP, actor.getRole(), false))
				.build();
	}

	private String denialMarkdown(Role role) {
		String scope = roleLabel(role);
		String canAsk = switch (role == null ? Role.USER : role) {
			case SUPER_ADMIN -> "- Your own account details (email, name, role)\n"
					+ "- Platform-wide stats (students, schools, teachers, revenue)\n"
					+ "- A specific school's overview\n- Class / student performance\n"
					+ "- Teacher & student names in a school\n- Billing & subscriptions\n- Navigation help";
			case SCHOOL_ADMIN -> "- Your own account details (email, name, role)\n"
					+ "- Your school's overview\n- Class & student performance in your school\n"
					+ "- Teacher & student names in your school\n"
					+ "- AI insights (fluency, pronunciation, top speakers leaderboard)\n"
					+ "- Navigation help";
			case TEACHER -> "- Your own account details (email, name, role)\n"
					+ "- Your assigned classes & students (including their names)\n- Navigation help";
			case STUDENT -> "- Your own account details (email, name, role)\n"
					+ "- Your own progress & streaks\n- Navigation help";
			case USER -> "- Your own account details (email, name, role)\n- Navigation help";
			default -> "- Your own account details (email, name, role)\n- Navigation help";
		};
		return "### 🙅 This question is outside your access\n\n"
				+ "As a **" + scope + "**, I can only show data within your role's scope, so I can't answer that one.\n\n"
				+ "**You can ask me about:**\n" + canAsk
				+ "\n\nIf you think this is a mistake, please contact your administrator.";
	}

	private String roleLabel(Role role) {
		switch (role == null ? Role.USER : role) {
			case SUPER_ADMIN: return "Super Admin";
			case SCHOOL_ADMIN: return "School Admin";
			case TEACHER: return "Teacher";
			case STUDENT: return "Student";
			case USER: return "User";
			default: return "User";
		}
	}

	/**
		* Fallback intent for a Super-Admin question the classifier could not place in a
		* dataset. Instead of the role-scope denial, answer from the platform user
		* directory (when the question is about people/accounts or their status) or the
		* platform overview. This guarantees a Super Admin is never told a question is
		* "outside their access" while the web app exposes that data to them.
		*/
	private AssistantIntent superAdminFallbackIntent(String message) {
		String m = message == null ? "" : message.toLowerCase(Locale.ROOT);
		boolean userish = m.contains("user") || m.contains("account") || m.contains("member")
				|| m.contains("login") || m.contains("people") || m.contains("person")
				|| m.contains("active") || m.contains("inactive") || m.contains("status")
				|| m.contains(" he ") || m.contains(" she ") || m.contains(" him ")
				|| m.contains(" his ") || m.contains(" her ");
		return userish ? AssistantIntent.PLATFORM_USERS : AssistantIntent.PLATFORM_OVERVIEW;
	}

	/**
	 * Returns at most 2 strictly relevant deep-link suggestions tailored to the
	 * classified intent and caller's role.
	 */
	private List<Suggestion> suggestionsFor(AssistantIntent intent, Role role, Boolean suggestDeepLink) {
		if (role == null) {
			return List.of();
		}
		List<Suggestion> candidates = new ArrayList<>();

		// 1. Intent-specific primary suggestions
		if (intent != null) {
			switch (intent) {
				case CLASS_PERFORMANCE -> {
					if (role == Role.TEACHER) {
						candidates.add(suggestion("View class analytics", "/teacher/analytics", "TEACHER"));
						candidates.add(suggestion("View class reports", "/teacher/reports", "TEACHER"));
					} else if (role == Role.SCHOOL_ADMIN) {
						candidates.add(suggestion("View school insights", "/school-admin/insights", "SCHOOL_ADMIN"));
						candidates.add(suggestion("View students", "/school-admin/students", "SCHOOL_ADMIN"));
					}
				}
				case STUDENT_PERFORMANCE -> {
					if (role == Role.STUDENT || role == Role.USER) {
						candidates.add(suggestion("View my progress", "/progress", role.name()));
						candidates.add(suggestion("Practice speaking", "/speaking", role.name()));
					} else if (role == Role.TEACHER) {
						candidates.add(suggestion("View my students", "/teacher/students", "TEACHER"));
						candidates.add(suggestion("View class analytics", "/teacher/analytics", "TEACHER"));
					} else if (role == Role.SCHOOL_ADMIN) {
						candidates.add(suggestion("View students", "/school-admin/students", "SCHOOL_ADMIN"));
						candidates.add(suggestion("View school insights", "/school-admin/insights", "SCHOOL_ADMIN"));
					}
				}
				case SCHOOL_ROSTER -> {
					if (role == Role.TEACHER) {
						candidates.add(suggestion("View my students", "/teacher/students", "TEACHER"));
						candidates.add(suggestion("Go to dashboard", "/teacher/dashboard", "TEACHER"));
					} else if (role == Role.SCHOOL_ADMIN) {
						candidates.add(suggestion("View teachers", "/school-admin/teachers", "SCHOOL_ADMIN"));
						candidates.add(suggestion("View students", "/school-admin/students", "SCHOOL_ADMIN"));
					} else if (role == Role.SUPER_ADMIN) {
						candidates.add(suggestion("View school users", "/admin/school-users", "SUPER_ADMIN"));
						candidates.add(suggestion("View all users", "/admin/users", "SUPER_ADMIN"));
					}
				}
				case PLATFORM_OVERVIEW -> {
					if (role == Role.SUPER_ADMIN) {
						candidates.add(suggestion("View platform insights", "/admin/insights", "SUPER_ADMIN"));
						candidates.add(suggestion("View all users", "/admin/users", "SUPER_ADMIN"));
					}
				}
				case SCHOOL_OVERVIEW -> {
					if (role == Role.SCHOOL_ADMIN) {
						candidates.add(suggestion("View school insights", "/school-admin/insights", "SCHOOL_ADMIN"));
						candidates.add(suggestion("Go to dashboard", "/school-admin/dashboard", "SCHOOL_ADMIN"));
					}
				}
				case BILLING -> {
					if (role == Role.SUPER_ADMIN) {
						candidates.add(suggestion("View subscriptions", "/admin/subscription", "SUPER_ADMIN"));
						candidates.add(suggestion("View platform insights", "/admin/insights", "SUPER_ADMIN"));
					}
				}
				case PLATFORM_USERS -> {
					if (role == Role.SUPER_ADMIN) {
						candidates.add(suggestion("View all users", "/admin/users", "SUPER_ADMIN"));
						candidates.add(suggestion("View school users", "/admin/school-users", "SUPER_ADMIN"));
					}
				}
				case SCHOOL_DASHBOARD -> {
					if (role == Role.SCHOOL_ADMIN) {
						candidates.add(suggestion("Open dashboard", "/school-admin/dashboard", "SCHOOL_ADMIN"));
						candidates.add(suggestion("View school insights", "/school-admin/insights", "SCHOOL_ADMIN"));
					}
				}
				case RESULTS_ANALYTICS -> {
					if (role == Role.SCHOOL_ADMIN) {
						candidates.add(suggestion("Open results", "/school-admin/results", "SCHOOL_ADMIN"));
						candidates.add(suggestion("View school insights", "/school-admin/insights", "SCHOOL_ADMIN"));
					}
				}
				case AI_INSIGHTS -> {
					if (role == Role.SCHOOL_ADMIN) {
						candidates.add(suggestion("Open AI insights", "/school-admin/insights", "SCHOOL_ADMIN"));
						candidates.add(suggestion("Open results", "/school-admin/results", "SCHOOL_ADMIN"));
					}
				}
				case PROFILE_SETTINGS -> {
					if (role == Role.SCHOOL_ADMIN) {
						candidates.add(suggestion("Open profile", "/school-admin/profile", "SCHOOL_ADMIN"));
					} else if (role == Role.TEACHER) {
						candidates.add(suggestion("Open profile", "/teacher/profile", "TEACHER"));
					} else if (role == Role.SUPER_ADMIN) {
						candidates.add(suggestion("Open profile", "/admin/profile", "SUPER_ADMIN"));
					} else {
						candidates.add(suggestion("Open profile", "/profile", role.name()));
					}
				}
				default -> {
				}
			}
		}

		// 2. Fallback / supplementary role suggestions if fewer than 2 candidates
		if (candidates.size() < 2) {
			List<Suggestion> roleDefaults = defaultSuggestionsForRole(role);
			for (Suggestion s : roleDefaults) {
				if (candidates.size() >= 2) {
					break;
				}
				candidates.add(s);
			}
		}

		// 3. Deduplicate by route and strictly keep at most 2 relevant suggestions
		List<Suggestion> result = new ArrayList<>();
		Set<String> seenRoutes = new HashSet<>();
		for (Suggestion s : candidates) {
			if (s != null && s.getRoute() != null && seenRoutes.add(s.getRoute())) {
				result.add(s);
				if (result.size() == 2) {
					break;
				}
			}
		}
		return result;
	}

	private List<Suggestion> defaultSuggestionsForRole(Role role) {
		return switch (role) {
			case SUPER_ADMIN -> List.of(
					suggestion("Platform insights", "/admin/insights", "SUPER_ADMIN"),
					suggestion("View all users", "/admin/users", "SUPER_ADMIN"));
			case SCHOOL_ADMIN -> List.of(
					suggestion("School insights", "/school-admin/insights", "SCHOOL_ADMIN"),
					suggestion("Go to students", "/school-admin/students", "SCHOOL_ADMIN"));
			case TEACHER -> List.of(
					suggestion("View my students", "/teacher/students", "TEACHER"),
					suggestion("View class analytics", "/teacher/analytics", "TEACHER"));
			case STUDENT -> List.of(
					suggestion("View my progress", "/progress", "STUDENT"),
					suggestion("Practice speaking", "/speaking", "STUDENT"));
			case USER -> List.of(
					suggestion("View my progress", "/progress", "USER"),
					suggestion("Practice speaking", "/speaking", "USER"));
			default -> List.of(suggestion("Go to dashboard", "/dashboard", "USER"));
		};
	}

	private Suggestion suggestion(String label, String route, String targetRole) {
		return Suggestion.builder().label(label).route(route).targetRole(targetRole).build();
	}
}
