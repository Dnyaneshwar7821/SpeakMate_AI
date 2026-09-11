package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.ResultRequest;
import com.rslsolution.speakmateai.dto.response.ResultResponse;

public interface ResultService {

	ResultResponse createResult(ResultRequest request);

	ResultResponse getResultById(Long id);

	List<ResultResponse> getAllResults();

	List<ResultResponse> getResultsByStudent(Long studentId);

	ResultResponse updateResult(Long id, ResultRequest request);

	void deleteResult(Long id);

	List<ResultResponse> searchResults(String searchTerm);
}
