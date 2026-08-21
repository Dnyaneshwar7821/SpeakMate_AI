// ============================================================================
// SPEAKMATE AI CONVERSATION & COACHING ENGINE (WEB & OFFLINE RESILIENT)
// ============================================================================

export function cleanDialogueText(rawText) {
  if (!rawText) return "";
  let clean = String(rawText);
  
  // If the response is a JSON string, parse the aiReply
  if (clean.trim().startsWith("{") && clean.trim().endsWith("}")) {
    try {
      const parsed = JSON.parse(clean);
      if (parsed.aiReply) return cleanDialogueText(parsed.aiReply);
    } catch (e) {}
  }

  // If the text contains markdown tables or section headers, filter out labels and tables
  if (clean.includes("|") || clean.includes("##") || clean.includes("---")) {
    const lines = clean.split("\n");
    const validLines = lines.filter((l) => {
      const trimmed = l.trim();
      return (
        !trimmed.includes("|") &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("---") &&
        !trimmed.toLowerCase().startsWith("text:") &&
        !trimmed.toLowerCase().startsWith("overall impression") &&
        !trimmed.toLowerCase().startsWith("feedback") &&
        !trimmed.endsWith(":") &&
        trimmed.length > 8
      );
    });
    if (validLines.length > 0) {
      clean = validLines.join(" ");
    }
  }

  // Strip remaining markdown and meta tags
  clean = clean.replace(/\|.*\|/g, " ");
  clean = clean.replace(/#+\s*/g, "");
  clean = clean.replace(/\*\*/g, "").replace(/\*/g, "");
  clean = clean.replace(/---+/g, " ");
  clean = clean.replace(/\[.*?\]/g, "");
  clean = clean.replace(/\(.*?\)/g, "");
  clean = clean.replace(/\s+/g, " ").trim();
  
  // If clean string is too short or is a leftover label, provide a natural conversational fallback
  if (clean.length < 5 || clean.toLowerCase() === "text" || clean.toLowerCase() === "overall impression") {
    clean = "That is a great thought! Can you tell me more about that?";
  }

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
    // Advanced native phrasing upgrades
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

  // 2. Dynamic, Highly Contextual Conversational Reply
  let aiReply = "";
  let followUpQuestion = "";

  if (lower.includes("routine") || lower.includes("daily routine") || lower.includes("morning routine") || lower.includes("schedule")) {
    aiReply = "I would love to learn about your daily schedule! Establishing a consistent routine is a great way to stay organized.";
    followUpQuestion = "What is the very first thing you like to do after waking up in the morning?";
  } else if (lower.includes("start") || lower.includes("get started") || lower.includes("ready") || lower.includes("let's begin")) {
    aiReply = "Awesome, let's jump right into our conversation! I'm here to help you speak with natural ease and confidence.";
    followUpQuestion = "To kick things off, how has your day been going so far?";
  } else if (lower.includes("ask me") || lower.includes("question") || lower.includes("topic")) {
    aiReply = "Certainly! Let's explore your interests and favorite activities.";
    followUpQuestion = "If you had an entire day free with no responsibilities, how would you choose to spend it?";
  } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("good morning") || lower.includes("good evening")) {
    aiReply = "Hello! It is wonderful to practice speaking with you today. You sound energized and ready to learn.";
    followUpQuestion = "What would you like to focus on in today's conversation?";
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
    aiReply = "I appreciate your perspective! Expanding on your ideas helps build natural conversational rhythm.";
    followUpQuestion = "Could you share an example or experience that supports that?";
  } else if (lower.includes("no") || lower.includes("disagree") || lower.includes("not really") || lower.includes("don't think so")) {
    aiReply = "That is a valid point of view. It is always interesting to explore different angles on this topic.";
    followUpQuestion = "What do you think is the main reason behind that?";
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
