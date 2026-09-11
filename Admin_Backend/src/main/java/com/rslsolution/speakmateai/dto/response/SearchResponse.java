package com.rslsolution.speakmateai.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponse {

	private List<SearchResultItem> results;
	private Long total;

	public static SearchResponse of(List<SearchResultItem> results) {
		return SearchResponse.builder().results(results).total((long) results.size()).build();
	}
}
