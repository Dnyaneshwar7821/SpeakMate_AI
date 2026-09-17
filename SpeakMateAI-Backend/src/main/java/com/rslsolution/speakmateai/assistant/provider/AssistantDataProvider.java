package com.rslsolution.speakmateai.assistant.provider;

import java.util.Map;

import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;

/**
 * A role-scoped, read-only data source for the assistant pipeline. Each provider
 * computes aggregated data for one {@link AssistantIntent} and returns it as a
 * JSON string for the Groq answer synthesizer.
 *
 * <p>Providers never write to the database and never return raw entity graphs —
 * only safe, aggregated summaries within the caller's role scope.
 */
public interface AssistantDataProvider {

	AssistantIntent intent();

	String provide(ActorContext actor, Map<String, Object> params);
}
