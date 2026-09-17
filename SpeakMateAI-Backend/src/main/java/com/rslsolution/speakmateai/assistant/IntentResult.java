package com.rslsolution.speakmateai.assistant;

import java.util.Collections;
import java.util.Map;

import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;

/**
 * Result of the Groq intent-classifier call: the detected intent plus any entity
 * parameters (student name, class name, roll number, school name, ...) the model
 * extracted from the user's question.
 */
public class IntentResult {

	private final AssistantIntent intent;
	private final Map<String, Object> params;
	private final String rawJson;

	public IntentResult(AssistantIntent intent, Map<String, Object> params, String rawJson) {
		this.intent = intent;
		this.params = params == null ? Collections.emptyMap() : params;
		this.rawJson = rawJson;
	}

	public AssistantIntent getIntent() { return intent; }
	public Map<String, Object> getParams() { return params; }
	public String getRawJson() { return rawJson; }
}
