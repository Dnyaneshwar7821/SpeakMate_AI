package com.rslsolution.speakmateai.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.rslsolution.speakmateai.dto.groq.GroqRequest;
import com.rslsolution.speakmateai.dto.groq.GroqResponse;
import com.rslsolution.speakmateai.dto.request.AiRequest;
import com.rslsolution.speakmateai.dto.response.AiResponse;
import com.rslsolution.speakmateai.exception.GroqException;
import com.rslsolution.speakmateai.service.AiService;

@Service
public class AiServiceImpl implements AiService {

	@Value("${groq.api.key:}")
	private String apiKey;

	@Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
	private String apiUrl;

	@Value("${groq.model:llama-3.3-70b-versatile}")
	private String model;

	private final RestTemplate restTemplate;

	public AiServiceImpl(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	@Override
	public AiResponse chat(AiRequest request) {
		return callGroq(request.getPrompt());
	}

	private static final String GRAMMAR_CORRECTION_SYSTEM_PROMPT = """
You are a strict, deterministic English grammar checker for a language-learning app.

TASK:
Given a single sentence, check it for grammar errors and return ONLY valid JSON — no preamble, no markdown, no extra text.

REPORT ALL ERRORS:
You must analyze the entire sentence and report EVERY error found. Do not stop after finding one error. If there are multiple errors (e.g., article usage, capitalization, and punctuation), include each error as a separate item in the "errors" array.

REASONING RULES (apply internally, in this exact order, before deciding isCorrect):
1. Check subject-verb agreement.
2. Check article usage (a/an/the) — missing, wrong, or unnecessary articles.
3. Check capitalization — first word of sentence must be capitalized; common nouns (e.g. "apple", "dog") must NOT be capitalized unless they start the sentence or are proper nouns.
4. Check punctuation (ending punctuation, commas).
5. Check verb tense consistency.
6. Check word order / sentence structure.

CONSISTENCY RULE (critical):
- If ANY error is found in steps 1–6, "isCorrect" MUST be false, and every found error MUST appear in "errors".
- If "errors" is a non-empty array, "isCorrect" MUST be false. These two fields must never contradict each other.
- If NO errors are found, "isCorrect" MUST be true and "errors" MUST be an empty array.
- Do not soften or skip an error just because the sentence is "mostly" correct.

OUTPUT FORMAT (strict JSON, no other text):
{
  "isCorrect": boolean,
  "errors": [
    {
      "type": "string (e.g. 'article', 'capitalization', 'subject-verb agreement', 'punctuation')",
      "issue": "string - what is wrong",
      "correction": "string - the corrected sentence"
    }
  ],
  "correctedSentence": "string - the fully corrected sentence (same as input if isCorrect is true)"
}

EXAMPLES:
Input: "I eat apple"
Output: {"isCorrect": false, "errors": [{"type": "article", "issue": "Missing article before the singular countable noun 'apple'.", "correction": "I eat an apple."}], "correctedSentence": "I eat an apple."}

Input: "I eat an Apple"
Output: {"isCorrect": false, "errors": [{"type": "capitalization", "issue": "'Apple' is a common noun here and should not be capitalized mid-sentence.", "correction": "I eat an apple."}], "correctedSentence": "I eat an apple."}

Input: "I eat an apple."
Output: {"isCorrect": true, "errors": [], "correctedSentence": "I eat an apple."}
""";

	@Override
	public AiResponse grammarCorrection(AiRequest request) {
		return callGroqWithSystem(GRAMMAR_CORRECTION_SYSTEM_PROMPT, "Input: \"" + request.getPrompt() + "\"");
	}

	private AiResponse callGroqWithSystem(String systemPrompt, String userPrompt) {
		try {
			GroqRequest.Message systemMessage = new GroqRequest.Message("system", systemPrompt);
			GroqRequest.Message userMessage = new GroqRequest.Message("user", userPrompt);

			GroqRequest request = new GroqRequest(model, List.of(systemMessage, userMessage), 0.0); // Set temperature to 0 for deterministic checks

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.setBearerAuth(apiKey);

			HttpEntity<GroqRequest> entity = new HttpEntity<>(request, headers);

			ResponseEntity<GroqResponse> response = restTemplate.postForEntity(apiUrl, entity, GroqResponse.class);

			GroqResponse body = response.getBody();

			if (body == null || body.getChoices() == null || body.getChoices().isEmpty()) {
				throw new GroqException("No response received from Groq.");
			}

			String result = body.getChoices().get(0).getMessage().getContent();

			return AiResponse.builder().response(result).build();

		} catch (HttpClientErrorException e) {
			throw new GroqException(e.getResponseBodyAsString());
		} catch (Exception e) {
			throw new GroqException(e.getMessage());
		}
	}

	@Override
	public AiResponse vocabularyAssistant(AiRequest request) {
		return callGroq(
				"Explain the meaning, synonyms, antonyms and give example sentences for:\n\n" + request.getPrompt());
	}

	@Override
	public AiResponse improveSentence(AiRequest request) {
		return callGroq("Improve the following English sentence:\n\n" + request.getPrompt());
	}

	@Override
	public AiResponse speakingFeedback(AiRequest request) {
		return callGroq(
				"Evaluate the following spoken English text. Give grammar feedback, fluency feedback and suggestions:\n\n"
						+ request.getPrompt());
	}

	@Override
	public AiResponse lessonQuiz(AiRequest request) {
		String prompt = "Generate 5 multiple-choice quiz questions for the English lesson titled:\n" 
				+ request.getPrompt() 
				+ "\n\nFormat your response strictly as a raw JSON array of 5 objects (no markdown wrapping, no ``` json, no extra text):\n"
				+ "[\n"
				+ "  {\n"
				+ "    \"question\": \"Question text here?\",\n"
				+ "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
				+ "    \"correctAnswer\": \"Option A\",\n"
				+ "    \"explanation\": \"Short explanation why Option A is correct.\"\n"
				+ "  }\n"
				+ "]\n";
		return callGroq(prompt);
	}

	@Override
	public AiResponse lessonTutor(AiRequest request) {
		String prompt = "You are an expert, encouraging AI English Tutor.\n"
				+ "Teach the student interactively about the following lesson section / topic:\n\n"
				+ request.getPrompt()
				+ "\n\nProvide a clear, engaging explanation, 2 practical real-world examples, and 1 practice question for the student.";
		return callGroq(prompt);
	}

	private AiResponse callGroq(String prompt) {

		try {

			GroqRequest.Message message = new GroqRequest.Message("user", prompt);

			GroqRequest request = new GroqRequest(model, List.of(message), 0.7);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			headers.setBearerAuth(apiKey);

			HttpEntity<GroqRequest> entity = new HttpEntity<>(request, headers);

			ResponseEntity<GroqResponse> response = restTemplate.postForEntity(apiUrl, entity, GroqResponse.class);

			GroqResponse body = response.getBody();

			if (body == null || body.getChoices() == null || body.getChoices().isEmpty()) {

				throw new GroqException("No response received from Groq.");
			}

			String result = body.getChoices().get(0).getMessage().getContent();

			return AiResponse.builder().response(result).build();

		} catch (HttpClientErrorException e) {

			throw new GroqException(e.getResponseBodyAsString());

		} catch (Exception e) {

			throw new GroqException(e.getMessage());
		}
	}
}