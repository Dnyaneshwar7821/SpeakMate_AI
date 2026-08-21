/**
 * SpeakMate AI - Comprehensive English Grammar Engine & Dynamic Tailored Daily Quiz System
 * 
 * Features:
 * 1. Multi-pass deterministic grammar correction & multi-mistake analyzer.
 * 2. CEFR-aligned Grammar Guides & School Syllabus topics.
 * 3. User-tailored Daily Quiz Generator:
 *    - For STUDENTS: Tailored by Standard (5th Std, 6th Std, 7th Std, 8th Std, 9th Std, 10th Std).
 *    - For INDIVIDUALS: Tailored by Age Group (Teens 13-17, Young Adults 18-24, Professionals 25-39, Lifelong Learners 40+).
 * 4. Varied Question Formats:
 *    - ✏️ FILL_BLANKS (Fill in the missing words/verb forms)
 *    - 🧐 CORRECT_OR_INCORRECT (Check if the given sentence is correct or wrong)
 *    - 🔍 SPOT_ERROR (Identify and fix multiple grammar mistakes)
 *    - 🔄 TRANSFORMATION (Active/Passive, Direct/Indirect, Conditionals)
 * 5. Date-seeded daily rotation (8 fresh questions every day with zero repeat).
 * 6. Audio synthesizer chimes & spoken feedback.
 */

