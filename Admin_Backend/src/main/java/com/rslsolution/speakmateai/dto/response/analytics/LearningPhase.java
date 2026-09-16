package com.rslsolution.speakmateai.dto.response.analytics;

public enum LearningPhase {
    GETTING_STARTED("Getting Started", "Early orientation and foundational introduction to learning tools."),
    BUILDING_THE_HABIT("Building the Habit", "Establishing a regular, consistent daily or weekly learning cadence."),
    ACTIVE_LEARNER("Active Learner", "Consistently engaging with lessons, speaking practice, and grammar checks."),
    DEVELOPING_PROFICIENCY("Developing Proficiency", "Demonstrating steady accuracy and conversational capability across skills."),
    BUILDING_FLUENCY("Building Fluency", "Sustained high practice volume with strong speaking fluency and vocabulary range."),
    INDEPENDENT_PRACTICE("Independent Practice", "Self-directed, advanced language usage with high mastery across all pillars.");

    private final String displayName;
    private final String description;

    LearningPhase(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
