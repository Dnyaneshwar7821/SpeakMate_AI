-- SpeakMate AI Database Backup
-- Exported At: 2026-07-30T07:21:25.301Z

-- Table: onboarding
INSERT INTO "onboarding" ("id", "created_at", "daily_goal_minutes", "english_level", "interests", "learning_goal", "native_language", "onboarding_completed", "preferred_learning_time", "updated_at", "user_id", "age_group", "school_grade", "ai_voice") VALUES ('29', '"2026-07-28T04:32:25.994Z"', 15, 'Beginner', 'Technology,Travel', 'Interview', 'English', true, 'Morning', '"2026-07-28T05:10:11.648Z"', '4', 'Senior', '5th Std', 'Friendly');
INSERT INTO "onboarding" ("id", "created_at", "daily_goal_minutes", "english_level", "interests", "learning_goal", "native_language", "onboarding_completed", "preferred_learning_time", "updated_at", "user_id", "age_group", "school_grade", "ai_voice") VALUES ('31', '"2026-07-28T23:52:55.057Z"', 30, 'Beginner', 'Technology,Travel', 'Interview', 'English', true, 'Morning', '"2026-07-28T23:54:47.755Z"', '6', 'Young Adult', NULL, 'Friendly');
INSERT INTO "onboarding" ("id", "created_at", "daily_goal_minutes", "english_level", "interests", "learning_goal", "native_language", "onboarding_completed", "preferred_learning_time", "updated_at", "user_id", "age_group", "school_grade", "ai_voice") VALUES ('32', '"2026-07-29T01:25:37.016Z"', 20, 'Intermediate', 'Travel, Science', 'Study', 'English', true, 'Morning', '"2026-07-29T01:27:01.116Z"', '7', 'Professional', '3rd Std', NULL);
INSERT INTO "onboarding" ("id", "created_at", "daily_goal_minutes", "english_level", "interests", "learning_goal", "native_language", "onboarding_completed", "preferred_learning_time", "updated_at", "user_id", "age_group", "school_grade", "ai_voice") VALUES ('35', '"2026-07-29T23:51:05.034Z"', 15, 'Beginner', 'General', 'Improve English speaking skills', 'English', false, 'Morning', '"2026-07-30T00:01:13.033Z"', '24', 'Young Adult', NULL, NULL);

-- Table: achievement
INSERT INTO "achievement" ("id", "created_at", "description", "tier", "title", "unlocked", "unlocked_at", "xp_reward", "user_id") VALUES ('25', '"2026-07-28T05:13:05.842Z"', 'Complete your first lesson!', 1, 'First Steps', false, NULL, 50, '4');
INSERT INTO "achievement" ("id", "created_at", "description", "tier", "title", "unlocked", "unlocked_at", "xp_reward", "user_id") VALUES ('26', '"2026-07-28T05:13:05.848Z"', 'Complete your first speaking session!', 1, 'Speak Up', false, NULL, 50, '4');
INSERT INTO "achievement" ("id", "created_at", "description", "tier", "title", "unlocked", "unlocked_at", "xp_reward", "user_id") VALUES ('27', '"2026-07-28T05:13:05.851Z"', 'Save 5 words to your vocabulary!', 1, 'Word Collector', false, NULL, 50, '4');
INSERT INTO "achievement" ("id", "created_at", "description", "tier", "title", "unlocked", "unlocked_at", "xp_reward", "user_id") VALUES ('28', '"2026-07-28T05:13:05.853Z"', 'Perform 3 grammar corrections!', 1, 'Grammar Guru', false, NULL, 50, '4');
INSERT INTO "achievement" ("id", "created_at", "description", "tier", "title", "unlocked", "unlocked_at", "xp_reward", "user_id") VALUES ('29', '"2026-07-28T05:13:05.854Z"', 'Reach a 3-day learning streak!', 1, 'Hot Streak', false, NULL, 50, '4');
INSERT INTO "achievement" ("id", "created_at", "description", "tier", "title", "unlocked", "unlocked_at", "xp_reward", "user_id") VALUES ('30', '"2026-07-28T05:13:05.857Z"', 'Earn 500 total learning XP!', 1, 'Super Scholar', false, NULL, 100, '4');

-- Table: speaking_sessions

-- Table: playing_with_neon
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (1, 'c4ca4238a0', 0.83310235);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (2, 'c81e728d9d', 0.88557607);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (3, 'eccbc87e4b', 0.16057949);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (4, 'a87ff679a2', 0.74529296);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (5, 'e4da3b7fbb', 0.7076901);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (6, '1679091c5a', 0.15749124);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (7, '8f14e45fce', 0.36594728);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (8, 'c9f0f895fb', 0.9420961);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (9, '45c48cce2e', 0.92349654);
INSERT INTO "playing_with_neon" ("id", "name", "value") VALUES (10, 'd3d9446802', 0.2272126);

-- Table: chat_bookmarks

-- Table: chat_history

-- Table: chat_sessions
INSERT INTO "chat_sessions" ("id", "created_at", "mode", "title", "updated_at", "user_id") VALUES ('22', '"2026-07-28T05:11:34.140Z"', 'General English', 'General English Session', '"2026-07-28T05:11:34.140Z"', '4');
INSERT INTO "chat_sessions" ("id", "created_at", "mode", "title", "updated_at", "user_id") VALUES ('23', '"2026-07-28T06:35:14.101Z"', 'Grammar Coach', 'Grammar Coach Session', '"2026-07-28T06:35:14.101Z"', '4');
INSERT INTO "chat_sessions" ("id", "created_at", "mode", "title", "updated_at", "user_id") VALUES ('24', '"2026-07-28T06:35:14.201Z"', 'General English', 'General English Session', '"2026-07-28T06:35:14.201Z"', '4');

