package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.GrammarRequest;
import com.rslsolution.speakmateai.dto.response.GrammarResponse;
import com.rslsolution.speakmateai.service.GrammarService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/grammar")
public class GrammarController {

	private final GrammarService grammarService;

	public GrammarController(GrammarService grammarService) {
		this.grammarService = grammarService;
	}

	@PostMapping("/check-grammar")
	public GrammarResponse checkGrammar(@Valid @RequestBody GrammarRequest request) {

		return grammarService.checkGrammar(request);
	}

	@GetMapping("/get-all-grammar")
	public List<GrammarResponse> getAllGrammarHistory() {

		return grammarService.getAllGrammarHistory();
	}

	@GetMapping("/get-grammar/{id}")
	public GrammarResponse getGrammarById(@PathVariable Long id) {

		return grammarService.getGrammarById(id);
	}

	@DeleteMapping("/delete-grammar/{id}")
	public String deleteGrammarById(@PathVariable Long id) {

		grammarService.deleteGrammarById(id);

		return "Grammar history deleted successfully.";
	}
}