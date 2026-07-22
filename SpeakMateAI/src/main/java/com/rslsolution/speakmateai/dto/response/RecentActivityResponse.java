package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentActivityResponse {

	private String id;

	private String type;

	private String icon;

	private String title;

	private LocalDateTime time;

	private Integer xp;

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }

	public String getIcon() { return icon; }
	public void setIcon(String icon) { this.icon = icon; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public LocalDateTime getTime() { return time; }
	public void setTime(LocalDateTime time) { this.time = time; }

	public Integer getXp() { return xp; }
	public void setXp(Integer xp) { this.xp = xp; }

	public static RecentActivityResponseBuilder builder() {
		return new RecentActivityResponseBuilder();
	}

	public static class RecentActivityResponseBuilder {
		private String id;
		private String type;
		private String icon;
		private String title;
		private LocalDateTime time;
		private Integer xp;

		public RecentActivityResponseBuilder id(String id) { this.id = id; return this; }
		public RecentActivityResponseBuilder type(String type) { this.type = type; return this; }
		public RecentActivityResponseBuilder icon(String icon) { this.icon = icon; return this; }
		public RecentActivityResponseBuilder title(String title) { this.title = title; return this; }
		public RecentActivityResponseBuilder time(LocalDateTime time) { this.time = time; return this; }
		public RecentActivityResponseBuilder xp(Integer xp) { this.xp = xp; return this; }

		public RecentActivityResponse build() {
			return new RecentActivityResponse(id, type, icon, title, time, xp);
		}
	}
}