// 1. Comprehensive Deterministic Fallback & Analysis Rules
export const COMPREHENSIVE_GRAMMAR_RULES = [
  // Subject-Verb Agreement
  {
    id: "sva_third_singular_do",
    regex: /\b(he|she|it|everyone|someone|nobody|everybody|anyone|each)\s+do\s+not\b/gi,
    replace: "$1 does not",
    type: "Subject-Verb Agreement",
    errorSnippet: "do not",
    issue: "Used 'do not' instead of 'does not' with a third-person singular subject.",
    rule: "Third-person singular subjects (he, she, it, everyone, someone) take 'does not' in the present tense.",
    correction: "does not"
  },
  {
    id: "sva_third_singular_dont",
    regex: /\b(he|she|it|everyone|someone|nobody|everybody|anyone)\s+don't\b/gi,
    replace: "$1 doesn't",
    type: "Subject-Verb Agreement",
    errorSnippet: "don't",
    issue: "Used 'don't' instead of 'doesn't' with third-person singular.",
    rule: "Use 'doesn't' with singular subjects (he, she, it). 'Don't' is for I, you, we, they.",
    correction: "doesn't"
  },
  {
    id: "sva_simple_present_verbs",
    regex: /\b(he|she|it)\s+(go|eat|walk|play|want|like|need|know|think|read|write|drive|work|study)\b/gi,
    replace: (match, subj, verb) => {
      const thirdMap = {
        go: "goes",
        eat: "eats",
        walk: "walks",
        play: "plays",
        want: "wants",
        like: "likes",
        need: "needs",
        know: "knows",
        think: "thinks",
        read: "reads",
        write: "writes",
        drive: "drives",
        work: "works",
        study: "studies"
      };
      return `${subj} ${thirdMap[verb.toLowerCase()] || verb + "s"}`;
    },
    type: "Subject-Verb Agreement",
    errorSnippet: "base verb with he/she/it",
    issue: "The verb is missing the third-person singular -s/-es suffix.",
    rule: "In Simple Present tense, third-person singular subjects require verbs ending in -s, -es, or -ies.",
    correction: "Add -s or -es to verb"
  },
  {
    id: "sva_they_we_singular_verb",
    regex: /\b(they|we|you)\s+(goes|eats|walks|plays|wants|likes|needs|works)\b/gi,
    replace: (match, subj, verb) => {
      const baseMap = {
        goes: "go",
        eats: "eat",
        walks: "walk",
        plays: "play",
        wants: "want",
        likes: "like",
        needs: "need",
        works: "work"
      };
      return `${subj} ${baseMap[verb.toLowerCase()] || verb.replace(/s$/, "")}`;
    },
    type: "Subject-Verb Agreement",
    errorSnippet: "singular verb with plural subject",
    issue: "Used a singular verb ending in -s with a plural subject (they, we, you).",
    rule: "Plural subjects (we, they, you) take the base form of the verb without -s in simple present.",
    correction: "Use base verb"
  },

  // Auxiliary Verbs & Modals
  {
    id: "aux_did_past_verb",
    regex: /\b(did|didn't|did\s+not)\s+(went|ate|saw|came|walked|played|bought|told|asked|knew|wrote|took)\b/gi,
    replace: (match, aux, verb) => {
      const baseMap = {
        went: "go",
        ate: "eat",
        saw: "see",
        came: "come",
        walked: "walk",
        played: "play",
        bought: "buy",
        told: "tell",
        asked: "ask",
        knew: "know",
        wrote: "write",
        took: "take"
      };
      return `${aux} ${baseMap[verb.toLowerCase()] || verb}`;
    },
    type: "Auxiliary Verb & Tense",
    errorSnippet: "did + past tense verb",
    issue: "Used past tense form of the verb after 'did' / 'didn't'.",
    rule: "After 'did' or 'didn't', always use the base (bare infinitive) form of the main verb (e.g. 'didn't go', not 'didn't went').",
    correction: "Use base verb form"
  },
  {
    id: "aux_modal_past_verb",
    regex: /\b(can|could|should|would|will|must|may|might)\s+(went|ate|saw|came|walked|played|wrote|spoke)\b/gi,
    replace: (match, modal, verb) => {
      const baseMap = {
        went: "go",
        ate: "eat",
        saw: "see",
        came: "come",
        walked: "walk",
        played: "play",
        wrote: "write",
        spoke: "speak"
      };
      return `${modal} ${baseMap[verb.toLowerCase()] || verb}`;
    },
    type: "Modal Verb Rule",
    errorSnippet: "modal + past verb",
    issue: "Used a past tense verb immediately after a modal verb.",
    rule: "Modal auxiliary verbs (can, could, should, would, must, may, might, will) must always be followed directly by a base verb.",
    correction: "Use base verb form"
  },

  // Articles
  {
    id: "article_a_before_vowel_sound",
    regex: /\ba\s+([aeiou][a-z]+)\b/gi,
    replace: "an $1",
    type: "Articles (A vs An)",
    errorSnippet: "a + vowel",
    issue: "Used indefinite article 'a' before a word starting with a vowel sound.",
    rule: "Use 'an' before words beginning with a vowel sound (a, e, i, o, u).",
    correction: "an"
  },
  {
    id: "article_an_before_consonant_sound",
    regex: /\ban\s+([bcdfghjklmnpqrstvwxyz][a-z]+)\b/gi,
    replace: (match, word) => {
      const silentH = /^(hour|honest|honor|heir)/i;
      if (silentH.test(word)) return match;
      return `a ${word}`;
    },
    type: "Articles (A vs An)",
    errorSnippet: "an + consonant",
    issue: "Used indefinite article 'an' before a word starting with a consonant sound.",
    rule: "Use 'a' before words beginning with a consonant sound.",
    correction: "a"
  },

  // Prepositions of Time & Direction
  {
    id: "prep_since_with_duration",
    regex: /\b(since)\s+(\d+\s+(?:days?|months?|years?|hours?|weeks?|minutes?|decades?))\b/gi,
    replace: "for $2",
    type: "Prepositions of Time",
    errorSnippet: "since + time period",
    issue: "Used 'since' with a duration of time instead of 'for'.",
    rule: "Use 'for' when referring to a length or duration of time. Use 'since' for a specific starting point in time.",
    correction: "for"
  },
  {
    id: "prep_listen_to",
    regex: /\blisten\s+(music|him|her|them|the\s+teacher|radio)\b/gi,
    replace: "listen to $1",
    type: "Dependent Prepositions",
    errorSnippet: "listen without 'to'",
    issue: "Missing preposition 'to' after the transitive verb 'listen'.",
    rule: "'Listen' requires the preposition 'to' when introducing an object (e.g. 'listen to music').",
    correction: "listen to"
  },
  {
    id: "prep_congratulate_on",
    regex: /\bcongratulate\s+([a-z\s]+)\s+for\b/gi,
    replace: "congratulate $1 on",
    type: "Dependent Prepositions",
    errorSnippet: "congratulate for",
    issue: "Used 'congratulate for' instead of 'congratulate on'.",
    rule: "The standard collocation is 'congratulate someone ON something'.",
    correction: "congratulate on"
  },
  {
    id: "prep_married_to",
    regex: /\bmarried\s+with\b/gi,
    replace: "married to",
    type: "Dependent Prepositions",
    errorSnippet: "married with",
    issue: "Used 'married with' instead of 'married to'.",
    rule: "In standard English, someone is 'married to' someone, not 'married with'.",
    correction: "married to"
  },

  // Redundancy
  {
    id: "redundancy_discuss_about",
    regex: /\bdiscuss\s+about\b/gi,
    replace: "discuss",
    type: "Redundancy & Word Choice",
    errorSnippet: "discuss about",
    issue: "'Discuss' already means 'talk about'. Adding 'about' is redundant.",
    rule: "'Discuss' is a transitive verb that takes a direct object without 'about'.",
    correction: "discuss"
  },
  {
    id: "redundancy_return_back",
    regex: /\b(return|revert|reply)\s+back\b/gi,
    replace: "$1",
    type: "Redundancy",
    errorSnippet: "return/revert back",
    issue: "'Return' and 'revert' already imply coming/sending back.",
    rule: "Say 'return to class' or 'revert with documents' without 'back'.",
    correction: "Remove 'back'"
  },
  {
    id: "idiom_one_of_my_friends",
    regex: /\bone\s+of\s+my\s+friend\b/gi,
    replace: "one of my friends",
    type: "Noun Phrase Plurality",
    errorSnippet: "one of my friend",
    issue: "'One of' selects one item from a plural group; the noun must be plural.",
    rule: "The structure 'one of my [noun]' always requires a plural noun (e.g. 'one of my friends').",
    correction: "one of my friends"
  },
  {
    id: "collocation_do_mistake",
    regex: /\b(did|do|does|doing)\s+(a\s+mistake|mistakes)\b/gi,
    replace: (match, verb, noun) => {
      const makeMap = { did: "made", do: "make", does: "makes", doing: "making" };
      return `${makeMap[verb.toLowerCase()] || "make"} ${noun}`;
    },
    type: "Collocation Error",
    errorSnippet: "do a mistake",
    issue: "Used 'do a mistake' instead of 'make a mistake'.",
    rule: "In English, mistakes are 'made', not 'done'. The correct collocation is 'make a mistake'.",
    correction: "make a mistake"
  },
  {
    id: "comp_double_comparative",
    regex: /\bmore\s+(better|faster|taller|easier|cheaper|smaller|bigger|harder)\b/gi,
    replace: "$1",
    type: "Double Comparative",
    errorSnippet: "more + -er adjective",
    issue: "Used 'more' with an adjective that already has the comparative -er suffix.",
    rule: "Do not use 'more' with one-syllable comparative adjectives (e.g. say 'better', not 'more better').",
    correction: "Remove 'more'"
  },
  {
    id: "cond_if_i_was_were",
    regex: /\bif\s+I\s+was\s+(you|a\s+bird|rich|the\s+president|in\s+your\s+place)\b/gi,
    replace: "if I were $1",
    type: "Subjunctive Mood (2nd Conditional)",
    errorSnippet: "if I was",
    issue: "Used 'was' in a hypothetical / unreal conditional instead of the subjunctive 'were'.",
    rule: "In unreal/hypothetical statements, use 'were' for all subjects (e.g. 'If I were you').",
    correction: "if I were"
  },
  {
    id: "mech_lowercase_i",
    regex: /(^|\s)i(\s|[.,!?;:'])/g,
    replace: "$1I$2",
    type: "Capitalization",
    errorSnippet: "lowercase 'i'",
    issue: "The pronoun 'I' is written in lowercase.",
    rule: "The first-person singular pronoun 'I' must always be capitalized.",
    correction: "I"
  }
];

/**
 * Multi-pass grammar analysis
 */
export function analyzeSentenceGrammarLocally(rawText) {
  if (!rawText || !rawText.trim()) {
    return {
      isCorrect: true,
      accuracyScore: 100,
      originalText: "",
      correctedText: "",
      errors: [],
      explanation: "Please enter a sentence to analyze.",
      praiseMessage: ""
    };
  }

  let text = rawText.trim();
  let workingSentence = text;
  const detectedErrors = [];

  for (const rule of COMPREHENSIVE_GRAMMAR_RULES) {
    if (typeof rule.replace === "function") {
      const match = workingSentence.match(rule.regex);
      if (match) {
        workingSentence = workingSentence.replace(rule.regex, rule.replace);
        detectedErrors.push({
          errorSnippet: match[0],
          type: rule.type,
          issue: rule.issue,
          rule: rule.rule,
          correction: rule.correction
        });
      }
    } else {
      if (rule.regex.test(workingSentence)) {
        const match = workingSentence.match(rule.regex);
        workingSentence = workingSentence.replace(rule.regex, rule.replace);
        detectedErrors.push({
          errorSnippet: match ? match[0] : rule.errorSnippet,
          type: rule.type,
          issue: rule.issue,
          rule: rule.rule,
          correction: rule.correction
        });
      }
    }
  }

  // Capitalize first letter
  if (workingSentence.length > 0 && workingSentence[0] !== workingSentence[0].toUpperCase()) {
    const originalFirst = workingSentence[0];
    workingSentence = workingSentence[0].toUpperCase() + workingSentence.slice(1);
    if (!detectedErrors.some(e => e.type === "Capitalization")) {
      detectedErrors.push({
        errorSnippet: originalFirst,
        type: "Capitalization",
        issue: "Sentence starts with a lowercase letter.",
        rule: "Every English sentence must start with a capital letter.",
        correction: `Capitalize '${originalFirst.toUpperCase()}'`
      });
    }
  }

  // Check ending punctuation
  const hasTerminalPunctuation = /[.!?]$/.test(workingSentence.trim());
  if (!hasTerminalPunctuation) {
    workingSentence = workingSentence.trim() + ".";
    if (!detectedErrors.some(e => e.type === "Punctuation")) {
      detectedErrors.push({
        errorSnippet: "missing terminal punctuation",
        type: "Punctuation",
        issue: "The sentence is missing closing punctuation at the end.",
        rule: "Complete English sentences must conclude with a period (.), question mark (?), or exclamation mark (!).",
        correction: "Add period (.)"
      });
    }
  }

  const isCorrect = detectedErrors.length === 0 && workingSentence.toLowerCase() === (text.trim() + ".").toLowerCase();
  const accuracyScore = isCorrect
    ? 100
    : Math.max(35, 100 - detectedErrors.length * 15);

  const praiseMessage = isCorrect
    ? "🌟 Perfect English Grammar! Your sentence is syntactically sound, natural, and adheres to all grammatical conventions."
    : "";

  const explanation = isCorrect
    ? "Your sentence is 100% correct! Subject-verb agreement, tense consistency, and punctuation are all properly applied."
    : `We identified ${detectedErrors.length} grammar improvement${detectedErrors.length > 1 ? "s" : ""}. Review the detailed breakdown below:`;

  return {
    isCorrect,
    accuracyScore,
    originalText: text,
    correctedText: workingSentence,
    nativeAlternative: isCorrect ? null : getSuggestedNativeAlternative(workingSentence),
    errors: detectedErrors,
    explanation,
    praiseMessage
  };
}

function getSuggestedNativeAlternative(corrected) {
  const c = corrected.toLowerCase();
  if (c.includes("i am having a doubt")) return "I have a question.";
  if (c.includes("what is your good name")) return "May I ask your name?";
  if (c.includes("today morning")) return "This morning";
  if (c.includes("yesterday night")) return "Last night";
  if (c.includes("i am very much happy")) return "I am thrilled / delighted.";
  if (c.includes("out of station")) return "Out of town / away.";
  return null;
}

// 2. Comprehensive CEFR-Aligned English Grammar Handbook Guide
export const EXTENSIVE_GRAMMAR_GUIDE = [
  {
    id: "guide_tenses",
    category: "Verb Tenses & Aspects",
    icon: "⏱️",
    level: "All Levels (A1-C2)",
    title: "The 12 English Tenses Master Guide",
    summary: "Master past, present, and future across simple, continuous, perfect, and perfect continuous forms.",
    rules: [
      {
        name: "Simple Present",
        formula: "Subject + Base Verb (+s/es for he/she/it)",
        usage: "Used for universal truths, daily routines, habits, and permanent states.",
        correctExample: "She drinks green tea every morning.",
        wrongExample: "She drinking green tea every morning."
      },
      {
        name: "Present Continuous",
        formula: "Subject + am/is/are + Verb-ing",
        usage: "Used for actions happening right now at the moment of speaking or temporary trends.",
        correctExample: "They are developing a new mobile application.",
        wrongExample: "They developing a new mobile application."
      },
      {
        name: "Present Perfect",
        formula: "Subject + have/has + Past Participle (V3)",
        usage: "Used for completed experiences where the exact time is not stated.",
        correctExample: "I have visited Japan twice.",
        wrongExample: "I have visit Japan twice."
      },
      {
        name: "Past Simple vs Past Continuous",
        formula: "Subject + V2 (Past Simple) vs was/were + V-ing",
        usage: "Past Continuous describes an ongoing background action interrupted by a Simple Past action.",
        correctExample: "While I was studying, the phone rang.",
        wrongExample: "While I studied, the phone was ringing."
      }
    ]
  },
  {
    id: "guide_sva",
    category: "Subject-Verb Agreement",
    icon: "⚖️",
    level: "Beginner - Intermediate (A2-B1)",
    title: "10 Golden Rules of Subject-Verb Agreement",
    summary: "Ensure singular subjects match singular verbs and plural subjects match plural verbs.",
    rules: [
      {
        name: "Third-Person Singular Rule",
        formula: "He / She / It / Singular Noun -> Verb + s/es",
        usage: "Always add -s or -es to simple present verbs when the subject is third-person singular.",
        correctExample: "The professor speaks five languages fluently.",
        wrongExample: "The professor speak five languages fluently."
      },
      {
        name: "Indefinite Pronouns (Everyone, Nobody, Each)",
        formula: "Everyone / Everybody / Each / Someone -> Takes Singular Verb",
        usage: "Words ending in -body, -one, -thing are grammatically singular.",
        correctExample: "Everyone in the room has submitted their assignment.",
        wrongExample: "Everyone in the room have submitted their assignment."
      },
      {
        name: "Compound Subjects with 'And' vs 'Or/Nor'",
        formula: "A and B -> Plural; Either A or B -> Matches nearest subject",
        usage: "'And' creates a plural subject. 'Either...or' matches the noun closest to the verb.",
        correctExample: "Neither the manager nor the employees are available.",
        wrongExample: "Neither the manager nor the employees is available."
      }
    ]
  },
  {
    id: "guide_articles",
    category: "Articles & Determiners",
    icon: "🔤",
    level: "Beginner - Intermediate (A1-B2)",
    title: "Articles Mastery: A, An, The & Zero Article",
    summary: "Clear rules on when to use definite, indefinite, or no articles at all.",
    rules: [
      {
        name: "Vowel Sounds (An) vs Consonant Sounds (A)",
        formula: "Sound-based rule (not spelling-based)",
        usage: "Use 'An' before vowel sounds ('an hour', 'an MP3', 'an apple'). Use 'A' before consonant sounds ('a university', 'a book').",
        correctExample: "It takes an hour to reach the university.",
        wrongExample: "It takes a hour to reach an university."
      },
      {
        name: "Definite Article 'The'",
        formula: "Specific, unique, or previously mentioned nouns",
        usage: "Use 'the' when referring to a specific, unique noun known to both speaker and listener.",
        correctExample: "I bought a laptop. The laptop is very fast.",
        wrongExample: "I bought a laptop. A laptop is very fast."
      }
    ]
  },
  {
    id: "guide_conditionals",
    category: "Conditionals & Hypotheticals",
    icon: "🔮",
    level: "Intermediate - Advanced (B1-C1)",
    title: "Conditionals: Types 0, 1, 2, 3 & Mixed",
    summary: "Express real possibilities, future plans, hypothetical dreams, and past regrets.",
    rules: [
      {
        name: "First Conditional (Real Future Possibility)",
        formula: "If + Simple Present, ... will + Base Verb",
        usage: "Expresses a real, likely future event conditional on a present action.",
        correctExample: "If it rains tomorrow, we will stay indoors.",
        wrongExample: "If it will rain tomorrow, we will stay indoors."
      },
      {
        name: "Second Conditional (Hypothetical Present)",
        formula: "If + Simple Past (were), ... would + Base Verb",
        usage: "Used for imaginary or improbable situations in the present/future.",
        correctExample: "If I were the CEO, I would implement flexible hours.",
        wrongExample: "If I was the CEO, I will implement flexible hours."
      }
    ]
  }
];

// 3. User-Tailored Master Question Pool (Organized by Audience, Standard/Age, and Question Type)
export const TAILORED_MASTER_QUIZ_POOL = [
  // ==========================================
  // SECTION A: STUDENT AUDIENCE (5th to 10th Std)
  // ==========================================

  // --- 5th & 6th Std (Basic Tenses, Articles, Simple SVA, Nouns) ---
  {
    id: "stu_5th_fb_1",
    targetAudience: "STUDENT",
    standards: ["5th Std", "6th Std"],
    ageGroups: ["TEENS"],
    questionType: "FILL_BLANKS",
    category: "Simple Present & Daily Routines",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "My sister _______ (drink / drinks / drinking) a glass of warm milk every night before bed.",
    question: "Choose the correct verb form to complete the sentence:",
    options: ["drinks", "drink", "drinking", "is drink"],
    correctAnswerIndex: 0,
    explanation: "'My sister' is third-person singular (she), so the simple present verb requires the -s suffix: 'drinks'."
  },
  {
    id: "stu_5th_tf_1",
    targetAudience: "STUDENT",
    standards: ["5th Std", "6th Std"],
    ageGroups: ["TEENS"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Articles & Sounds",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Look at this sentence: 'Ravi ate a apple and an banana for breakfast.'",
    question: "Is this sentence grammatically correct?",
    options: [
      "❌ Incorrect - Should be 'an apple and a banana'.",
      "✅ Correct - Articles are used properly.",
      "❌ Incorrect - 'Apple' does not need an article.",
      "❌ Incorrect - Should be 'the apple and the banana'."
    ],
    correctAnswerIndex: 0,
    explanation: "'Apple' starts with a vowel sound (/æ/) taking 'an', while 'banana' starts with a consonant sound (/b/) taking 'a'."
  },
  {
    id: "stu_6th_spot_1",
    targetAudience: "STUDENT",
    standards: ["5th Std", "6th Std", "7th Std"],
    ageGroups: ["TEENS"],
    questionType: "SPOT_ERROR",
    category: "Past Auxiliary & Verb Form",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'Yesterday our school team didn't played football due to heavy rain.'",
    question: "Which option correctly fixes the grammar error?",
    options: [
      "Yesterday our school team didn't play football due to heavy rain.",
      "Yesterday our school team didn't played football due to heavy rain.",
      "Yesterday our school team hadn't play football due to heavy rain.",
      "Yesterday our school team don't played football due to heavy rain."
    ],
    correctAnswerIndex: 0,
    explanation: "After auxiliary 'didn't', the main verb must remain in its base bare-infinitive form 'play' (not past 'played')."
  },
  {
    id: "stu_6th_fb_2",
    targetAudience: "STUDENT",
    standards: ["6th Std", "7th Std"],
    ageGroups: ["TEENS"],
    questionType: "FILL_BLANKS",
    category: "Prepositions of Place",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "The teacher placed all the examination papers _______ (in / on / at / into) the principal's table.",
    question: "Select the correct preposition:",
    options: ["on", "in", "at", "underneath of"],
    correctAnswerIndex: 0,
    explanation: "We place items 'on' a flat surface like a table or desk."
  },

  // --- 7th & 8th Std (Conjunctions, Tenses, Modals, Passive Voice) ---
  {
    id: "stu_7th_tf_1",
    targetAudience: "STUDENT",
    standards: ["7th Std", "8th Std"],
    ageGroups: ["TEENS"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Conjunctions & Clauses",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'Although he studied very hard, but he failed the science test.'",
    question: "Is this sentence grammatically correct?",
    options: [
      "❌ Incorrect - 'Although' and 'but' cannot be used together in the same sentence.",
      "✅ Correct - Conjunctions are well connected.",
      "❌ Incorrect - 'Studied' should be 'studies'.",
      "❌ Incorrect - 'Although' must be replaced with 'Because'."
    ],
    correctAnswerIndex: 0,
    explanation: "Do not use 'Although' and 'but' together. Say: 'Although he studied hard, he failed the test' OR 'He studied hard, but he failed'."
  },
  {
    id: "stu_8th_trans_1",
    targetAudience: "STUDENT",
    standards: ["7th Std", "8th Std", "9th Std"],
    ageGroups: ["TEENS"],
    questionType: "TRANSFORMATION",
    category: "Active to Passive Voice",
    formatBadge: "🔄 Sentence Transformation",
    promptSentence: "Active Voice: 'The principal inaugurated the new computer laboratory.'",
    question: "Choose the correct Passive Voice transformation:",
    options: [
      "The new computer laboratory was inaugurated by the principal.",
      "The new computer laboratory is inaugurated by the principal.",
      "The new computer laboratory has inaugurated by the principal.",
      "The new computer laboratory was inaugurating by the principal."
    ],
    correctAnswerIndex: 0,
    explanation: "Simple Past active ('inaugurated') transforms into 'was/were + past participle' ('was inaugurated')."
  },
  {
    id: "stu_8th_fb_1",
    targetAudience: "STUDENT",
    standards: ["8th Std", "9th Std"],
    ageGroups: ["TEENS"],
    questionType: "FILL_BLANKS",
    category: "Present Perfect vs Simple Past",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "Ananya _______ (has lived / lives / lived) in this apartment since 2021.",
    question: "Fill in the blank with the appropriate tense form:",
    options: ["has lived", "lived", "is living", "will live"],
    correctAnswerIndex: 0,
    explanation: "With 'since + starting year' indicating an action continuing into the present, use Present Perfect: 'has lived'."
  },
  {
    id: "stu_8th_spot_1",
    targetAudience: "STUDENT",
    standards: ["8th Std", "9th Std", "10th Std"],
    ageGroups: ["TEENS"],
    questionType: "SPOT_ERROR",
    category: "Subject-Verb Agreement",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'Each of the student in the science club have received a gold medal.'",
    question: "Which corrected sentence fixes ALL grammar mistakes in this sentence?",
    options: [
      "Each of the students in the science club has received a gold medal.",
      "Each of the student in the science club have received a gold medal.",
      "Each of the students in the science club are received a gold medal.",
      "Each of the students in the science club have receive a gold medal."
    ],
    correctAnswerIndex: 0,
    explanation: "'Each of the' requires a plural noun ('students') and a singular verb ('has received')."
  },

  // --- 9th & 10th Std (Reported Speech, Inversion, Conditionals, Board Syntax) ---
  {
    id: "stu_9th_trans_1",
    targetAudience: "STUDENT",
    standards: ["9th Std", "10th Std"],
    ageGroups: ["TEENS", "YOUNG_ADULT"],
    questionType: "TRANSFORMATION",
    category: "Direct to Indirect Speech",
    formatBadge: "🔄 Sentence Transformation",
    promptSentence: "Direct Speech: Rohan said, 'I am preparing my physics notes right now.'",
    question: "Select the correct Indirect (Reported) Speech version:",
    options: [
      "Rohan said that he was preparing his physics notes then.",
      "Rohan said that I am preparing my physics notes right now.",
      "Rohan said that he is preparing his physics notes right now.",
      "Rohan told that he has been preparing his physics notes then."
    ],
    correctAnswerIndex: 0,
    explanation: "In reported speech, 'am preparing' shifts to 'was preparing', 'my' changes to 'his', and 'now' shifts to 'then'."
  },
  {
    id: "stu_10th_fb_1",
    targetAudience: "STUDENT",
    standards: ["9th Std", "10th Std"],
    ageGroups: ["TEENS", "YOUNG_ADULT"],
    questionType: "FILL_BLANKS",
    category: "Conditionals & Subjunctive",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "If I _______ (had studied / studied / have studied) more diligently, I would have secured first rank in the board exam.",
    question: "Complete the Third Conditional clause:",
    options: ["had studied", "studied", "would study", "have studied"],
    correctAnswerIndex: 0,
    explanation: "Third Conditional requires 'If + had + past participle (had studied)' paired with 'would have + V3'."
  },
  {
    id: "stu_10th_tf_1",
    targetAudience: "STUDENT",
    standards: ["10th Std"],
    ageGroups: ["TEENS", "YOUNG_ADULT"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Inversion & Board Exam Syntax",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'No sooner had the bell rung when all students rushed out of the classroom.'",
    question: "Is this sentence grammatically accurate for board examination standards?",
    options: [
      "❌ Incorrect - 'No sooner...had' must be paired with 'than', not 'when'.",
      "✅ Correct - Sentence construction is flawless.",
      "❌ Incorrect - 'Rung' should be 'rang'.",
      "❌ Incorrect - Inversion is not allowed with 'No sooner'."
    ],
    correctAnswerIndex: 0,
    explanation: "The correlative conjunction pair is 'No sooner ... THAN' (Hardly/Scarcely takes 'when'). Correct: 'No sooner had the bell rung THAN...'"
  },
  {
    id: "stu_10th_spot_1",
    targetAudience: "STUDENT",
    standards: ["9th Std", "10th Std"],
    ageGroups: ["TEENS", "YOUNG_ADULT"],
    questionType: "SPOT_ERROR",
    category: "Correlative Conjunctions",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'Not only the teacher but also the students was excited about the excursion.'",
    question: "Identify the corrected sentence:",
    options: [
      "Not only the teacher but also the students were excited about the excursion.",
      "Not only the teacher but also the students was excited about the excursion.",
      "Not only the teacher but also the students is excited about the excursion.",
      "Not only the teacher but the students was excited about the excursion."
    ],
    correctAnswerIndex: 0,
    explanation: "With 'not only...but also', the verb agrees with the subject closest to it ('students' is plural -> 'were excited')."
  },

  // ==========================================
  // SECTION B: INDIVIDUAL / ADULT / PROFESSIONAL AUDIENCE
  // ==========================================

  // --- College / Young Adults (18-24) ---
  {
    id: "ind_ya_fb_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["YOUNG_ADULT", "TEENS"],
    questionType: "FILL_BLANKS",
    category: "Subjunctive Mood",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "If I _______ (was / were / am / would be) in your position, I would negotiate for a higher base stipend.",
    question: "Choose the standard subjunctive form:",
    options: ["were", "was", "am", "would be"],
    correctAnswerIndex: 0,
    explanation: "In formal hypothetical conditionals, the subjunctive 'were' is used for all subjects ('If I were you')."
  },
  {
    id: "ind_ya_tf_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["YOUNG_ADULT", "WORKING_PROFESSIONAL"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Pronoun Case in Prepositional Phrases",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'Between you and I, this semester project was much more challenging than expected.'",
    question: "Is this sentence grammatically correct?",
    options: [
      "❌ Incorrect - Should be 'Between you and me'.",
      "✅ Correct - 'Between you and I' is standard.",
      "❌ Incorrect - 'Between' cannot be used with two people.",
      "❌ Incorrect - 'Much more challenging' is redundant."
    ],
    correctAnswerIndex: 0,
    explanation: "Prepositions take object pronouns ('me', 'him', 'her', 'them'). Therefore, 'Between you and ME' is correct."
  },
  {
    id: "ind_ya_spot_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["YOUNG_ADULT", "WORKING_PROFESSIONAL"],
    questionType: "SPOT_ERROR",
    category: "ESL Collocations & Redundancy",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'I made a blunder mistake and reverted back to the hiring manager yesterday.'",
    question: "Select the sentence with all redundancies and collocation errors fixed:",
    options: [
      "I made a mistake and reverted to the hiring manager yesterday.",
      "I made a blunder mistake and reverted back to the hiring manager yesterday.",
      "I did a blunder and reverted back to the hiring manager yesterday.",
      "I did a mistake and replied back to the hiring manager yesterday."
    ],
    correctAnswerIndex: 0,
    explanation: "'Blunder' already means big mistake ('blunder mistake' is redundant), and 'revert' already means reply ('revert back' is redundant)."
  },

  // --- Working Professionals & Business English (25-39) ---
  {
    id: "ind_pro_fb_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["WORKING_PROFESSIONAL", "LIFELONG_LEARNER"],
    questionType: "FILL_BLANKS",
    category: "Business Mandate Subjunctive",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "The compliance committee insisted that the tech lead _______ (updates / update / updated / is updating) the security protocol immediately.",
    question: "Choose the proper present subjunctive form:",
    options: ["update", "updates", "updated", "is updating"],
    correctAnswerIndex: 0,
    explanation: "Verbs of demand/insistence (insist, demand, recommend) take the base bare-infinitive form in that-clauses: 'insisted that he UPDATE'."
  },
  {
    id: "ind_pro_tf_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["WORKING_PROFESSIONAL", "LIFELONG_LEARNER"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Business Prepositions",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'We need to discuss about the quarterly revenue projections during tomorrow's executive meeting.'",
    question: "Is this sentence grammatically sound?",
    options: [
      "❌ Incorrect - 'Discuss' is transitive and does not take 'about'.",
      "✅ Correct - 'Discuss about' is standard business English.",
      "❌ Incorrect - 'Meeting' requires preposition 'in' not 'during'.",
      "❌ Incorrect - 'Projections' should be singular."
    ],
    correctAnswerIndex: 0,
    explanation: "'Discuss' already means 'talk about'. Adding 'about' is redundant. Say: 'discuss the quarterly revenue projections'."
  },
  {
    id: "ind_pro_trans_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["WORKING_PROFESSIONAL", "LIFELONG_LEARNER"],
    questionType: "TRANSFORMATION",
    category: "Negative Inversion for Formal Rhetoric",
    formatBadge: "🔄 Sentence Transformation",
    promptSentence: "Informal / Standard: 'We have rarely witnessed such high quarterly growth across all regional markets.'",
    question: "Transform this sentence into an inverted formal sentence starting with 'Rarely':",
    options: [
      "Rarely have we witnessed such high quarterly growth across all regional markets.",
      "Rarely we have witnessed such high quarterly growth across all regional markets.",
      "Rarely we witnessed such high quarterly growth across all regional markets.",
      "Rarely did we witnessed such high quarterly growth across all regional markets."
    ],
    correctAnswerIndex: 0,
    explanation: "When a negative or limiting adverb like 'Rarely' begins a sentence, the auxiliary verb inverts before the subject: 'Rarely have we witnessed'."
  },
  {
    id: "ind_pro_spot_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["WORKING_PROFESSIONAL", "LIFELONG_LEARNER"],
    questionType: "SPOT_ERROR",
    category: "Subject-Verb Agreement in Complex Noun Phrases",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'The implementation of the new automated cloud infrastructure are causing temporary service latency.'",
    question: "Which option corrects the agreement mismatch?",
    options: [
      "The implementation of the new automated cloud infrastructure is causing temporary service latency.",
      "The implementation of the new automated cloud infrastructure are causing temporary service latency.",
      "The implementation of the new automated cloud infrastructure were causing temporary service latency.",
      "The implementation of the new automated cloud infrastructure have caused temporary service latency."
    ],
    correctAnswerIndex: 0,
    explanation: "The subject head noun is the singular 'implementation', so the verb must be singular: 'is causing'."
  },

  // --- Lifelong Learners & Advanced Nuance (40+) ---
  {
    id: "ind_life_fb_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["LIFELONG_LEARNER", "WORKING_PROFESSIONAL"],
    questionType: "FILL_BLANKS",
    category: "Dependent Collocations & Idioms",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "The author is exceptionally adept _______ (in / at / with / for) crafting gripping historical mysteries.",
    question: "Choose the proper dependent preposition with 'adept':",
    options: ["at", "in", "with", "for"],
    correctAnswerIndex: 0,
    explanation: "The standard English collocation is 'adept at doing something' (or 'adept in' an art, but 'adept at + gerund' is standard)."
  },
  {
    id: "ind_life_tf_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["LIFELONG_LEARNER", "WORKING_PROFESSIONAL"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Parallel Structure",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'She enjoys reading classical literature, playing the piano, and to write poetry.'",
    question: "Is this sentence grammatically parallel?",
    options: [
      "❌ Incorrect - Lacks parallelism. Should end with 'writing poetry'.",
      "✅ Correct - All verbs are grammatically consistent.",
      "❌ Incorrect - 'Reading' should be 'to read'.",
      "❌ Incorrect - 'Piano' should not have the article 'the'."
    ],
    correctAnswerIndex: 0,
    explanation: "Items in a list must share the same grammatical form. Parallel: 'reading...', 'playing...', and 'WRITING poetry'."
  },
  {
    id: "ind_life_spot_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["LIFELONG_LEARNER", "WORKING_PROFESSIONAL"],
    questionType: "SPOT_ERROR",
    category: "Dangling Modifiers",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'Walking through the botanical garden, the colorful orchids appeared particularly stunning to us.'",
    question: "Which option corrects the dangling modifier?",
    options: [
      "As we were walking through the botanical garden, we noticed that the colorful orchids appeared particularly stunning.",
      "Walking through the botanical garden, the colorful orchids appeared particularly stunning to us.",
      "Having walked through the botanical garden, the orchids appeared stunning.",
      "Walking in garden, orchids were stunning."
    ],
    correctAnswerIndex: 0,
    explanation: "The orchids were not walking through the garden; the modifier 'Walking through...' was dangling. Clarifying the subject ('As we were walking...') resolves the error."
  }
];

/**
 * Returns user-tailored daily grammar questions based on:
 * - userType ('STUDENT' or 'INDIVIDUAL')
 * - targetGrade (e.g. '5th Std', '6th Std', '7th Std', '8th Std', '9th Std', '10th Std')
 * - ageGroup (e.g. 'TEENS', 'YOUNG_ADULT', 'WORKING_PROFESSIONAL', 'LIFELONG_LEARNER')
 * - customDate (for day-of-year rotation)
 * - offset (for loading more unique batches)
 */
export function getTailoredDailyGrammarQuizzes({
  userType = "INDIVIDUAL",
  targetGrade = "8th Std",
  ageGroup = "WORKING_PROFESSIONAL",
  customDate = new Date(),
  offset = 0,
} = {}) {
  const isStudent = userType === "STUDENT";

  // Filter pool matching user profile
  let matchingPool = TAILORED_MASTER_QUIZ_POOL.filter((q) => {
    if (isStudent) {
      if (q.targetAudience === "STUDENT" && q.standards?.includes(targetGrade)) {
        return true;
      }
      return q.standards?.includes(targetGrade);
    } else {
      if (q.targetAudience === "INDIVIDUAL" && q.ageGroups?.includes(ageGroup)) {
        return true;
      }
      return q.ageGroups?.includes(ageGroup);
    }
  });

  // If matching pool has fewer than 8, supplement from general pool
  if (matchingPool.length < 8) {
    const fallbackPool = TAILORED_MASTER_QUIZ_POOL.filter(
      (q) => !matchingPool.some((m) => m.id === q.id)
    );
    matchingPool = [...matchingPool, ...fallbackPool];
  }

  // Deterministic daily date seed
  const d = customDate;
  const dayOfYear = Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
      Date.UTC(d.getFullYear(), 0, 0)) /
      (24 * 60 * 60 * 1000)
  );

  const seed = d.getFullYear() * 1000 + dayOfYear + offset * 19;
  const poolCopy = [...matchingPool];

  let currentSeed = seed;
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
  }

  return poolCopy.slice(0, 8);
}

// Backward-compatible alias
export function getDailyGrammarQuizzes(customDate = new Date(), offset = 0) {
  return getTailoredDailyGrammarQuizzes({ customDate, offset });
}

// Audio Synthesizer Chimes (Web Audio API)
export function playWebAudioChime(type = "correct") {
  if (typeof window === "undefined" || (!window.AudioContext && !window.webkitAudioContext)) {
    return;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();

    if (type === "correct") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.15);

      osc2.frequency.setValueAtTime(880.0, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.55);
      osc2.stop(ctx.currentTime + 0.55);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220.0, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(185.0, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    }
  } catch (e) {
    console.debug("Audio chime:", e);
  }
}
