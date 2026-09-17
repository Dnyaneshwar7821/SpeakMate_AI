package com.rslsolution.speakmateai.assistant.provider;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.Result;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.repository.ResultRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;

import jakarta.persistence.criteria.Predicate;

/**
 * Answers questions about the School-Admin <b>Results</b> page: how many
 * results, average percentage, pass/fail split, highest & lowest scores and
 * a per-standard breakdown.
 *
 * <p>Read-only and scoped to a single school (School Admin: own school; Super
 * Admin: a school named in the question).
 */
@Component
public class ResultsAnalyticsDataProvider implements AssistantDataProvider {

	private final ResultRepository resultRepository;
	private final SchoolRepository schoolRepository;
	private final ObjectMapper objectMapper;

	public ResultsAnalyticsDataProvider(ResultRepository resultRepository, SchoolRepository schoolRepository,
			ObjectMapper objectMapper) {
		this.resultRepository = resultRepository;
		this.schoolRepository = schoolRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.RESULTS_ANALYTICS;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		if (actor == null) {
			data.put("message", "NO DATA");
			data.put("reason", "Authenticated caller context is missing.");
			return toJson(data);
		}
		Long schoolId = resolveSchoolId(actor, params);
		if (schoolId == null) {
			data.put("message", "NO DATA");
			data.put("reason", "No school scope is available for this caller.");
			return toJson(data);
		}

		List<Result> results = schoolResults(schoolId);
		long excellent = 0;
		long good = 0;
		long passCount = 0;
		long fail = 0;
		double totalPercentage = 0.0;
		double highest = 0.0;
		double lowest = results.isEmpty() ? 0.0 : Double.MAX_VALUE;
		Map<String, double[]> perStandard = new LinkedHashMap<>();

		for (Result r : results) {
			double pct = percentage(r);
			totalPercentage += pct;
			if (pct > highest) {
				highest = pct;
			}
			if (pct < lowest) {
				lowest = pct;
			}
			String status = r.getStatus() != null ? r.getStatus() : "FAIL";
			if ("Excellent".equalsIgnoreCase(status)) {
				excellent++;
			} else if ("Good".equalsIgnoreCase(status)) {
				good++;
			} else if ("Pass".equalsIgnoreCase(status)) {
				passCount++;
			} else if ("Fail".equalsIgnoreCase(status)) {
				fail++;
			}
			String standard = standardOf(r);
			double[] agg = perStandard.computeIfAbsent(standard, k -> new double[2]);
			agg[0] += 1;
			agg[1] += pct;
		}

		long total = results.size();
		long passed = excellent + good + passCount;
		double avgPercentage = total == 0 ? 0.0 : totalPercentage / total;
		double passPercentage = total == 0 ? 0.0 : (passed * 100.0) / total;
		double failPercentage = total == 0 ? 0.0 : (fail * 100.0) / total;

		List<Map<String, Object>> breakdown = new ArrayList<>();
		perStandard.forEach((standardName, agg) -> {
			Map<String, Object> entry = new LinkedHashMap<>();
			entry.put("standard", standardName);
			entry.put("count", (long) agg[0]);
			entry.put("averagePercentage", round(agg[0] > 0 ? agg[1] / agg[0] : 0.0));
			breakdown.add(entry);
		});
		breakdown.sort(Comparator.comparing(e -> String.valueOf(e.get("standard"))));

		School school = schoolRepository.findById(schoolId).orElse(null);
		String schoolName = school != null
				? (school.getName() != null && !school.getName().isBlank() ? school.getName() : school.getSchoolName())
				: null;

		data.put("scope", "SCHOOL (results of the caller's school)");
		data.put("schoolId", schoolId);
		data.put("schoolName", schoolName);
		data.put("totalResults", total);
		data.put("averagePercentage", round(avgPercentage));
		data.put("passed", passed);
		data.put("failed", fail);
		data.put("passPercentage", round(passPercentage));
		data.put("failPercentage", round(failPercentage));
		data.put("highestPercentage", round(total == 0 ? 0.0 : highest));
		data.put("lowestPercentage", round(total == 0 ? 0.0 : lowest));
		data.put("excellentResults", excellent);
		data.put("goodResults", good);
		data.put("passResults", passCount);
		data.put("failResults", fail);
		data.put("resultsByStandard", breakdown);
		data.put("summary", "There are " + total + " results with an average of " + round(avgPercentage) + "%: "
				+ passed + " passed (" + round(passPercentage) + "%) and " + fail + " failed.");
		return toJson(data);
	}

	private List<Result> schoolResults(Long schoolId) {
		return resultRepository.findAll((root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.equal(root.get("student").get("schoolId"), schoolId));
			predicates.add(cb.isTrue(root.get("active")));
			return cb.and(predicates.toArray(new Predicate[0]));
		});
	}

	private String standardOf(Result r) {
		if (r.getStudent() != null && r.getStudent().getStandard() != null && !r.getStudent().getStandard().isBlank()) {
			return r.getStudent().getStandard();
		}
		return "Unspecified";
	}

	private double percentage(Result r) {
		if (r.getTotalMarks() != null && r.getTotalMarks() > 0 && r.getMarksObtained() != null) {
			return (r.getMarksObtained() / r.getTotalMarks()) * 100.0;
		}
		return 0.0;
	}

	private Long resolveSchoolId(ActorContext actor, Map<String, Object> params) {
		if (actor.getSchoolId() != null) {
			return actor.getSchoolId();
		}
		String name = strParam(params, "schoolName");
		if (name != null) {
			return schoolRepository.findByName(name).map(School::getId)
					.orElseGet(() -> schoolRepository.findAll().stream()
							.filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(name))
							.map(School::getId).findFirst().orElse(null));
		}
		return null;
	}

	private String strParam(Map<String, Object> params, String key) {
		if (params == null) {
			return null;
		}
		Object value = params.get(key);
		if (value == null) {
			return null;
		}
		String s = String.valueOf(value).trim();
		return s.isEmpty() ? null : s;
	}

	private double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
