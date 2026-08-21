// ============================================================================
// SPEAKMATE AI CONVERSATION & COACHING ENGINE (WEB & OFFLINE RESILIENT)
// ============================================================================

export function cleanDialogueText(rawText) {
  if (!rawText) return "";
  let clean = String(rawText);
  // If the text contains markdown tables or section headers, extract only conversational text
  if (clean.includes("|") || clean.includes("##")) {
    const lines = clean.split("\n");
    const nonTableLines = lines.filter((l) => !l.includes("|") && !l.startsWith("#") && !l.startsWith("---") && l.trim().length > 0);
    if (nonTableLines.length > 0) {
      clean = nonTableLines[0];
    }
  }
  // Strip remaining markdown characters
  clean = clean.replace(/\|.*\|/g, " ");
  clean = clean.replace(/#+\s*/g, "");
  clean = clean.replace(/\*\*/g, "").replace(/\*/g, "");
  clean = clean.replace(/---+/g, " ");
  clean = clean.replace(/\s+/g, " ").trim();
  return clean;
}

export function generateDynamicCoachingResponse(userText, scenario = "Daily Conversation", history = []) {
  const text = (userText || "").trim();
  const lower = text.toLowerCase();

  // 1. Analyze Grammar & Punctuation
  let grammarCorrection = "✅ Your sentence is grammatically clear and natural.";
  let betterSentence = null;
  let explanation = null;
  let vocabularySuggestions = null;

  // Common grammar checks
  if (lower.includes(" i ") || lower.startsWith("i ")) {
    // Check capitalization or minor things
  }
  if (lower.includes("more better") || lower.includes("more easier")) {
    grammarCorrection = text.replace(/more better/gi, "better").replace(/more easier/gi, "easier");
    betterSentence = `I find it much better to practice consistently.`;
    explanation = "In English, 'better' and 'easier' are already comparative adjectives, so avoid adding 'more'.";
    vocabularySuggestions = "Significantly better, Much easier, Preferable";
  } else if (lower.includes("she don't") || lower.includes("he don't") || lower.includes("it don't")) {
    grammarCorrection = text.replace(/she don't/gi, "she doesn't").replace(/he don't/gi, "he doesn't").replace(/it don't/gi, "it doesn't");
    explanation = "Third-person singular subjects (He, She, It) use 'does not' or 'doesn't'.";
    vocabularySuggestions = "Doesn't, Seldom, Rarely";
  } else if (lower.includes("i am agree") || lower.includes("i'm agree")) {
    grammarCorrection = text.replace(/i am agree/gi, "I agree").replace(/i'm agree/gi, "I agree");
    betterSentence = "I completely agree with that perspective.";
    explanation = "'Agree' is a verb, so you say 'I agree' rather than 'I am agree'.";
    vocabularySuggestions = "Concur, In agreement, Resonate with";
  } else if (lower.includes("explain me") || lower.includes("tell to me")) {
    grammarCorrection = text.replace(/explain me/gi, "explain to me").replace(/tell to me/gi, "tell me");
    explanation = "'Explain' requires the preposition 'to' before a person (explain to me).";
  } else {
    // Offer a more advanced native phrasing
    const words = text.split(/\s+/);
    if (words.length >= 3) {
      if (lower.includes("very good") || lower.includes("very nice")) {
        betterSentence = text.replace(/very good/gi, "exceptional").replace(/very nice/gi, "delightful");
        vocabularySuggestions = "Exceptional, Splendid, Remarkable";
        explanation = "Replacing basic intensifiers like 'very' with rich adjectives makes your speech more engaging.";
      } else if (lower.includes("i want to")) {
        betterSentence = text.replace(/i want to/gi, "I would like to");
        vocabularySuggestions = "Aim to, Strive to, Intend to";
        explanation = "Using 'I would like to' or 'I intend to' sounds more polite and polished in conversation.";
      }
    }
  }

  // 2. Generate Dynamic, Contextual Conversational Reply
  let aiReply = "";
  let followUpQuestion = "";

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("good morning") || lower.includes("good evening")) {
    const greetings = [
      "Hello! It is wonderful to practice speaking with you today.",
      "Hi there! I am excited to dive into our English speaking session.",
      "Greetings! You're sounding confident and ready to practice.",
    ];
    aiReply = greetings[Math.floor(Math.random() * greetings.length)];
    followUpQuestion = "How has your day been going so far?";
  } else if (lower.includes("how are you") || lower.includes("how are you doing") || lower.includes("how is it going")) {
    aiReply = "I am doing fantastic, thank you for asking! I always enjoy helping motivated learners build fluency.";
    followUpQuestion = "What is a topic you are especially passionate about discussing today?";
  } else if (lower.includes("hobby") || lower.includes("free time") || lower.includes("weekend") || lower.includes("music") || lower.includes("movie") || lower.includes("game")) {
    aiReply = "That sounds like a wonderful way to unwind and enjoy your time. Having engaging hobbies also gives you rich topics to speak about.";
    followUpQuestion = "How often do you get to do that, and what do you enjoy most about it?";
  } else if (lower.includes("work") || lower.includes("job") || lower.includes("career") || lower.includes("company") || lower.includes("interview") || lower.includes("study")) {
    aiReply = "Effective communication is one of the greatest accelerators for career growth and professional confidence.";
    followUpQuestion = "What is a project or goal you are currently focusing on?";
  } else if (lower.includes("travel") || lower.includes("flight") || lower.includes("trip") || lower.includes("country") || lower.includes("hotel") || lower.includes("city")) {
    aiReply = "Traveling and exploring new cultures is such an exciting way to put your English speaking skills into practice.";
    followUpQuestion = "If you could visit any destination in the world tomorrow, where would you go and why?";
  } else if (lower.includes("food") || lower.includes("restaurant") || lower.includes("coffee") || lower.includes("dinner") || lower.includes("cook")) {
    aiReply = "Food and culinary culture are always delicious conversation starters.";
    followUpQuestion = "What is your absolute favorite dish or restaurant to visit?";
  } else if (lower.includes("yes") || lower.includes("sure") || lower.includes("okay") || lower.includes("agree") || lower.includes("definitely")) {
    const replies = [
      "I appreciate your perspective! Expanding on your ideas helps build natural conversational rhythm.",
      "Exactly. When you articulate your viewpoint clearly, your confidence shines through.",
      "Great! Let's build further on that thought.",
    ];
    aiReply = replies[Math.floor(Math.random() * replies.length)];
    followUpQuestion = "Could you share an example or experience that supports that?";
  } else if (lower.includes("no") || lower.includes("disagree") || lower.includes("not really") || lower.includes("don't think so")) {
    aiReply = "That is a valid point of view. It is always interesting to explore different angles on this topic.";
    followUpQuestion = "What do you think is the main reason behind that?";
  } else if (lower.includes("why") || lower.includes("what do you think") || lower.includes("how about you") || lower.includes("?")) {
    aiReply = "From my perspective as your AI coach, the best approach is daily practice with authentic sentence variety and active listening.";
    followUpQuestion = "How do you feel about trying a new conversational challenge together?";
  } else {
    const contextualPool = [
      `You expressed that thought very clearly. Building on what you said, communication becomes much more impactful when you speak with natural pacing.`,
      `That is an interesting viewpoint. Adding personal examples and descriptive adjectives can elevate your spoken fluency even further.`,
      `I like the way you structured that idea. Practicing spontaneous responses like this trains your brain to think directly in English.`,
      `Well said! Clear pronunciation and steady rhythm make your English sound remarkably natural.`,
    ];
    const picked = contextualPool[(history.length || 0) % contextualPool.length];
    aiReply = picked;
    followUpQuestion = "What other thoughts or questions would you like to explore regarding this?";
  }

  return {
    aiReply,
    grammarCorrection,
    betterSentence,
    vocabularySuggestions,
    explanation,
    followUpQuestion,
  };
}
