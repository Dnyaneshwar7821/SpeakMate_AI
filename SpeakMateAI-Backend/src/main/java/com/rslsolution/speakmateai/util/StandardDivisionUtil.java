package com.rslsolution.speakmateai.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Reusable source of truth for School -> Standard -> Division configuration.
 *
 * <p>Standards are a fixed business rule (exactly 1st through 10th). Divisions are
 * <b>not</b> stored per standard; they are dynamically generated from a school's
 * {@code divisionCount} at request time:
 *
 * <ul>
 *   <li>divisionCount = 1  -> A</li>
 *   <li>divisionCount = 3  -> A, B, C</li>
 *   <li>divisionCount = 5  -> A, B, C, D, E</li>
 *   <li>divisionCount = 26 -> A .. Z</li>
 * </ul>
 *
 * <p>This guarantees every standard of a school has the same, consistent division set
 * without introducing ten separate division-count columns or hardcoded division tables.
 */
public final class StandardDivisionUtil {

	/** Maximum supported number of divisions (A-Z). */
	public static final int MAX_DIVISIONS = 26;

	/** The exact standards every school supports. */
	public static final List<String> STANDARDS = List.of(
			"1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th");

	private StandardDivisionUtil() {
	}

	/**
	 * Dynamically generate division labels for a school's {@code divisionCount}.
	 *
	 * @param divisionCount the configured division count (clamped to {@code [1, MAX_DIVISIONS]})
	 * @return an unmodifiable list of uppercase letters, e.g. {@code [A, B, C]} for 3
	 */
	public static List<String> generateDivisions(int divisionCount) {
		int count = Math.max(1, Math.min(divisionCount, MAX_DIVISIONS));
		List<String> divisions = new ArrayList<>(count);
		for (int i = 0; i < count; i++) {
			divisions.add(String.valueOf((char) ('A' + i)));
		}
		return Collections.unmodifiableList(divisions);
	}
}
