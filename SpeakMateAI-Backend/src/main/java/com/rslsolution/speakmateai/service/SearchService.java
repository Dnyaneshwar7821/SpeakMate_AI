package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.response.SearchResponse;
import com.rslsolution.speakmateai.dto.response.SearchResultItem;

public interface SearchService {

	SearchResponse globalSearch(String query);
}
