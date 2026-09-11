package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false, fetch = jakarta.persistence.FetchType.LAZY)
	@JoinColumn(name = "student_id", nullable = false)
	private User student;

	@NotBlank(message = "Test title is required")
	@Column(nullable = false)
	private String testTitle;

	@NotNull(message = "Marks obtained is required")
	@Min(value = 0, message = "Marks obtained must be >= 0")
	@Column(nullable = false)
	private Double marksObtained;

	@NotNull(message = "Total marks is required")
	@Min(value = 1, message = "Total marks must be >= 1")
	@Column(nullable = false)
	private Double totalMarks;

	@Column(nullable = false, updatable = false)
	private LocalDateTime submittedAt;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@Column(nullable = false)
	private String status;

	@Builder.Default
	@Column(nullable = false)
	private boolean active = true;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		submittedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getStudent() {
		return student;
	}

	public void setStudent(User student) {
		this.student = student;
	}

	public String getTestTitle() {
		return testTitle;
	}

	public void setTestTitle(String testTitle) {
		this.testTitle = testTitle;
	}

	public Double getMarksObtained() {
		return marksObtained;
	}

	public void setMarksObtained(Double marksObtained) {
		this.marksObtained = marksObtained;
	}

	public Double getTotalMarks() {
		return totalMarks;
	}

	public void setTotalMarks(Double totalMarks) {
		this.totalMarks = totalMarks;
	}

	public LocalDateTime getSubmittedAt() {
		return submittedAt;
	}

	public void setSubmittedAt(LocalDateTime submittedAt) {
		this.submittedAt = submittedAt;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public static ResultBuilder builder() {
		return new ResultBuilder();
	}

	public static class ResultBuilder {
		private Long id;
		private User student;
		private String testTitle;
		private Double marksObtained;
		private Double totalMarks;
		private LocalDateTime submittedAt;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;
		private String status;
		private boolean active = true;

		public ResultBuilder id(Long id) {
			this.id = id;
			return this;
		}

		public ResultBuilder student(User student) {
			this.student = student;
			return this;
		}

		public ResultBuilder testTitle(String testTitle) {
			this.testTitle = testTitle;
			return this;
		}

		public ResultBuilder marksObtained(Double marksObtained) {
			this.marksObtained = marksObtained;
			return this;
		}

		public ResultBuilder totalMarks(Double totalMarks) {
			this.totalMarks = totalMarks;
			return this;
		}

		public ResultBuilder submittedAt(LocalDateTime submittedAt) {
			this.submittedAt = submittedAt;
			return this;
		}

		public ResultBuilder createdAt(LocalDateTime createdAt) {
			this.createdAt = createdAt;
			return this;
		}

		public ResultBuilder updatedAt(LocalDateTime updatedAt) {
			this.updatedAt = updatedAt;
			return this;
		}

		public ResultBuilder status(String status) {
			this.status = status;
			return this;
		}

		public ResultBuilder active(boolean active) {
			this.active = active;
			return this;
		}

		public Result build() {
			Result result = new Result();
			result.setId(id);
			result.setStudent(student);
			result.setTestTitle(testTitle);
			result.setMarksObtained(marksObtained);
			result.setTotalMarks(totalMarks);
			result.setSubmittedAt(submittedAt);
			result.setCreatedAt(createdAt);
			result.setUpdatedAt(updatedAt);
			result.setStatus(status);
			result.setActive(active);
			return result;
		}
	}
}
