package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.response.SearchResponse;

public interface SearchService {

	SearchResponse globalSearch(String query);
}
