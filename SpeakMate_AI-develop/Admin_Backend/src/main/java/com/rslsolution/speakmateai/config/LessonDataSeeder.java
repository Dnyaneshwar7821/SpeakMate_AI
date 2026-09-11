package com.rslsolution.speakmateai.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.entity.Lesson;
import com.rslsolution.speakmateai.repository.LessonRepository;

/**
 * Seeds 20 comprehensive lessons across 10 categories on first boot (idempotent).
 * Only runs if the lessons table is empty. Contains rich educational content for each topic.
 */
@Component
public class LessonDataSeeder implements CommandLineRunner {

    private final LessonRepository lessonRepository;

    public LessonDataSeeder(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    @Override
    public void run(String... args) {
        if (lessonRepository.count() > 0) return; // already seeded

        List<Lesson> lessons = List.of(

            // ── Grammar ──────────────────────────────────────────────────
            Lesson.builder()
                .title("Present Tenses Mastery")
                .category("Grammar").level("Beginner")
                .description("Master the simple present and present continuous with real-world examples.")
                .content("""
                    English has two primary present tenses: Simple Present and Present Continuous.

                    1. Simple Present (Subject + Verb 1 + Object)
                    - Used for habits, routines, and permanent facts.
                    - Example: 'I live in New York.' (Permanent) or 'She drinks coffee every morning.' (Habit)

                    2. Present Continuous (Subject + am/is/are + Verb-ing)
                    - Used for temporary situations and actions happening right now.
                    - Example: 'I am studying English.' (Temporary study) or 'Look! It is raining outside.' (Happening now)

                    Common Mistakes:
                    - Don't use continuous tenses with stative verbs (verbs of feeling/thinking):
                      Incorrect: 'I am knowing the answer.'
                      Correct: 'I know the answer.'
                    """)
                .objectives("Use simple present correctly,Use present continuous,Avoid common tense errors")
                .skills("Sentence Structure,Verb Conjugation,Written English")
                .requirements("None")
                .estimatedMinutes(20).xpReward(80).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            Lesson.builder()
                .title("Past Tenses Deep Dive")
                .category("Grammar").level("Intermediate")
                .description("Simple past vs. past continuous vs. past perfect — explained clearly.")
                .content("""
                    Narrating events in the past requires choosing the right past tense:

                    1. Simple Past (Subject + Verb-ed / Irregular Verb)
                    - Used for completed past actions with a specific time.
                    - Example: 'I visited Paris in 2022.'

                    2. Past Continuous (Subject + was/were + Verb-ing)
                    - Used for actions that were in progress at a specific moment in the past, or when an action was interrupted.
                    - Example: 'I was cooking dinner when the phone rang.' (Cooking was in progress, call interrupted it)

                    3. Past Perfect (Subject + had + Past Participle)
                    - Used to talk about an action that happened before another past action.
                    - Example: 'When I arrived at the station, the train had already left.' (The train left first)
                    """)
                .objectives("Use simple past,Use past continuous,Use past perfect")
                .skills("Storytelling,Grammar Accuracy,Writing")
                .requirements("Present Tenses Mastery")
                .estimatedMinutes(25).xpReward(100).orderIndex(2)
                .active(true).popular(true).locked(false).build(),

            Lesson.builder()
                .title("Conditionals: If Sentences")
                .category("Grammar").level("Advanced")
                .description("Master zero, first, second, and third conditionals for hypotheticals and possibilities.")
                .content("""
                    Conditionals describe the result of a specific condition. There are four types:

                    1. Zero Conditional (If + Present Simple, Present Simple)
                    - Used for general truths and facts.
                    - Example: 'If you heat ice, it melts.'

                    2. First Conditional (If + Present Simple, Will + Verb)
                    - Used for real, likely future possibilities.
                    - Example: 'If it rains tomorrow, we will stay at home.'

                    3. Second Conditional (If + Past Simple, Would + Verb)
                    - Used for imaginary, hypothetical present/future situations.
                    - Example: 'If I won the lottery, I would buy a large mansion.'

                    4. Third Conditional (If + Past Perfect, Would Have + Verb 3)
                    - Used for imaginary past situations and regrets.
                    - Example: 'If I had studied harder, I would have passed the exam.'
                    """)
                .objectives("Use zero conditional,Use first conditional,Use second and third conditionals")
                .skills("Advanced Grammar,Hypothetical Speech,Writing")
                .requirements("Past Tenses Deep Dive")
                .estimatedMinutes(30).xpReward(150).orderIndex(3)
                .active(true).locked(false).build(),

            // ── Vocabulary ───────────────────────────────────────────────
            Lesson.builder()
                .title("Essential 500 Words")
                .category("Vocabulary").level("Beginner")
                .description("The 500 most useful English words every learner must know.")
                .content("""
                    Vocabulary learning is most effective when categorized:

                    1. High-Frequency Nouns:
                    - People: 'friend', 'family', 'people', 'student', 'boss'
                    - Places: 'school', 'home', 'work', 'city', 'office'
                    - Objects: 'computer', 'book', 'phone', 'table', 'car'

                    2. Core Verbs:
                    - Action: 'do', 'make', 'go', 'take', 'come', 'run'
                    - Thought/Sense: 'know', 'think', 'see', 'hear', 'learn'

                    3. Describing Adjectives:
                    - Positive: 'good', 'happy', 'great', 'important', 'easy'
                    - Negative: 'bad', 'difficult', 'sad', 'cheap', 'slow'

                    Try using these in simple combinations: 'My boss has a new computer.'
                    """)
                .objectives("Learn 100 common nouns,Learn 100 common verbs,Learn 100 adjectives")
                .skills("Reading,Communication,Word Recognition")
                .requirements("None")
                .estimatedMinutes(20).xpReward(70).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            Lesson.builder()
                .title("Idioms and Phrases")
                .category("Vocabulary").level("Intermediate")
                .description("Learn 50 common English idioms used in everyday conversation.")
                .content("""
                    Idioms are phrases where the meaning cannot be understood from the literal words.

                    Common Conversational Idioms:

                    1. 'Under the weather'
                    - Meaning: Feeling slightly sick or unwell.
                    - Example: 'I'm feeling a bit under the weather, so I won't go to work.'

                    2. 'Bite the bullet'
                    - Meaning: Face a difficult situation with courage and get it over with.
                    - Example: 'I hate dental work, but I need to bite the bullet and go.'

                    3. 'Spill the beans'
                    - Meaning: Reveal a secret, often accidentally.
                    - Example: 'Don't spill the beans about the surprise party!'

                    4. 'Once in a blue moon'
                    - Meaning: Happening very rarely.
                    - Example: 'My brother lives abroad, so I only see him once in a blue moon.'
                    """)
                .objectives("Learn 50 common idioms,Use idioms naturally,Understand native speakers")
                .skills("Fluency,Natural Speech,Comprehension")
                .requirements("Essential 500 Words")
                .estimatedMinutes(25).xpReward(110).orderIndex(2)
                .active(true).popular(true).locked(false).build(),

            Lesson.builder()
                .title("Business Vocabulary")
                .category("Vocabulary").level("Advanced")
                .description("Professional vocabulary for meetings, emails, and presentations.")
                .content("""
                    Succeed in English-speaking workplaces with professional vocabulary:

                    1. Key Verbs:
                    - 'Postpone': Delay an event to a later time. (e.g. 'Let's postpone the meeting.')
                    - 'Collaborate': Work together to achieve something. (e.g. 'We need to collaborate on this proposal.')
                    - 'Implement': Put a decision or plan into effect. (e.g. 'We will implement the changes next week.')

                    2. Nouns and Phrases:
                    - 'Key takeaway': The most important point to remember.
                    - 'Action item': A specific task to be done.
                    - 'Bottleneck': A stage in a process that slows everything down.
                    """)
                .objectives("Email writing vocabulary,Meeting phrases,Presentation language")
                .skills("Professional English,Email Writing,Presentations")
                .requirements("Idioms and Phrases")
                .estimatedMinutes(30).xpReward(140).orderIndex(3)
                .active(true).locked(false).build(),

            // ── Speaking ─────────────────────────────────────────────────
            Lesson.builder()
                .title("Speak with Confidence")
                .category("Speaking").level("Beginner")
                .description("Overcome fear of speaking and build your English fluency from day one.")
                .content("""
                    Building speaking confidence is about attitude, not just grammar:

                    1. Start with Simple Formulas
                    - When introducing yourself: 'Hi, I'm [Name]. I work in [Industry] and I enjoy [Hobby].'
                    - Keep sentences short. Short sentences are easier to control and pronounce.

                    2. Use Speech Fillers Politely
                    - If you need time to think, don't stay silent. Use fillers like: 'Well...', 'Let me think...', 'Actually...'

                    3. Don't Fear Mistakes
                    - Communication is the goal. Native speakers focus on what you say, not if you made a small tense error. Keep speaking!
                    """)
                .objectives("Introduce yourself confidently,Make small talk,Overcome speaking anxiety")
                .skills("Fluency,Confidence,Pronunciation")
                .requirements("None")
                .estimatedMinutes(20).xpReward(90).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            Lesson.builder()
                .title("Storytelling in English")
                .category("Speaking").level("Intermediate")
                .description("Tell compelling stories in English using transitions and narrative techniques.")
                .content("""
                    To tell an engaging story, structure it clearly using chronological transition markers:

                    1. Setting the Scene (Past Continuous)
                    - Describe what was happening around you.
                    - Example: 'Last summer, I was traveling in Italy. The sun was shining...'

                    2. The Interrupting Action (Simple Past)
                    - Introduce the main event using sequence markers like 'Suddenly' or 'Out of the blue'.
                    - Example: 'Suddenly, my bag disappeared.'

                    3. Using Linkers:
                    - 'First of all...'
                    - 'Then / Next...'
                    - 'After that...'
                    - 'In the end...'
                    """)
                .objectives("Use narrative structure,Tell a story fluently,Use sequence markers")
                .skills("Storytelling,Fluency,Past Tenses")
                .requirements("Speak with Confidence")
                .estimatedMinutes(25).xpReward(120).orderIndex(2)
                .active(true).locked(false).build(),

            // ── Pronunciation ────────────────────────────────────────────
            Lesson.builder()
                .title("English Vowel Sounds")
                .category("Pronunciation").level("Beginner")
                .description("Master all 20 English vowel sounds to speak clearly and be understood.")
                .content("""
                    English has 20 vowel sounds represented by only 5 vowel letters. Distinguishing between short and long vowel sounds is crucial:

                    1. Short /ɪ/ vs. Long /iː/
                    - Short /ɪ/ (lax mouth, short sound): 'ship', 'fit', 'sit', 'bin'
                    - Long /iː/ (wide smile, longer sound): 'sheep', 'feet', 'seat', 'bean'

                    2. Minimal Pair Drills:
                    - 'Leave' vs. 'Live' (e.g. 'Where do you live?' vs 'I need to leave.')
                    - 'Heal' vs. 'Hill'

                    Practice smiling wide for /iː/ and keeping your jaw relaxed and neutral for /ɪ/.
                    """)
                .objectives("Identify all 20 vowel sounds,Produce short vowels,Produce long vowels")
                .skills("Pronunciation,Clarity,Accent Reduction")
                .requirements("None")
                .estimatedMinutes(25).xpReward(85).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            Lesson.builder()
                .title("Word Stress Patterns")
                .category("Pronunciation").level("Intermediate")
                .description("Learn how word stress changes meaning and makes you sound more natural.")
                .content("""
                    Word stress is the magic key to English comprehension. Stressed syllables are louder, longer, and higher in pitch.

                    1. Two-Syllable Noun vs. Verb Stress:
                    - For nouns, stress the first syllable: **RE**cord, **IM**port, **PRE**sent.
                    - For verbs, stress the second syllable: re**CORD**, im**PORT**, pre**SENT**.
                    - Example: 'He gave me a **PRE**sent.' vs. 'I will pre**SENT** the slides.'

                    2. Sentence Stress:
                    - Stress content words (nouns, verbs, adjectives).
                    - Unstress function words (prepositions, articles, pronouns).
                    """)
                .objectives("Identify stressed syllables,Apply stress rules,Use noun-verb stress contrasts")
                .skills("Stress Patterns,Natural Speech,Rhythm")
                .requirements("English Vowel Sounds")
                .estimatedMinutes(20).xpReward(100).orderIndex(2)
                .active(true).locked(false).build(),

            // ── Conversation ─────────────────────────────────────────────
            Lesson.builder()
                .title("Everyday Conversations")
                .category("Conversation").level("Beginner")
                .description("Practice the conversations you have every day: greetings, shopping, asking directions.")
                .content("""
                    Daily English centers on simple exchanges. Let's study how to ask for and give directions:

                    Asking for Help:
                    - 'Excuse me, could you tell me how to get to the train station?'
                    - 'Excuse me, is there a pharmacy nearby?'

                    Giving Directions:
                    - 'Go straight down this street.'
                    - 'Turn left at the traffic light.'
                    - 'It's on your right, next to the post office.'

                    Polite endings:
                    - 'Thank you so much!' -> 'You're welcome!' or 'No problem!'
                    """)
                .objectives("Handle greetings,Shop in English,Ask for directions")
                .skills("Communication,Listening,Fluency")
                .requirements("None")
                .estimatedMinutes(20).xpReward(75).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            Lesson.builder()
                .title("Debate and Persuasion")
                .category("Conversation").level("Advanced")
                .description("Learn how to express opinions, agree, disagree, and persuade others in English.")
                .content("""
                    Advanced conversation requires expressing opinions politely but firmly:

                    1. Expressing Strong Beliefs:
                    - 'From my perspective, it is clear that...'
                    - 'I strongly believe that...'

                    2. Disagreeing Politely (Crucial Skill):
                    - Avoid: 'You are wrong.'
                    - Use: 'I see your point, but have you considered...?' or 'I agree with you to some extent, but...'

                    3. Formulating Persuasive Questions:
                    - 'Wouldn't you agree that this option saves time?'
                    """)
                .objectives("Express opinions clearly,Use hedging language,Agree and disagree politely")
                .skills("Critical Thinking,Debate,Persuasion")
                .requirements("Everyday Conversations")
                .estimatedMinutes(30).xpReward(160).orderIndex(2)
                .active(true).locked(false).build(),

            // ── Listening ────────────────────────────────────────────────
            Lesson.builder()
                .title("Listen and Understand: Accents")
                .category("Listening").level("Intermediate")
                .description("Train your ear to understand different English accents: British, American, Australian.")
                .content("""
                    Understanding accents requires noticing differences in vocabulary and pronunciation:

                    1. Vocabulary Differences:
                    - American: 'elevator', 'apartment', 'subway', 'trash'
                    - British: 'lift', 'flat', 'underground', 'rubbish'

                    2. Pronunciation Differences (The Letter R):
                    - American accent is rhotic: they pronounce the 'r' in 'water' and 'car'.
                    - British accent is non-rhotic: 'water' sounds like 'watah', 'car' sounds like 'cah'.

                    3. Listening Strategy:
                    - Focus on content words (nouns and verbs) to get the context, rather than worrying about every single sound.
                    """)
                .objectives("Understand British accent,Understand American accent,Understand Australian accent")
                .skills("Listening Comprehension,Accent Recognition,Vocabulary")
                .requirements("None")
                .estimatedMinutes(30).xpReward(110).orderIndex(1)
                .active(true).popular(true).locked(false).build(),

            // ── Business English ─────────────────────────────────────────
            Lesson.builder()
                .title("Professional Email Writing")
                .category("Business English").level("Intermediate")
                .description("Write clear, professional emails that get responses and build credibility.")
                .content("""
                    Professional emails follow a strict 4-step structure:

                    1. Formal Greeting:
                    - 'Dear Mr. Jones,' (Formal client) or 'Dear Team,' (Internal department)

                    2. Pleasant Opening:
                    - 'I hope this email finds you well.'

                    3. Clear Statement of Purpose:
                    - 'I am writing to inquire about...' or 'I am writing to follow up on our meeting.'

                    4. Formal Call-to-Action & Closing:
                    - 'Please let me know your availability by Friday.'
                    - 'Best regards,' or 'Sincerely,' followed by your name.
                    """)
                .objectives("Write a professional subject line,Structure email body,Use formal closings")
                .skills("Email Writing,Professional English,Grammar")
                .requirements("None")
                .estimatedMinutes(25).xpReward(130).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            Lesson.builder()
                .title("Presentations in English")
                .category("Business English").level("Advanced")
                .description("Deliver clear, engaging presentations in English with confidence.")
                .content("""
                    Structure a presentation clearly using signpost phrases:

                    1. The Introduction:
                    - 'Welcome everyone. Today I'd like to present our quarterly results.'

                    2. Transitional Signposts:
                    - Moving to a new point: 'Let's move on to the next topic...'
                    - Elaborating: 'To go into more detail...'
                    - Visual references: 'As you can see on this chart...'

                    3. The Conclusion & Q&A:
                    - 'To wrap up, let's summarize the key points...'
                    - 'Thank you for your time. I'd be happy to take any questions now.'
                    """)
                .objectives("Structure a presentation,Open confidently,Handle Q&A")
                .skills("Public Speaking,Presentation Skills,Professional English")
                .requirements("Professional Email Writing")
                .estimatedMinutes(35).xpReward(180).orderIndex(2)
                .active(true).locked(false).build(),

            // ── Interview Preparation ────────────────────────────────────
            Lesson.builder()
                .title("Common Interview Questions")
                .category("Interview Preparation").level("Intermediate")
                .description("Prepare for the top 20 interview questions with model answers.")
                .content("""
                    Ace job interviews by structuring your responses strategically:

                    1. 'Tell me about yourself'
                    - Use the Present-Past-Future framework:
                      - Present: 'I am currently a senior developer leading a team...'
                      - Past: 'Before this, I worked for 3 years building cloud databases...'
                      - Future: 'I'm looking to join a company like yours where I can apply my skills...'

                    2. 'What is your greatest weakness?'
                    - Name a real but manageable weakness, and immediately explain how you are working to improve it.
                    - Example: 'I used to struggle with public speaking, but I joined Toastmasters last year to practice.'
                    """)
                .objectives("Answer Tell me about yourself,Describe strengths and weaknesses,Answer behavioral questions")
                .skills("Interview Skills,Professional English,Confidence")
                .requirements("None")
                .estimatedMinutes(30).xpReward(140).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            // ── Travel English ───────────────────────────────────────────
            Lesson.builder()
                .title("At the Airport")
                .category("Travel English").level("Beginner")
                .description("All the English you need for check-in, security, boarding, and arrivals.")
                .content("""
                    Navigate airport security and check-in with these common dialogues:

                    At the Check-In Counter:
                    - Agent: 'May I see your passport and ticket, please?'
                    - Passenger: 'Here you go. I'd like an aisle seat, please.'
                    - Agent: 'Are you checking any bags?'
                    - Passenger: 'Yes, just this one suitcase.'

                    At Security:
                    - Agent: 'Please place your laptop in a separate bin. Empty your pockets.'
                    - Passenger: 'Do I need to take off my shoes?'
                    - Agent: 'Yes, please.'
                    """)
                .objectives("Handle check-in,Clear customs,Navigate the airport")
                .skills("Listening,Communication,Travel Vocabulary")
                .requirements("None")
                .estimatedMinutes(20).xpReward(80).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            Lesson.builder()
                .title("Hotel and Accommodation")
                .category("Travel English").level("Beginner")
                .description("Check in, make requests, and handle problems at hotels in English.")
                .content("""
                    Master conversations at hotel reception desks:

                    Checking In:
                    - Guest: 'Hello, I have a reservation under the name Robinson.'
                    - Reception: 'Yes, Mr. Robinson. A double room for three nights. May I see your ID?'
                    - Guest: 'Here is my passport. Is breakfast included?'
                    - Reception: 'Yes, breakfast is served in the lobby from 7 AM to 10 AM.'

                    Handling Problems:
                    - Guest: 'Excuse me, my room keycard isn't working.'
                    - Reception: 'Let me reprogram that keycard for you immediately.'
                    """)
                .objectives("Make a reservation,Check in and check out,Request hotel services")
                .skills("Communication,Travel Vocabulary,Problem-Solving")
                .requirements("At the Airport")
                .estimatedMinutes(20).xpReward(75).orderIndex(2)
                .active(true).locked(false).build(),

            // ── Daily English ────────────────────────────────────────────
            Lesson.builder()
                .title("Morning Routines")
                .category("Daily English").level("Beginner")
                .description("Describe your morning routine and everyday activities naturally in English.")
                .content("""
                    Describe your daily routine using Simple Present and adverbs of frequency:

                    Vocabulary List:
                    - 'Wake up' vs 'Get up' (Waking up is opening eyes, getting up is leaving bed)
                    - 'Commute': Travel to work or school.

                    Daily Routine paragraph:
                    - 'I usually wake up at 7 AM. I always brush my teeth and make a cup of coffee. Then, I commute to work by bus at 8:15 AM.'

                    Frequency Adverbs:
                    - Always (100%) -> Usually (80%) -> Often (60%) -> Sometimes (40%) -> Rarely (10%) -> Never (0%)
                    """)
                .objectives("Describe daily routine,Use frequency adverbs,Talk about time")
                .skills("Simple Present,Time Expressions,Daily Vocabulary")
                .requirements("None")
                .estimatedMinutes(15).xpReward(60).orderIndex(1)
                .active(true).popular(true).featured(true).locked(false).build(),

            Lesson.builder()
                .title("Talking About Food")
                .category("Daily English").level("Beginner")
                .description("Discuss food preferences, order at restaurants, and describe dishes in English.")
                .content("""
                    Learn how to discuss ingredients and order food at a restaurant:

                    1. Describing Tastes:
                    - 'Sweet': Sugar, honey, ripe fruits.
                    - 'Sour': Lemons, limes, vinegar.
                    - 'Spicy': Chili peppers, hot curry.
                    - 'Savory': Meat, mushrooms, cheese (salty/rich, not sweet).

                    2. Ordering Food Dialogue:
                    - Server: 'Are you ready to order?'
                    - Customer: 'Yes, I'd like the grilled chicken with a side salad, please.'
                    - Server: 'Would you like anything to drink?'
                    - Customer: 'Just a glass of water, thank you.'
                    """)
                .objectives("Describe food and taste,Order at a restaurant,Express food preferences")
                .skills("Vocabulary,Communication,Politeness")
                .requirements("Morning Routines")
                .estimatedMinutes(20).xpReward(70).orderIndex(2)
                .active(true).locked(false).build()
        );

        lessonRepository.saveAll(lessons);
    }
}
