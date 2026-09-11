package com.rslsolution.speakmateai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse;
import com.rslsolution.speakmateai.service.SchoolInsightsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/school/insights")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
public class SchoolInsightsController {

    private final SchoolInsightsService schoolInsightsService;

    @GetMapping
    public ResponseEntity<SchoolInsightsResponse> getSchoolInsights(
            @RequestParam(defaultValue = "6m") String range) {
        return ResponseEntity.ok(schoolInsightsService.getSchoolInsights(range));
    }
}
