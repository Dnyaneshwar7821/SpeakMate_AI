package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.response.StandardDivisionResponse;

/**
 * Provides the canonical School -> Standard -> Division configuration.
 *
 * <p>Standards are fixed (1st-10th). Divisions are dynamically generated from
 * the school's {@code divisionCount} and are identical for every standard.
 *
 * <p>Access rules (enforced in the implementation, not the client):
 * <ul>
 *   <li>SUPER_ADMIN / ADMIN - any school</li>
 *   <li>SCHOOL_ADMIN - only their own school</li>
 *   <li>TEACHER - only their own school and only standards assigned to them</li>
 * </ul>
 */
public interface SchoolStandardService {

	/**
	 * Returns the standards + divisions configuration for the given school.
	 *
	 * @param schoolId target school; null/absent resolves to the current user's school
	 * @return ordered list of standards (1st-10th) each with its generated divisions
	 */
	List<StandardDivisionResponse> getStandards(Long schoolId);

	/**
	 * Convenience: returns the standards + divisions configuration for the
	 * currently authenticated user's own school.
	 */
	List<StandardDivisionResponse> getMySchoolStandards();

	/**
	 * Configures the standard and divisions for the given school.
	 * Replaces existing configuration.
	 */
	List<StandardDivisionResponse> configureStandards(Long schoolId, List<StandardDivisionResponse> request);
}
