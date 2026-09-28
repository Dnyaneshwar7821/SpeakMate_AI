package com.rslsolution.speakmateai.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.entity.Lesson;
import com.rslsolution.speakmateai.repository.LessonRepository;

/**
 * Seeds and synchronizes the Master 120 Academic Lessons Curriculum Dataset.
 * Purges legacy placeholder lessons on boot so only the academic curriculum remains.
 */
@Component
public class LessonDataSeeder implements CommandLineRunner {

    private final LessonRepository lessonRepository;

    public LessonDataSeeder(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    @Override
    public void run(String... args) {
        // Safe purge of 20 legacy placeholder lessons so only 120 Academic Curriculum lessons remain
        List<String> legacyTitles = List.of(
            "Present Tenses Mastery", "Past Tenses Deep Dive", "Conditionals: If Sentences",
            "Essential 500 Words", "Idioms and Phrases", "Business Vocabulary",
            "Speak with Confidence", "Storytelling in English", "English Vowel Sounds",
            "Word Stress Patterns", "Everyday Conversations", "Debate and Persuasion",
            "Listen and Understand: Accents", "Professional Email Writing", "Presentations in English",
            "Common Interview Questions", "At the Airport", "Hotel and Accommodation",
            "Morning Routines", "Talking About Food"
        );

        for (String title : legacyTitles) {
            lessonRepository.findByTitleIgnoreCase(title.trim()).ifPresent(l -> {
                try {
                    lessonRepository.delete(l);
                    System.out.println("Purged legacy lesson: " + title);
                } catch (Exception e) {
                    l.setActive(false);
                    lessonRepository.save(l);
                    System.out.println("Deactivated legacy lesson: " + title);
                }
            });
        }

        // Seed or synchronize the 120 Academic Curriculum lessons
        seedCurriculumLessons();
    }

    private void seedCurriculumLessons() {
        try {
            org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("curriculum_lessons.json");
            if (!resource.exists()) {
                return;
            }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.List<java.util.Map<String, Object>> list = mapper.readValue(
                resource.getInputStream(),
                new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {}
            );
            if (list == null || list.isEmpty()) return;

            java.util.List<Lesson> toSave = new java.util.ArrayList<>();
            for (java.util.Map<String, Object> map : list) {
                String title = (String) map.get("title");
                if (title == null || title.isBlank()) continue;

                String category = (String) map.getOrDefault("category", "General");
                String level = (String) map.getOrDefault("level", "Beginner");
                String description = (String) map.getOrDefault("description", "");
                Integer xp = map.get("xpReward") instanceof Number n ? n.intValue() : 35;
                Integer mins = map.get("estimatedMinutes") instanceof Number n ? n.intValue() : 15;
                Integer order = map.get("orderIndex") instanceof Number n ? n.intValue() : 0;
                String skills = (String) map.getOrDefault("skills", "");
                String objectives = (String) map.getOrDefault("objectives", "");
                String requirements = (String) map.getOrDefault("requirements", "");

                var existingOpt = lessonRepository.findByTitleIgnoreCase(title.trim());
                if (existingOpt.isPresent()) {
                    Lesson existing = existingOpt.get();
                    existing.setCategory(category);
                    existing.setLevel(level);
                    existing.setDescription(description);
                    existing.setXpReward(xp);
                    existing.setEstimatedMinutes(mins);
                    existing.setDuration(mins);
                    existing.setOrderIndex(order);
                    existing.setSkills(skills);
                    existing.setObjectives(objectives);
                    existing.setRequirements(requirements);
                    existing.setActive(true);
                    toSave.add(existing);
                } else {
                    Lesson lesson = Lesson.builder()
                            .title(title.trim())
                            .category(category)
                            .level(level)
                            .description(description)
                            .content(description)
                            .xpReward(xp)
                            .estimatedMinutes(mins)
                            .duration(mins)
                            .orderIndex(order)
                            .skills(skills)
                            .objectives(objectives)
                            .requirements(requirements)
                            .active(true)
                            .locked(false)
                            .popular(false)
                            .featured(false)
                            .build();
                    toSave.add(lesson);
                }
            }
            if (!toSave.isEmpty()) {
                lessonRepository.saveAll(toSave);
                System.out.println("Seeded/Synchronized " + toSave.size() + " Academic Curriculum lessons.");
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not seed curriculum_lessons.json: " + e.getMessage());
        }
    }
}
