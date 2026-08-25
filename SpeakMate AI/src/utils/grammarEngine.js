/**
 * SpeakMate AI - Complete Tailored Grammar Quiz Engine
 * Matches exact App Categories:
 * 
 * 1. STUDENT GRADES (1st Std to 10th Std):
 *    - 1st Std (Phonics, animals, colors, basic greetings)
 *    - 2nd Std (Daily routines, singular/plural, simple verbs)
 *    - 3rd Std (Action verbs, past tense, simple prepositions)
 *    - 4th Std (Describing nouns, adjectives, pronouns, time)
 *    - 5th Std (Simple Present, Articles, SVA basics)
 *    - 6th Std (Compound sentences, conjunctions, past auxiliary)
 *    - 7th Std (Prepositions, relative clauses, tenses)
 *    - 8th Std (Active/Passive voice, modals, comparisons)
 *    - 9th Std (Direct/Indirect speech, complex conditionals)
 *    - 10th Std (Board exam syntax, inversion, correlative pairs)
 * 
 * 2. INDIVIDUAL AGE GROUPS:
 *    - Kids (6-12 yrs) 🎈
 *    - Teens (13-17 yrs) ⚡
 *    - Young Adult (18-24 yrs) 🎓
 *    - Professional (25-50 yrs) 💼
 *    - Senior (50+ yrs) ☕
 * 
 * 3. QUESTION FORMATS:
 *    - ✏️ FILL_BLANKS (Fill in the blanks with correct grammar)
 *    - 🧐 CORRECT_OR_INCORRECT (Check if sentence is correct or wrong)
 *    - 🔍 SPOT_ERROR (Identify and fix multiple grammar mistakes)
 *    - 🔄 TRANSFORMATION (Active/Passive, Direct/Indirect, Inversion)
 */

