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

	public List<SearchResultItem> getResults() { return results; }
	public void setResults(List<SearchResultItem> results) { this.results = results; }

	public Long getTotal() { return total; }
	public void setTotal(Long total) { this.total = total; }

	public static SearchResponse of(List<SearchResultItem> results) {
		SearchResponse resp = new SearchResponse();
		resp.setResults(results);
		resp.setTotal((long) (results != null ? results.size() : 0));
		return resp;
	}

	public static SearchResponseBuilder builder() {
		return new SearchResponseBuilder();
	}

	public static class SearchResponseBuilder {
		private List<SearchResultItem> results;
		private Long total;

		public SearchResponseBuilder results(List<SearchResultItem> results) {
			this.results = results;
			return this;
		}

		public SearchResponseBuilder total(Long total) {
			this.total = total;
			return this;
		}

		public SearchResponse build() {
			SearchResponse r = new SearchResponse();
			r.setResults(results);
			r.setTotal(total);
			return r;
		}
	}
}
