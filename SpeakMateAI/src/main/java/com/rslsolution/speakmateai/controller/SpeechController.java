package com.rslsolution.speakmateai.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.rslsolution.speakmateai.dto.request.PronunciationRequest;
import com.rslsolution.speakmateai.dto.response.PronunciationResponse;
import com.rslsolution.speakmateai.dto.response.SpeechToTextResponse;
import com.rslsolution.speakmateai.service.SpeechService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/speech")
public class SpeechController {

	private final SpeechService speechService;

	public SpeechController(SpeechService speechService) {
		this.speechService = speechService;
	}

	@PostMapping(value = "/speech-to-text", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public SpeechToTextResponse speechToText(@RequestParam("file") MultipartFile file) {

		return speechService.speechToText(file);
	}

	@PostMapping("/pronunciation")
	public PronunciationResponse analyzePronunciation(@Valid @RequestBody PronunciationRequest request) {

		return speechService.analyzePronunciation(request);
	}
}