export const COMPREHENSIVE_GRAMMAR_RULES = [
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
    rule: "After 'did' or 'didn't', always use the base (bare infinitive) form of the main verb.",
    correction: "Use base verb form"
  },
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
    id: "prep_since_with_duration",
    regex: /\b(since)\s+(\d+\s+(?:days?|months?|years?|hours?|weeks?|minutes?|decades?))\b/gi,
    replace: "for $2",
    type: "Prepositions of Time",
    errorSnippet: "since + time period",
    issue: "Used 'since' with a duration of time instead of 'for'.",
    rule: "Use 'for' when referring to a duration of time. Use 'since' for a specific point in time.",
    correction: "for"
  },
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
    id: "cond_if_i_was_were",
    regex: /\bif\s+I\s+was\s+(you|a\s+bird|rich|the\s+president|in\s+your\s+place)\b/gi,
    replace: "if I were $1",
    type: "Subjunctive Mood (2nd Conditional)",
    errorSnippet: "if I was",
    issue: "Used 'was' in a hypothetical / unreal conditional instead of the subjunctive 'were'.",
    rule: "In unreal/hypothetical condition statements, use 'were' for all subjects ('If I were you').",
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
  },
  {
    id: "missing_article_common_singular",
    regex: /\b(eat|eats|ate|buy|buys|bought|see|sees|saw|have|has|had|read|reads|want|wants)\s+(apple|orange|egg|umbrella|ice cream|elephant)\b/gi,
    replace: (match, verb, noun) => `${verb} an ${noun}`,
    type: "Articles",
    errorSnippet: "missing 'an'",
    issue: "Missing indefinite article 'an' before the singular countable noun starting with a vowel sound.",
    rule: "Singular countable nouns require an article ('an' before vowel sounds).",
    correction: "an"
  },
  {
    id: "missing_article_consonant_singular",
    regex: /\b(eat|eats|ate|buy|buys|bought|see|sees|saw|have|has|had|read|reads|want|wants|drive|drives|drove)\s+(banana|book|car|pen|pencil|dog|cat|phone|laptop|computer|house|job)\b/gi,
    replace: (match, verb, noun) => `${verb} a ${noun}`,
    type: "Articles",
    errorSnippet: "missing 'a'",
    issue: "Missing indefinite article 'a' before the singular countable noun starting with a consonant sound.",
    rule: "Singular countable nouns require an article ('a' before consonant sounds).",
    correction: "a"
  },
  {
    id: "redundancy_repeat_again",
    regex: /\brepeat\s+again\b/gi,
    replace: "repeat",
    type: "Redundancy",
    errorSnippet: "repeat again",
    issue: "'Repeat' already means say or do again. Using 'again' is redundant.",
    rule: "Avoid redundant pairs like 'repeat again'. Use only 'repeat'.",
    correction: "repeat"
  },
  {
    id: "redundancy_revert_back",
    regex: /\brevert\s+back\b/gi,
    replace: "revert",
    type: "Redundancy",
    errorSnippet: "revert back",
    issue: "'Revert' already implies returning to a previous state. Adding 'back' is redundant.",
    rule: "Use 'revert' directly without 'back'.",
    correction: "revert"
  },
  {
    id: "word_order_sov_sentence",
    regex: /\b(I|you|we|they|he|she)\s+([a-zA-Z]+)\s+(eat|eats|ate|drink|drinks|drank|play|plays|played|do|does|did|write|writes|wrote|read|reads|watch|watches|watched|like|likes|liked)\b/gi,
    replace: (match, subj, obj, verb) => {
      const nonObjects = ["not", "never", "always", "often", "seldom", "rarely", "usually", "sometimes", "also", "just", "really", "will", "would", "can", "could", "should", "must", "might", "may", "did", "does", "do"];
      if (nonObjects.includes(obj.toLowerCase())) {
        return match;
      }
      const vowelNouns = ["apple", "orange", "egg", "ice cream", "elephant", "umbrella"];
      const countConsonant = ["banana", "mango", "book", "letter", "movie", "game", "ball", "song"];
      let formattedObj = obj;
      if (vowelNouns.includes(obj.toLowerCase())) formattedObj = `an ${obj}`;
      else if (countConsonant.includes(obj.toLowerCase())) formattedObj = `a ${obj}`;
      return `${subj} ${verb} ${formattedObj}`;
    },
    type: "Sentence Structure & Word Order",
    errorSnippet: "Subject-Object-Verb word order",
    issue: "Incorrect word order (Subject + Object + Verb). Standard English requires Subject + Verb + Object (SVO).",
    rule: "English declarative sentences follow SVO structure: Subject + Verb + Object (e.g., 'I eat an apple', not 'I apple eat').",
    correction: "Rearrange to Subject + Verb + Object"
  }
];

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

  const isQuestion = /^(who|what|where|when|why|how|is|are|am|do|does|did|can|could|will|would|should|may|might|have|has|had)\b/i.test(
    workingSentence.trim()
  );

  const hasTerminalPunctuation = /[.!?]$/.test(workingSentence.trim());
  if (!hasTerminalPunctuation) {
    const punct = isQuestion ? "?" : ".";
    workingSentence = workingSentence.trim() + punct;
    if (!detectedErrors.some(e => e.type === "Punctuation")) {
      detectedErrors.push({
        errorSnippet: isQuestion ? "missing '?'" : "missing '.'",
        type: "Punctuation",
        issue: isQuestion
          ? "The question is missing a closing question mark (?) at the end."
          : "The sentence is missing a closing period (.) at the end.",
        rule: isQuestion
          ? "Interrogative sentences must end with a question mark (?)."
          : "Declarative sentences must conclude with a period (.).",
        correction: `Add ${punct}`
      });
    }
  }

  const isCorrect = detectedErrors.length === 0 && workingSentence.toLowerCase() === (text.trim() + (hasTerminalPunctuation ? "" : ".")).toLowerCase();
  const accuracyScore = isCorrect ? 100 : Math.max(35, 100 - detectedErrors.length * 15);

  return {
    isCorrect,
    accuracyScore,
    originalText: text,
    correctedText: workingSentence,
    nativeAlternative: isCorrect ? null : getSuggestedNativeAlternative(workingSentence),
    errors: detectedErrors,
    explanation: isCorrect ? "Your sentence is 100% correct!" : `Identified ${detectedErrors.length} grammar improvement${detectedErrors.length > 1 ? "s" : ""}.`,
    praiseMessage: isCorrect ? "🌟 Perfect English Grammar! Your sentence is 100% accurate." : ""
  };
}

function getSuggestedNativeAlternative(corrected) {
  const c = corrected.toLowerCase();
  if (c.includes("i am having a doubt")) return "I have a question.";
  if (c.includes("what is your good name")) return "May I ask your name?";
  if (c.includes("today morning")) return "This morning";
  if (c.includes("yesterday night")) return "Last night";
  return null;
}

