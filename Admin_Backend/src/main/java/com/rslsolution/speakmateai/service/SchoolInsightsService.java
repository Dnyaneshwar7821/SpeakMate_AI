package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse;

public interface SchoolInsightsService {

    SchoolInsightsResponse getSchoolInsights(String range);
}
