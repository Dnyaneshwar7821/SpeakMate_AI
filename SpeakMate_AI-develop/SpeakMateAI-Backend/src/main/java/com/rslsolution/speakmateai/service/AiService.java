package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.AiRequest;
import com.rslsolution.speakmateai.dto.response.AiResponse;

public interface AiService {

	AiResponse chat(AiRequest request);

	AiResponse grammarCorrection(AiRequest request);

	AiResponse vocabularyAssistant(AiRequest request);

	AiResponse improveSentence(AiRequest request);

	AiResponse speakingFeedback(AiRequest request);

	AiResponse lessonQuiz(AiRequest request);

	AiResponse lessonTutor(AiRequest request);

}