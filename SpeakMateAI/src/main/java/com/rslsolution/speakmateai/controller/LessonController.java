package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.rslsolution.speakmateai.dto.request.LessonProgressRequest;
import com.rslsolution.speakmateai.dto.request.LessonRequest;
import com.rslsolution.speakmateai.dto.response.CategoryResponse;
import com.rslsolution.speakmateai.dto.response.LessonProgressResponse;
import com.rslsolution.speakmateai.dto.response.LessonResponse;
import com.rslsolution.speakmateai.service.LessonService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
public class LessonController {

	private final LessonService lessonService;

	public LessonController(LessonService lessonService) {
		this.lessonService = lessonService;
	}

	// ── Existing CRUD (preserved at /api/lesson/*) ────────────────────

	@PostMapping("/api/lesson/create-lesson")
	public LessonResponse createLesson(@Valid @RequestBody LessonRequest request) {
		return lessonService.createLesson(request);
	}

	@GetMapping("/api/lesson/get-all-lessons")
	public List<LessonResponse> getAllLessons() {
		return lessonService.getAllLessons();
	}

	@GetMapping("/api/lesson/get-lesson/{id}")
	public LessonResponse getLessonById(@PathVariable Long id) {
		return lessonService.getLessonById(id);
	}

	@GetMapping("/api/lesson/get-lessons-by-category/{category}")
	public List<LessonResponse> getLessonsByCategory(@PathVariable String category) {
		return lessonService.getLessonsByCategory(category);
	}

	@GetMapping("/api/lesson/get-lessons-by-level/{level}")
	public List<LessonResponse> getLessonsByLevel(@PathVariable String level) {
		return lessonService.getLessonsByLevel(level);
	}

	@GetMapping("/api/lesson/get-lessons/{category}/{level}")
	public List<LessonResponse> getLessonsByCategoryAndLevel(
			@PathVariable String category, @PathVariable String level) {
		return lessonService.getLessonsByCategoryAndLevel(category, level);
	}

	@GetMapping("/api/lesson/get-active-lessons")
	public List<LessonResponse> getActiveLessons() {
		return lessonService.getActiveLessons();
	}

	@GetMapping("/api/lesson/upcoming")
	public List<LessonResponse> getUpcomingLessons() {
		return lessonService.getUpcomingLessons();
	}

	@PutMapping("/api/lesson/update-lesson/{id}")
	public LessonResponse updateLesson(@PathVariable Long id, @Valid @RequestBody LessonRequest request) {
		return lessonService.updateLesson(id, request);
	}

	@DeleteMapping("/api/lesson/delete-lesson/{id}")
	public String deleteLesson(@PathVariable Long id) {
		lessonService.deleteLesson(id);
		return "Lesson deleted successfully.";
	}

	// ── Phase 2 — Module endpoints (at /api/lessons/*) ───────────────

	@GetMapping("/api/lessons")
	public List<LessonResponse> listLessons(
			@RequestParam(required = false) String category,
			@RequestParam(required = false) String difficulty) {
		if ((category != null && !category.isBlank()) || (difficulty != null && !difficulty.isBlank())) {
			return lessonService.search(null, category, difficulty);
		}
		return lessonService.getActiveLessons();
	}

	@GetMapping("/api/lessons/categories")
	public List<CategoryResponse> getCategories() {
		return lessonService.getCategories();
	}

	@GetMapping("/api/lessons/{id}")
	public LessonResponse getLessonDetail(@PathVariable Long id) {
		return lessonService.getLessonById(id);
	}

	@GetMapping("/api/lessons/recommended")
	public List<LessonResponse> getRecommended() {
		return lessonService.getRecommended();
	}

	@GetMapping("/api/lessons/continue")
	public List<LessonResponse> getContinueLearning() {
		return lessonService.getContinueLearning();
	}

	@GetMapping("/api/lessons/search")
	public List<LessonResponse> search(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String category,
			@RequestParam(required = false) String difficulty) {
		return lessonService.search(q, category, difficulty);
	}

	@GetMapping("/api/lessons/recent")
	public List<LessonResponse> getRecent() {
		return lessonService.getRecent();
	}

	@GetMapping("/api/lessons/completed")
	public List<LessonResponse> getCompleted() {
		return lessonService.getCompleted();
	}

	@PostMapping("/api/lessons/start/{id}")
	public LessonResponse startLesson(@PathVariable Long id) {
		return lessonService.startLesson(id);
	}

	@PutMapping("/api/lessons/progress")
	public LessonProgressResponse updateProgress(@Valid @RequestBody LessonProgressRequest request) {
		return lessonService.updateProgress(request);
	}

	@PutMapping("/api/lessons/complete/{id}")
	public LessonProgressResponse completeLesson(@PathVariable Long id) {
		return lessonService.completeLesson(id);
	}
}