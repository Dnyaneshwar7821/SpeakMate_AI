package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.LessonProgressRequest;
import com.rslsolution.speakmateai.dto.request.LessonRequest;
import com.rslsolution.speakmateai.dto.response.CategoryResponse;
import com.rslsolution.speakmateai.dto.response.LessonProgressResponse;
import com.rslsolution.speakmateai.dto.response.LessonResponse;

public interface LessonService {

	// ── Existing CRUD (unchanged) ─────────────────────────────────────
	LessonResponse createLesson(LessonRequest request);

	List<LessonResponse> getAllLessons();

	LessonResponse getLessonById(Long id);

	List<LessonResponse> getLessonsByCategory(String category);

	List<LessonResponse> getLessonsByLevel(String level);

	List<LessonResponse> getLessonsByCategoryAndLevel(String category, String level);

	List<LessonResponse> getActiveLessons();

	List<LessonResponse> getUpcomingLessons();

	LessonResponse updateLesson(Long id, LessonRequest request);

	void deleteLesson(Long id);

	// ── Phase 2 — Module endpoints ────────────────────────────────────
	List<CategoryResponse> getCategories();

	List<LessonResponse> getRecommended();

	List<LessonResponse> getContinueLearning();

	List<LessonResponse> search(String query, String category, String difficulty);

	List<LessonResponse> getRecent();

	List<LessonResponse> getCompleted();

	LessonResponse startLesson(Long id);

	LessonProgressResponse updateProgress(LessonProgressRequest request);

	LessonProgressResponse completeLesson(Long id);
}