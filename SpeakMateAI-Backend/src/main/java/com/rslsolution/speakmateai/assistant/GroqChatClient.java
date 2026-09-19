package com.rslsolution.speakmateai.assistant;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;

import com.rslsolution.speakmateai.dto.groq.GroqChatRequest;
import com.rslsolution.speakmateai.dto.groq.GroqResponse;
import com.rslsolution.speakmateai.exception.GroqException;

/**
 * Thin, read-only wrapper around the existing Groq chat completions integration
 * (mirrors {@code AIChatServiceImpl.callGroqChat}). Adds JSON-mode support for
 * the assistant's structured two-call pipeline.
 */
@Component
public class GroqChatClient {

	private static final Logger log = LoggerFactory.getLogger(GroqChatClient.class);

	private final RestTemplate restTemplate;

	@Value("${groq.assistant.api.url:${GROQ_ASSISTANT_API_URL:${groq.api.url:https://api.groq.com/openai/v1/chat/completions}}}")
	private String apiUrl;

	@Value("${groq.assistant.api.key:${GROQ_ASSISTANT_API_KEY:${groq.chatbot.api.key:${GROQ_CHATBOT_API_KEY:${chatbot.groq.api.key:${CHATBOT_GROQ_API_KEY:${groq.api.key.chatbot:${GROQ_API_KEY_CHATBOT:${assistant.groq.api.key:${ASSISTANT_GROQ_API_KEY:${assistant.api.key:${ASSISTANT_API_KEY:${chatbot.api.key:${CHATBOT_API_KEY:${groq.key:${GROQ_KEY:${groq.api.key:${GROQ_API_KEY:}}}}}}}}}}}}}}}}}")
	private String apiKey;

	@Value("${groq.assistant.model:${GROQ_ASSISTANT_MODEL:${groq.chatbot.model:${GROQ_CHATBOT_MODEL:${groq.model.assistant:${groq.model.chat:${groq.model:openai/gpt-oss-120b}}}}}}}")
	private String model;

	/**
	 * Returns the sanitized API key (whitespace and surrounding quotes removed).
	 */
	public String getCleanApiKey() {
		if (apiKey == null) {
			return null;
		}
		String clean = apiKey.trim();
		if ((clean.startsWith("\"") && clean.endsWith("\"")) || (clean.startsWith("'") && clean.endsWith("'"))) {
			clean = clean.substring(1, clean.length() - 1).trim();
		}
		return clean;
	}

	@PostConstruct
	public void init() {
		String key = getCleanApiKey();
		if (key != null && !key.isBlank()) {
			String masked = key.length() > 8
					? key.substring(0, 4) + "..." + key.substring(key.length() - 4)
					: "***";
			log.info("Assistant GroqChatClient initialized successfully with active API key ({}), model={}", masked, model);
		} else {
			log.warn("Assistant GroqChatClient initialized with NO API key configured! (Check GROQ_ASSISTANT_API_KEY, GROQ_CHATBOT_API_KEY, or GROQ_API_KEY in Render environment)");
		}
	}

	/**
	 * Uses a dedicated, timeout-bounded RestTemplate instead of the shared application
	 * bean. Without a read timeout a stalled Groq connection would block the assistant
	 * request indefinitely; the assistant now degrades to a deterministic answer instead.
	 */
	public GroqChatClient() {
		SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
		factory.setConnectTimeout(5000);
		factory.setReadTimeout(30000);
		this.restTemplate = new RestTemplate(factory);
	}

	/**
	 * Chat call with JSON-mode response format (used for intent classification).
	 */
	public String chatJson(List<GroqChatRequest.Message> messages) {
		return chatJson(messages, 0.2);
	}

	public String chatJson(List<GroqChatRequest.Message> messages, double temperature) {
		return call(messages, temperature, Map.<String, Object>of("type", "json_object"));
	}

	public String chat(List<GroqChatRequest.Message> messages, double temperature) {
		return call(messages, temperature, null);
	}

	private String call(List<GroqChatRequest.Message> messages, double temperature, Map<String, Object> responseFormat) {
		String cleanKey = getCleanApiKey();
		if (cleanKey == null || cleanKey.isBlank()) {
			throw new GroqException("Groq API key is not configured. Set GROQ_ASSISTANT_API_KEY, GROQ_CHATBOT_API_KEY, or GROQ_API_KEY before using the AI assistant.");
		}
		try {
			GroqChatRequest request = new GroqChatRequest(model, messages, temperature, responseFormat);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.setBearerAuth(cleanKey);

			HttpEntity<GroqChatRequest> entity = new HttpEntity<>(request, headers);
			String targetUrl = Objects.requireNonNull(
					(apiUrl != null && !apiUrl.isBlank()) ? apiUrl.trim() : "https://api.groq.com/openai/v1/chat/completions");
			ResponseEntity<GroqResponse> response = restTemplate.postForEntity(targetUrl, entity, GroqResponse.class);
			GroqResponse body = response.getBody();

			if (body == null || body.getChoices() == null || body.getChoices().isEmpty()
					|| body.getChoices().get(0).getMessage() == null
					|| body.getChoices().get(0).getMessage().getContent() == null) {
				throw new GroqException("No response received from Groq.");
			}

			return body.getChoices().get(0).getMessage().getContent();
		} catch (GroqException e) {
			throw e;
		} catch (HttpStatusCodeException e) {
			// Groq returns 429 when the per-minute or per-day token quota is exhausted.
			// Surface it distinctly (and in the logs) so the cause is obvious; the
			// assistant will fall back to a deterministic, data-backed answer.
			int status = e.getStatusCode().value();
			if (status == 429) {
				log.warn("Groq rate limit reached (429, model={}): {}", model, snippet(e.getResponseBodyAsString()));
				throw new GroqException("Groq rate limit reached (429): " + snippet(e.getResponseBodyAsString()));
			}
			log.error("Groq API returned HTTP {} (model={}): {}", status, model, snippet(e.getResponseBodyAsString()));
			throw new GroqException("Groq API error " + status + ": " + snippet(e.getResponseBodyAsString()));
		} catch (ResourceAccessException e) {
			log.error("Groq API unreachable or timed out (model={}, url={}): {}", model, apiUrl, e.getMessage());
			throw new GroqException("Groq API unreachable: " + e.getMessage());
		} catch (Exception e) {
			// Surface the real Groq failure reason (e.g. 401 invalid key, 404 model_not_found).
			// Previously this was swallowed into a generic GroqException, so a failure only
			// ever appeared to the user as "I couldn't reach the AI service" with no clue
			// in the logs.
			log.error("Groq API call failed (model={}, url={}): {}", model, apiUrl, e.getMessage());
			throw new GroqException("Groq API call failed: " + e.getMessage());
		}
	}

	private String snippet(String raw) {
		if (raw == null) {
			return "";
		}
		String text = raw.replaceAll("\\s+", " ").trim();
		return text.length() > 300 ? text.substring(0, 300) + "..." : text;
	}
}