-- Table: lessons
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('1', true, 'Grammar', 'English has two primary present tenses: Simple Present and Present Continuous.

1. Simple Present (Subject + Verb 1 + Object)
- Used for habits, routines, and permanent facts.
- Example: ''I live in New York.'' (Permanent) or ''She drinks coffee every morning.'' (Habit)

2. Present Continuous (Subject + am/is/are + Verb-ing)
- Used for temporary situations and actions happening right now.
- Example: ''I am studying English.'' (Temporary study) or ''Look! It is raining outside.'' (Happening now)

Common Mistakes:
- Don''t use continuous tenses with stative verbs (verbs of feeling/thinking):
  Incorrect: ''I am knowing the answer.''
  Correct: ''I know the answer.''
', NULL, '"2026-07-22T17:52:23.419Z"', 'Master the simple present and present continuous with real-world examples.', 10, 20, true, 'Beginner', false, 'Use simple present correctly,Use present continuous,Avoid common tense errors', 1, true, 1, 0, 'None', 'Sentence Structure,Verb Conjugation,Written English', NULL, 'Present Tenses Mastery', '"2026-07-27T05:26:07.085Z"', 20);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('2', true, 'Grammar', 'Narrating events in the past requires choosing the right past tense:

1. Simple Past (Subject + Verb-ed / Irregular Verb)
- Used for completed past actions with a specific time.
- Example: ''I visited Paris in 2022.''

2. Past Continuous (Subject + was/were + Verb-ing)
- Used for actions that were in progress at a specific moment in the past, or when an action was interrupted.
- Example: ''I was cooking dinner when the phone rang.'' (Cooking was in progress, call interrupted it)

3. Past Perfect (Subject + had + Past Participle)
- Used to talk about an action that happened before another past action.
- Example: ''When I arrived at the station, the train had already left.'' (The train left first)
', NULL, '"2026-07-22T17:52:23.559Z"', 'Simple past vs. past continuous vs. past perfect — explained clearly.', 10, 25, false, 'Intermediate', false, 'Use simple past,Use past continuous,Use past perfect', 2, true, 1, 0, 'Present Tenses Mastery', 'Storytelling,Grammar Accuracy,Writing', NULL, 'Past Tenses Deep Dive', '"2026-07-27T05:26:07.187Z"', 25);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('3', true, 'Grammar', 'Conditionals describe the result of a specific condition. There are four types:

1. Zero Conditional (If + Present Simple, Present Simple)
- Used for general truths and facts.
- Example: ''If you heat ice, it melts.''

2. First Conditional (If + Present Simple, Will + Verb)
- Used for real, likely future possibilities.
- Example: ''If it rains tomorrow, we will stay at home.''

3. Second Conditional (If + Past Simple, Would + Verb)
- Used for imaginary, hypothetical present/future situations.
- Example: ''If I won the lottery, I would buy a large mansion.''

4. Third Conditional (If + Past Perfect, Would Have + Verb 3)
- Used for imaginary past situations and regrets.
- Example: ''If I had studied harder, I would have passed the exam.''
', NULL, '"2026-07-22T17:52:23.635Z"', 'Master zero, first, second, and third conditionals for hypotheticals and possibilities.', 10, 30, false, 'Advanced', false, 'Use zero conditional,Use first conditional,Use second and third conditionals', 3, false, 1, 0, 'Past Tenses Deep Dive', 'Advanced Grammar,Hypothetical Speech,Writing', NULL, 'Conditionals: If Sentences', '"2026-07-27T05:26:07.187Z"', 30);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('4', true, 'Vocabulary', 'Vocabulary learning is most effective when categorized:

1. High-Frequency Nouns:
- People: ''friend'', ''family'', ''people'', ''student'', ''boss''
- Places: ''school'', ''home'', ''work'', ''city'', ''office''
- Objects: ''computer'', ''book'', ''phone'', ''table'', ''car''

2. Core Verbs:
- Action: ''do'', ''make'', ''go'', ''take'', ''come'', ''run''
- Thought/Sense: ''know'', ''think'', ''see'', ''hear'', ''learn''

3. Describing Adjectives:
- Positive: ''good'', ''happy'', ''great'', ''important'', ''easy''
- Negative: ''bad'', ''difficult'', ''sad'', ''cheap'', ''slow''

Try using these in simple combinations: ''My boss has a new computer.''
', NULL, '"2026-07-22T17:52:23.715Z"', 'The 500 most useful English words every learner must know.', 10, 20, true, 'Beginner', false, 'Learn 100 common nouns,Learn 100 common verbs,Learn 100 adjectives', 1, true, 1, 0, 'None', 'Reading,Communication,Word Recognition', NULL, 'Essential 500 Words', '"2026-07-27T05:26:07.187Z"', 20);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('5', true, 'Vocabulary', 'Idioms are phrases where the meaning cannot be understood from the literal words.

Common Conversational Idioms:

1. ''Under the weather''
- Meaning: Feeling slightly sick or unwell.
- Example: ''I''m feeling a bit under the weather, so I won''t go to work.''

2. ''Bite the bullet''
- Meaning: Face a difficult situation with courage and get it over with.
- Example: ''I hate dental work, but I need to bite the bullet and go.''

3. ''Spill the beans''
- Meaning: Reveal a secret, often accidentally.
- Example: ''Don''t spill the beans about the surprise party!''

4. ''Once in a blue moon''
- Meaning: Happening very rarely.
- Example: ''My brother lives abroad, so I only see him once in a blue moon.''
', NULL, '"2026-07-22T17:52:23.788Z"', 'Learn 50 common English idioms used in everyday conversation.', 10, 25, false, 'Intermediate', false, 'Learn 50 common idioms,Use idioms naturally,Understand native speakers', 2, true, 1, 0, 'Essential 500 Words', 'Fluency,Natural Speech,Comprehension', NULL, 'Idioms and Phrases', '"2026-07-27T05:26:07.187Z"', 25);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('6', true, 'Vocabulary', 'Succeed in English-speaking workplaces with professional vocabulary:

1. Key Verbs:
- ''Postpone'': Delay an event to a later time. (e.g. ''Let''s postpone the meeting.'')
- ''Collaborate'': Work together to achieve something. (e.g. ''We need to collaborate on this proposal.'')
- ''Implement'': Put a decision or plan into effect. (e.g. ''We will implement the changes next week.'')

2. Nouns and Phrases:
- ''Key takeaway'': The most important point to remember.
- ''Action item'': A specific task to be done.
- ''Bottleneck'': A stage in a process that slows everything down.
', NULL, '"2026-07-22T17:52:23.860Z"', 'Professional vocabulary for meetings, emails, and presentations.', 10, 30, false, 'Advanced', false, 'Email writing vocabulary,Meeting phrases,Presentation language', 3, false, 1, 0, 'Idioms and Phrases', 'Professional English,Email Writing,Presentations', NULL, 'Business Vocabulary', '"2026-07-27T05:26:07.187Z"', 30);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('7', true, 'Speaking', 'Building speaking confidence is about attitude, not just grammar:

1. Start with Simple Formulas
- When introducing yourself: ''Hi, I''m [Name]. I work in [Industry] and I enjoy [Hobby].''
- Keep sentences short. Short sentences are easier to control and pronounce.

2. Use Speech Fillers Politely
- If you need time to think, don''t stay silent. Use fillers like: ''Well...'', ''Let me think...'', ''Actually...''

3. Don''t Fear Mistakes
- Communication is the goal. Native speakers focus on what you say, not if you made a small tense error. Keep speaking!
', NULL, '"2026-07-22T17:52:24.007Z"', 'Overcome fear of speaking and build your English fluency from day one.', 10, 20, true, 'Beginner', false, 'Introduce yourself confidently,Make small talk,Overcome speaking anxiety', 1, true, 1, 0, 'None', 'Fluency,Confidence,Pronunciation', NULL, 'Speak with Confidence', '"2026-07-27T05:26:07.187Z"', 20);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('8', true, 'Speaking', 'To tell an engaging story, structure it clearly using chronological transition markers:

1. Setting the Scene (Past Continuous)
- Describe what was happening around you.
- Example: ''Last summer, I was traveling in Italy. The sun was shining...''

2. The Interrupting Action (Simple Past)
- Introduce the main event using sequence markers like ''Suddenly'' or ''Out of the blue''.
- Example: ''Suddenly, my bag disappeared.''

3. Using Linkers:
- ''First of all...''
- ''Then / Next...''
- ''After that...''
- ''In the end...''
', NULL, '"2026-07-22T17:52:24.156Z"', 'Tell compelling stories in English using transitions and narrative techniques.', 10, 25, false, 'Intermediate', false, 'Use narrative structure,Tell a story fluently,Use sequence markers', 2, false, 1, 0, 'Speak with Confidence', 'Storytelling,Fluency,Past Tenses', NULL, 'Storytelling in English', '"2026-07-27T05:26:07.187Z"', 25);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('9', true, 'Pronunciation', 'English has 20 vowel sounds represented by only 5 vowel letters. Distinguishing between short and long vowel sounds is crucial:

1. Short /ɪ/ vs. Long /iː/
- Short /ɪ/ (lax mouth, short sound): ''ship'', ''fit'', ''sit'', ''bin''
- Long /iː/ (wide smile, longer sound): ''sheep'', ''feet'', ''seat'', ''bean''

2. Minimal Pair Drills:
- ''Leave'' vs. ''Live'' (e.g. ''Where do you live?'' vs ''I need to leave.'')
- ''Heal'' vs. ''Hill''

Practice smiling wide for /iː/ and keeping your jaw relaxed and neutral for /ɪ/.
', NULL, '"2026-07-22T17:52:24.299Z"', 'Master all 20 English vowel sounds to speak clearly and be understood.', 10, 25, true, 'Beginner', false, 'Identify all 20 vowel sounds,Produce short vowels,Produce long vowels', 1, true, 1, 0, 'None', 'Pronunciation,Clarity,Accent Reduction', NULL, 'English Vowel Sounds', '"2026-07-27T05:26:07.187Z"', 20);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('10', true, 'Pronunciation', 'Word stress is the magic key to English comprehension. Stressed syllables are louder, longer, and higher in pitch.

1. Two-Syllable Noun vs. Verb Stress:
- For nouns, stress the first syllable: **RE**cord, **IM**port, **PRE**sent.
- For verbs, stress the second syllable: re**CORD**, im**PORT**, pre**SENT**.
- Example: ''He gave me a **PRE**sent.'' vs. ''I will pre**SENT** the slides.''

2. Sentence Stress:
- Stress content words (nouns, verbs, adjectives).
- Unstress function words (prepositions, articles, pronouns).
', NULL, '"2026-07-22T17:52:24.451Z"', 'Learn how word stress changes meaning and makes you sound more natural.', 10, 20, false, 'Intermediate', false, 'Identify stressed syllables,Apply stress rules,Use noun-verb stress contrasts', 2, false, 1, 0, 'English Vowel Sounds', 'Stress Patterns,Natural Speech,Rhythm', NULL, 'Word Stress Patterns', '"2026-07-27T05:26:07.188Z"', 25);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('11', true, 'Conversation', 'Daily English centers on simple exchanges. Let''s study how to ask for and give directions:

Asking for Help:
- ''Excuse me, could you tell me how to get to the train station?''
- ''Excuse me, is there a pharmacy nearby?''

Giving Directions:
- ''Go straight down this street.''
- ''Turn left at the traffic light.''
- ''It''s on your right, next to the post office.''

Polite endings:
- ''Thank you so much!'' -> ''You''re welcome!'' or ''No problem!''
', NULL, '"2026-07-22T17:52:24.607Z"', 'Practice the conversations you have every day: greetings, shopping, asking directions.', 10, 20, true, 'Beginner', false, 'Handle greetings,Shop in English,Ask for directions', 1, true, 1, 0, 'None', 'Communication,Listening,Fluency', NULL, 'Everyday Conversations', '"2026-07-27T05:26:07.188Z"', 20);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('12', true, 'Conversation', 'Advanced conversation requires expressing opinions politely but firmly:

1. Expressing Strong Beliefs:
- ''From my perspective, it is clear that...''
- ''I strongly believe that...''

2. Disagreeing Politely (Crucial Skill):
- Avoid: ''You are wrong.''
- Use: ''I see your point, but have you considered...?'' or ''I agree with you to some extent, but...''

3. Formulating Persuasive Questions:
- ''Wouldn''t you agree that this option saves time?''
', NULL, '"2026-07-22T17:52:24.760Z"', 'Learn how to express opinions, agree, disagree, and persuade others in English.', 10, 30, false, 'Advanced', false, 'Express opinions clearly,Use hedging language,Agree and disagree politely', 2, false, 1, 0, 'Everyday Conversations', 'Critical Thinking,Debate,Persuasion', NULL, 'Debate and Persuasion', '"2026-07-27T05:26:07.188Z"', 30);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('13', true, 'Listening', 'Understanding accents requires noticing differences in vocabulary and pronunciation:

1. Vocabulary Differences:
- American: ''elevator'', ''apartment'', ''subway'', ''trash''
- British: ''lift'', ''flat'', ''underground'', ''rubbish''

2. Pronunciation Differences (The Letter R):
- American accent is rhotic: they pronounce the ''r'' in ''water'' and ''car''.
- British accent is non-rhotic: ''water'' sounds like ''watah'', ''car'' sounds like ''cah''.

3. Listening Strategy:
- Focus on content words (nouns and verbs) to get the context, rather than worrying about every single sound.
', NULL, '"2026-07-22T17:52:24.908Z"', 'Train your ear to understand different English accents: British, American, Australian.', 10, 30, false, 'Intermediate', false, 'Understand British accent,Understand American accent,Understand Australian accent', 1, true, 1, 0, 'None', 'Listening Comprehension,Accent Recognition,Vocabulary', NULL, 'Listen and Understand: Accents', '"2026-07-27T05:26:07.188Z"', 25);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('14', true, 'Business English', 'Professional emails follow a strict 4-step structure:

1. Formal Greeting:
- ''Dear Mr. Jones,'' (Formal client) or ''Dear Team,'' (Internal department)

2. Pleasant Opening:
- ''I hope this email finds you well.''

3. Clear Statement of Purpose:
- ''I am writing to inquire about...'' or ''I am writing to follow up on our meeting.''

4. Formal Call-to-Action & Closing:
- ''Please let me know your availability by Friday.''
- ''Best regards,'' or ''Sincerely,'' followed by your name.
', NULL, '"2026-07-22T17:52:25.059Z"', 'Write clear, professional emails that get responses and build credibility.', 10, 25, true, 'Intermediate', false, 'Write a professional subject line,Structure email body,Use formal closings', 1, true, 1, 0, 'None', 'Email Writing,Professional English,Grammar', NULL, 'Professional Email Writing', '"2026-07-27T05:26:07.188Z"', 25);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('15', true, 'Business English', 'Structure a presentation clearly using signpost phrases:

1. The Introduction:
- ''Welcome everyone. Today I''d like to present our quarterly results.''

2. Transitional Signposts:
- Moving to a new point: ''Let''s move on to the next topic...''
- Elaborating: ''To go into more detail...''
- Visual references: ''As you can see on this chart...''

3. The Conclusion & Q&A:
- ''To wrap up, let''s summarize the key points...''
- ''Thank you for your time. I''d be happy to take any questions now.''
', NULL, '"2026-07-22T17:52:25.211Z"', 'Deliver clear, engaging presentations in English with confidence.', 10, 35, false, 'Advanced', false, 'Structure a presentation,Open confidently,Handle Q&A', 2, false, 1, 0, 'Professional Email Writing', 'Public Speaking,Presentation Skills,Professional English', NULL, 'Presentations in English', '"2026-07-27T05:26:07.188Z"', 30);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('16', true, 'Interview Preparation', 'Ace job interviews by structuring your responses strategically:

1. ''Tell me about yourself''
- Use the Present-Past-Future framework:
  - Present: ''I am currently a senior developer leading a team...''
  - Past: ''Before this, I worked for 3 years building cloud databases...''
  - Future: ''I''m looking to join a company like yours where I can apply my skills...''

2. ''What is your greatest weakness?''
- Name a real but manageable weakness, and immediately explain how you are working to improve it.
- Example: ''I used to struggle with public speaking, but I joined Toastmasters last year to practice.''
', NULL, '"2026-07-22T17:52:25.361Z"', 'Prepare for the top 20 interview questions with model answers.', 10, 30, true, 'Intermediate', false, 'Answer Tell me about yourself,Describe strengths and weaknesses,Answer behavioral questions', 1, true, 1, 0, 'None', 'Interview Skills,Professional English,Confidence', NULL, 'Common Interview Questions', '"2026-07-27T05:26:07.188Z"', 25);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('17', true, 'Travel English', 'Navigate airport security and check-in with these common dialogues:

At the Check-In Counter:
- Agent: ''May I see your passport and ticket, please?''
- Passenger: ''Here you go. I''d like an aisle seat, please.''
- Agent: ''Are you checking any bags?''
- Passenger: ''Yes, just this one suitcase.''

At Security:
- Agent: ''Please place your laptop in a separate bin. Empty your pockets.''
- Passenger: ''Do I need to take off my shoes?''
- Agent: ''Yes, please.''
', NULL, '"2026-07-22T17:52:25.518Z"', 'All the English you need for check-in, security, boarding, and arrivals.', 10, 20, true, 'Beginner', false, 'Handle check-in,Clear customs,Navigate the airport', 1, true, 1, 0, 'None', 'Listening,Communication,Travel Vocabulary', NULL, 'At the Airport', '"2026-07-27T05:26:07.188Z"', 20);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('18', true, 'Travel English', 'Master conversations at hotel reception desks:

Checking In:
- Guest: ''Hello, I have a reservation under the name Robinson.''
- Reception: ''Yes, Mr. Robinson. A double room for three nights. May I see your ID?''
- Guest: ''Here is my passport. Is breakfast included?''
- Reception: ''Yes, breakfast is served in the lobby from 7 AM to 10 AM.''

Handling Problems:
- Guest: ''Excuse me, my room keycard isn''t working.''
- Reception: ''Let me reprogram that keycard for you immediately.''
', NULL, '"2026-07-22T17:52:25.668Z"', 'Check in, make requests, and handle problems at hotels in English.', 10, 20, false, 'Beginner', false, 'Make a reservation,Check in and check out,Request hotel services', 2, false, 1, 0, 'At the Airport', 'Communication,Travel Vocabulary,Problem-Solving', NULL, 'Hotel and Accommodation', '"2026-07-27T05:26:07.188Z"', 20);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('19', true, 'Daily English', 'Describe your daily routine using Simple Present and adverbs of frequency:

Vocabulary List:
- ''Wake up'' vs ''Get up'' (Waking up is opening eyes, getting up is leaving bed)
- ''Commute'': Travel to work or school.

Daily Routine paragraph:
- ''I usually wake up at 7 AM. I always brush my teeth and make a cup of coffee. Then, I commute to work by bus at 8:15 AM.''

Frequency Adverbs:
- Always (100%) -> Usually (80%) -> Often (60%) -> Sometimes (40%) -> Rarely (10%) -> Never (0%)
', NULL, '"2026-07-22T17:52:25.820Z"', 'Describe your morning routine and everyday activities naturally in English.', 10, 15, true, 'Beginner', false, 'Describe daily routine,Use frequency adverbs,Talk about time', 1, true, 1, 0, 'None', 'Simple Present,Time Expressions,Daily Vocabulary', NULL, 'Morning Routines', '"2026-07-27T05:26:07.188Z"', 20);
INSERT INTO "lessons" ("id", "active", "category", "content", "cover_image", "created_at", "description", "duration", "estimated_minutes", "featured", "level", "locked", "objectives", "order_index", "popular", "required_level", "requiredxp", "requirements", "skills", "thumbnail", "title", "updated_at", "xp_reward") VALUES ('20', true, 'Daily English', 'Learn how to discuss ingredients and order food at a restaurant:

1. Describing Tastes:
- ''Sweet'': Sugar, honey, ripe fruits.
- ''Sour'': Lemons, limes, vinegar.
- ''Spicy'': Chili peppers, hot curry.
- ''Savory'': Meat, mushrooms, cheese (salty/rich, not sweet).

2. Ordering Food Dialogue:
- Server: ''Are you ready to order?''
- Customer: ''Yes, I''d like the grilled chicken with a side salad, please.''
- Server: ''Would you like anything to drink?''
- Customer: ''Just a glass of water, thank you.''
', NULL, '"2026-07-22T17:52:25.970Z"', 'Discuss food preferences, order at restaurants, and describe dishes in English.', 10, 20, false, 'Beginner', false, 'Describe food and taste,Order at a restaurant,Express food preferences', 2, false, 1, 0, 'Morning Routines', 'Vocabulary,Communication,Politeness', NULL, 'Talking About Food', '"2026-07-27T05:26:07.189Z"', 20);

-- Table: admins
INSERT INTO "admins" ("id", "created_at", "email", "full_name", "last_login", "password", "phone", "profile_image", "role", "status", "updated_at", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "school_id", "department", "designation", "language", "location", "theme", "email_notifications", "notifications_enabled", "sidebar_collapsed", "system_notifications", "two_factor_enabled", "session_timeout") VALUES ('4', '"2026-07-29T02:49:21.365Z"', 'superadmin@speakmate.com', 'Super Admin', '"2026-07-29T11:25:30.829Z"', '$2a$10$1H918icFQ7wGdB9hG0YX7uEz2zgFwzb6c9v38PrJrh8Gr8Td9g/bG', NULL, NULL, 'SUPER_ADMIN', 'ACTIVE', '"2026-07-29T11:25:30.848Z"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30);
INSERT INTO "admins" ("id", "created_at", "email", "full_name", "last_login", "password", "phone", "profile_image", "role", "status", "updated_at", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "school_id", "department", "designation", "language", "location", "theme", "email_notifications", "notifications_enabled", "sidebar_collapsed", "system_notifications", "two_factor_enabled", "session_timeout") VALUES ('2', '"2026-07-24T13:14:25.224Z"', 'ayushchandgude08@gmail.com', 'Super Admin', '"2026-07-30T06:45:37.548Z"', '$2a$10$Dom5mO.juMnbp54.gSuOSOS67Z2qC6aNBncCPMGiAjOlk09d77tvi', '9876543210', '', 'SUPER_ADMIN', 'ACTIVE', '"2026-07-30T06:45:37.631Z"', NULL, NULL, NULL, NULL, NULL, 'Engineering', 'Lead Developer', 'fr', 'San Francisco', 'DARK', true, true, true, false, true, 60);
INSERT INTO "admins" ("id", "created_at", "email", "full_name", "last_login", "password", "phone", "profile_image", "role", "status", "updated_at", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "school_id", "department", "designation", "language", "location", "theme", "email_notifications", "notifications_enabled", "sidebar_collapsed", "system_notifications", "two_factor_enabled", "session_timeout") VALUES ('1', '"2026-07-24T11:36:44.335Z"', 'admin@speakmate.ai', 'Super Admin', '"2026-07-24T13:02:22.038Z"', '$2a$10$6cfTzciTqloiUHgmFL1PJuDE4qmeqkR170ABPIndZEslAydUwgGu2', '1234567890', '', 'SUPER_ADMIN', 'ACTIVE', '"2026-07-24T13:11:10.476Z"', '037389', '"2026-07-24T13:21:10.474Z"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30);
INSERT INTO "admins" ("id", "created_at", "email", "full_name", "last_login", "password", "phone", "profile_image", "role", "status", "updated_at", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "school_id", "department", "designation", "language", "location", "theme", "email_notifications", "notifications_enabled", "sidebar_collapsed", "system_notifications", "two_factor_enabled", "session_timeout") VALUES ('3', '"2026-07-27T12:13:54.623Z"', 'admin@speakmateai.com', 'Super Admin', NULL, '$2a$10$wl93qMSkvvL3WB4eN5Z7/.Tn2pR2x.7VVrybB4MAnC6WkayeAxZWW', '+1234567890', NULL, 'ADMIN', 'ACTIVE', '"2026-07-27T12:13:54.623Z"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30);

-- Table: subscription_plans
INSERT INTO "subscription_plans" ("id", "ai_practice_limit", "created_at", "currency", "description", "duration_months", "features", "grammar_practice_limit", "is_active", "max_lessons", "max_tests", "plan_name", "price", "speaking_practice_limit", "updated_at", "vocabulary_practice_limit", "ai_minutes_limit", "billing_cycle", "student_limit", "teacher_limit") VALUES ('2', 1000, '"2026-07-29T05:43:20.861Z"', 'USD', 'Unlock unlimited AI practice and priority support.', 12, 'Unlimited Lessons,Unlimited AI Speaking,Priority Support', 500, true, 500, 100, 'Premium Pro', '149.99', 500, '"2026-07-29T05:43:20.861Z"', 500, NULL, NULL, NULL, NULL);
INSERT INTO "subscription_plans" ("id", "ai_practice_limit", "created_at", "currency", "description", "duration_months", "features", "grammar_practice_limit", "is_active", "max_lessons", "max_tests", "plan_name", "price", "speaking_practice_limit", "updated_at", "vocabulary_practice_limit", "ai_minutes_limit", "billing_cycle", "student_limit", "teacher_limit") VALUES ('1', -1, '"2026-07-27T11:09:10.869Z"', 'USD', 'Price drop for back to school season!', 12, 'Unlimited AI Practice, Unlimited Tests, Personal Vocabulary Coach', -1, false, -1, -1, 'SpeakMate Pro (Updated)', '79.99', -1, '"2026-07-29T07:04:02.842Z"', -1, NULL, NULL, NULL, NULL);

-- Table: users
INSERT INTO "users" ("id", "active", "auth_provider", "avatar", "created_at", "daily_goal_minutes", "email", "english_level", "expo_push_token", "first_name", "interests", "last_name", "learning_goal", "native_language", "onboarding_completed", "password", "preferred_accent", "preferred_voice", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "role", "updated_at", "welcome_completed", "age_group", "school_grade", "division", "parent_name", "parent_phone", "phone", "roll_number", "school_name", "standard", "user_type", "school_id", "status", "student_id", "email_verification_token", "email_verified") VALUES ('19', true, NULL, NULL, '"2026-07-29T10:55:30.924Z"', 30, 'jane.smith@example.com', 'BEGINNER', NULL, 'Jane', NULL, 'Smith', 'Improve conversational skills for travel', 'Spanish', false, '$2a$10$aTSwnppNJjnX1Rp3IsAAjepbiOgynYOcpoBGOccV31bWogZuRzpnS', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', '"2026-07-29T10:55:30.924Z"', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'STANDARD', NULL, NULL, NULL, NULL, false);
INSERT INTO "users" ("id", "active", "auth_provider", "avatar", "created_at", "daily_goal_minutes", "email", "english_level", "expo_push_token", "first_name", "interests", "last_name", "learning_goal", "native_language", "onboarding_completed", "password", "preferred_accent", "preferred_voice", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "role", "updated_at", "welcome_completed", "age_group", "school_grade", "division", "parent_name", "parent_phone", "phone", "roll_number", "school_name", "standard", "user_type", "school_id", "status", "student_id", "email_verification_token", "email_verified") VALUES ('20', true, NULL, NULL, '"2026-07-29T11:40:37.503Z"', NULL, 'alice.smith@greenwood.com', NULL, NULL, 'Alice', NULL, 'Smith', NULL, NULL, false, '$2a$10$TuyLwYSWlaOtLB52YmpWvekQOCOF8V6nj4gQWt7RscR9/EcX02TZy', NULL, NULL, NULL, NULL, NULL, NULL, 'SCHOOL_ADMIN', '"2026-07-29T11:40:37.503Z"', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8', 'ACTIVE', NULL, 'e405cde8-9c69-445c-b2bb-4ab69fc59dac', false);
INSERT INTO "users" ("id", "active", "auth_provider", "avatar", "created_at", "daily_goal_minutes", "email", "english_level", "expo_push_token", "first_name", "interests", "last_name", "learning_goal", "native_language", "onboarding_completed", "password", "preferred_accent", "preferred_voice", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "role", "updated_at", "welcome_completed", "age_group", "school_grade", "division", "parent_name", "parent_phone", "phone", "roll_number", "school_name", "standard", "user_type", "school_id", "status", "student_id", "email_verification_token", "email_verified") VALUES ('22', true, NULL, NULL, '"2026-07-29T12:03:16.033Z"', NULL, 'michael.scott@greenwoodstudent.com', NULL, NULL, 'Michael', NULL, 'Scott', NULL, NULL, false, '$2a$10$IixaZifodL9MIFqCWx17veG10hXNdHEfkF6cZ1y20.ULDjQuWTjlS', NULL, NULL, NULL, NULL, NULL, NULL, 'STUDENT', '"2026-07-29T12:03:16.033Z"', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8', 'ACTIVE', 'STU-2026-7054', NULL, false);
INSERT INTO "users" ("id", "active", "auth_provider", "avatar", "created_at", "daily_goal_minutes", "email", "english_level", "expo_push_token", "first_name", "interests", "last_name", "learning_goal", "native_language", "onboarding_completed", "password", "preferred_accent", "preferred_voice", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "role", "updated_at", "welcome_completed", "age_group", "school_grade", "division", "parent_name", "parent_phone", "phone", "roll_number", "school_name", "standard", "user_type", "school_id", "status", "student_id", "email_verification_token", "email_verified") VALUES ('6', true, 'LOCAL', NULL, '"2026-07-28T23:52:54.663Z"', NULL, 'nikitaalgule1205@gmail.com', NULL, NULL, 'Nikita', NULL, 'Algule', NULL, NULL, true, '$2a$10$C0fcNSrq6y0Av3XVrUAzAevmCmz9A8vpXdKEWERL1VF70OeHSJurS', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', '"2026-07-28T23:54:47.755Z"', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false);
INSERT INTO "users" ("id", "active", "auth_provider", "avatar", "created_at", "daily_goal_minutes", "email", "english_level", "expo_push_token", "first_name", "interests", "last_name", "learning_goal", "native_language", "onboarding_completed", "password", "preferred_accent", "preferred_voice", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "role", "updated_at", "welcome_completed", "age_group", "school_grade", "division", "parent_name", "parent_phone", "phone", "roll_number", "school_name", "standard", "user_type", "school_id", "status", "student_id", "email_verification_token", "email_verified") VALUES ('7', true, 'LOCAL', 'https://api.dicebear.com/7.x/avataaars/png?seed=Max&backgroundType=gradientLinear&backgroundColor=ffdfbf,ffd5dc', '"2026-07-29T01:25:36.219Z"', 20, 'dnyanesh7803@gmail.com', 'Intermediate', NULL, 'Rohit', 'Travel, Science', 'Patil', 'Study', 'English', true, '$2a$10$YMJNeJckHK/zOcor1F7LyOyt67jmMlGk2NzA/hheKx6ukRkXHhRI6', NULL, 'Friendly', NULL, NULL, NULL, NULL, 'USER', '"2026-07-29T01:27:02.520Z"', false, 'Professional', '3rd Std', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false);
INSERT INTO "users" ("id", "active", "auth_provider", "avatar", "created_at", "daily_goal_minutes", "email", "english_level", "expo_push_token", "first_name", "interests", "last_name", "learning_goal", "native_language", "onboarding_completed", "password", "preferred_accent", "preferred_voice", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "role", "updated_at", "welcome_completed", "age_group", "school_grade", "division", "parent_name", "parent_phone", "phone", "roll_number", "school_name", "standard", "user_type", "school_id", "status", "student_id", "email_verification_token", "email_verified") VALUES ('24', true, 'LOCAL', 'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka&backgroundType=gradientLinear&backgroundColor=ffd5dc,ffdfbf', '"2026-07-29T23:51:04.841Z"', NULL, 'dnyaneshwaralgule@gmail.com', NULL, NULL, 'Dnyaneshwar', NULL, 'Algule', NULL, NULL, false, '$2a$10$xtZWp9c/UJWdi.MbVU19uuq2C/BjWdava0AdBzehVt8jaIICdVY/m', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', '"2026-07-30T00:01:13.033Z"', false, 'Young Adult', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false);
INSERT INTO "users" ("id", "active", "auth_provider", "avatar", "created_at", "daily_goal_minutes", "email", "english_level", "expo_push_token", "first_name", "interests", "last_name", "learning_goal", "native_language", "onboarding_completed", "password", "preferred_accent", "preferred_voice", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "role", "updated_at", "welcome_completed", "age_group", "school_grade", "division", "parent_name", "parent_phone", "phone", "roll_number", "school_name", "standard", "user_type", "school_id", "status", "student_id", "email_verification_token", "email_verified") VALUES ('25', true, NULL, NULL, '"2026-07-30T05:38:54.073Z"', NULL, 'john.doe@school.edu', NULL, NULL, 'John', NULL, 'Doe', NULL, NULL, false, '$2a$10$Z/7PqLnft/2iYmvgAqZQV.CTvcQxhDrm0X5YKNKM9azxAn6zqUIqa', NULL, NULL, NULL, NULL, NULL, NULL, 'STUDENT', '"2026-07-30T05:43:19.891Z"', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8', 'ACTIVE', 'STU-2026-2088', NULL, false);
INSERT INTO "users" ("id", "active", "auth_provider", "avatar", "created_at", "daily_goal_minutes", "email", "english_level", "expo_push_token", "first_name", "interests", "last_name", "learning_goal", "native_language", "onboarding_completed", "password", "preferred_accent", "preferred_voice", "reset_otp", "reset_otp_expiry", "reset_password_token", "reset_password_token_expiry", "role", "updated_at", "welcome_completed", "age_group", "school_grade", "division", "parent_name", "parent_phone", "phone", "roll_number", "school_name", "standard", "user_type", "school_id", "status", "student_id", "email_verification_token", "email_verified") VALUES ('4', false, 'LOCAL', NULL, '"2026-07-28T04:32:24.985Z"', NULL, 'ayushchandgude08@gmail.com', NULL, NULL, 'Aayush', NULL, 'Patil', NULL, NULL, true, '$2a$10$vywau/wJbF9RRMy33YRAietaLtsfelnVMbwuhJMPZ0hzhuvC1MAQy', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', '"2026-07-30T06:46:44.706Z"', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false);

-- Table: grammar_history
INSERT INTO "grammar_history" ("id", "corrected_text", "created_at", "explanation", "grammar_score", "original_text", "user_id") VALUES ('7', 'I eat an apple.', '"2026-07-28T06:36:24.903Z"', '1. [capitalization] The first word of the sentence ''i'' should be capitalized. (Suggested: "I eat apple")
2. [article] Missing article before the singular countable noun ''apple''. (Suggested: "I eat an apple")', 70, 'i eat apple', '4');

-- Table: lesson_progress

-- Table: notification

-- Table: progress
INSERT INTO "progress" ("id", "created_at", "current_streak", "level", "longest_streak", "total_grammar_checks", "total_practice_minutes", "total_speaking_sessions", "total_vocabulary_words", "updated_at", "xp", "user_id") VALUES ('30', '"2026-07-28T04:32:25.687Z"', 0, 1, 0, 1, 0, 0, 0, '"2026-07-28T06:36:24.999Z"', 15, '4');
INSERT INTO "progress" ("id", "created_at", "current_streak", "level", "longest_streak", "total_grammar_checks", "total_practice_minutes", "total_speaking_sessions", "total_vocabulary_words", "updated_at", "xp", "user_id") VALUES ('32', '"2026-07-28T23:52:54.757Z"', 0, 1, 0, 0, 0, 0, 0, '"2026-07-28T23:52:54.757Z"', 0, '6');
INSERT INTO "progress" ("id", "created_at", "current_streak", "level", "longest_streak", "total_grammar_checks", "total_practice_minutes", "total_speaking_sessions", "total_vocabulary_words", "updated_at", "xp", "user_id") VALUES ('33', '"2026-07-29T01:25:36.817Z"', 0, 1, 0, 0, 0, 0, 0, '"2026-07-29T01:25:36.817Z"', 0, '7');
INSERT INTO "progress" ("id", "created_at", "current_streak", "level", "longest_streak", "total_grammar_checks", "total_practice_minutes", "total_speaking_sessions", "total_vocabulary_words", "updated_at", "xp", "user_id") VALUES ('36', '"2026-07-29T23:51:04.934Z"', 0, 1, 0, 0, 0, 0, 0, '"2026-07-29T23:51:04.934Z"', 0, '24');

-- Table: settings
INSERT INTO "settings" ("id", "ai_voice", "auto_play_audio", "created_at", "daily_reminder", "dark_mode", "language", "notifications_enabled", "sound_effects", "updated_at", "user_id") VALUES ('29', 'Female', true, '"2026-07-28T04:32:25.980Z"', true, false, 'English', true, true, '"2026-07-28T04:32:25.980Z"', '4');
INSERT INTO "settings" ("id", "ai_voice", "auto_play_audio", "created_at", "daily_reminder", "dark_mode", "language", "notifications_enabled", "sound_effects", "updated_at", "user_id") VALUES ('31', 'Female', true, '"2026-07-28T23:52:54.952Z"', true, false, 'English', true, true, '"2026-07-28T23:52:54.952Z"', '6');
INSERT INTO "settings" ("id", "ai_voice", "auto_play_audio", "created_at", "daily_reminder", "dark_mode", "language", "notifications_enabled", "sound_effects", "updated_at", "user_id") VALUES ('32', 'Friendly', true, '"2026-07-29T01:25:36.834Z"', true, false, 'English', true, true, '"2026-07-29T01:27:01.922Z"', '7');
INSERT INTO "settings" ("id", "ai_voice", "auto_play_audio", "created_at", "daily_reminder", "dark_mode", "language", "notifications_enabled", "sound_effects", "updated_at", "user_id") VALUES ('35', 'Friendly', true, '"2026-07-29T23:51:04.941Z"', true, false, 'English', true, true, '"2026-07-29T23:52:07.236Z"', '24');

-- Table: vocabulary

-- Table: user_subscriptions

-- Table: payments

-- Table: chat_messages
INSERT INTO "chat_messages" ("id", "better_sentence", "created_at", "explanation", "follow_up_question", "grammar_correction", "message", "sender", "vocabulary_suggestions", "voice_enabled", "session_id") VALUES ('60', NULL, '"2026-07-28T05:11:40.746Z"', NULL, NULL, NULL, 'I''m SpeakMateAI, your friendly English tutor, and I''m excited to chat with you - what do you like to do in your free time?', 'ai', NULL, false, '22');
INSERT INTO "chat_messages" ("id", "better_sentence", "created_at", "explanation", "follow_up_question", "grammar_correction", "message", "sender", "vocabulary_suggestions", "voice_enabled", "session_id") VALUES ('61', NULL, '"2026-07-28T06:35:24.298Z"', NULL, NULL, NULL, 'I''m SpeakMateAI, your friendly English tutor, and I''m excited to help you improve your grammar skills. What area of grammar would you like to focus on today, such as verb tenses, conditional sentences, or something else?', 'ai', NULL, false, '23');
INSERT INTO "chat_messages" ("id", "better_sentence", "created_at", "explanation", "follow_up_question", "grammar_correction", "message", "sender", "vocabulary_suggestions", "voice_enabled", "session_id") VALUES ('62', NULL, '"2026-07-28T06:35:24.298Z"', NULL, NULL, NULL, 'I''m SpeakMateAI, your friendly English tutor, and I''m excited to chat with you today. What''s been the highlight of your week so far, anything interesting or exciting happen?', 'ai', NULL, false, '24');

-- Table: conversation_feedbacks

-- Table: conversation_messages

-- Table: invoices

-- Table: refunds

-- Table: ai_prompt_versions

-- Table: ai_usage_logs

-- Table: assignment_progress

-- Table: assignments

-- Table: audit_logs

-- Table: schools
INSERT INTO "schools" ("id", "admin_name", "created_date", "location", "school_code", "school_name", "status", "subscription_plan", "subscription_status", "total_students", "address", "city", "country", "created_at", "email", "logo_url", "max_students", "name", "phone", "state", "subscription_end_date", "subscription_plan_id", "subscription_start_date", "updated_at", "contact_number", "active", "contact_phone") VALUES ('4', NULL, NULL, NULL, 'TEST001', 'Test School', 'ACTIVE', NULL, NULL, NULL, NULL, 'Mumbai', 'India', '"2026-07-29T04:25:10.512Z"', 'school@test.com', NULL, NULL, 'Test School', '9876543210', 'Maharashtra', NULL, NULL, NULL, '"2026-07-29T04:25:10.512Z"', NULL, true, NULL);
INSERT INTO "schools" ("id", "admin_name", "created_date", "location", "school_code", "school_name", "status", "subscription_plan", "subscription_status", "total_students", "address", "city", "country", "created_at", "email", "logo_url", "max_students", "name", "phone", "state", "subscription_end_date", "subscription_plan_id", "subscription_start_date", "updated_at", "contact_number", "active", "contact_phone") VALUES ('8', NULL, NULL, NULL, 'SCH-BFC554A2', 'Greenwood High School', NULL, NULL, NULL, NULL, '123 Elm Street, Cityville', NULL, NULL, '"2026-07-29T11:40:37.152Z"', NULL, NULL, NULL, 'Greenwood High School', NULL, NULL, NULL, NULL, NULL, '"2026-07-29T11:40:37.152Z"', NULL, true, '+1555019283');

-- Table: class_rooms
INSERT INTO "class_rooms" ("id", "academic_year", "created_at", "grade", "name", "school_id", "section", "status", "teacher_id", "updated_at") VALUES ('1', '2026-2027', '"2026-07-30T06:46:14.364Z"', '5th Grade', 'Grade 5 Beta (Updated)', '1', NULL, 'ACTIVE', '3', '"2026-07-30T06:48:54.107Z"');

-- Table: class_students
INSERT INTO "class_students" ("id", "class_id", "student_id", "created_at") VALUES ('1', '1', '101', '"2026-07-30T06:49:40.681Z"');
INSERT INTO "class_students" ("id", "class_id", "student_id", "created_at") VALUES ('2', '1', '102', '"2026-07-30T06:49:40.993Z"');
INSERT INTO "class_students" ("id", "class_id", "student_id", "created_at") VALUES ('3', '1', '105', '"2026-07-30T06:49:41.194Z"');
INSERT INTO "class_students" ("id", "class_id", "student_id", "created_at") VALUES ('4', '1', '25', '"2026-07-30T06:50:09.457Z"');

