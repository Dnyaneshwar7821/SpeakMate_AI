package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.AchievementRequest;
import com.rslsolution.speakmateai.dto.response.AchievementResponse;

public interface AchievementService {

	AchievementResponse createAchievement(AchievementRequest request);

	List<AchievementResponse> getAllAchievements();

	AchievementResponse getAchievementById(Long id);

	List<AchievementResponse> getUnlockedAchievements();

	void deleteAchievementById(Long id);

}