export function parseBackendGrammarExplanation(rawExplanation, correctedText, localErrors = []) {
  if (!rawExplanation || typeof rawExplanation !== "string") {
    return localErrors;
  }

  const lowerExp = rawExplanation.toLowerCase();
  if (
    lowerExp.includes("100% grammatically correct") ||
    lowerExp.includes("great job") ||
    lowerExp.includes("perfect grammar") ||
    lowerExp.includes("no grammar errors") ||
    lowerExp.includes("no issues found")
  ) {
    return [];
  }

  const lines = rawExplanation
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return localErrors;

  const parsed = [];
  for (const line of lines) {
    const bracketMatch = line.match(/\[(.*?)\]/);
    let category = bracketMatch ? bracketMatch[1].trim() : "Grammar Issue";

    // Clean bracket tags, numbers, and redundant (Suggested: ...) suffixes
    let cleanIssue = line
      .replace(/^\d+[.)]\s*/, "") // Remove "1. " or "1) "
      .replace(/\[.*?\]\s*/g, "")   // Remove "[article]"
      .replace(/\s*\((?:Suggested|Correction|Corrected):\s*.*?\)$/i, "") // Remove "(Suggested: ...)"
      .trim();

    if (cleanIssue.length > 0) {
      cleanIssue = cleanIssue.charAt(0).toUpperCase() + cleanIssue.slice(1);
    }

    category = category.charAt(0).toUpperCase() + category.slice(1);

    if (cleanIssue) {
      parsed.push({
        type: category,
        issue: cleanIssue,
        rule: `Make sure your sentence follows standard ${category.toLowerCase()} rules.`,
        correction: correctedText,
      });
    }
  }

  return parsed.length > 0 ? parsed : localErrors;
}

