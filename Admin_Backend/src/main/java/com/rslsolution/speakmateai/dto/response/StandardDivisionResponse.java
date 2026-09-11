package com.rslsolution.speakmateai.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents one standard (e.g. "3rd") and the divisions available for it
 * within a school. Divisions are derived from the school's {@code divisionCount}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandardDivisionResponse {
	private String standard;
	private List<String> divisions;
}
