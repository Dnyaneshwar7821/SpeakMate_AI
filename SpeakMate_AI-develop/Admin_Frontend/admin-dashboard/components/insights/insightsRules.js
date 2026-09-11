/**
 * frontend/admin-dashboard/components/insights/insightsRules.js
 *
 * Super Admin AI Insights - Rule-Based Monitoring Insight Engine (Phase 4)
 *
 * CORE PRINCIPLES:
 *  - 100% deterministic, pure, and testable function (zero React hooks, zero API calls).
 *  - STRICTLY DATA-DRIVEN: Operates exclusively on genuine data already in memory:
 *      filteredStudents, aggregations (school, standard, division, status), KPIs, and filter state.
 *  - ZERO FABRICATED SCORES: No fluency, pronunciation, grammar, vocabulary, or speaking scores.
 *  - SUPER ADMIN PERSONA: Network-level monitoring of activity, dormant cohorts, and school engagement.
 *  - SAMPLE-SIZE PROTECTION: Requires minimum cohort size (>= 5) before drawing strong comparative conclusions.
 *  - FILTER-AWARE: Context adapts dynamically to School, Standard, Division, and Status filters.
 *  - STATUS FILTER AWARE: Suppresses misleading 100% / 0% activity rates when status filter is Active / Inactive.
 *  - PRIORITIZATION & DEDUPLICATION: critical > warning > positive > info, capped at 5 highest-relevance cards.
 */

/**
 * Format numeric standard to ordinal string (e.g. 6 -> "6th Standard").
 */
export function formatStandardLabel(standard) {
  if (!standard && standard !== 0) return "Unassigned Standard";
  const num = parseInt(standard, 10);
  if (isNaN(num)) return `${standard} Standard`;

  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  const ordinal = num + (s[(v - 20) % 10] || s[v] || s[0]);
  return `${ordinal} Standard`;
}

/**
 * Priority ordering for sorting:
 * critical (1) > warning (2) > positive (3) > info (4)
 */
const PRIORITY_WEIGHTS = {
  critical: 1,
  warning: 2,
  positive: 3,
  info: 4,
};

/**
 * Pure Rule-Based Insight Generator
 *
 * @param {Object} params
 * @param {Array} params.filteredStudents - Filtered student objects in current view
 * @param {Object} params.aggregations - Aggregated metrics { schoolAggregation, standardAggregation, divisionAggregation, statusAggregation }
 * @param {Object} params.kpis - KPI totals { totalStudents, activeStudents, inactiveStudents, engagementRate, monitoredSchools }
 * @param {Object} params.filters - Filter state { selectedSchool, selectedStandard, selectedDivision, selectedStatus }
 * @returns {Array<Object>} List of max 5 prioritized, deduplicated monitoring insight objects
 */
