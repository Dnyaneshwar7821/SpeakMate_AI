/**
 * SpeakMate AI Mobile - Comprehensive English Grammar Engine & Knowledge Base
 * Supports deep multi-dimension grammar analysis, error itemization, 
 * CEFR-aligned Grammar Guides, and Sentence Quizzes.
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

  // Auxiliary Verbs & Modals (Did / Does / Modal + Base Verb)
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

  // Articles (A vs An vs The)
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
  {
    id: "article_missing_singular_countable",
    regex: /\b(I|you|he|she|we|they)\s+(ate|eat|bought|buy|have|see|saw)\s+(apple|orange|car|book|pen|phone|dog|cat)\b/gi,
    replace: (match, subj, verb, noun) => {
      const startsVowel = /^[aeiou]/i.test(noun);
      const article = startsVowel ? "an" : "a";
      return `${subj} ${verb} ${article} ${noun}`;
    },
    type: "Missing Article",
    errorSnippet: "missing article before singular countable noun",
    issue: "Singular countable nouns cannot stand alone without a determiner/article.",
    rule: "Singular countable nouns (apple, car, book, phone) require an article ('a', 'an', or 'the') or possessive pronoun before them.",
    correction: "Add article 'a' / 'an'"
  },

  // Prepositions of Time & Direction
  {
    id: "prep_since_with_duration",
    regex: /\b(since)\s+(\d+\s+(?:days?|months?|years?|hours?|weeks?|minutes?|decades?))\b/gi,
    replace: "for $2",
    type: "Prepositions of Time",
    errorSnippet: "since + time period",
    issue: "Used 'since' with a duration of time instead of 'for'.",
    rule: "Use 'for' when referring to a length or duration of time (e.g. for 3 years). Use 'since' for a specific starting timestamp (e.g. since 2021, since Monday).",
    correction: "for"
  },
  {
    id: "prep_listen_to",
    regex: /\blisten\s+(music|him|her|them|the\s+teacher|radio)\b/gi,
    replace: "listen to $1",
    type: "Dependent Prepositions",
    errorSnippet: "listen without 'to'",
    issue: "Missing preposition 'to' after the transitive verb 'listen'.",
    rule: "'Listen' is an intransitive verb that requires the preposition 'to' when introducing an object (e.g. 'listen to music').",
    correction: "listen to"
  },
  {
    id: "prep_congratulate_on",
    regex: /\bcongratulate\s+([a-z\s]+)\s+for\b/gi,
    replace: "congratulate $1 on",
    type: "Dependent Prepositions",
    errorSnippet: "congratulate for",
    issue: "Used 'congratulate for' instead of 'congratulate on'.",
    rule: "The standard English collocation is 'congratulate someone ON something' (e.g. 'congratulated him on his success').",
    correction: "congratulate on"
  },
  {
    id: "prep_married_to",
    regex: /\bmarried\s+with\b/gi,
    replace: "married to",
    type: "Dependent Prepositions",
    errorSnippet: "married with",
    issue: "Used 'married with' instead of 'married to'.",
    rule: "In English, we say someone is 'married to' another person, not 'married with'.",
    correction: "married to"
  },

  // Redundancy & Common ESL / Indian English Pitfalls
  {
    id: "redundancy_discuss_about",
    regex: /\bdiscuss\s+about\b/gi,
    replace: "discuss",
    type: "Redundancy & Word Choice",
    errorSnippet: "discuss about",
    issue: "The verb 'discuss' already means 'talk about'. Adding 'about' is redundant.",
    rule: "'Discuss' is a transitive verb that takes a direct object without the preposition 'about' (e.g. 'discuss the project').",
    correction: "discuss"
  },
  {
    id: "redundancy_return_back",
    regex: /\b(return|revert|reply)\s+back\b/gi,
    replace: "$1",
    type: "Redundancy",
    errorSnippet: "return/revert back",
    issue: "'Return' and 'revert' already encompass returning. 'Back' is superfluous.",
    rule: "Say 'return to work' or 'revert with information' without adding 'back'.",
    correction: "Remove 'back'"
  },
  {
    id: "idiom_one_of_my_friends",
    regex: /\bone\s+of\s+my\s+friend\b/gi,
    replace: "one of my friends",
    type: "Noun Phrase Plurality",
    errorSnippet: "one of my friend",
    issue: "'One of' selects one item from a plural group; the noun must be plural.",
    rule: "The structure 'one of my [noun]' always requires a plural noun (e.g. 'one of my friends', 'one of the best teachers').",
    correction: "one of my friends"
  },
  {
    id: "idiom_cope_up_with",
    regex: /\bcope\s+up\s+with\b/gi,
    replace: "cope with",
    type: "Idiomatic Phrasing",
    errorSnippet: "cope up with",
    issue: "'Cope up with' is a non-standard collocation.",
    rule: "The standard English idiom is 'cope with' (e.g. 'cope with stress'), without the word 'up'.",
    correction: "cope with"
  },
  {
    id: "collocation_do_mistake",
    regex: /\b(did|do|does|doing)\s+(a\s+mistake|mistakes)\b/gi,
    replace: (match, verb, noun) => {
      const makeMap = {
        did: "made",
        do: "make",
        does: "makes",
        doing: "making"
      };
      return `${makeMap[verb.toLowerCase()] || "make"} ${noun}`;
    },
    type: "Collocation Error",
    errorSnippet: "do a mistake",
    issue: "Used 'do a mistake' instead of 'make a mistake'.",
    rule: "In English, mistakes are 'made', not 'done'. The correct collocation is 'make a mistake'.",
    correction: "make a mistake"
  },

  // Comparatives & Superlatives
  {
    id: "comp_double_comparative",
    regex: /\bmore\s+(better|faster|taller|easier|cheaper|smaller|bigger|harder)\b/gi,
    replace: "$1",
    type: "Double Comparative",
    errorSnippet: "more + -er adjective",
    issue: "Used 'more' with an adjective that already has the comparative -er suffix.",
    rule: "Do not use 'more' with one-syllable comparative adjectives that end in -er (e.g. say 'better' or 'taller', never 'more better' or 'more taller').",
    correction: "Remove 'more'"
  },
  {
    id: "super_double_superlative",
    regex: /\bmost\s+(best|fastest|tallest|easiest|cheapest|smallest|biggest|hardest)\b/gi,
    replace: "$1",
    type: "Double Superlative",
    errorSnippet: "most + -est adjective",
    issue: "Used 'most' with an adjective that already has the superlative -est suffix.",
    rule: "Do not use 'most' with superlative adjectives ending in -est (e.g. 'fastest', not 'most fastest').",
    correction: "Remove 'most'"
  },

  // Conditionals (Hypothetical Past)
  {
    id: "cond_if_i_was_were",
    regex: /\bif\s+I\s+was\s+(you|a\s+bird|rich|the\s+president|in\s+your\s+place)\b/gi,
    replace: "if I were $1",
    type: "Subjunctive Mood (2nd Conditional)",
    errorSnippet: "if I was",
    issue: "Used 'was' in a hypothetical / unreal conditional instead of the subjunctive 'were'.",
    rule: "In formal and standard English, unreal/hypothetical condition statements use 'were' for all subjects (e.g. 'If I were you', 'If he were here').",
    correction: "if I were"
  },

  // Pronoun Case
  {
    id: "pronoun_between_you_and_i",
    regex: /\bbetween\s+you\s+and\s+I\b/gi,
    replace: "between you and me",
    type: "Pronoun Case",
    errorSnippet: "between you and I",
    issue: "Used subject pronoun 'I' as the object of a preposition.",
    rule: "Prepositions (like 'between', 'with', 'for') take objective case pronouns ('me', 'him', 'her', 'us', 'them'), so 'between you and me' is correct.",
    correction: "between you and me"
  },

  // Capitalization & Sentence Mechanics
  {
    id: "mech_lowercase_i",
    regex: /(^|\s)i(\s|[.,!?;:'])/g,
    replace: "$1I$2",
    type: "Capitalization",
    errorSnippet: "lowercase 'i'",
    issue: "The pronoun 'I' is written in lowercase.",
    rule: "The first-person singular pronoun 'I' must always be capitalized in English.",
    correction: "I"
  }
];

/**
 * Executes multi-pass deep grammar check on any sentence.
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

  // Pass 1: Run comprehensive rule engine
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

  // Pass 2: Capitalize first letter of sentence if needed
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

  // Pass 3: Check ending punctuation
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
        usage: "Used for completed experiences where the exact time is not stated, or actions connecting past to present.",
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
        usage: "Use 'An' before vowel sounds ('an hour', 'an MP3', 'an apple'). Use 'A' before consonant sounds ('a university', 'a European country', 'a book').",
        correctExample: "It takes an hour to reach the university.",
        wrongExample: "It takes a hour to reach an university."
      },
      {
        name: "Definite Article 'The'",
        formula: "Specific, unique, or previously mentioned nouns",
        usage: "Use 'the' when both speaker and listener know which specific object is being referred to, or with unique nouns (the sun, the internet).",
        correctExample: "I bought a laptop. The laptop is very fast.",
        wrongExample: "I bought a laptop. A laptop is very fast."
      },
      {
        name: "Zero Article with General Plurals & Uncountable Nouns",
        formula: "No article for general concepts",
        usage: "Do not use 'the' when speaking about categories or abstract concepts in general.",
        correctExample: "Water is essential for life.",
        wrongExample: "The water is essential for the life."
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
        name: "Second Conditional (Hypothetical / Unreal Present)",
        formula: "If + Simple Past (were), ... would + Base Verb",
        usage: "Used for imaginary or improbable situations in the present/future.",
        correctExample: "If I were the CEO, I would implement flexible hours.",
        wrongExample: "If I was the CEO, I will implement flexible hours."
      },
      {
        name: "Third Conditional (Past Regrets / Unchangeable Past)",
        formula: "If + had + V3, ... would have + V3",
        usage: "Used to imagine how past outcomes could have been different.",
        correctExample: "If she had left earlier, she would have caught the train.",
        wrongExample: "If she left earlier, she would caught the train."
      }
    ]
  },
  {
    id: "guide_prepositions",
    category: "Prepositions & Collocations",
    icon: "📍",
    level: "All Levels (A2-C1)",
    title: "Prepositions of Time, Place & Dependent Collocations",
    summary: "Eliminate preposition confusion with visual timelines and standard collocations.",
    rules: [
      {
        name: "In, On, At for Time & Place",
        formula: "At (precise time/point) -> On (days/surfaces) -> In (months/years/enclosed spaces)",
        usage: "At 5 PM / At the door; On Monday / On the table; In July / In 2026 / In the room.",
        correctExample: "The conference starts at 9:00 AM on Monday in London.",
        wrongExample: "The conference starts in 9:00 AM at Monday on London."
      },
      {
        name: "Since vs For",
        formula: "Since + Point in Time; For + Duration",
        usage: "'Since' pins to a specific start date ('since 2018'). 'For' measures duration ('for 8 years').",
        correctExample: "I have worked at SpeakMate for three years.",
        wrongExample: "I have worked at SpeakMate since three years."
      },
      {
        name: "Common Dependent Prepositions",
        formula: "Verb / Adjective + Fixed Preposition",
        usage: "Interested IN, good AT, depend ON, apologize FOR, congratulate ON.",
        correctExample: "She is extremely good at public speaking.",
        wrongExample: "She is extremely good in public speaking."
      }
    ]
  },
  {
    id: "guide_voice_speech",
    category: "Active/Passive Voice & Reported Speech",
    icon: "🔄",
    level: "Intermediate - Advanced (B2-C2)",
    title: "Active vs Passive Voice & Indirect Speech",
    summary: "Transform sentence structures smoothly for academic and professional clarity.",
    rules: [
      {
        name: "Passive Voice Formation",
        formula: "Object + form of 'be' + Past Participle (V3) (+ by Agent)",
        usage: "Used when the action or the receiver of the action is more important than the doer.",
        correctExample: "The report was finalized by the research team yesterday.",
        wrongExample: "The report finalized by the research team yesterday."
      },
      {
        name: "Reported (Indirect) Speech Tense Shift",
        formula: "Present Simple -> Past Simple; Present Continuous -> Past Continuous",
        usage: "When reporting what someone said in the past, shift tenses back one step.",
        correctExample: "She said that she was preparing for her IELTS exam.",
        wrongExample: "She said that I am preparing for my IELTS exam."
      }
    ]
  }
];

// 3. Interactive Sentence-Based Grammar Quizzes
export const SENTENCE_GRAMMAR_QUIZZES = [
  {
    id: "quiz_1",
    category: "Subject-Verb Agreement",
    difficulty: "Easy",
    sentenceWithProblem: "Neither of the two candidates have enough leadership experience for this role.",
    question: "Which of the following corrections fixes the grammatical error in the sentence?",
    options: [
      "Neither of the two candidates has enough leadership experience for this role.",
      "Neither of the two candidates are having enough leadership experience for this role.",
      "Neither of the two candidate have enough leadership experience for this role.",
      "Neither of the two candidates have had enough leadership experience for this role."
    ],
    correctAnswerIndex: 0,
    explanation: "'Neither' is a singular indefinite pronoun when referring to two items and requires the singular verb 'has', not 'have'."
  },
  {
    id: "quiz_2",
    category: "Verb Tense & Auxiliary Verbs",
    difficulty: "Medium",
    sentenceWithProblem: "She didn't went to the international symposium yesterday because she was ill.",
    question: "Identify the correct version of this sentence:",
    options: [
      "She didn't went to the international symposium yesterday because she was ill.",
      "She didn't go to the international symposium yesterday because she was ill.",
      "She hasn't go to the international symposium yesterday because she was ill.",
      "She didn't gone to the international symposium yesterday because she was ill."
    ],
    correctAnswerIndex: 1,
    explanation: "After the auxiliary verb 'didn't' (past tense already indicated), the main verb must be in its base form 'go', not 'went'."
  },
  {
    id: "quiz_3",
    category: "Prepositions & Time",
    difficulty: "Medium",
    sentenceWithProblem: "Our software engineering team has been building this feature since six months.",
    question: "How should the preposition of time be corrected?",
    options: [
      "Replace 'since six months' with 'for six months'.",
      "Replace 'since six months' with 'from six months'.",
      "Replace 'since six months' with 'in six months'.",
      "Replace 'since six months' with 'during six months'."
    ],
    correctAnswerIndex: 0,
    explanation: "Use 'for' when expressing a duration of time (e.g. 'for six months'). 'Since' is only used with a specific starting date or point in time (e.g. 'since January')."
  },
  {
    id: "quiz_4",
    category: "Articles & Determiners",
    difficulty: "Easy",
    sentenceWithProblem: "He completed his master's degree from an prestigious European university.",
    question: "Choose the correct article usage for the sentence:",
    options: [
      "He completed his master's degree from a prestigious European university.",
      "He completed his master's degree from an prestigious European university.",
      "He completed his master's degree from the prestigious an European university.",
      "He completed his master's degree from prestigious European university."
    ],
    correctAnswerIndex: 0,
    explanation: "'Prestigious' begins with a consonant sound (/p/), so it requires the indefinite article 'a', not 'an'."
  },
  {
    id: "quiz_5",
    category: "Conditionals & Subjunctive",
    difficulty: "Hard",
    sentenceWithProblem: "If I was you, I would have accepted the scholarship without hesitation.",
    question: "Select the sentence with proper subjunctive and conditional phrasing:",
    options: [
      "If I were you, I would accept the scholarship without hesitation.",
      "If I was you, I will accept the scholarship without hesitation.",
      "If I am you, I would have accept the scholarship without hesitation.",
      "If I were you, I would have accepted the scholarship without hesitation."
    ],
    correctAnswerIndex: 3,
    explanation: "Hypothetical condition clauses in standard English use the subjunctive 'were' ('If I were you')."
  },
  {
    id: "quiz_6",
    category: "Redundancy & Word Choice",
    difficulty: "Medium",
    sentenceWithProblem: "We need to discuss about the upcoming quarterly budget with our investors.",
    question: "Which option eliminates the redundancy while preserving standard English?",
    options: [
      "We need to discuss the upcoming quarterly budget with our investors.",
      "We need to talk the upcoming quarterly budget with our investors.",
      "We need to discuss on the upcoming quarterly budget with our investors.",
      "We need to discuss about the quarterly budget with our investors."
    ],
    correctAnswerIndex: 0,
    explanation: "'Discuss' is a transitive verb that takes a direct object without 'about'. Say 'discuss the budget'."
  },
  {
    id: "quiz_7",
    category: "Comparatives & Superlatives",
    difficulty: "Easy",
    sentenceWithProblem: "This AI-powered speech recognition model is much more faster than the previous version.",
    question: "What is the correct comparative phrasing?",
    options: [
      "This AI-powered speech recognition model is much faster than the previous version.",
      "This AI-powered speech recognition model is much more fast than the previous version.",
      "This AI-powered speech recognition model is most faster than the previous version.",
      "This AI-powered speech recognition model is more fast than the previous version."
    ],
    correctAnswerIndex: 0,
    explanation: "Do not use 'more' with adjectives that already have the comparative suffix '-er'. Say 'much faster', not 'much more faster'."
  },
  {
    id: "quiz_8",
    category: "Pronoun Cases",
    difficulty: "Hard",
    sentenceWithProblem: "The decision was made secretly between the team lead and he.",
    question: "Identify the correct pronoun case in the prepositional phrase:",
    options: [
      "The decision was made secretly between the team lead and him.",
      "The decision was made secretly between the team lead and he.",
      "The decision was made secretly between the team lead and his.",
      "The decision was made secretly between the team lead and himself."
    ],
    correctAnswerIndex: 0,
    explanation: "Objects of prepositions ('between') require objective case pronouns. Therefore, 'between the team lead and him' is grammatically correct."
  }
];
