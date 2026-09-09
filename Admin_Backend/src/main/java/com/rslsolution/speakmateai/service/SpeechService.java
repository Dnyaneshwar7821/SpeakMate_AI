package com.rslsolution.speakmateai.service;

import org.springframework.web.multipart.MultipartFile;

import com.rslsolution.speakmateai.dto.request.PronunciationRequest;
import com.rslsolution.speakmateai.dto.response.PronunciationResponse;
import com.rslsolution.speakmateai.dto.response.SpeechToTextResponse;

public interface SpeechService {

	SpeechToTextResponse speechToText(MultipartFile audioFile);

	PronunciationResponse analyzePronunciation(PronunciationRequest request);

}