export function generateMonitoringInsights({
  filteredStudents = [],
  aggregations = {},
  kpis = { totalStudents: 0, activeStudents: 0, inactiveStudents: 0, engagementRate: 0, monitoredSchools: 0 },
  filters = { selectedSchool: "All Schools", selectedStandard: "all", selectedDivision: "all", selectedStatus: "all" },
} = {}) {
  const { totalStudents = 0, activeStudents = 0, inactiveStudents = 0, engagementRate = 0 } = kpis;
  const { selectedSchool = "All Schools", selectedStandard = "all", selectedDivision = "all", selectedStatus = "all" } = filters;
  const {
    schoolAggregation = [],
    standardAggregation = [],
    divisionAggregation = [],
  } = aggregations;

  // RULE 1: Empty Cohort / Zero Filtered Students
  if (totalStudents === 0 || !filteredStudents || filteredStudents.length === 0) {
    return [
      {
        id: "empty-cohort",
        type: "network",
        priority: "info",
        category: "Cohort Overview",
        title: "No Matching Students",
        message: "No student records match the current filter selection.",
        metric: "0 Students Found",
        context: "Reset the filters or select a broader school/standard cohort.",
        cohortSize: 0,
      },
    ];
  }

  const rawInsights = [];

  // =========================================================================
  // STATUS FILTER SPECIAL HANDLING (Rules 2 & 3)
  // When status is specifically Active or Inactive, engagementRate is artificially
  // 100% or 0% due to the filter. Do NOT produce misleading strong/low activity claims.
  // =========================================================================
  if (selectedStatus === "active") {
    rawInsights.push({
      id: "status-active-filter",
      type: "status",
      priority: "info",
      category: "Status Filter Active",
      title: "Active Student Cohort",
      message: `The current view contains only active students across the selected ${
        selectedSchool !== "All Schools" ? selectedSchool : "network"
      } cohort.`,
      metric: `${totalStudents} Active Student${totalStudents === 1 ? "" : "s"}`,
      context: "Filtered exclusively by active enrollment status.",
      cohortSize: totalStudents,
    });
  } else if (selectedStatus === "inactive") {
    rawInsights.push({
      id: "status-inactive-filter",
      type: "status",
      priority: totalStudents >= 10 ? "warning" : "info",
      category: "Attention Required",
      title: "Inactive Student Cohort",
      message: `All ${totalStudents} students in the current view are inactive. Review onboarding status or schedule re-engagement follow-up.`,
      metric: `${totalStudents} Inactive Student${totalStudents === 1 ? "" : "s"}`,
      context: "Filtered exclusively by inactive enrollment status.",
      cohortSize: totalStudents,
    });
  } else {
    // =========================================================================
    // OVERVIEW ACTIVITY RULES (Only when status === 'all')
    // =========================================================================
    if (engagementRate >= 80) {
      rawInsights.push({
        id: "overview-activity-strong",
        type: "network",
        priority: "positive",
        category: "Positive Observation",
        title: "Strong Cohort Activity",
        message: `Student activity is strong in the selected cohort, with ${engagementRate}% of students currently active.`,
        metric: `${activeStudents} Active · ${inactiveStudents} Inactive`,
        context: `${totalStudents} total students monitored`,
        cohortSize: totalStudents,
      });
    } else if (engagementRate >= 50 && engagementRate < 80) {
      rawInsights.push({
        id: "overview-activity-moderate",
        type: "network",
        priority: "info",
        category: "Cohort Overview",
        title: "Moderate Activity Level",
        message: `Student activity is moderate in the selected cohort (${engagementRate}%). Review dormant groups for follow-up opportunities.`,
        metric: `${activeStudents} Active · ${inactiveStudents} Inactive`,
        context: `${totalStudents} total students monitored`,
        cohortSize: totalStudents,
      });
    } else if (engagementRate < 50) {
      rawInsights.push({
        id: "overview-activity-low",
        type: "network",
        priority: engagementRate < 30 ? "critical" : "warning",
        category: "Attention Required",
        title: "Low Student Activity",
        message: `Less than half of the selected students are currently active (${engagementRate}%). This cohort may require closer monitoring.`,
        metric: `${activeStudents} Active · ${inactiveStudents} Inactive`,
        context: `${totalStudents} total students monitored`,
        cohortSize: totalStudents,
      });
    }
  }

  // =========================================================================
  // SCHOOL MONITORING RULES
  // =========================================================================
  if (selectedSchool === "All Schools") {
    // Comparative school rules require at least 2 schools in the aggregation
    if (schoolAggregation.length >= 2) {
      // SAMPLE-SIZE PROTECTION: Only evaluate schools with >= 5 students for strong/weak conclusions
      const qualifiedSchools = schoolAggregation.filter((s) => s.totalStudents >= 5);

      if (qualifiedSchools.length >= 1 && selectedStatus === "all") {
        // Find school with lowest engagement rate
        const sortedByEngagementAsc = [...qualifiedSchools].sort(
          (a, b) => a.engagementRate - b.engagementRate
        );
        const lowestSchool = sortedByEngagementAsc[0];

        if (lowestSchool && lowestSchool.engagementRate < 50) {
          rawInsights.push({
            id: `school-low-activity-${lowestSchool.schoolName}`,
            type: "school",
            priority: "warning",
            category: "School Monitoring",
            title: "School Attention Required",
            message: `${lowestSchool.schoolName} has a lower active-student ratio (${lowestSchool.engagementRate}%) than the overall network average.`,
            metric: `${lowestSchool.activeStudents} Active · ${lowestSchool.inactiveStudents} Inactive`,
            context: `${lowestSchool.totalStudents} students enrolled`,
            cohortSize: lowestSchool.totalStudents,
          });
        }

        // Find school with highest engagement rate (if >= 80% and different from lowest)
        const sortedByEngagementDesc = [...qualifiedSchools].sort(
          (a, b) => b.engagementRate - a.engagementRate
        );
        const highestSchool = sortedByEngagementDesc[0];

        if (
          highestSchool &&
          highestSchool.engagementRate >= 80 &&
          highestSchool.schoolName !== lowestSchool?.schoolName
        ) {
          rawInsights.push({
            id: `school-strong-activity-${highestSchool.schoolName}`,
            type: "school",
            priority: "positive",
            category: "Positive Observation",
            title: "Leading School Activity",
            message: `${highestSchool.schoolName} currently shows strong student activity, with an ${highestSchool.engagementRate}% active-student ratio.`,
            metric: `${highestSchool.activeStudents} Active of ${highestSchool.totalStudents} students`,
            context: `${highestSchool.totalStudents} students enrolled`,
            cohortSize: highestSchool.totalStudents,
          });
        }

        // Concentrated Inactivity Rule: Identify school with highest inactive student count
        const sortedByInactiveDesc = [...qualifiedSchools].sort(
          (a, b) => b.inactiveStudents - a.inactiveStudents
        );
        const highestInactiveSchool = sortedByInactiveDesc[0];

        if (
          highestInactiveSchool &&
          highestInactiveSchool.inactiveStudents >= 3 &&
          highestInactiveSchool.schoolName !== lowestSchool?.schoolName // Avoid duplicating lowest-activity school
        ) {
          rawInsights.push({
            id: `school-inactive-concentration-${highestInactiveSchool.schoolName}`,
            type: "school",
            priority: "warning",
            category: "Attention Required",
            title: "High Inactivity Concentration",
            message: `${highestInactiveSchool.schoolName} has the highest number of inactive students in the selected cohort.`,
            metric: `${highestInactiveSchool.inactiveStudents} Inactive of ${highestInactiveSchool.totalStudents} total students`,
            context: "Candidate for student re-engagement follow-up",
            cohortSize: highestInactiveSchool.totalStudents,
          });
        }
      }

      // If schools exist but all have < 5 students, provide a sample-size protected informational note
      if (qualifiedSchools.length === 0 && schoolAggregation.length > 0) {
        rawInsights.push({
          id: "school-sample-size-limited",
          type: "school",
          priority: "info",
          category: "School Monitoring",
          title: "Limited School Sample Sizes",
          message: "All monitored schools currently have fewer than 5 students. Comparative performance evaluations are withheld for statistical reliability.",
          metric: `${schoolAggregation.length} Schools · ${totalStudents} Students`,
          context: "Sample size protection active",
          cohortSize: totalStudents,
        });
      }
    }
  } else {
    // Single School Filtered: Focus strictly on the selected school
    const currentSchool = schoolAggregation.find(
      (s) => s.schoolName?.trim().toLowerCase() === selectedSchool.trim().toLowerCase()
    );

    if (currentSchool) {
      if (currentSchool.totalStudents < 5) {
        // SAMPLE SIZE PROTECTION: Neutral informational wording
        rawInsights.push({
          id: `school-single-small-${currentSchool.schoolName}`,
          type: "school",
          priority: "info",
          category: "School Monitoring",
          title: `${currentSchool.schoolName} Overview`,
          message: `${currentSchool.schoolName} currently contains ${currentSchool.totalStudents} student${
            currentSchool.totalStudents === 1 ? "" : "s"
          }. Sample size is limited for robust comparative monitoring.`,
          metric: `${currentSchool.activeStudents} Active · ${currentSchool.inactiveStudents} Inactive`,
          context: "Cohort size below statistical threshold (< 5)",
          cohortSize: currentSchool.totalStudents,
        });
      } else if (selectedStatus === "all") {
        if (currentSchool.engagementRate >= 80) {
          rawInsights.push({
            id: `school-single-strong-${currentSchool.schoolName}`,
            type: "school",
            priority: "positive",
            category: "Positive Observation",
            title: "Strong School Participation",
            message: `${currentSchool.schoolName} demonstrates high student engagement with ${currentSchool.engagementRate}% active participation.`,
            metric: `${currentSchool.activeStudents} Active · ${currentSchool.inactiveStudents} Inactive`,
            context: `${currentSchool.totalStudents} total students enrolled`,
            cohortSize: currentSchool.totalStudents,
          });
        } else if (currentSchool.engagementRate < 50) {
          rawInsights.push({
            id: `school-single-low-${currentSchool.schoolName}`,
            type: "school",
            priority: "warning",
            category: "Attention Required",
            title: "School Engagement Review",
            message: `${currentSchool.schoolName} has an active-student ratio of ${currentSchool.engagementRate}%. Closer monitoring may be beneficial.`,
            metric: `${currentSchool.activeStudents} Active · ${currentSchool.inactiveStudents} Inactive`,
            context: `${currentSchool.totalStudents} total students enrolled`,
            cohortSize: currentSchool.totalStudents,
          });
        }
      }
    }
  }

  // =========================================================================
  // STANDARD MONITORING RULES
  // =========================================================================
  if (selectedStandard === "all") {
    if (standardAggregation.length >= 2 && selectedStatus === "all") {
      // SAMPLE-SIZE PROTECTION: Filter standards with >= 5 students
      const qualifiedStandards = standardAggregation.filter(
        (std) => std.totalStudents >= 5 && std.standard !== "Unassigned"
      );

      if (qualifiedStandards.length >= 2) {
        // Standard with lowest active ratio
        const sortedStdAsc = [...qualifiedStandards].sort(
          (a, b) => a.engagementRate - b.engagementRate
        );
        const lowestStd = sortedStdAsc[0];

        if (lowestStd && lowestStd.engagementRate < 50) {
          rawInsights.push({
            id: `standard-low-activity-${lowestStd.standard}`,
            type: "standard",
            priority: "warning",
            category: "Standard Monitoring",
            title: "Standard Activity Attention",
            message: `${formatStandardLabel(lowestStd.standard)} currently has a relatively lower active-student ratio (${lowestStd.engagementRate}%) than other monitored standards.`,
            metric: `${lowestStd.activeStudents} Active · ${lowestStd.inactiveStudents} Inactive`,
            context: `${lowestStd.totalStudents} students in standard`,
            cohortSize: lowestStd.totalStudents,
          });
        }

        // Standard with highest active ratio
        const sortedStdDesc = [...qualifiedStandards].sort(
          (a, b) => b.engagementRate - a.engagementRate
        );
        const highestStd = sortedStdDesc[0];

        if (
          highestStd &&
          highestStd.engagementRate >= 80 &&
          highestStd.standard !== lowestStd?.standard
        ) {
          rawInsights.push({
            id: `standard-strong-activity-${highestStd.standard}`,
            type: "standard",
            priority: "positive",
            category: "Positive Observation",
            title: "Leading Standard Activity",
            message: `${formatStandardLabel(highestStd.standard)} currently shows the highest active-student ratio (${highestStd.engagementRate}%) among monitored standards.`,
            metric: `${highestStd.activeStudents} Active of ${highestStd.totalStudents} students`,
            context: `${highestStd.totalStudents} students in standard`,
            cohortSize: highestStd.totalStudents,
          });
        }
      }
    }
  } else {
    // Specific standard selected: check sample size
    const currentStd = standardAggregation.find(
      (std) => String(std.standard) === String(selectedStandard)
    );

    if (currentStd && currentStd.totalStudents < 5) {
      rawInsights.push({
        id: `standard-single-small-${currentStd.standard}`,
        type: "standard",
        priority: "info",
        category: "Standard Monitoring",
        title: `${formatStandardLabel(currentStd.standard)} Overview`,
        message: `${formatStandardLabel(currentStd.standard)} currently contains ${currentStd.totalStudents} student${
          currentStd.totalStudents === 1 ? "" : "s"
        }. Sample size is limited for comparative conclusions.`,
        metric: `${currentStd.activeStudents} Active · ${currentStd.inactiveStudents} Inactive`,
        context: "Filtered to standard",
        cohortSize: currentStd.totalStudents,
      });
    }
  }

  // =========================================================================
  // DIVISION MONITORING RULES
  // =========================================================================
  if (selectedDivision === "all") {
    if (divisionAggregation.length >= 2 && selectedStatus === "all") {
      // SAMPLE-SIZE PROTECTION: Filter divisions with >= 5 students
      const qualifiedDivisions = divisionAggregation.filter(
        (d) => d.totalStudents >= 5 && d.division !== "Unassigned"
      );

      if (qualifiedDivisions.length >= 2) {
        // Division with lowest activity ratio or highest inactive count
        const sortedDivAsc = [...qualifiedDivisions].sort(
          (a, b) => a.engagementRate - b.engagementRate
        );
        const lowestDiv = sortedDivAsc[0];

        if (lowestDiv && lowestDiv.engagementRate < 50) {
          rawInsights.push({
            id: `division-low-activity-${lowestDiv.division}`,
            type: "division",
            priority: "warning",
            category: "Division Monitoring",
            title: "Division Activity Review",
            message: `Division ${lowestDiv.division} represents a lower active-student ratio (${lowestDiv.engagementRate}%) within the current filtered cohort.`,
            metric: `${lowestDiv.activeStudents} Active · ${lowestDiv.inactiveStudents} Inactive`,
            context: `${lowestDiv.totalStudents} students in division`,
            cohortSize: lowestDiv.totalStudents,
          });
        }

        // Division with highest activity ratio
        const sortedDivDesc = [...qualifiedDivisions].sort(
          (a, b) => b.engagementRate - a.engagementRate
        );
        const highestDiv = sortedDivDesc[0];

        if (
          highestDiv &&
          highestDiv.engagementRate >= 80 &&
          highestDiv.division !== lowestDiv?.division
        ) {
          rawInsights.push({
            id: `division-strong-activity-${highestDiv.division}`,
            type: "division",
            priority: "positive",
            category: "Positive Observation",
            title: "Strong Division Activity",
            message: `Division ${highestDiv.division} shows strong student activity with an ${highestDiv.engagementRate}% active-student ratio in this cohort.`,
            metric: `${highestDiv.activeStudents} Active of ${highestDiv.totalStudents} students`,
            context: `${highestDiv.totalStudents} students in division`,
            cohortSize: highestDiv.totalStudents,
          });
        }
      }
    }
  } else {
    // Specific division selected: check sample size
    const currentDiv = divisionAggregation.find((d) => d.division === selectedDivision);
    if (currentDiv && currentDiv.totalStudents < 5) {
      rawInsights.push({
        id: `division-single-small-${currentDiv.division}`,
        type: "division",
        priority: "info",
        category: "Division Monitoring",
        title: `Division ${currentDiv.division} Overview`,
        message: `Division ${currentDiv.division} currently contains ${currentDiv.totalStudents} student${
          currentDiv.totalStudents === 1 ? "" : "s"
        }. Sample size is limited for cohort-wide comparative analysis.`,
        metric: `${currentDiv.activeStudents} Active · ${currentDiv.inactiveStudents} Inactive`,
        context: "Filtered to division",
        cohortSize: currentDiv.totalStudents,
      });
    }
  }

  // =========================================================================
  // DEDUPLICATION & PRIORITIZATION
  // Ordering: critical (1) > warning (2) > positive (3) > info (4)
  // Tie-breaker: larger cohortSize first
  // Max visible insights: 5
  // =========================================================================
  const seenTitles = new Set();
  const deduplicated = [];

  for (const insight of rawInsights) {
    if (!seenTitles.has(insight.title)) {
      seenTitles.add(insight.title);
      deduplicated.push(insight);
    }
  }

  const prioritized = deduplicated.sort((a, b) => {
    const weightA = PRIORITY_WEIGHTS[a.priority] ?? 99;
    const weightB = PRIORITY_WEIGHTS[b.priority] ?? 99;

    if (weightA !== weightB) {
      return weightA - weightB;
    }
    // Tie-breaker: larger cohort size
    return (b.cohortSize || 0) - (a.cohortSize || 0);
  });

  return prioritized.slice(0, 5);
}

export default generateMonitoringInsights;
