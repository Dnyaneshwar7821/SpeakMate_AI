package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.rslsolution.speakmateai.dto.request.SpeakingMessageRequest;
import com.rslsolution.speakmateai.dto.request.SpeakingSessionRequest;
import com.rslsolution.speakmateai.dto.request.SpeakingStartRequest;
import com.rslsolution.speakmateai.dto.response.SpeakingEndResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingHistoryResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingMessageResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingSessionDetailResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingSessionResponse;
import com.rslsolution.speakmateai.service.SpeakingSessionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/speaking")
@CrossOrigin(origins = "*")
public class SpeakingSessionController {

	private final SpeakingSessionService speakingSessionService;

	public SpeakingSessionController(SpeakingSessionService speakingSessionService) {
		this.speakingSessionService = speakingSessionService;
	}

	// ── Existing endpoints (kept for compatibility) ──────────────────

	@PostMapping("/create")
	public SpeakingSessionResponse createSession(@Valid @RequestBody SpeakingSessionRequest request) {
		return speakingSessionService.createSession(request);
	}

	@GetMapping("/get-all-sessions")
	public List<SpeakingSessionResponse> getAllSessions() {
		return speakingSessionService.getAllSessions();
	}

	@GetMapping("/get-session/{id}")
	public SpeakingSessionResponse getSessionById(@PathVariable Long id) {
		return speakingSessionService.getSessionById(id);
	}

	@DeleteMapping("/delete-session/{id}")
	public String deleteSession(@PathVariable Long id) {
		speakingSessionService.deleteSession(id);
		return "Speaking session deleted successfully.";
	}

	// ── Phase 2 — Speaking practice module endpoints ─────────────────

	@PostMapping("/start")
	public SpeakingSessionResponse startSession(@Valid @RequestBody SpeakingStartRequest request) {
		return speakingSessionService.startSession(request);
	}

	@PostMapping("/message")
	public SpeakingMessageResponse sendMessage(@Valid @RequestBody SpeakingMessageRequest request) {
		return speakingSessionService.processMessage(request);
	}

	@PostMapping("/end/{id}")
	public SpeakingEndResponse endSession(@PathVariable Long id) {
		return speakingSessionService.endSession(id);
	}

	@GetMapping("/history")
	public List<SpeakingHistoryResponse> getHistory() {
		return speakingSessionService.getSessionHistory();
	}

	@GetMapping("/session/{id}")
	public SpeakingSessionDetailResponse getDetail(@PathVariable Long id) {
		return speakingSessionService.getSessionDetail(id);
	}

	@GetMapping("/hint/{id}")
	public List<String> getHints(@PathVariable Long id) {
		return speakingSessionService.getHints(id);
	}

	@DeleteMapping("/{id}")
	public String removeSession(@PathVariable Long id) {
		speakingSessionService.deleteSession(id);
		return "Session deleted successfully.";
	}
}