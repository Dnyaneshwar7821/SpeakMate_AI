package com.rslsolution.speakmateai.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.entity.Lesson;
import com.rslsolution.speakmateai.repository.LessonRepository;

@Component
public class DataSeeder implements CommandLineRunner {

	private final LessonRepository lessonRepository;

	public DataSeeder(LessonRepository lessonRepository) {
		this.lessonRepository = lessonRepository;
	}

	@Override
	public void run(String... args) {
		if (lessonRepository.count() > 0) {
			return; // Already seeded — do nothing
		}

		List<Lesson> lessons = new ArrayList<>();

		// ─── GRAMMAR ─────────────────────────────────────────────────
		lessons.add(lesson("Present Tense Mastery", "Grammar", "Beginner",
				"Learn when and how to use the simple present tense correctly in everyday English.",
				"Pronunciation,Fluency", "Use present tense correctly,Form affirmative and negative sentences",
				"None", 12, 40, false, 0, 1, true, true, 1));

		lessons.add(lesson("Past Tense Adventures", "Grammar", "Beginner",
				"Explore regular and irregular past tense verbs through real-life story contexts.",
				"Grammar,Writing", "Form simple past sentences,Understand irregular verbs",
				"Present Tense Mastery", 15, 50, false, 40, 1, true, false, 2));

		lessons.add(lesson("Perfect Tenses Explained", "Grammar", "Intermediate",
				"Master the present perfect, past perfect, and future perfect tenses with examples.",
				"Grammar,Fluency", "Use present perfect correctly,Form past perfect sentences",
				"Past Tense Mastery", 20, 75, false, 90, 2, true, true, 3));

		// ─── VOCABULARY ──────────────────────────────────────────────
		lessons.add(lesson("Emotions & Feelings", "Vocabulary", "Beginner",
				"Learn over 40 words to describe emotions and feelings clearly in English.",
				"Vocabulary,Expression", "Name common emotions in English,Use feeling words in context",
				"None", 10, 35, false, 0, 1, true, true, 1));

		lessons.add(lesson("Food & Cuisine Vocabulary", "Vocabulary", "Beginner",
				"Discover vocabulary for ordering food, cooking, and describing meals.",
				"Vocabulary,Conversation", "Name common foods,Describe meals and recipes",
				"None", 12, 40, false, 0, 1, false, false, 2));

		lessons.add(lesson("Business & Office Vocabulary", "Vocabulary", "Intermediate",
				"Essential workplace vocabulary for emails, meetings, and professional settings.",
				"Vocabulary,Business", "Use professional vocabulary,Write formal emails",
				"Emotions & Feelings", 18, 65, false, 75, 2, true, false, 3));

		lessons.add(lesson("Advanced Idioms & Phrases", "Vocabulary", "Advanced",
				"Master 30+ advanced English idioms used by native speakers every day.",
				"Vocabulary,Idioms", "Understand native-level idioms,Use idioms naturally in speech",
				"Business & Office Vocabulary", 25, 100, false, 200, 3, true, true, 4));

		// ─── SPEAKING ────────────────────────────────────────────────
		lessons.add(lesson("Introducing Yourself", "Speaking", "Beginner",
				"Practice introducing yourself confidently in casual and professional settings.",
				"Speaking,Confidence", "Introduce yourself clearly,Describe your background",
				"None", 10, 40, false, 0, 1, true, true, 1));

		lessons.add(lesson("Expressing Opinions", "Speaking", "Intermediate",
				"Learn structured phrases for agreeing, disagreeing, and giving your views politely.",
				"Speaking,Diplomacy", "Express opinions politely,Use discourse markers",
				"Introducing Yourself", 15, 60, false, 80, 2, true, false, 2));

		lessons.add(lesson("Storytelling in English", "Speaking", "Advanced",
				"Develop narrative skills to tell engaging stories with proper tense flow and vivid language.",
				"Speaking,Storytelling", "Build narrative structure,Use vivid language",
				"Expressing Opinions", 22, 90, false, 180, 3, false, true, 3));

		// ─── LISTENING ───────────────────────────────────────────────
		lessons.add(lesson("Listening to Announcements", "Listening", "Beginner",
				"Practice understanding public announcements, travel information, and broadcast messages.",
				"Listening,Comprehension", "Follow spoken announcements,Extract key information",
				"None", 12, 40, false, 0, 1, true, false, 1));

		lessons.add(lesson("Understanding Accents", "Listening", "Intermediate",
				"Train your ear to recognise different English accents: British, American, Australian.",
				"Listening,Accents", "Distinguish major accents,Improve overall comprehension",
				"Listening to Announcements", 18, 70, false, 80, 2, true, true, 2));

		lessons.add(lesson("Podcast Comprehension", "Listening", "Advanced",
				"Improve comprehension with fast-paced native podcast-style recordings on varied topics.",
				"Listening,Speed", "Follow fast natural speech,Identify speaker intent",
				"Understanding Accents", 25, 95, false, 200, 3, false, false, 3));

		// ─── PRONUNCIATION ───────────────────────────────────────────
		lessons.add(lesson("Vowel Sounds & Minimal Pairs", "Pronunciation", "Beginner",
				"Identify and practice the 12 vowel sounds in English through minimal pair exercises.",
				"Pronunciation,Phonetics", "Produce correct vowel sounds,Distinguish minimal pairs",
				"None", 12, 45, false, 0, 1, true, true, 1));

		lessons.add(lesson("Consonant Clusters", "Pronunciation", "Intermediate",
				"Practice difficult consonant cluster sounds that challenge non-native speakers.",
				"Pronunciation,Clarity", "Articulate consonant clusters,Reduce unwanted vowel insertion",
				"Vowel Sounds & Minimal Pairs", 15, 60, false, 80, 2, false, false, 2));

		lessons.add(lesson("Intonation & Stress Patterns", "Pronunciation", "Advanced",
				"Master sentence stress and intonation to sound natural and expressive in English.",
				"Pronunciation,Fluency", "Apply correct sentence stress,Use intonation for meaning",
				"Consonant Clusters", 20, 85, false, 180, 3, true, true, 3));

		// ─── CONVERSATION ────────────────────────────────────────────
		lessons.add(lesson("Everyday Conversations", "Conversation", "Beginner",
				"Practice common daily conversations — greetings, shopping, and asking for directions.",
				"Conversation,Fluency", "Handle everyday interactions,Start and end conversations",
				"None", 12, 45, false, 0, 1, true, true, 1));

		lessons.add(lesson("Making Small Talk", "Conversation", "Intermediate",
				"Build skills to start and sustain light conversations in social and professional settings.",
				"Conversation,Social", "Make relevant small talk,Keep a conversation going",
				"Everyday Conversations", 15, 60, false, 80, 2, true, false, 2));

		lessons.add(lesson("Debating & Arguing Points", "Conversation", "Advanced",
				"Develop structured argumentation and rebuttal skills for formal and informal debates.",
				"Conversation,Rhetoric", "Present arguments clearly,Counter opposing views",
				"Making Small Talk", 25, 100, false, 200, 3, false, true, 3));

		// ─── BUSINESS ENGLISH ────────────────────────────────────────
		lessons.add(lesson("Professional Email Writing", "Business English", "Beginner",
				"Write clear, concise, and professional emails for workplace communication.",
				"Writing,Business", "Format professional emails,Use business language",
				"None", 15, 55, false, 0, 1, true, true, 1));

		lessons.add(lesson("Meeting & Presentation Skills", "Business English", "Intermediate",
				"Lead meetings and deliver presentations confidently using appropriate English.",
				"Speaking,Business", "Chair a meeting effectively,Structure a clear presentation",
				"Professional Email Writing", 20, 80, false, 100, 2, true, false, 2));

		lessons.add(lesson("Negotiation English", "Business English", "Advanced",
				"Learn the language of negotiation, compromise, and deal-making in professional contexts.",
				"Business,Negotiation", "Use negotiation phrases,Reach agreements diplomatically",
				"Meeting & Presentation Skills", 25, 100, false, 200, 3, false, true, 3));

		// ─── INTERVIEW PREPARATION ───────────────────────────────────
		lessons.add(lesson("Common Interview Questions", "Interview Preparation", "Beginner",
				"Prepare answers for classic interview questions like 'Tell me about yourself'.",
				"Speaking,Confidence", "Answer common interview questions,Structure STAR responses",
				"None", 15, 55, false, 0, 1, true, true, 1));

		lessons.add(lesson("Industry-Specific Vocabulary", "Interview Preparation", "Intermediate",
				"Build the domain-specific vocabulary needed for interviews in tech, finance, and healthcare.",
				"Vocabulary,Business", "Use industry terminology,Discuss your experience professionally",
				"Common Interview Questions", 20, 75, false, 80, 2, true, false, 2));

		lessons.add(lesson("Salary & Benefits Negotiation", "Interview Preparation", "Advanced",
				"Negotiate salary, benefits, and job offers professionally in English.",
				"Business,Negotiation", "Negotiate salary confidently,Discuss employment terms",
				"Industry-Specific Vocabulary", 22, 95, false, 180, 3, false, true, 3));

		// ─── TRAVEL ENGLISH ──────────────────────────────────────────
		lessons.add(lesson("At the Airport", "Travel English", "Beginner",
				"Master essential phrases for check-in, security, boarding, and customs.",
				"Conversation,Travel", "Handle airport interactions,Understand travel announcements",
				"None", 10, 35, false, 0, 1, true, true, 1));

		lessons.add(lesson("Hotel & Accommodation", "Travel English", "Beginner",
				"Learn vocabulary and phrases for booking, checking in, and making requests at hotels.",
				"Conversation,Travel", "Book a hotel room in English,Make service requests",
				"None", 12, 40, false, 0, 1, false, false, 2));

		lessons.add(lesson("Navigating a New City", "Travel English", "Intermediate",
				"Ask for and give directions, use public transport, and explore a new city with confidence.",
				"Conversation,Travel", "Ask for directions clearly,Understand transportation info",
				"At the Airport", 15, 60, false, 60, 2, true, false, 3));

		// ─── DAILY ENGLISH ───────────────────────────────────────────
		lessons.add(lesson("Morning Routines & Habits", "Daily English", "Beginner",
				"Build vocabulary and phrases for describing your daily morning routine.",
				"Vocabulary,Conversation", "Describe a daily routine,Use frequency adverbs",
				"None", 10, 30, false, 0, 1, true, true, 1));

		lessons.add(lesson("Shopping & Bargaining", "Daily English", "Beginner",
				"Practise shopping conversations from entering a store to paying and returning items.",
				"Conversation,Vocabulary", "Handle shopping interactions,Compare prices and products",
				"None", 12, 40, false, 0, 1, false, false, 2));

		lessons.add(lesson("Health & Medical English", "Daily English", "Intermediate",
				"Communicate symptoms, follow medical advice, and understand health-related vocabulary.",
				"Vocabulary,Conversation", "Describe symptoms clearly,Understand medical instructions",
				"Morning Routines & Habits", 18, 65, false, 75, 2, true, false, 3));

		lessonRepository.saveAll(lessons);
		System.out.println("✅  DataSeeder: seeded " + lessons.size() + " lessons.");
	}

	private Lesson lesson(
			String title, String category, String level, String description,
			String skills, String objectives, String requirements,
			int minutes, int xp, boolean locked, int reqXP, int reqLevel,
			boolean popular, boolean featured, int order) {
		return Lesson.builder()
				.title(title)
				.category(category)
				.level(level)
				.description(description)
				.content("Lesson content for: " + title)
				.estimatedMinutes(minutes)
				.duration(minutes)
				.xpReward(xp)
				.locked(locked)
				.requiredXP(reqXP)
				.requiredLevel(reqLevel)
				.skills(skills)
				.objectives(objectives)
				.requirements(requirements)
				.popular(popular)
				.featured(featured)
				.orderIndex(order)
				.active(true)
				.build();
	}
}
