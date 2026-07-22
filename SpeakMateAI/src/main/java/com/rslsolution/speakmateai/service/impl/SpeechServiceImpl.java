package com.rslsolution.speakmateai.service.impl;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.rslsolution.speakmateai.dto.groq.SpeechGroqResponse;
import com.rslsolution.speakmateai.dto.request.PronunciationRequest;
import com.rslsolution.speakmateai.dto.response.PronunciationResponse;
import com.rslsolution.speakmateai.dto.response.SpeechToTextResponse;
import com.rslsolution.speakmateai.exception.SpeechException;
import com.rslsolution.speakmateai.service.AiService;
import com.rslsolution.speakmateai.service.SpeechService;

@Service
public class SpeechServiceImpl implements SpeechService {

	@Value("${groq.api.key}")
	private String apiKey;

	@Value("${groq.whisper.url}")
	private String whisperUrl;

	@Value("${groq.whisper.model}")
	private String whisperModel;

	private final RestTemplate restTemplate;

	private final AiService aiService;

	public SpeechServiceImpl(RestTemplate restTemplate, AiService aiService) {

		this.restTemplate = restTemplate;
		this.aiService = aiService;
	}

	@Override
	public SpeechToTextResponse speechToText(MultipartFile audioFile) {

		try {

			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(apiKey);

			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

			ByteArrayResource resource = new ByteArrayResource(audioFile.getBytes()) {

				@Override
				public String getFilename() {

					return audioFile.getOriginalFilename();
				}
			};

			body.add("file", resource);

			body.add("model", whisperModel);

			HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

			ResponseEntity<SpeechGroqResponse> response = restTemplate.postForEntity(whisperUrl, request,
					SpeechGroqResponse.class);

			SpeechGroqResponse groqResponse = response.getBody();

			if (groqResponse == null) {

				throw new SpeechException("No transcription received.");
			}

			return SpeechToTextResponse.builder().transcript(groqResponse.getText()).build();

		} catch (IOException e) {

			throw new SpeechException("Unable to read audio file.");

		} catch (Exception e) {

			throw new SpeechException(e.getMessage());
		}
	}

	@Override
	public PronunciationResponse analyzePronunciation(PronunciationRequest request) {

		String feedback = aiService.speakingFeedback(

				com.rslsolution.speakmateai.dto.request.AiRequest.builder().prompt(request.getText()).build()

		).getResponse();

		return PronunciationResponse.builder().feedback(feedback).build();
	}
}