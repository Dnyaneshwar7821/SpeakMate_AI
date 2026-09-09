package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.SpeakingMessageRequest;
import com.rslsolution.speakmateai.dto.request.SpeakingSessionRequest;
import com.rslsolution.speakmateai.dto.request.SpeakingStartRequest;
import com.rslsolution.speakmateai.dto.response.SpeakingEndResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingHistoryResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingMessageResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingSessionDetailResponse;
import com.rslsolution.speakmateai.dto.response.SpeakingSessionResponse;

public interface SpeakingSessionService {

	// ── Existing CRUD (kept for compatibility) ────────────────────────
	SpeakingSessionResponse createSession(SpeakingSessionRequest request);

	List<SpeakingSessionResponse> getAllSessions();

	SpeakingSessionResponse getSessionById(Long id);

	void deleteSession(Long id);

	// ── Phase 2 — Speaking practice module ────────────────────────────
	SpeakingSessionResponse startSession(SpeakingStartRequest request);

	SpeakingMessageResponse processMessage(SpeakingMessageRequest request);

	SpeakingEndResponse endSession(Long id);

	List<SpeakingHistoryResponse> getSessionHistory();

	SpeakingSessionDetailResponse getSessionDetail(Long id);

	List<String> getHints(Long id);
}