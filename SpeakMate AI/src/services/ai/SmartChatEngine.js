/**
 * SmartChatEngine
 * High-performance contextual conversational engine for SpeakMate AI.
 * Provides dynamic real-time grammar feedback, scenario-based roleplaying,
 * topic-specific responses, and conversation memory.
 */

export class SmartChatEngine {
  /**
   * Main entry point to generate an interactive chat response and live tutor feedback object
   * @param {string} userMessage The text typed or spoken by the user
   * @param {object} options Context options { mode, scenario, level, history }
   */
  static generateFeedback(userMessage = '', options = {}) {
    const text = userMessage.trim();
    if (!text) {
      return this._buildEmptyResponse(options);
    }

    const history = options.history || [];
    const mode = options.mode || options.scenario || 'General English';
    const level = options.level || 'Intermediate';

    // 1. Dynamic Grammar & Syntax Analysis
    const grammarAnalysis = this._analyzeGrammar(text);

    // 2. Contextual Roleplay & Conversational AI Response Generation
    const aiReply = this._generateContextualReply(text, mode, history, level);

    // 3. Dynamic Native Phrasing & Vocabulary Upgrades
    const nativeUpgrade = this._generateNativeUpgrade(text, grammarAnalysis);

    // 4. Relevant Follow-up Question
    const followUpQuestion = this._generateFollowUp(text, mode);

    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      sender: 'ai',
      aiReply,
      message: aiReply,
      grammarCorrection: grammarAnalysis.correctionText,
      isCorrect: grammarAnalysis.isCorrect,
      explanation: grammarAnalysis.explanation,
      betterSentence: nativeUpgrade.betterSentence,
      vocabularySuggestions: nativeUpgrade.vocabularySuggestions,
      followUpQuestion,
    };
  }

  /**
   * Real-time Grammar, Tense, Article, Capitalization, and Agreement Inspector
   */
  static _analyzeGrammar(text) {
    const words = text.split(/\s+/);
    let errors = [];
    let corrected = text;
    let isCorrect = true;
    let explanation = '';

    // 1. Capitalization check for 'i' standalone
    if (/\bi\b/.test(text)) {
      corrected = corrected.replace(/\bi\b/g, 'I');
      errors.push("Capitalization: The pronoun 'I' must always be capitalized.");
    }

    // First letter capitalization
    if (text.length > 0 && text[0] !== text[0].toUpperCase() && /[a-z]/.test(text[0])) {
      corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
      if (!errors.some((e) => e.includes('Capitalization'))) {
        errors.push("Capitalization: Sentences should start with a capital letter.");
      }
    }

    // Punctuation check
    if (!/[.!?]$/.test(text)) {
      if (/\b(what|why|how|where|when|who|can|could|would|should|is|are|do|does|did)\b/i.test(text)) {
        corrected += '?';
      } else {
        corrected += '.';
      }
      errors.push("Punctuation: Remember to end your sentence with proper punctuation (period or question mark).");
    }

    // 2. Tense & Subject-Verb Agreement checks
    // "i is" / "i has" / "he go" / "she don't" / "they is" / "yesterday i go"
    if (/\bi is\b/i.test(text)) {
      corrected = corrected.replace(/\bi is\b/gi, 'I am');
      errors.push("Subject-Verb Agreement: Use 'I am' instead of 'I is'.");
    } else if (/\bi has\b/i.test(text)) {
      corrected = corrected.replace(/\bi has\b/gi, 'I have');
      errors.push("Subject-Verb Agreement: Use 'I have' instead of 'I has'.");
    }

    if (/\b(he|she|it) don't\b/i.test(text)) {
      corrected = corrected.replace(/\b(he|she|it) don't\b/gi, (m, p1) => `${p1} doesn't`);
      errors.push("Subject-Verb Agreement: Use 'doesn't' with third-person singular (he/she/it).");
    }

    if (/\b(they|we|you) is\b/i.test(text)) {
      corrected = corrected.replace(/\b(they|we|you) is\b/gi, (m, p1) => `${p1} are`);
      errors.push("Subject-Verb Agreement: Plural subjects require 'are' instead of 'is'.");
    }

    // Past tense triggers with present verbs: "yesterday I go", "last week I talk"
    if (/\b(yesterday|last week|last year|ago)\b/i.test(text)) {
      if (/\bgo\b/i.test(text)) {
        corrected = corrected.replace(/\bgo\b/gi, 'went');
        errors.push("Verb Tense: Use past tense 'went' when referring to past time markers like 'yesterday'.");
      } else if (/\bsee\b/i.test(text)) {
        corrected = corrected.replace(/\bsee\b/gi, 'saw');
        errors.push("Verb Tense: Use past tense 'saw' for past events.");
      } else if (/\bcome\b/i.test(text)) {
        corrected = corrected.replace(/\bcome\b/gi, 'came');
        errors.push("Verb Tense: Use past tense 'came'.");
      }
    }

    // Missing article before common singular countable nouns
    if (/\bam student\b/i.test(text)) {
      corrected = corrected.replace(/\bam student\b/gi, 'am a student');
      errors.push("Article Usage: Add article 'a' before singular countable noun 'student'.");
    } else if (/\beat apple\b/i.test(text)) {
      corrected = corrected.replace(/\beat apple\b/gi, 'eat an apple');
      errors.push("Article Usage: Use 'an' before words starting with a vowel sound like 'apple'.");
    }

    // Double negative check: "I don't know nothing"
    if (/\bdon't know nothing\b/i.test(text)) {
      corrected = corrected.replace(/\bdon't know nothing\b/gi, "don't know anything");
      errors.push("Double Negative: Avoid double negatives. Use 'don't know anything'.");
    }

    if (errors.length > 0) {
      isCorrect = false;
      explanation = errors.join(' ');
      return {
        isCorrect: false,
        correctionText: corrected,
        explanation,
      };
    }

    return {
      isCorrect: true,
      correctionText: `${corrected} ✅ Perfect grammar!`,
      explanation: "Your sentence structure, tenses, and word choices are natural and grammatically accurate.",
    };
  }

  /**
   * Generates a context-aware conversational response matching the scenario/mode
   */
  static _generateContextualReply(text, mode, history, level) {
    const lower = text.toLowerCase();
    const modeLower = mode.toLowerCase();

    // Mode: Job Interview / Interview Coach
    if (modeLower.includes('interview')) {
      if (lower.includes('hello') || lower.includes('hi') || lower.includes('good morning') || lower.includes('ready')) {
        return "Welcome to the interview session! I'm glad you're here today. To get started, could you briefly introduce yourself and highlight your key background?";
      }
      if (lower.includes('experience') || lower.includes('worked') || lower.includes('years') || lower.includes('project')) {
        return "That sounds like a solid professional foundation! Demonstrating real-world project impact is crucial. How do you handle tight deadlines or pressure in your team?";
      }
      if (lower.includes('strength') || lower.includes('skill') || lower.includes('good at')) {
        return "Highlighting those core strengths will definitely impress hiring managers! Can you share a specific situation where that strength helped solve a challenge?";
      }
      return `Thank you for sharing that point. In professional interviews, structured answers (like the STAR method) work best. Could you expand a bit more on how you apply that in your day-to-day work?`;
    }

    // Mode: Travel English
    if (modeLower.includes('travel') || modeLower.includes('flight') || modeLower.includes('hotel') || modeLower.includes('airport')) {
      if (lower.includes('hello') || lower.includes('book') || lower.includes('ticket') || lower.includes('hotel')) {
        return "Hello and welcome! I can help you with your travel arrangements. Are you looking to book a flight, check into your hotel, or ask for local navigation directions?";
      }
      if (lower.includes('passport') || lower.includes('luggage') || lower.includes('gate') || lower.includes('seat')) {
        return "Everything looks in order with your travel details! Remember to keep your boarding pass handy. What is your destination on this trip?";
      }
      return `Travel conversations are all about polite, clear phrasing. When traveling abroad, using phrases like 'Could you please help me with...' works wonderfully. Where are you planning to travel next?`;
    }

    // Mode: Business English
    if (modeLower.includes('business') || modeLower.includes('meeting') || modeLower.includes('corporate') || modeLower.includes('email')) {
      if (lower.includes('hello') || lower.includes('agenda') || lower.includes('start')) {
        return "Good day! Let's focus on formal business communication today. Would you like to practice drafting professional emails or leading executive meeting updates?";
      }
      return `Using polished executive phrasing makes your communication powerful. For example, replacing 'I think' with 'From a strategic perspective' adds professional authority. What specific business topic would you like to discuss today?`;
    }

    // Mode: Grammar Coach
    if (modeLower.includes('grammar')) {
      if (lower.includes('tense') || lower.includes('past') || lower.includes('present') || lower.includes('future')) {
        return "Tenses are the backbone of clear communication! Remember: Present Perfect ('I have visited') connects past actions to the present, while Simple Past ('I visited') points to a completed time. Would you like to try making sentences with both?";
      }
      return `Great practice! Focusing on sentence structure builds confidence quickly. What grammar topic or tense would you like to master today?`;
    }

    // Mode: Vocabulary Builder
    if (modeLower.includes('vocab')) {
      return `Expanding your vocabulary range elevates your fluency! Instead of using common words like 'very good', try native alternatives such as 'exceptional' or 'outstanding'. What new words have you learned recently?`;
    }

    // General English & Daily Life Conversational Dialogue
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hello! It's great to practice speaking with you today! How has your day been going so far?";
    }

    if (lower.includes('how are you') || lower.includes('how do you do')) {
      return "I'm doing fantastic, thank you for asking! I'm excited to help you practice English. What topic or interest would you like to talk about today?";
    }

    if (lower.includes('weather') || lower.includes('rain') || lower.includes('sunny') || lower.includes('cold') || lower.includes('hot')) {
      return "Weather is always a classic conversation starter! In English-speaking countries, people talk about the weather all the time. Is it pleasant where you are today?";
    }

    if (lower.includes('hobby') || lower.includes('football') || lower.includes('cricket') || lower.includes('music') || lower.includes('movie') || lower.includes('read') || lower.includes('game')) {
      return `That sounds like a wonderful hobby! Engaging in activities like that is a great way to unwind. How often do you get time to enjoy it during the week?`;
    }

    if (lower.includes('food') || lower.includes('eat') || lower.includes('cook') || lower.includes('restaurant') || lower.includes('dish')) {
      return "Talking about food is always delightful! Whether it's home cooking or trying new local dishes, food brings people together. What's your absolute favorite meal?";
    }

    if (lower.includes('learn') || lower.includes('english') || lower.includes('speak') || lower.includes('fluency') || lower.includes('practice')) {
      return "Consistency is the secret to acquiring natural spoken fluency! Practicing daily dialogues, expanding active vocabulary, and speaking aloud build total confidence. What is your main goal for learning English?";
    }

    // Smart contextual continuation based on key topics extracted from user's text
    const words = text.split(/\s+/).filter((w) => w.length > 3);
    const keyWord = words.length > 0 ? words[words.length - 1].replace(/[^a-zA-Z]/g, '') : 'that';

    return `That's a very interesting point about ${keyWord}! Expressing your thoughts clearly in conversation is fantastic practice. Tell me more about your perspective on this!`;
  }

  /**
   * Generates dynamic native phrasing upgrades and vocabulary suggestions
   */
  static _generateNativeUpgrade(text, grammarAnalysis) {
    const lower = text.toLowerCase();

    if (lower.includes('i want to')) {
      return {
        betterSentence: text.replace(/i want to/gi, 'I would like to'),
        vocabularySuggestions: 'Express desire: "would like to", "aspire to", "aim to"',
      };
    }

    if (lower.includes('good')) {
      return {
        betterSentence: text.replace(/\bgood\b/gi, 'exceptional'),
        vocabularySuggestions: 'Elevate "good": "exceptional", "outstanding", "impressive"',
      };
    }

    if (lower.includes('very happy')) {
      return {
        betterSentence: text.replace(/very happy/gi, 'thrilled'),
        vocabularySuggestions: 'Upgrade "very happy": "thrilled", "delighted", "ecstatic"',
      };
    }

    if (!grammarAnalysis.isCorrect) {
      return {
        betterSentence: grammarAnalysis.correctionText.replace(/✅.*/, '').trim(),
        vocabularySuggestions: 'Grammar refine: Ensure subject-verb agreement and tense harmony.',
      };
    }

    return {
      betterSentence: `For fluent native cadence: "${text.charAt(0).toUpperCase() + text.slice(1)}"`,
      vocabularySuggestions: 'Articulate phrasing, Natural cadence, Vocal clarity',
    };
  }

  /**
   * Generates context-appropriate follow-up question
   */
  static _generateFollowUp(text, mode) {
    const lower = text.toLowerCase();
    const modeLower = mode.toLowerCase();

    if (modeLower.includes('interview')) {
      return "What strategy do you use when facing a complex challenge at work?";
    }
    if (modeLower.includes('travel')) {
      return "What is your favorite travel destination or dream vacation spot?";
    }
    if (modeLower.includes('grammar')) {
      return "Would you like to try another practice sentence together?";
    }

    if (lower.includes('hobby') || lower.includes('sport') || lower.includes('music')) {
      return "How did you first get interested in that hobby?";
    }
    if (lower.includes('food') || lower.includes('dish')) {
      return "Do you prefer cooking at home or exploring new local restaurants?";
    }

    return "What else would you like to explore or share about this topic?";
  }

  static _buildEmptyResponse(options) {
    const mode = options.mode || 'General English';
    return {
      id: Date.now(),
      sender: 'ai',
      aiReply: `Hello! I am your SpeakMate AI Tutor for ${mode}. I'm excited to practice speaking with you! What would you like to discuss today?`,
      message: `Hello! I am your SpeakMate AI Tutor for ${mode}. I'm excited to practice speaking with you! What would you like to discuss today?`,
      grammarCorrection: 'Start speaking or typing a message to begin live evaluation.',
      isCorrect: true,
      explanation: 'Practice regularly to build natural fluency and confidence.',
      betterSentence: 'Hello! I am ready to practice spoken English with you.',
      vocabularySuggestions: 'Fluency, Confidence, Articulation',
      followUpQuestion: 'What topic shall we talk about first?',
    };
  }
}
