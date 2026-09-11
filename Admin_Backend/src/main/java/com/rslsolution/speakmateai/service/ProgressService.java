package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.ProgressRequest;
import com.rslsolution.speakmateai.dto.response.ProgressResponse;

public interface ProgressService {

	ProgressResponse createProgress(ProgressRequest request);

	ProgressResponse getProgress();

	ProgressResponse updateProgress(ProgressRequest request);

	void deleteProgress();

}