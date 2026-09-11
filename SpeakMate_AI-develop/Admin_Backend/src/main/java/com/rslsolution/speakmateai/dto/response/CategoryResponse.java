package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

	private String name;
	private String icon;
	private String description;
	private Integer lessonCount;
	private Integer completedCount;
	private Integer totalXP;

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getIcon() { return icon; }
	public void setIcon(String icon) { this.icon = icon; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public Integer getLessonCount() { return lessonCount; }
	public void setLessonCount(Integer lessonCount) { this.lessonCount = lessonCount; }

	public Integer getCompletedCount() { return completedCount; }
	public void setCompletedCount(Integer completedCount) { this.completedCount = completedCount; }

	public Integer getTotalXP() { return totalXP; }
	public void setTotalXP(Integer totalXP) { this.totalXP = totalXP; }

	public static CategoryResponseBuilder builder() {
		return new CategoryResponseBuilder();
	}

	public static class CategoryResponseBuilder {
		private String name;
		private String icon;
		private String description;
		private Integer lessonCount;
		private Integer completedCount;
		private Integer totalXP;

		public CategoryResponseBuilder name(String name) { this.name = name; return this; }
		public CategoryResponseBuilder icon(String icon) { this.icon = icon; return this; }
		public CategoryResponseBuilder description(String description) { this.description = description; return this; }
		public CategoryResponseBuilder lessonCount(Integer lessonCount) { this.lessonCount = lessonCount; return this; }
		public CategoryResponseBuilder completedCount(Integer completedCount) { this.completedCount = completedCount; return this; }
		public CategoryResponseBuilder totalXP(Integer totalXP) { this.totalXP = totalXP; return this; }

		public CategoryResponse build() {
            CategoryResponse obj = new CategoryResponse();
            obj.setName(name);
            obj.setIcon(icon);
            obj.setDescription(description);
            obj.setLessonCount(lessonCount);
            obj.setCompletedCount(completedCount);
            obj.setTotalXP(totalXP);
            return obj;
        }
	}
}
