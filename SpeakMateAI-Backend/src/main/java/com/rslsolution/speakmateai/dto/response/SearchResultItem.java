package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultItem {

	private String type;
	private Long id;
	private String name;
	private String email;
	private String subtitle;
	private String status;

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getSubtitle() { return subtitle; }
	public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }

	public static SearchResultItemBuilder builder() {
		return new SearchResultItemBuilder();
	}

	public static class SearchResultItemBuilder {
		private String type;
		private Long id;
		private String name;
		private String email;
		private String subtitle;
		private String status;

		public SearchResultItemBuilder type(String type) { this.type = type; return this; }
		public SearchResultItemBuilder id(Long id) { this.id = id; return this; }
		public SearchResultItemBuilder name(String name) { this.name = name; return this; }
		public SearchResultItemBuilder email(String email) { this.email = email; return this; }
		public SearchResultItemBuilder subtitle(String subtitle) { this.subtitle = subtitle; return this; }
		public SearchResultItemBuilder status(String status) { this.status = status; return this; }

		public SearchResultItem build() {
			SearchResultItem item = new SearchResultItem();
			item.setType(type);
			item.setId(id);
			item.setName(name);
			item.setEmail(email);
			item.setSubtitle(subtitle);
			item.setStatus(status);
			return item;
		}
	}
}
