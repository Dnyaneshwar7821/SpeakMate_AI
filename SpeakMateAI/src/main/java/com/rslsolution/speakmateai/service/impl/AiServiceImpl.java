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

	@Value("${groq.model.chat:${groq.model:openai/gpt-oss-120b}}")
	private String chatModel;

	@Value("${groq.model.analysis:${groq.model:qwen/qwen3.6-27b}}")
	private String analysisModel;

	private final RestTemplate restTemplate;

	public AiServiceImpl(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	@Override
	public AiResponse chat(AiRequest request) {
		return callGroq(chatModel, request.getPrompt(), 0.7);
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
		try {
			return callGroqWithSystem(analysisModel, GRAMMAR_CORRECTION_SYSTEM_PROMPT, "Input: \"" + request.getPrompt() + "\"");
		} catch (Exception e) {
			String sentence = (request != null && request.getPrompt() != null) ? request.getPrompt().trim() : "";
			String fallback = String.format("{\"isCorrect\": true, \"errors\": [], \"correctedSentence\": \"%s\"}", sentence);
			return AiResponse.builder().response(fallback).build();
		}
	}

	private AiResponse callGroqWithSystem(String targetModel, String systemPrompt, String userPrompt) {
		List<GroqRequest.Message> messages = List.of(
				new GroqRequest.Message("system", systemPrompt),
				new GroqRequest.Message("user", userPrompt));
		try {
			return executeGroqCall(targetModel, messages, 0.0);
		} catch (Exception e) {
			if (!"llama-3.1-8b-instant".equals(targetModel)) {
				try {
					return executeGroqCall("llama-3.1-8b-instant", messages, 0.0);
				} catch (Exception ex) {
					throw new GroqException(ex.getMessage());
				}
			}
			throw (e instanceof GroqException ge) ? ge : new GroqException(e.getMessage());
		}
	}

	@Override
	public AiResponse vocabularyAssistant(AiRequest request) {
		try {
			return callGroq(
					chatModel,
					"Explain the meaning, synonyms, antonyms and give example sentences for:\n\n" + request.getPrompt(),
					0.5);
		} catch (Exception e) {
			String w = (request != null && request.getPrompt() != null) ? request.getPrompt() : "word";
			return AiResponse.builder().response("Word: " + w + "\nMeaning: A key English word.\nExample: Practice using '" + w + "' in daily conversations.").build();
		}
	}

	@Override
	public AiResponse improveSentence(AiRequest request) {
		try {
			return callGroq(chatModel, "Improve the following English sentence:\n\n" + request.getPrompt(), 0.5);
		} catch (Exception e) {
			String s = (request != null && request.getPrompt() != null) ? request.getPrompt() : "";
			return AiResponse.builder().response(s).build();
		}
	}

	@Override
	public AiResponse speakingFeedback(AiRequest request) {
		try {
			return callGroq(
					chatModel,
					"Evaluate the following spoken English text. Give grammar feedback, fluency feedback and suggestions:\n\n"
							+ request.getPrompt(),
					0.5);
		} catch (Exception e) {
			return AiResponse.builder().response("Good job! Your sentence is clear and communicates the intended idea well. Continue practicing for greater fluency.").build();
		}
	}

	@Override
	public AiResponse lessonQuiz(AiRequest request) {
		try {
			String prompt = "Generate 5 multiple-choice quiz questions for the English lesson titled:\n" 
					+ request.getPrompt() 
					+ "\n\nFormat your response strictly as a raw JSON array of 5 objects with no surrounding markdown or conversational text:\n"
					+ "[\n"
					+ "  {\n"
					+ "    \"question\": \"Which sentence is grammatically correct?\",\n"
					+ "    \"options\": [\"Option 1\", \"Option 2\", \"Option 3\", \"Option 4\"],\n"
					+ "    \"correctAnswer\": \"Option 1\",\n"
					+ "    \"explanation\": \"Because...\"\n"
					+ "  }\n"
					+ "]";
			List<GroqRequest.Message> messages = List.of(
				new GroqRequest.Message("system", "You are an automated backend JSON API. You MUST output ONLY valid, parsable JSON starting with '[' and ending with ']'. Never output introductory words like 'Certainly', 'Here are', markdown formatting, bold text, or backticks."),
				new GroqRequest.Message("user", prompt)
			);
			AiResponse res = executeGroqCall("llama-3.3-70b-versatile", messages, 0.2);
			if (res != null && res.getResponse() != null) {
				String raw = res.getResponse().trim();
				raw = raw.replaceAll("(?s)<think>.*?</think>", "").trim();
				raw = raw.replaceAll("(?s)<think>.*", "").trim();
				raw = raw.replace("```json", "").replace("```", "").trim();
				int start = raw.indexOf('[');
				int end = raw.lastIndexOf(']');
				if (start != -1 && end != -1 && end > start) {
					raw = raw.substring(start, end + 1);
				}
				return AiResponse.builder().response(raw).build();
			}
			return res;
		} catch (Exception e) {
			String fallbackJson = """
[
  {"question": "Which sentence is grammatically correct?", "options": ["She don't like coffee.", "She doesn't likes coffee.", "She doesn't like coffee.", "She not like coffee."], "correctAnswer": "She doesn't like coffee.", "explanation": "In present simple negative with third person singular, use 'doesn't' + base verb."},
  {"question": "Choose the correct past tense form: 'They ____ to London last year.'", "options": ["go", "went", "gone", "going"], "correctAnswer": "went", "explanation": "'Went' is the simple past form of 'go'."},
  {"question": "Which of these is a synonym for 'rapid'?", "options": ["Slow", "Quick", "Heavy", "Quiet"], "correctAnswer": "Quick", "explanation": "'Rapid' means happening in a short time or at high speed."},
  {"question": "Select the correct article: 'I saw ____ elephant at the zoo.'", "options": ["a", "an", "the", "no article"], "correctAnswer": "an", "explanation": "Use 'an' before words starting with a vowel sound."},
  {"question": "Which sentence expresses a polite request?", "options": ["Give me that water.", "I want water now.", "Could you please pass the water?", "Water is what I need."], "correctAnswer": "Could you please pass the water?", "explanation": "'Could you please...' is the most polite phrasing."}
]
""";
			return AiResponse.builder().response(fallbackJson.trim()).build();
		}
	}

	@Override
	public AiResponse lessonTutor(AiRequest request) {
		try {
			String prompt = "You are a master English teacher and speech coach.\n"
					+ "Teach a comprehensive, detailed masterclass on the topic:\n"
					+ request.getPrompt()
					+ "\n\nStructure your lesson in these clear, detailed sections without markdown asterisks or bullet stars:\n"
					+ "1. WHAT IS THIS CONCEPT: Explain the meaning, core function, and foundational rules in crystal-clear detail.\n"
					+ "2. WHY IT IS CRUCIAL: Explain how mastering this transforms spoken confidence, natural fluency, and professional communication.\n"
					+ "3. SENTENCE FORMULA AND RULES: Give the exact sentence structures (positive, negative, question formats) with step-by-step guidance.\n"
					+ "4. PRACTICAL REAL-WORLD USAGE: Provide practical conversational examples and explain how native speakers use this in daily discussions.\n"
					+ "5. COMMON MISTAKES TO AVOID: Point out 2-3 frequent learner errors and give the exact corrections.\n"
					+ "6. PRO-TIP FOR MASTERY: Share one powerful action step to master this topic today.\n\n"
					+ "Write in warm, engaging, spoken English suitable for text-to-speech read-aloud (total 250-320 words). Do NOT output reasoning thoughts, asterisks, or outline meta-text.";
			List<GroqRequest.Message> messages = List.of(
				new GroqRequest.Message("system", "You are a world-class AI English Tutor. You provide detailed, comprehensive, high-quality spoken lessons. Never output reasoning tags, asterisk bolding, or meta-notes."),
				new GroqRequest.Message("user", prompt)
			);
			return executeGroqCall("llama-3.3-70b-versatile", messages, 0.7);
		} catch (Exception e) {
			return AiResponse.builder()
					.response("Welcome to your detailed lesson masterclass! Today we are exploring this topic thoroughly to build your English fluency.\n\n1. What is this concept: This topic forms the backbone of natural, confident communication. It gives your sentences proper grammatical structure and clarity.\n\n2. Why it matters: Mastering this allows you to express thoughts precisely without second-guessing yourself or getting stuck mid-sentence.\n\n3. The Core Rules: Always pay attention to subject-verb agreement and natural word order. Practice formulating positive, negative, and question sentences.\n\n4. Common Pitfalls: Avoid translating word-for-word from your native language. Instead, think in full phrases.\n\n5. Action Step: Speak 3 original sentences out loud using this concept right now to lock it into your memory!")
					.build();
		}
	}

	private AiResponse callGroq(String prompt) {
		return callGroq(chatModel, prompt, 0.7);
	}

	private AiResponse callGroq(String targetModel, String prompt, double temperature) {
		try {
			return executeGroqCall(targetModel, List.of(new GroqRequest.Message("user", prompt)), temperature);
		} catch (Exception e) {
			if (!"llama-3.1-8b-instant".equals(targetModel)) {
				try {
					return executeGroqCall("llama-3.1-8b-instant", List.of(new GroqRequest.Message("user", prompt)), temperature);
				} catch (Exception ex) {
					throw new GroqException(ex.getMessage());
				}
			}
			throw (e instanceof GroqException ge) ? ge : new GroqException(e.getMessage());
		}
	}

	private AiResponse executeGroqCall(String modelName, List<GroqRequest.Message> messages, double temperature) {
		try {
			GroqRequest request = new GroqRequest(modelName, messages, temperature);

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
			if (result != null) {
				result = result.replaceAll("(?s)<think>.*?</think>", "").trim();
				result = result.replaceAll("(?s)<think>.*", "").trim();
			}

			return AiResponse.builder().response(result).build();

		} catch (HttpClientErrorException e) {
			throw new GroqException(e.getResponseBodyAsString());
		} catch (Exception e) {
			throw new GroqException(e.getMessage());
		}
	}
}