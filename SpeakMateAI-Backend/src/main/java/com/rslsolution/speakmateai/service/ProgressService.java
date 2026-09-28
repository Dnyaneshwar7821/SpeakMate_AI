package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.ProgressRequest;
import com.rslsolution.speakmateai.dto.response.LeaderboardResponse;
import com.rslsolution.speakmateai.dto.response.ProgressResponse;

public interface ProgressService {

	ProgressResponse createProgress(ProgressRequest request);

	ProgressResponse getProgress();

	ProgressResponse updateProgress(ProgressRequest request);

	void deleteProgress();

	ProgressResponse syncProgress();

	ProgressResponse recalculateUserProgress(Long userId);

	java.util.Map<String, Object> recalculateAllUsers();

	ProgressResponse buyStreakFreeze();

	List<LeaderboardResponse> getLeaderboard(int limit);
}