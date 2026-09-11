package com.rslsolution.speakmateai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.response.SearchResponse;
import com.rslsolution.speakmateai.service.SearchService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SearchController {

	private final SearchService searchService;

	@GetMapping
	public ResponseEntity<SearchResponse> search(@RequestParam String q) {
		return ResponseEntity.ok(searchService.globalSearch(q));
	}
}
