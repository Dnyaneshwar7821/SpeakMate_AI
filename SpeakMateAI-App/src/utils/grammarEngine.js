/**
 * SpeakMate AI Mobile - Complete Tailored Grammar Quiz Engine
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
  // =========================================================================
  // 1. ALL 12 ENGLISH TENSES MASTER BLUEPRINT ⏱️
  // =========================================================================
  {
    id: "guide_tenses",
    category: "Verb Tenses & Aspects",
    icon: "⏱️",
    level: "Essential (All Levels)",
    title: "The 12 English Tenses Master Blueprint",
    summary: "Complete breakdown of all 12 tenses with formulas, real-world usage, timelines, and pitfalls.",
    rules: [
      {
        name: "Simple Present Tense",
        formula: "Subject + Base Verb (+s/es for He/She/It)",
        usage: "Expresses permanent facts, universal truths, daily routines, scientific laws, and scheduled events.",
        correctExample: "The earth revolves around the sun, and she works out every morning.",
        wrongExample: "The earth is revolving around the sun and she work out every morning."
      },
      {
        name: "Present Continuous (Progressive)",
        formula: "Subject + is / am / are + Verb-ing",
        usage: "Describes actions happening at the exact moment of speaking, or temporary current trends and near-future plans.",
        correctExample: "We are developing an AI English tutor app right now.",
        wrongExample: "We are develop an AI English tutor app right now."
      },
      {
        name: "Present Perfect Tense",
        formula: "Subject + have / has + Past Participle (V3)",
        usage: "Connects a past action to the present moment, life experiences, recent achievements, or ongoing states.",
        correctExample: "She has lived in New York for five years.",
        wrongExample: "She is living in New York since five years."
      },
      {
        name: "Present Perfect Continuous",
        formula: "Subject + have / has + been + Verb-ing (+ since / for)",
        usage: "Emphasizes the duration of an ongoing action that began in the past and is still continuing right now.",
        correctExample: "They have been studying for the exam since 8 AM.",
        wrongExample: "They are studying for the exam since 8 AM."
      },
      {
        name: "Simple Past Tense",
        formula: "Subject + Past Form of Verb (V2)",
        usage: "Describes actions that started and finished at a specific point in the past.",
        correctExample: "We launched the new product yesterday.",
        wrongExample: "We have launched the new product yesterday."
      },
      {
        name: "Past Continuous Tense",
        formula: "Subject + was / were + Verb-ing",
        usage: "Describes an action that was ongoing in the past when another action interrupted it.",
        correctExample: "I was reading a book when the phone suddenly rang.",
        wrongExample: "I was read a book when the phone suddenly rang."
      },
      {
        name: "Past Perfect Tense",
        formula: "Subject + had + Past Participle (V3)",
        usage: "Describes an action completed BEFORE another past action or specific past time.",
        correctExample: "When the doctor arrived, the patient had already recovered.",
        wrongExample: "When the doctor arrived, the patient already recovered."
      },
      {
        name: "Past Perfect Continuous",
        formula: "Subject + had + been + Verb-ing",
        usage: "Shows that an action was ongoing in the past up until another past event occurred.",
        correctExample: "He was exhausted because he had been driving for eight hours.",
        wrongExample: "He was exhausted because he was driving since eight hours."
      },
      {
        name: "Simple Future Tense (Will vs Going To)",
        formula: "Subject + will + Base Verb  OR  is/am/are + going to + Base Verb",
        usage: "Use 'will' for spontaneous decisions/promises, and 'be going to' for planned intentions or evidence-based predictions.",
        correctExample: "Look at those dark clouds; it is going to rain. I will carry an umbrella.",
        wrongExample: "Look at those dark clouds; it will be rain."
      },
      {
        name: "Future Continuous Tense",
        formula: "Subject + will + be + Verb-ing",
        usage: "Describes an action that will be in progress at a specific time in the future.",
        correctExample: "This time tomorrow, I will be flying to Tokyo.",
        wrongExample: "This time tomorrow, I will flying to Tokyo."
      },
      {
        name: "Future Perfect Tense",
        formula: "Subject + will + have + Past Participle (V3)",
        usage: "Shows that an action will be completed before a designated future deadline.",
        correctExample: "By next month, our team will have completed the entire syllabus.",
        wrongExample: "By next month, our team will complete the entire syllabus."
      },
      {
        name: "Future Perfect Continuous",
        formula: "Subject + will + have + been + Verb-ing",
        usage: "Emphasizes the duration of an activity leading up to a specific future milestone.",
        correctExample: "By December, she will have been teaching here for a decade.",
        wrongExample: "By December, she will be teaching here for a decade."
      }
    ]
  },

  // =========================================================================
  // 2. SUBJECT-VERB AGREEMENT (SVA) GOLDEN RULES ⚖️
  // =========================================================================
  {
    id: "guide_sva",
    category: "Subject-Verb Agreement",
    icon: "⚖️",
    level: "Essential (All Levels)",
    title: "Golden Rules of Subject-Verb Agreement",
    summary: "Master agreement across singular/plural subjects, collective nouns, correlative pairs, and quantifiers.",
    rules: [
      {
        name: "Third-Person Singular Rule",
        formula: "He / She / It / Singular Noun -> Verb + s / es",
        usage: "Add -s or -es to present tense verbs when the subject is third-person singular.",
        correctExample: "The manager reviews every report before signing.",
        wrongExample: "The manager review every report before signing."
      },
      {
        name: "Intervening Prepositional Phrases",
        formula: "Subject + [along with / as well as / together with] + Verb matches primary Subject",
        usage: "Words between the subject and verb (like 'along with', 'as well as', 'in addition to') do not change the subject's number.",
        correctExample: "The captain, along with all his teammates, is attending the press conference.",
        wrongExample: "The captain, along with all his teammates, are attending the press conference."
      },
      {
        name: "Correlative Pairs Proximity Rule",
        formula: "Either...or / Neither...nor -> Verb agrees with closest subject",
        usage: "When subjects are joined by 'or', 'nor', 'either...or', or 'neither...nor', the verb agrees with the subject closest to it.",
        correctExample: "Neither the teacher nor the students were aware of the schedule change.",
        wrongExample: "Neither the teacher nor the students was aware of the schedule change."
      },
      {
        name: "Indefinite Pronouns are Singular",
        formula: "Everyone / Somebody / Each / Neither of -> Singular Verb",
        usage: "Indefinite pronouns like everyone, everybody, someone, nobody, anyone, each, and neither take singular verbs.",
        correctExample: "Each of the participants has received a certificate.",
        wrongExample: "Each of the participants have received a certificate."
      },
      {
        name: "Collective Nouns (Unit vs Individuals)",
        formula: "Collective Noun as single unit = Singular Verb; acting separately = Plural Verb",
        usage: "Words like committee, jury, audience, team take a singular verb when acting as a unified unit.",
        correctExample: "The jury has reached a unanimous verdict.",
        wrongExample: "The jury have reached a unanimous verdict."
      },
      {
        name: "'A Number of' vs 'The Number of'",
        formula: "'A number of' = Plural Verb; 'The number of' = Singular Verb",
        usage: "'A number of' means many (plural), while 'the number of' refers to the specific count (singular).",
        correctExample: "A number of students are absent today, but the number of students is fifty.",
        wrongExample: "A number of students is absent today."
      }
    ]
  },

  // =========================================================================
  // 3. NOUNS & PLURALIZATION MASTER GUIDE 🏷️
  // =========================================================================
  {
    id: "guide_nouns",
    category: "Nouns & Pluralization",
    icon: "🏷️",
    level: "Foundation to Advanced",
    title: "Nouns & Pluralization Rules",
    summary: "Countable vs uncountable nouns, irregular plurals, collective groups, and uncountable nouns.",
    rules: [
      {
        name: "Countable vs Uncountable Nouns",
        formula: "Countable: many / few / a few; Uncountable: much / little / a little",
        usage: "Uncountable nouns (information, advice, furniture, luggage, bread, knowledge) cannot take 'a/an' or plural '-s'.",
        correctExample: "He gave me valuable advice and much information.",
        wrongExample: "He gave me many valuable advices and informations."
      },
      {
        name: "Irregular Plurals & Greek/Latin Endings",
        formula: "Child -> Children, Person -> People, Crisis -> Crises, Phenomenon -> Phenomena",
        usage: "Certain nouns transform irregularly without adding standard -s.",
        correctExample: "Scientists analyzed several natural phenomena during the solar eclipse.",
        wrongExample: "Scientists analyzed several natural phenomenas during the solar eclipse."
      },
      {
        name: "Always Plural Nouns (Paired Items)",
        formula: "Scissors / Trousers / Spectacles / Glasses -> Plural Verb (or 'a pair of' + Singular)",
        usage: "Objects consisting of two parts are always plural unless preceded by 'a pair of'.",
        correctExample: "These scissors are sharp, but that pair of scissors is dull.",
        wrongExample: "This scissors is sharp."
      },
      {
        name: "Possessive Noun Apostrophe Rules",
        formula: "Singular: Noun's; Plural ending in -s: Nouns'; Irregular plural: Noun's",
        usage: "Use apostrophe before s for singular (boy's ball) and after s for standard plurals (boys' school).",
        correctExample: "The children's playground is situated near the teachers' lounge.",
        wrongExample: "The childrens' playground is situated near the teacher's lounge."
      }
    ]
  },

  // =========================================================================
  // 4. PRONOUNS & CASE ACCURACY 👤
  // =========================================================================
  {
    id: "guide_pronouns",
    category: "Pronouns & Case Accuracy",
    icon: "👤",
    level: "All Levels",
    title: "Pronouns, Cases & Common Traps",
    summary: "Master subjective vs objective cases, relative pronouns (who vs whom), and reflexive pronoun traps.",
    rules: [
      {
        name: "Subject vs Object Pronoun Cases",
        formula: "Subject Case (I/He/She/We/They) before verb; Object Case (Me/Him/Her/Us/Them) after verb/preposition",
        usage: "Use objective pronouns after transitive verbs and prepositions (between, to, for, with).",
        correctExample: "Between you and me, the manager selected Priya and her for the project.",
        wrongExample: "Between you and I, the manager selected Priya and she for the project."
      },
      {
        name: "Relative Pronouns: Who vs Whom",
        formula: "Who = Subject (performs action: He/She); Whom = Object (receives action: Him/Her)",
        usage: "If you can substitute 'he/she', use 'who'. If you can substitute 'him/her', use 'whom'.",
        correctExample: "The architect whom we met yesterday designed this university.",
        wrongExample: "The architect who we met yesterday designed this university."
      },
      {
        name: "Avoid 'Myself' for Self-Introductions",
        formula: "Say 'I am [Name]' or 'My name is [Name]' (Never 'Myself [Name]')",
        usage: "'Myself' is a reflexive/emphatic pronoun and cannot function as the subject of a sentence.",
        correctExample: "Hello everyone, I am Rahul, and I will lead this discussion.",
        wrongExample: "Hello everyone, myself Rahul, and I will lead this discussion."
      },
      {
        name: "Relative Clauses: That vs Which",
        formula: "That = Essential (restrictive, no comma); Which = Non-essential (extra info, with commas)",
        usage: "Use 'that' when the clause is crucial to identify the noun; use 'which' for bonus background details.",
        correctExample: "The laptop that I bought last week is fast. My laptop, which has 16GB RAM, is fast.",
        wrongExample: "The laptop which I bought last week is fast without commas."
      }
    ]
  },

  // =========================================================================
  // 5. ARTICLES & DETERMINERS (A, AN, THE, ZERO ARTICLE) 🎯
  // =========================================================================
  {
    id: "guide_articles",
    category: "Articles & Determiners",
    icon: "🎯",
    level: "All Levels",
    title: "Mastering Articles (A, An, The, Zero Article)",
    summary: "Sound-based rules for A vs An, definite article 'The' usage, and when to omit articles completely.",
    rules: [
      {
        name: "A vs An (Vowel SOUND, Not Spelling)",
        formula: "An + Vowel Sound (/a/, /e/, /i/, /o/, /u/); A + Consonant Sound",
        usage: "Choose article by pronunciation: 'an hour' (silent h), 'a university' (y-consonant sound), 'an MBA' (em-vowel sound).",
        correctExample: "He is an honest officer with a university degree and an MBA.",
        wrongExample: "He is a honest officer with an university degree and a MBA."
      },
      {
        name: "Definite Article 'The' Usage",
        formula: "The + Unique entity / Superlatives / Oceans / Rivers / Specific reference",
        usage: "Use 'The' for singular unique nouns (The sun), superlative adjectives (The tallest), and specific known items.",
        correctExample: "Mount Everest is the highest mountain peak in the Himalayas.",
        wrongExample: "Mount Everest is highest mountain peak in Himalayas."
      },
      {
        name: "Zero Article (Omission of Articles)",
        formula: "NO article before proper names, languages, sports, meals, abstract nouns in general",
        usage: "Do not use 'the' before languages (English, not the English language), sports (cricket), or meals (breakfast).",
        correctExample: "She speaks fluent French and plays tennis every Sunday after breakfast.",
        wrongExample: "She speaks the fluent French and plays the tennis after the breakfast."
      },
      {
        name: "Determiners: Some vs Any, Few vs Little",
        formula: "Some = Positive; Any = Negative/Question; Few = Countable; Little = Uncountable",
        usage: "'Few/Little' have negative meanings (almost none); 'A few / A little' have positive meanings (some).",
        correctExample: "Do you have any questions? I have a few suggestions to improve the plan.",
        wrongExample: "Do you have some questions? I have few suggestions (meaning none)."
      }
    ]
  },

  // =========================================================================
  // 6. ADJECTIVES & ORDER OF ADJECTIVES 🎨
  // =========================================================================
  {
    id: "guide_adjectives",
    category: "Adjectives & Comparison",
    icon: "🎨",
    level: "Intermediate to Advanced",
    title: "Adjectives, Degrees & OSASCOMP Order",
    summary: "Degrees of comparison, avoiding double comparatives, participial adjectives (-ed vs -ing), and adjective order.",
    rules: [
      {
        name: "Royal Order of Adjectives (OSASCOMP)",
        formula: "Opinion -> Size -> Age -> Shape -> Color -> Origin -> Material -> Purpose",
        usage: "When multiple adjectives describe a noun, stack them in the standard natural English order.",
        correctExample: "She bought a lovely, small, antique, round, brown, Italian, wooden dining table.",
        wrongExample: "She bought an Italian, wooden, lovely, round, small dining table."
      },
      {
        name: "Degrees of Comparison & Double Comparatives",
        formula: "Positive -> Comparative (-er / more) -> Superlative (-est / most)",
        usage: "Never combine '-er' with 'more' or '-est' with 'most'. Double comparatives are grammatically incorrect.",
        correctExample: "This route is faster and much safer than the highway.",
        wrongExample: "This route is more faster and more safer than the highway."
      },
      {
        name: "Participial Adjectives (-ed vs -ing)",
        formula: "-ed = Feeling/Emotion of a person; -ing = Characteristic of the object/situation",
        usage: "A person feels 'bored' or 'interested'; a movie is 'boring' or 'interesting'.",
        correctExample: "The audience was fascinated because the keynote lecture was inspiring.",
        wrongExample: "The audience was fascinating because the keynote lecture was inspired."
      },
      {
        name: "Absolute Adjectives (No Comparative/Superlative)",
        formula: "Unique, Perfect, Dead, Complete, Eternal, Essential cannot take 'more' or 'most'",
        usage: "Something is either unique or not; it cannot be 'very unique' or 'more perfect'.",
        correctExample: "His voice has a unique timbre and completely original cadence.",
        wrongExample: "His voice has a very unique timbre and most perfect cadence."
      }
    ]
  },

  // =========================================================================
  // 7. ADVERBS & INVERSION STRUCTURES ⚡
  // =========================================================================
  {
    id: "guide_adverbs",
    category: "Adverbs & Word Placement",
    icon: "⚡",
    level: "Intermediate to Advanced",
    title: "Adverbs, Placement & Negative Inversion",
    summary: "Adverb types, placement of frequency adverbs, adjective vs adverb confusion, and inversion for emphasis.",
    rules: [
      {
        name: "Adverbs of Frequency Placement",
        formula: "Subject + Frequency Adverb (always/never/often/seldom) + Main Verb  OR  Be + Adverb",
        usage: "Place frequency adverbs before normal action verbs, but after auxiliary 'to be' verbs.",
        correctExample: "He always arrives on time, and he is never late for client meetings.",
        wrongExample: "He arrives always on time, and he never is late for client meetings."
      },
      {
        name: "Adjective vs Adverb Confusion",
        formula: "Good (Adjective) modifies Noun; Well (Adverb) modifies Verb/Action",
        usage: "Say 'he speaks well' (adverb), not 'he speaks good'. Note: 'fast' is both adjective and adverb (never 'fastly').",
        correctExample: "She is a good orator and spoke very well during the debate.",
        wrongExample: "She is a good orator and spoke very good during the debate."
      },
      {
        name: "Negative Inversion for Dramatic Emphasis",
        formula: "Negative Adverb (Never/Rarely/Seldom/Hardly/Scarcely) + Auxiliary Verb + Subject + Main Verb",
        usage: "When starting a sentence with a negative or limiting adverb, invert the auxiliary verb and subject.",
        correctExample: "Seldom have I witnessed such extraordinary talent and dedication.",
        wrongExample: "Seldom I have witnessed such extraordinary talent and dedication."
      },
      {
        name: "Hard vs Hardly, Late vs Lately",
        formula: "Hard = with effort/solid; Hardly = barely/scarcely; Late = not on time; Lately = recently",
        usage: "'Hardly' and 'lately' have completely different meanings from 'hard' and 'late'.",
        correctExample: "He works hard every day, so he hardly ever fails an exam.",
        wrongExample: "He works hardly every day, so he hard fails an exam."
      }
    ]
  },

  // =========================================================================
  // 8. PREPOSITIONS & DEPENDENT COLLOCATIONS 🧭
  // =========================================================================
  {
    id: "guide_prepositions",
    category: "Prepositions & Collocations",
    icon: "🧭",
    level: "All Levels",
    title: "Prepositions of Time, Place & Collocations",
    summary: "At/On/In rules for time and location, dependent prepositions, and verbs that take no prepositions.",
    rules: [
      {
        name: "Prepositions of Time (At / On / In)",
        formula: "At + Specific Time; On + Days/Dates; In + Months/Years/Seasons/Centuries",
        usage: "Use 'at 5 PM', 'on Monday / on 15th August', and 'in July / in 2026 / in summer'.",
        correctExample: "The conference starts at 9:00 AM on Monday in October.",
        wrongExample: "The conference starts in 9:00 AM at Monday on October."
      },
      {
        name: "Since vs For in Time Periods",
        formula: "Since + Exact Starting Point (2020, Monday, 8 AM); For + Duration (3 years, 4 days)",
        usage: "'Since' specifies when the action began; 'for' measures the length of elapsed time.",
        correctExample: "I have been living in this city for four years, since 2022.",
        wrongExample: "I have been living in this city since four years."
      },
      {
        name: "Essential Dependent Prepositions",
        formula: "Interested in, Good at, Congratulate on, Proud of, Differ from, Comply with",
        usage: "English verbs and adjectives bind to specific prepositions that cannot be swapped.",
        correctExample: "I congratulated her on winning the award and praised her proficiency in coding.",
        wrongExample: "I congratulated her for winning the award and praised her proficiency at coding."
      },
      {
        name: "Verbs with NO Prepositions (Redundancy Traps)",
        formula: "Discuss (NOT discuss about), Order (NOT order for), Revert (NOT revert back), Marry (NOT marry with)",
        usage: "Transitive verbs take their direct object immediately without inserting unnecessary prepositions.",
        correctExample: "Let us discuss the quarterly budget and order lunch.",
        wrongExample: "Let us discuss about the quarterly budget and order for lunch."
      }
    ]
  },

  // =========================================================================
  // 9. CONJUNCTIONS & SENTENCE CONNECTORS 🔗
  // =========================================================================
  {
    id: "guide_conjunctions",
    category: "Conjunctions & Connectors",
    icon: "🔗",
    level: "Intermediate to Advanced",
    title: "Conjunctions, FANBOYS & Correlatives",
    summary: "Coordinating, subordinating, and correlative conjunctions with proper comma and clause coordination.",
    rules: [
      {
        name: "Coordinating Conjunctions (FANBOYS)",
        formula: "For, And, Nor, But, Or, Yet, So (Join words, phrases, or independent clauses with comma)",
        usage: "Use a comma before a FANBOYS conjunction when connecting two complete independent clauses.",
        correctExample: "She prepared thoroughly for the interview, so she answered every question with ease.",
        wrongExample: "She prepared thoroughly for the interview so she answered every question with ease (missing comma)."
      },
      {
        name: "Correlative Conjunction Pairs",
        formula: "Not only...but also, Either...or, Neither...nor, Both...and, Whether...or",
        usage: "Keep parallel grammatical structures after each element of a correlative pair.",
        correctExample: "He is not only an accomplished pianist but also a skilled violinist.",
        wrongExample: "He is not only an accomplished pianist but also plays violin skillfully."
      },
      {
        name: "Subordinating Conjunctions & Clause Punctuation",
        formula: "[Subordinating Clause], [Independent Clause]  OR  [Independent Clause] [Subordinating Clause]",
        usage: "If a sentence starts with 'Although', 'Because', 'While', or 'Since', place a comma after the dependent clause.",
        correctExample: "Although it rained heavily, we completed the football championship.",
        wrongExample: "Although it rained heavily we completed the football championship."
      },
      {
        name: "Avoid Double Conjunctions in One Sentence",
        formula: "Use EITHER 'Although' OR 'But'; EITHER 'Because' OR 'So' (Never both)",
        usage: "Do not pair 'Although...but' or 'Because...therefore' in the same sentence.",
        correctExample: "Although he worked hard, he did not clear the board exam.",
        wrongExample: "Although he worked hard, but he did not clear the board exam."
      }
    ]
  },

  // =========================================================================
  // 10. ACTIVE & PASSIVE VOICE TRANSFORMATION 🔄
  // =========================================================================
  {
    id: "guide_voice",
    category: "Active & Passive Voice",
    icon: "🔄",
    level: "Intermediate to Advanced",
    title: "Active & Passive Voice Mastery",
    summary: "Step-by-step conversion formulas across all tenses, modal verbs, and imperative sentences.",
    rules: [
      {
        name: "Universal Active to Passive Formula",
        formula: "Object + Auxiliary Verb (be / is / was / been / being) + Past Participle (V3) + by Subject",
        usage: "The receiver of the action becomes the subject of the passive sentence.",
        correctExample: "The chef cooked a gourmet meal. -> A gourmet meal was cooked by the chef.",
        wrongExample: "A gourmet meal was cooked from the chef."
      },
      {
        name: "Continuous Tenses in Passive",
        formula: "Present Cont: is/am/are + being + V3; Past Cont: was/were + being + V3",
        usage: "Always include 'being' when converting continuous tenses to passive voice.",
        correctExample: "Engineers are testing the software. -> The software is being tested by engineers.",
        wrongExample: "The software is testing by engineers."
      },
      {
        name: "Passive with Modal Auxiliaries",
        formula: "Subject + Modal (can/must/should/will) + be + Past Participle (V3)",
        usage: "Add 'be' after the modal followed by the third form (V3) of the main verb.",
        correctExample: "You must submit the assignment on Friday. -> The assignment must be submitted on Friday.",
        wrongExample: "The assignment must submitted on Friday."
      },
      {
        name: "Imperative Sentences in Passive",
        formula: "Let + Object + be + Past Participle (V3)  OR  You are requested/ordered to + Verb",
        usage: "Commands and requests transform into passive using 'Let' or polite request formulas.",
        correctExample: "Open the door. -> Let the door be opened.",
        wrongExample: "The door should open."
      }
    ]
  },

  // =========================================================================
  // 11. DIRECT & INDIRECT (REPORTED) SPEECH 💬
  // =========================================================================
  {
    id: "guide_narration",
    category: "Reported Speech",
    icon: "💬",
    level: "Intermediate to Advanced",
    title: "Direct & Indirect Speech Rules",
    summary: "Backshifting rules, reporting verbs, pronoun shifts, time/place conversions, and reporting questions.",
    rules: [
      {
        name: "Tense Backshifting in Reported Speech",
        formula: "Simple Present -> Simple Past; Present Continuous -> Past Continuous; Simple Past -> Past Perfect",
        usage: "When the reporting verb is in the past (e.g. 'said'), step each tense back one step into the past.",
        correctExample: "Direct: 'I am working,' she said. -> Indirect: She said that she was working.",
        wrongExample: "She said that she is working."
      },
      {
        name: "Time, Place & Pronoun Shifts",
        formula: "Now -> Then; Today -> That day; Tomorrow -> The next day; Yesterday -> The day before; Here -> There",
        usage: "Convert deictic time and place markers to reflect the reporting perspective.",
        correctExample: "Direct: 'I will visit tomorrow,' he said. -> Indirect: He said that he would visit the next day.",
        wrongExample: "He said that he will visit tomorrow."
      },
      {
        name: "Reporting Questions (Wh- and Yes/No)",
        formula: "Wh- questions keep Wh- word; Yes/No questions use 'if / whether' + Statement Word Order (Subject + Verb)",
        usage: "In indirect questions, eliminate auxiliary 'do/did' and avoid inverted question word order.",
        correctExample: "Direct: 'Where do you live?' -> Indirect: She asked me where I lived.",
        wrongExample: "She asked me where did I live."
      },
      {
        name: "Exception: Universal Truths & Scientific Facts",
        formula: "Universal Facts DO NOT backshift even with past reporting verbs",
        usage: "If the reported statement expresses a universal constant truth, maintain the present tense.",
        correctExample: "The science teacher said that water boils at 100 degrees Celsius.",
        wrongExample: "The science teacher said that water boiled at 100 degrees Celsius."
      }
    ]
  },

  // =========================================================================
  // 12. CONDITIONALS & SUBJUNCTIVE MOOD 🔮
  // =========================================================================
  {
    id: "guide_conditionals",
    category: "Conditionals & Subjunctive",
    icon: "🔮",
    level: "Intermediate to Advanced",
    title: "The 4 Conditionals & Subjunctive Mood",
    summary: "Zero, 1st, 2nd, 3rd, and Mixed Conditionals, plus formal mandate and hypothetical subjunctive.",
    rules: [
      {
        name: "Zero Conditional (Universal Truths)",
        formula: "If + Simple Present, Simple Present",
        usage: "Used for scientific facts, causes and direct automatic effects.",
        correctExample: "If you heat ice, it melts into water.",
        wrongExample: "If you heat ice, it will melt into water."
      },
      {
        name: "First Conditional (Real Possible Future)",
        formula: "If + Simple Present, Subject + will / can / may + Base Verb",
        usage: "Expresses a realistic condition in the present and its probable future result.",
        correctExample: "If you study hard, you will clear the university entrance exam.",
        wrongExample: "If you will study hard, you will clear the exam."
      },
      {
        name: "Second Conditional (Unreal Hypothetical)",
        formula: "If + Simple Past (use 'were' for all subjects), Subject + would + Base Verb",
        usage: "Hypothetical, imaginary, or impossible scenarios in the present or future.",
        correctExample: "If I were the CEO, I would implement a four-day workweek.",
        wrongExample: "If I was the CEO, I will implement a four-day workweek."
      },
      {
        name: "Third Conditional (Past Regrets & Unreal Past)",
        formula: "If + had + Past Participle (V3), Subject + would have + Past Participle (V3)",
        usage: "Refers to an unfulfilled condition in the past and its imaginary past result.",
        correctExample: "If we had left earlier, we would have caught the morning flight.",
        wrongExample: "If we would have left earlier, we would catch the flight."
      },
      {
        name: "Mandate Subjunctive in Formal English",
        formula: "Recommend / Insist / Demand / Suggest + that + Subject + Base Verb (Bare Infinitive)",
        usage: "Verbs of recommendation and urgency take the base verb form without -s or 'should'.",
        correctExample: "The doctor recommended that he take a two-week rest.",
        wrongExample: "The doctor recommended that he takes a two-week rest."
      }
    ]
  },

  // =========================================================================
  // 13. SENTENCE STRUCTURE & SVO WORD ORDER 🧱
  // =========================================================================
  {
    id: "guide_syntax",
    category: "Sentence Structure & Syntax",
    icon: "🧱",
    level: "Foundation to Advanced",
    title: "Sentence Structure, Clauses & SVO Order",
    summary: "Subject-Verb-Object (SVO) rules, simple/compound/complex sentences, run-on traps, and parallelism.",
    rules: [
      {
        name: "Standard SVO Word Order",
        formula: "Subject + Verb + Object (+ Manner + Place + Time)",
        usage: "English declarative sentences strictly follow SVO order. Avoid native tongue SOV inversions (e.g. 'I apple eat').",
        correctExample: "I eat an apple every morning at breakfast.",
        wrongExample: "I apple eat every morning at breakfast."
      },
      {
        name: "Avoiding Comma Splices & Run-On Sentences",
        formula: "Two independent clauses must be joined with a Semicolon (;) OR Comma + FANBOYS Conjunction",
        usage: "Do not join two complete thoughts with only a comma (comma splice).",
        correctExample: "The meeting concluded at noon; we went out for lunch together.",
        wrongExample: "The meeting concluded at noon, we went out for lunch together."
      },
      {
        name: "Parallel Structure in Lists & Comparisons",
        formula: "All items in a list must share the same grammatical form (all gerunds, all infinitives, or all nouns)",
        usage: "Ensure symmetry across coordinated verbs and descriptive clauses.",
        correctExample: "She loves swimming, jogging, and reading classic novels.",
        wrongExample: "She loves swimming, jogging, and to read classic novels."
      },
      {
        name: "Dangling & Misplaced Modifiers",
        formula: "Introductory modifier phrase must describe the subject immediately following the comma",
        usage: "Place descriptive phrases right beside the word they actually modify.",
        correctExample: "Walking through the forest, the hiker spotted a rare bird.",
        wrongExample: "Walking through the forest, a rare bird was spotted by the hiker."
      }
    ]
  },

  // =========================================================================
  // 14. MODAL AUXILIARY VERBS & NUANCES 🛡️
  // =========================================================================
  {
    id: "guide_modals",
    category: "Modal Auxiliaries",
    icon: "🛡️",
    level: "Intermediate to Advanced",
    title: "Modal Auxiliaries & Past Modal Deductions",
    summary: "Expressing ability, permission, necessity, advice, possibility, and past deductions.",
    rules: [
      {
        name: "Modal Auxiliaries Take Bare Infinitives",
        formula: "Can / Could / May / Might / Must / Should / Would + Base Verb (Never 'to + verb' or '-s')",
        usage: "Modal verbs are never followed by 'to' (except 'ought to' and 'used to') and never take '-s'.",
        correctExample: "She can speak four languages fluently and must attend the meeting.",
        wrongExample: "She can to speak four languages and must attends the meeting."
      },
      {
        name: "Modals in the Past (Past Deductions)",
        formula: "Must have + V3 (99% certainty); Could/Might have + V3 (possibility); Should have + V3 (unfulfilled advice)",
        usage: "Use modal + have + V3 to evaluate past actions and express regrets or logical deductions.",
        correctExample: "The streets are wet; it must have rained heavily last night.",
        wrongExample: "The streets are wet; it must rain heavily last night."
      },
      {
        name: "Can vs May (Ability vs Formal Permission)",
        formula: "Can = Physical/Mental Ability; May = Polite Formal Permission / Likelihood",
        usage: "Use 'May I' for polite requests and formal academic/workplace permission.",
        correctExample: "May I borrow your laptop for fifteen minutes?",
        wrongExample: "Can I borrow your laptop (informal/colloquial) in formal settings."
      }
    ]
  },

  // =========================================================================
  // 15. QUESTION FORMATION & QUESTION TAGS ❓
  // =========================================================================
  {
    id: "guide_questions",
    category: "Questions & Tags",
    icon: "❓",
    level: "All Levels",
    title: "Question Formation & Question Tags",
    summary: "Wh- question syntax, subject vs object questions, and golden rules for question tags.",
    rules: [
      {
        name: "Wh- Question Syntax",
        formula: "Wh- word + Auxiliary (do/does/did/is/are/have) + Subject + Main Verb?",
        usage: "Standard Wh- questions require an auxiliary verb before the subject.",
        correctExample: "Where did you purchase this wireless headset?",
        wrongExample: "Where you purchased this wireless headset?"
      },
      {
        name: "Subject Questions vs Object Questions",
        formula: "Subject Question: Wh- + Verb? (No auxiliary do/did); Object Question: Wh- + Auxiliary + Subject + Verb?",
        usage: "When the question word IS the subject doing the action, do not add 'do/does/did'.",
        correctExample: "Who called you this morning? (Subject) vs Whom did you call? (Object)",
        wrongExample: "Who did call you this morning?"
      },
      {
        name: "Golden Rules of Question Tags",
        formula: "Positive Statement -> Negative Tag; Negative Statement -> Positive Tag",
        usage: "Tags use the auxiliary verb from the statement and the pronoun matching the subject.",
        correctExample: "You have completed the assignment, haven't you? She didn't come, did she?",
        wrongExample: "You have completed the assignment, isn't it? (Avoid 'no?' or 'na?' or 'isn't it?')"
      },
      {
        name: "Special Question Tag Exceptions",
        formula: "I am -> aren't I?; Let's -> shall we?; Imperative -> will you / won't you?",
        usage: "Note the irregular tag forms for 'I am' and invitations starting with 'Let's'.",
        correctExample: "I am included in the project team, aren't I? Let's begin, shall we?",
        wrongExample: "I am included in the project team, am not I?"
      }
    ]
  },

  // =========================================================================
  // 16. PUNCTUATION, MECHANICS & REDUNDANCY TRAPS 🪤
  // =========================================================================
  {
    id: "guide_pitfalls",
    category: "Punctuation & Pitfalls",
    icon: "🪤",
    level: "All Levels",
    title: "Punctuation, Mechanics & Redundancy Traps",
    summary: "Apostrophes, contractions vs possessives, semicolons, and the top 10 redundancy errors to eliminate.",
    rules: [
      {
        name: "It's vs Its, You're vs Your, They're vs Their",
        formula: "It's = It is / It has; Its = Possessive of it; You're = You are; Your = Belonging to you",
        usage: "Possessive pronouns (its, hers, yours, theirs, whose) NEVER take an apostrophe.",
        correctExample: "It's obvious that the company values its employees and their well-being.",
        wrongExample: "Its obvious that the company values it's employees and there well-being."
      },
      {
        name: "Top 10 Indian English Redundancy Traps to Avoid",
        formula: "Eliminate repetitive words: 'revert' (not revert back), 'blunder' (not blunder mistake)",
        usage: "Avoid unnecessary duplications that weaken professional spoken and written communication.",
        correctExample: "Say 'I made a blunder' (NOT blunder mistake), 'repeat' (NOT repeat again), 'cope with' (NOT cope up with).",
        wrongExample: "I will revert back to you regarding that blunder mistake."
      },
      {
        name: "Semicolon (;) vs Colon (:) Usage",
        formula: "Semicolon connects closely related independent clauses; Colon introduces a list, quote, or explanation",
        usage: "Use semicolons where a period is too strong and a comma is too weak.",
        correctExample: "She had one major goal: to master English; she practiced every single day.",
        wrongExample: "She had one major goal; to master English: she practiced every single day."
      },
      {
        name: "Standard Capitalization Rules",
        formula: "First word of sentence, Proper nouns (Names, Places, Days, Months), Pronoun 'I', Acronyms",
        usage: "Common nouns (apple, school, doctor) are NOT capitalized mid-sentence unless part of an official title.",
        correctExample: "On Tuesday, Dr. Sharma and I traveled to Mumbai to attend the conference.",
        wrongExample: "On tuesday, dr. sharma and i traveled to mumbai to attend the Conference."
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
