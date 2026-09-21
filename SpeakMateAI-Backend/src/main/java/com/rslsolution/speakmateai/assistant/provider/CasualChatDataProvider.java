package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.repository.SchoolRepository;

/**
 * Provides user context (display name, role, school name) for greetings,
 * well-being inquiries, capabilities explanation, and polite small talk.
 */
@Component
public class CasualChatDataProvider implements AssistantDataProvider {

	private final SchoolRepository schoolRepository;
	private final ObjectMapper objectMapper;

	public CasualChatDataProvider(SchoolRepository schoolRepository, ObjectMapper objectMapper) {
		this.schoolRepository = schoolRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.CASUAL_CHAT;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "CASUAL_CHAT");
		String displayName = (actor != null && actor.getDisplayName() != null && !actor.getDisplayName().isBlank())
				? actor.getDisplayName().trim() : null;
		data.put("displayName", displayName);
		data.put("role", actor != null && actor.getRole() != null ? actor.getRole().name() : "USER");

		String schoolName = null;
		if (actor != null && actor.getSchoolId() != null) {
			schoolName = schoolRepository.findById(actor.getSchoolId()).map(School::getName).orElse(null);
		}
		data.put("schoolName", schoolName);

		String chatType = (params != null && params.get("chatType") != null)
				? params.get("chatType").toString() : "GREETING";
		data.put("chatType", chatType);

		return toJson(data);
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
