package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.VocabularyRequest;
import com.rslsolution.speakmateai.dto.response.VocabularyResponse;

public interface VocabularyService {

	VocabularyResponse addVocabulary(VocabularyRequest request);

	List<VocabularyResponse> getAllVocabulary();

	VocabularyResponse getVocabularyById(Long id);

	List<VocabularyResponse> getFavoriteVocabulary();

	void deleteVocabularyById(Long id);

	VocabularyResponse toggleFavorite(Long id);

	List<java.util.Map<String, Object>> getQuiz();
}