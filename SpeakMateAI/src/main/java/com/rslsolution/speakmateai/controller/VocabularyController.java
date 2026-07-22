package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.VocabularyRequest;
import com.rslsolution.speakmateai.dto.response.VocabularyResponse;
import com.rslsolution.speakmateai.service.VocabularyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vocabulary")
public class VocabularyController {

	private final VocabularyService vocabularyService;

	public VocabularyController(VocabularyService vocabularyService) {
		this.vocabularyService = vocabularyService;
	}

	@PostMapping("/add-vocabulary")
	public VocabularyResponse addVocabulary(@Valid @RequestBody VocabularyRequest request) {

		return vocabularyService.addVocabulary(request);
	}

	@GetMapping("/get-all-vocabulary")
	public List<VocabularyResponse> getAllVocabulary() {

		return vocabularyService.getAllVocabulary();
	}

	@GetMapping("/get-vocabulary/{id}")
	public VocabularyResponse getVocabularyById(@PathVariable Long id) {

		return vocabularyService.getVocabularyById(id);
	}

	@GetMapping("/get-favorite-vocabulary")
	public List<VocabularyResponse> getFavoriteVocabulary() {

		return vocabularyService.getFavoriteVocabulary();
	}

	@DeleteMapping("/delete-vocabulary/{id}")
	public String deleteVocabularyById(@PathVariable Long id) {

		vocabularyService.deleteVocabularyById(id);

		return "Vocabulary deleted successfully.";
	}

	@PutMapping("/toggle-favorite/{id}")
	public VocabularyResponse toggleFavorite(@PathVariable Long id) {
		return vocabularyService.toggleFavorite(id);
	}

	@GetMapping("/quiz")
	public List<java.util.Map<String, Object>> getQuiz() {
		return vocabularyService.getQuiz();
	}
}