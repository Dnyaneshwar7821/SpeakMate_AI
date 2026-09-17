package com.rslsolution.speakmateai.assistant.provider;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.enums.Role;

/**
 * Routes an {@link AssistantIntent} to the correct {@link AssistantDataProvider}
 * for the caller's role, and enforces the role-access matrix so out-of-scope
 * questions never reach a provider (they become a graceful ACCESS_DENIED).
 */
@Component
public class AssistantDataProviderRegistry {

	private final Map<AssistantIntent, AssistantDataProvider> providers = new EnumMap<>(AssistantIntent.class);
	private final SelfProgressDataProvider selfProgressProvider;

	public AssistantDataProviderRegistry(List<AssistantDataProvider> providerList) {
		SelfProgressDataProvider self = null;
		for (AssistantDataProvider p : providerList) {
			if (p instanceof SelfProgressDataProvider) {
				self = (SelfProgressDataProvider) p;
				continue; // routed explicitly for the STUDENT role
			}
			providers.put(p.intent(), p);
		}
		this.selfProgressProvider = self;
	}

	/**
	 * Role access matrix for each intent. Out-of-scope combinations return false
	 * and the service answers with ACCESS_DENIED (no data, no Groq call).
	 */
	public boolean isRoleAllowed(AssistantIntent intent, Role role) {
		if (intent == null || role == null) {
			return false;
		}
		return switch (intent) {
			case PLATFORM_OVERVIEW -> role == Role.SUPER_ADMIN;
			case SCHOOL_OVERVIEW -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN;
			case CLASS_PERFORMANCE -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER;
			case STUDENT_PERFORMANCE -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN
					|| role == Role.TEACHER || role == Role.STUDENT;
			case ACCOUNT_INFO -> true; // every authenticated caller can see their own account
			case BILLING -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN; // School Admin: own school only
			case SCHOOL_ROSTER -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER;
			// School-Admin dashboard PAGE datasets: the School-Admin sees their own
			// school; a Super Admin may request them for a named school.
			case SCHOOL_DASHBOARD -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN;
			case RESULTS_ANALYTICS -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN;
			case AI_INSIGHTS -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN;
			case PROFILE_SETTINGS -> true; // everyone can see their own profile/settings
			// Platform-wide user directory: a Super Admin can access every dataset the
			// web app exposes (e.g. the All Users page at /admin/users).
			case PLATFORM_USERS -> role == Role.SUPER_ADMIN;
			case NAVIGATION_HELP -> role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN
					|| role == Role.TEACHER || role == Role.STUDENT || role == Role.USER;
			case ACCESS_DENIED -> false;
		};
	}

	public Optional<AssistantDataProvider> providerFor(AssistantIntent intent, Role role) {
		if (intent == AssistantIntent.STUDENT_PERFORMANCE && role == Role.STUDENT && selfProgressProvider != null) {
			return Optional.of(selfProgressProvider);
		}
		return Optional.ofNullable(providers.get(intent));
	}
}
