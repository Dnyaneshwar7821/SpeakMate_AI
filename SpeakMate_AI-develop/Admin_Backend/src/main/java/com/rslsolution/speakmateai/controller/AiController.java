package com.rslsolution.speakmateai.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.AiRequest;
import com.rslsolution.speakmateai.dto.response.AiResponse;
import com.rslsolution.speakmateai.service.AiService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ai")
public class AiController {

	private final AiService aiService;

	public AiController(AiService aiService) {
		this.aiService = aiService;
	}

	@PostMapping("/chat")
	public AiResponse chat(@Valid @RequestBody AiRequest request) {
		return aiService.chat(request);
	}

	@PostMapping("/grammar")
	public AiResponse grammarCorrection(@Valid @RequestBody AiRequest request) {
		return aiService.grammarCorrection(request);
	}

	@PostMapping("/vocabulary")
	public AiResponse vocabularyAssistant(@Valid @RequestBody AiRequest request) {
		return aiService.vocabularyAssistant(request);
	}

	@PostMapping("/improve-sentence")
	public AiResponse improveSentence(@Valid @RequestBody AiRequest request) {
		return aiService.improveSentence(request);
	}

	@PostMapping("/speaking-feedback")
	public AiResponse speakingFeedback(@Valid @RequestBody AiRequest request) {
		return aiService.speakingFeedback(request);
	}

	@PostMapping("/lesson-quiz")
	public AiResponse lessonQuiz(@Valid @RequestBody AiRequest request) {
		return aiService.lessonQuiz(request);
	}

	@PostMapping("/lesson-tutor")
	public AiResponse lessonTutor(@Valid @RequestBody AiRequest request) {
		return aiService.lessonTutor(request);
	}
}