export function generateSpokenGrammarSegments(res) {
  if (!res) return [];

  if (res.isCorrect) {
    return [`Your sentence is 100% grammatically correct! "${res.correctedText}". Excellent job.`];
  }

  const segments = [];
  segments.push(`The corrected sentence is: "${res.correctedText}".`);

  if (res.errors && res.errors.length > 0) {
    const cleanTips = res.errors.map((e) => {
      return e.issue
        .replace(/\[.*?\]/g, "")
        .replace(/[()"]/g, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim();
    });

    if (cleanTips.length === 1) {
      segments.push(`Improvement made: ${cleanTips[0]}.`);
    } else {
      segments.push(`I noticed ${cleanTips.length} grammar improvements.`);
      const ordinals = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
      cleanTips.forEach((tip, idx) => {
        const prefix = ordinals[idx] || `Point ${idx + 1}`;
        segments.push(`${prefix}: ${tip}.`);
      });
    }
  }

  return segments;
}

export const EXTENSIVE_GRAMMAR_GUIDE = [
  {
    id: "guide_tenses",
    category: "Verb Tenses & Aspects",
    icon: "⏱️",
    level: "All Levels",
    title: "The 12 English Tenses Master Guide",
    summary: "Master past, present, and future across simple, continuous, and perfect forms.",
    rules: [
      {
        name: "Simple Present",
        formula: "Subject + Base Verb (+s/es for he/she/it)",
        usage: "Used for universal truths, daily routines, habits, and permanent states.",
        correctExample: "She drinks green tea every morning.",
        wrongExample: "She drinking green tea every morning."
      },
      {
        name: "Present Perfect",
        formula: "Subject + have/has + Past Participle (V3)",
        usage: "Used for completed experiences connecting past to present.",
        correctExample: "I have visited London twice.",
        wrongExample: "I have visit London twice."
      }
    ]
  },
  {
    id: "guide_sva",
    category: "Subject-Verb Agreement",
    icon: "⚖️",
    level: "All Levels",
    title: "Golden Rules of Subject-Verb Agreement",
    summary: "Ensure singular subjects match singular verbs and plural subjects match plural verbs.",
    rules: [
      {
        name: "Third-Person Singular Rule",
        formula: "He / She / It -> Verb + s/es",
        usage: "Add -s or -es to simple present verbs when subject is third-person singular.",
        correctExample: "The teacher explains the lesson clearly.",
        wrongExample: "The teacher explain the lesson clearly."
      }
    ]
  }
];

// Master User-Tailored Questions matching ALL 10 Grades & 5 Age Groups
export const ALL_TAILORED_QUIZZES = [
  // ==========================================
  // 1st Std (Phonics, Articles, Greetings, Nouns)
  // ==========================================
  {
    id: "g1_fb_1",
    targetAudience: "STUDENT",
    standards: ["1st Std", "2nd Std"],
    ageGroups: ["Kids"],
    questionType: "FILL_BLANKS",
    category: "Articles (A vs An)",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "I see _______ (a / an) big red apple on the tree.",
    question: "Which article fits before 'big'?",
    options: ["a", "an", "the an", "two"],
    correctAnswerIndex: 0,
    explanation: "'Big' starts with consonant sound /b/, so we use 'a big red apple'."
  },
  {
    id: "g1_tf_1",
    targetAudience: "STUDENT",
    standards: ["1st Std", "2nd Std"],
    ageGroups: ["Kids"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Capitalization & Names",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'my name is Aarav and i like to play.'",
    question: "Is this sentence written with correct capital letters?",
    options: [
      "❌ Incorrect - 'My' and 'I' must have capital letters.",
      "✅ Correct - All letters are correct.",
      "❌ Incorrect - 'Aarav' should be lowercase.",
      "❌ Incorrect - 'Play' must be capitalized."
    ],
    correctAnswerIndex: 0,
    explanation: "Sentences always start with a capital letter ('My') and the pronoun 'I' is always capitalized."
  },

  // ==========================================
  // 2nd Std (Daily Routines, Singular/Plural)
  // ==========================================
  {
    id: "g2_fb_1",
    targetAudience: "STUDENT",
    standards: ["2nd Std", "3rd Std"],
    ageGroups: ["Kids"],
    questionType: "FILL_BLANKS",
    category: "Singular & Plural Nouns",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "There are three _______ (bus / buses / bus's) waiting outside the school gate.",
    question: "Choose the correct plural spelling:",
    options: ["buses", "bus", "buss", "busses's"],
    correctAnswerIndex: 0,
    explanation: "Nouns ending in -s take -es in plural form: 'buses'."
  },
  {
    id: "g2_spot_1",
    targetAudience: "STUDENT",
    standards: ["2nd Std", "3rd Std"],
    ageGroups: ["Kids"],
    questionType: "SPOT_ERROR",
    category: "Simple Present He/She",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'He play with his toy car every evening.'",
    question: "Choose the correct sentence:",
    options: [
      "He plays with his toy car every evening.",
      "He play with his toy car every evening.",
      "He is play with his toy car every evening.",
      "He playing with his toy car every evening."
    ],
    correctAnswerIndex: 0,
    explanation: "With 'He', add -s to the verb in simple present: 'He plays'."
  },

  // ==========================================
  // 3rd Std (Action Verbs, Simple Past, Prepositions)
  // ==========================================
  {
    id: "g3_fb_1",
    targetAudience: "STUDENT",
    standards: ["3rd Std", "4th Std"],
    ageGroups: ["Kids"],
    questionType: "FILL_BLANKS",
    category: "Simple Past Tense",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "Yesterday, my mother _______ (bake / baked / bakes) a delicious chocolate cake.",
    question: "Select the correct past tense verb:",
    options: ["baked", "bake", "bakes", "is baking"],
    correctAnswerIndex: 0,
    explanation: "For yesterday (past action), use the past tense 'baked'."
  },
  {
    id: "g3_tf_1",
    targetAudience: "STUDENT",
    standards: ["3rd Std", "4th Std"],
    ageGroups: ["Kids"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Prepositions of Place",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'The cat jumped in the table and drank milk.'",
    question: "Is 'in the table' grammatically correct?",
    options: [
      "❌ Incorrect - It should be 'jumped onto the table'.",
      "✅ Correct - 'in the table' is right.",
      "❌ Incorrect - Should be 'underneath of'.",
      "❌ Incorrect - 'Drank' should be 'drinked'."
    ],
    correctAnswerIndex: 0,
    explanation: "Use 'onto' or 'on' for flat upper surfaces like a table, not 'in'."
  },

  // ==========================================
  // 4th Std (Adjectives, Pronouns, Helping Verbs)
  // ==========================================
  {
    id: "g4_fb_1",
    targetAudience: "STUDENT",
    standards: ["4th Std", "5th Std"],
    ageGroups: ["Kids"],
    questionType: "FILL_BLANKS",
    category: "Pronouns (Subject vs Object)",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "Teacher praised Rohan and _______ (I / me / mine) for completing our science chart.",
    question: "Choose the correct pronoun:",
    options: ["me", "I", "myself", "mine"],
    correctAnswerIndex: 0,
    explanation: "As the object of the verb 'praised', use the objective pronoun 'me'."
  },
  {
    id: "g4_trans_1",
    targetAudience: "STUDENT",
    standards: ["4th Std", "5th Std"],
    ageGroups: ["Kids"],
    questionType: "TRANSFORMATION",
    category: "Positive to Negative Sentence",
    formatBadge: "🔄 Sentence Transformation",
    promptSentence: "Positive: 'She likes spicy food.'",
    question: "Transform this sentence into the correct negative sentence:",
    options: [
      "She does not like spicy food.",
      "She do not likes spicy food.",
      "She not like spicy food.",
      "She does not likes spicy food."
    ],
    correctAnswerIndex: 0,
    explanation: "Negative of 'She likes' is 'She does not like' (base verb 'like')."
  },

  // ==========================================
  // 5th Std (Simple Present, SVA, Articles)
  // ==========================================
  {
    id: "g5_fb_1",
    targetAudience: "STUDENT",
    standards: ["5th Std", "6th Std"],
    ageGroups: ["Kids", "Teens"],
    questionType: "FILL_BLANKS",
    category: "Subject-Verb Agreement",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "My sister _______ (drink / drinks / is drink) warm water every morning.",
    question: "Choose the correct verb form:",
    options: ["drinks", "drink", "is drink", "drinking"],
    correctAnswerIndex: 0,
    explanation: "'My sister' is singular (she), so use 'drinks'."
  },
  {
    id: "g5_tf_1",
    targetAudience: "STUDENT",
    standards: ["5th Std", "6th Std"],
    ageGroups: ["Kids", "Teens"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Vowel Sound Articles",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'He is an honest police officer who loves his job.'",
    question: "Is this sentence grammatically correct?",
    options: [
      "✅ Correct - 'Honest' starts with a vowel sound (/ɒ/), so 'an honest' is correct.",
      "❌ Incorrect - 'Honest' starts with H, so it must be 'a honest'.",
      "❌ Incorrect - 'Police officer' does not need an article.",
      "❌ Incorrect - 'Loves' should be 'love'."
    ],
    correctAnswerIndex: 0,
    explanation: "'Honest' has a silent 'h' and begins with vowel sound /ɒ/, taking 'an honest'."
  },

  // ==========================================
  // 6th Std (Compound Sentences, Past Auxiliary)
  // ==========================================
  {
    id: "g6_spot_1",
    targetAudience: "STUDENT",
    standards: ["6th Std", "7th Std"],
    ageGroups: ["Teens"],
    questionType: "SPOT_ERROR",
    category: "Past Auxiliary Verb Form",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'We didn't went to the museum yesterday because it was closed.'",
    question: "Identify the corrected sentence:",
    options: [
      "We didn't go to the museum yesterday because it was closed.",
      "We didn't went to the museum yesterday because it was closed.",
      "We hasn't gone to the museum yesterday because it was closed.",
      "We don't went to the museum yesterday because it was closed."
    ],
    correctAnswerIndex: 0,
    explanation: "After auxiliary 'didn't', the verb must be in base form 'go'."
  },
  {
    id: "g6_fb_1",
    targetAudience: "STUDENT",
    standards: ["6th Std", "7th Std"],
    ageGroups: ["Teens"],
    questionType: "FILL_BLANKS",
    category: "Coordinating Conjunctions",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "I wanted to play outside, _______ (and / but / so / because) it started raining heavily.",
    question: "Choose the proper contrasting conjunction:",
    options: ["but", "and", "or", "so that"],
    correctAnswerIndex: 0,
    explanation: "Use 'but' to show contrast between wanting to play and the rain stopping it."
  },

  // ==========================================
  // 7th Std (Prepositions of Time, Relative Clauses)
  // ==========================================
  {
    id: "g7_fb_1",
    targetAudience: "STUDENT",
    standards: ["7th Std", "8th Std"],
    ageGroups: ["Teens"],
    questionType: "FILL_BLANKS",
    category: "Prepositions (Since vs For)",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "Our school cricket team has been practicing _______ (since / for / from) three weeks.",
    question: "Select the correct preposition of duration:",
    options: ["for", "since", "from", "during of"],
    correctAnswerIndex: 0,
    explanation: "Use 'for' for lengths/durations of time ('for three weeks')."
  },
  {
    id: "g7_tf_1",
    targetAudience: "STUDENT",
    standards: ["7th Std", "8th Std"],
    ageGroups: ["Teens"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Relative Pronouns (Who vs Which)",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'This is the student which won the national science quiz.'",
    question: "Is 'which' used correctly here?",
    options: [
      "❌ Incorrect - Use 'who' when referring to people ('the student who won').",
      "✅ Correct - 'which' can refer to students.",
      "❌ Incorrect - Should be 'whose won'.",
      "❌ Incorrect - 'Won' should be 'wins'."
    ],
    correctAnswerIndex: 0,
    explanation: "Use 'who' for people and 'which' for animals or objects."
  },

  // ==========================================
  // 8th Std (Active/Passive Voice, Modals)
  // ==========================================
  {
    id: "g8_trans_1",
    targetAudience: "STUDENT",
    standards: ["8th Std", "9th Std"],
    ageGroups: ["Teens"],
    questionType: "TRANSFORMATION",
    category: "Active to Passive Voice",
    formatBadge: "🔄 Sentence Transformation",
    promptSentence: "Active Voice: 'The principal inaugurated the annual cultural fest.'",
    question: "Select the correct Passive Voice form:",
    options: [
      "The annual cultural fest was inaugurated by the principal.",
      "The annual cultural fest is inaugurated by the principal.",
      "The annual cultural fest has inaugurated by the principal.",
      "The annual cultural fest inaugurated the principal."
    ],
    correctAnswerIndex: 0,
    explanation: "Simple past active ('inaugurated') becomes 'was inaugurated by'."
  },
  {
    id: "g8_spot_1",
    targetAudience: "STUDENT",
    standards: ["8th Std", "9th Std", "10th Std"],
    ageGroups: ["Teens"],
    questionType: "SPOT_ERROR",
    category: "Subject-Verb Agreement (Each of)",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'Each of the player in our team have received a medal.'",
    question: "Choose the sentence that fixes ALL errors:",
    options: [
      "Each of the players in our team has received a medal.",
      "Each of the player in our team have received a medal.",
      "Each of the players in our team are received a medal.",
      "Each of the player in our team has receive a medal."
    ],
    correctAnswerIndex: 0,
    explanation: "'Each of the' requires a plural noun ('players') and a singular verb ('has received')."
  },

  // ==========================================
  // 9th Std (Direct/Indirect Speech, Conditionals)
  // ==========================================
  {
    id: "g9_trans_1",
    targetAudience: "STUDENT",
    standards: ["9th Std", "10th Std"],
    ageGroups: ["Teens", "Young Adult"],
    questionType: "TRANSFORMATION",
    category: "Reported (Indirect) Speech",
    formatBadge: "🔄 Sentence Transformation",
    promptSentence: "Direct: Sneha said, 'I am preparing my presentation today.'",
    question: "Choose the proper Indirect Speech transformation:",
    options: [
      "Sneha said that she was preparing her presentation that day.",
      "Sneha said that I am preparing my presentation today.",
      "Sneha said that she is preparing her presentation today.",
      "Sneha told that she has been preparing her presentation that day."
    ],
    correctAnswerIndex: 0,
    explanation: "In reported speech, 'am preparing' becomes 'was preparing' and 'today' becomes 'that day'."
  },
  {
    id: "g9_fb_1",
    targetAudience: "STUDENT",
    standards: ["9th Std", "10th Std"],
    ageGroups: ["Teens", "Young Adult"],
    questionType: "FILL_BLANKS",
    category: "First Conditional",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "If it _______ (rains / will rain / rained) tomorrow, the sports match will be postponed.",
    question: "Complete the if-clause correctly:",
    options: ["rains", "will rain", "rained", "is raining"],
    correctAnswerIndex: 0,
    explanation: "In First Conditional sentences, use Simple Present ('rains') in the if-clause, never 'will'."
  },

  // ==========================================
  // 10th Std (Board Exam Syntax, Correlatives, Inversion)
  // ==========================================
  {
    id: "g10_tf_1",
    targetAudience: "STUDENT",
    standards: ["10th Std"],
    ageGroups: ["Teens", "Young Adult"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Correlative Conjunctions (No sooner...than)",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'No sooner had the bell rung when the students left the hall.'",
    question: "Is this sentence standard for 10th board grammar?",
    options: [
      "❌ Incorrect - 'No sooner...had' must be paired with 'than', not 'when'.",
      "✅ Correct - 'No sooner...when' is standard.",
      "❌ Incorrect - 'Rung' should be 'rang'.",
      "❌ Incorrect - 'Left' should be 'leave'."
    ],
    correctAnswerIndex: 0,
    explanation: "The pair is 'No sooner ... THAN' (Hardly/Scarcely takes 'when')."
  },
  {
    id: "g10_fb_1",
    targetAudience: "STUDENT",
    standards: ["10th Std"],
    ageGroups: ["Teens", "Young Adult"],
    questionType: "FILL_BLANKS",
    category: "Third Conditional",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "If he _______ (had practiced / practiced / has practiced) more, he would have cleared the merit list.",
    question: "Complete the Third Conditional statement:",
    options: ["had practiced", "practiced", "would practice", "has practiced"],
    correctAnswerIndex: 0,
    explanation: "Third Conditional uses 'If + had + past participle' ('had practiced')."
  },

  // ==========================================
  // AGE GROUP: Kids (6-12 yrs) 🎈
  // ==========================================
  {
    id: "kid_fb_1",
    targetAudience: "INDIVIDUAL",
    standards: ["3rd Std", "4th Std", "5th Std"],
    ageGroups: ["Kids"],
    questionType: "FILL_BLANKS",
    category: "Fun Story Verbs",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "The little puppy _______ (wagged / wag / wagging) its tail happily when it saw me.",
    question: "Choose the past tense verb:",
    options: ["wagged", "wag", "wagging", "wags"],
    correctAnswerIndex: 0,
    explanation: "Use past tense 'wagged' for completed storytelling action."
  },
  {
    id: "kid_tf_1",
    targetAudience: "INDIVIDUAL",
    standards: ["3rd Std", "4th Std", "5th Std"],
    ageGroups: ["Kids"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "This vs These",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'These ice cream is my favorite treat.'",
    question: "Is 'These' used correctly with singular 'ice cream'?",
    options: [
      "❌ Incorrect - Should be 'This ice cream' for a single treat.",
      "✅ Correct - 'These' is right.",
      "❌ Incorrect - 'Favorite' is misspelled.",
      "❌ Incorrect - 'Is' should be 'are'."
    ],
    correctAnswerIndex: 0,
    explanation: "'This' is for singular nouns; 'These' is for plural nouns."
  },

  // ==========================================
  // AGE GROUP: Teens (13-17 yrs) ⚡
  // ==========================================
  {
    id: "teen_fb_1",
    targetAudience: "INDIVIDUAL",
    standards: ["8th Std", "9th Std", "10th Std"],
    ageGroups: ["Teens"],
    questionType: "FILL_BLANKS",
    category: "Modal Verbs & Opinions",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "You _______ (should / must to / ought) take a short break after studying for two hours.",
    question: "Choose the proper modal auxiliary verb:",
    options: ["should", "must to", "ought", "need to be"],
    correctAnswerIndex: 0,
    explanation: "'Should' is followed directly by a base verb ('should take'). 'Must' does not take 'to'."
  },
  {
    id: "teen_tf_1",
    targetAudience: "INDIVIDUAL",
    standards: ["8th Std", "9th Std", "10th Std"],
    ageGroups: ["Teens"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Redundancy in Casual Speech",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'I made a blunder mistake while answering the history quiz.'",
    question: "Is 'blunder mistake' good English?",
    options: [
      "❌ Incorrect - 'Blunder' already means a big mistake. 'Blunder mistake' is redundant.",
      "✅ Correct - 'Blunder mistake' is standard English.",
      "❌ Incorrect - 'Made' should be 'did'.",
      "❌ Incorrect - 'While answering' is ungrammatical."
    ],
    correctAnswerIndex: 0,
    explanation: "Say 'I made a blunder' or 'I made a mistake', never 'blunder mistake'."
  },

  // ==========================================
  // AGE GROUP: Young Adult (18-24 yrs) 🎓
  // ==========================================
  {
    id: "ya_fb_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["Young Adult"],
    questionType: "FILL_BLANKS",
    category: "Subjunctive Conditional",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "If I _______ (were / was / am / would be) in your place, I would apply for that tech internship.",
    question: "Choose the formal subjunctive form:",
    options: ["were", "was", "am", "would be"],
    correctAnswerIndex: 0,
    explanation: "In formal unreal conditionals, use 'were' for all subjects ('If I were you')."
  },
  {
    id: "ya_spot_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["Young Adult"],
    questionType: "SPOT_ERROR",
    category: "Pronoun Cases in Prepositional Phrases",
    formatBadge: "🔍 Spot & Fix Mistake",
    promptSentence: "Sentence: 'The scholarship committee gave the award to Priya and I.'",
    question: "Which option corrects the pronoun case error?",
    options: [
      "The scholarship committee gave the award to Priya and me.",
      "The scholarship committee gave the award to Priya and I.",
      "The scholarship committee gave the award to Priya and myself.",
      "The scholarship committee given the award to Priya and I."
    ],
    correctAnswerIndex: 0,
    explanation: "Objects of prepositions ('to') take objective pronouns ('me')."
  },

  // ==========================================
  // AGE GROUP: Professional (25-50 yrs) 💼
  // ==========================================
  {
    id: "pro_fb_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["Professional"],
    questionType: "FILL_BLANKS",
    category: "Business Subjunctive Mandate",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "The CEO recommended that the project lead _______ (submit / submits / submitted / is submitting) the quarterly audit by Friday.",
    question: "Select the proper mandate subjunctive verb:",
    options: ["submit", "submits", "submitted", "is submitting"],
    correctAnswerIndex: 0,
    explanation: "Verbs of recommendation (recommend that he...) take base infinitive 'submit'."
  },
  {
    id: "pro_tf_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["Professional"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Business Prepositions",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'We need to discuss about the budget allocation during tomorrow's sync.'",
    question: "Is 'discuss about' correct in professional business English?",
    options: [
      "❌ Incorrect - 'Discuss' is transitive and does not take 'about'. Say 'discuss the budget allocation'.",
      "✅ Correct - 'Discuss about' is formal business English.",
      "❌ Incorrect - 'Sync' is not a valid word.",
      "❌ Incorrect - 'Allocation' should be plural."
    ],
    correctAnswerIndex: 0,
    explanation: "'Discuss' already means 'talk about'. Adding 'about' is redundant."
  },
  {
    id: "pro_trans_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["Professional", "Senior"],
    questionType: "TRANSFORMATION",
    category: "Negative Inversion for Formal Rhetoric",
    formatBadge: "🔄 Sentence Transformation",
    promptSentence: "Standard: 'We have rarely seen such rapid revenue growth in Q3.'",
    question: "Transform into an inverted formal sentence starting with 'Rarely':",
    options: [
      "Rarely have we seen such rapid revenue growth in Q3.",
      "Rarely we have seen such rapid revenue growth in Q3.",
      "Rarely we saw such rapid revenue growth in Q3.",
      "Rarely are we seen such rapid revenue growth in Q3."
    ],
    correctAnswerIndex: 0,
    explanation: "Negative adverbs at the start of a sentence require auxiliary inversion: 'Rarely have we seen'."
  },

  // ==========================================
  // AGE GROUP: Senior (50+ yrs) ☕
  // ==========================================
  {
    id: "sen_fb_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["Senior"],
    questionType: "FILL_BLANKS",
    category: "Dependent Collocations & Idioms",
    formatBadge: "✏️ Fill in the Blank",
    promptSentence: "He is exceptionally adept _______ (at / in / with / for) restoring classical antique clocks.",
    question: "Choose the proper dependent preposition with 'adept':",
    options: ["at", "in", "with", "for"],
    correctAnswerIndex: 0,
    explanation: "The standard English collocation is 'adept at + gerund' ('adept at restoring')."
  },
  {
    id: "sen_tf_1",
    targetAudience: "INDIVIDUAL",
    standards: ["10th Std"],
    ageGroups: ["Senior"],
    questionType: "CORRECT_OR_INCORRECT",
    category: "Parallel Structure in Prose",
    formatBadge: "🧐 Correct or Incorrect?",
    promptSentence: "Sentence: 'He spends his morning gardening, reading memoirs, and to drink herbal tea.'",
    question: "Is this sentence grammatically parallel?",
    options: [
      "❌ Incorrect - Lacks parallelism. Should be 'and drinking herbal tea'.",
      "✅ Correct - All verb phrases are parallel.",
      "❌ Incorrect - 'Memoirs' should be singular.",
      "❌ Incorrect - 'Gardening' should be 'to garden'."
    ],
    correctAnswerIndex: 0,
    explanation: "All items in a list must share the same form: 'gardening', 'reading', and 'DRINKING'."
  }
];

/**
 * Returns user-tailored daily grammar questions based on standard/age and rotates 8 non-repeating questions daily.
 */
export function getTailoredDailyGrammarQuizzes({
  userType = "INDIVIDUAL",
  targetGrade = "8th Std",
  ageGroup = "Professional",
  customDate = new Date(),
  offset = 0,
} = {}) {
  const isStudent = userType === "STUDENT";

  let matchingPool = ALL_TAILORED_QUIZZES.filter((q) => {
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

  if (matchingPool.length < 8) {
    const fallbackPool = ALL_TAILORED_QUIZZES.filter(
      (q) => !matchingPool.some((m) => m.id === q.id)
    );
    matchingPool = [...matchingPool, ...fallbackPool];
  }

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

export function getDailyGrammarQuizzes(customDate = new Date(), offset = 0) {
  return getTailoredDailyGrammarQuizzes({ customDate, offset });
}

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
