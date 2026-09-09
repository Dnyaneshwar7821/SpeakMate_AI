package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.GrammarRequest;
import com.rslsolution.speakmateai.dto.response.GrammarResponse;

public interface GrammarService {

	GrammarResponse checkGrammar(GrammarRequest request);

	List<GrammarResponse> getAllGrammarHistory();

	GrammarResponse getGrammarById(Long id);

	void deleteGrammarById(Long id);

}