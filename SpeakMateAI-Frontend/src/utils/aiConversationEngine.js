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
    vocabularySuggestions = "Concur, See eye to eye, Endorse";
  } else if (lower.includes("last night i go") || lower.includes("yesterday i go")) {
    grammarCorrection = text.replace(/i go/gi, "I went");
    betterSentence = "Yesterday I went there and enjoyed the experience.";
    explanation = "When describing completed actions in the past, use the simple past tense 'went'.";
    vocabularySuggestions = "Visited, Attended, Explored";
  } else if (lower.length > 5 && !/[.!?]$/.test(text)) {
    betterSentence = `${text.charAt(0).toUpperCase() + text.slice(1)}.`;
  }

  // 2. Contextual Dynamic Replies based on scenario and user turn
  const count = (history || []).length;
  const s = (scenario || "").toLowerCase();

  let aiReply = "That is a great thought! What other details would you like to share about this topic?";
  let followUpQuestion = "How do you feel about practicing this in real-life conversations?";

  if (s.includes("interview") || s.includes("job") || s.includes("career")) {
    const replies = [
      "That highlights your dedication and strengths well. Could you describe a challenging project and how you solved it?",
      "Excellent explanation. What key technical or team skills are you focusing on improving next?",
      "Very clear and professional answer! Where do you see yourself making the biggest impact in your role?",
    ];
    aiReply = replies[count % replies.length];
    followUpQuestion = "Would you like to practice answering a question about your team leadership experience?";
  } else if (s.includes("restaurant") || s.includes("food") || s.includes("cafe")) {
    const replies = [
      "That sounds delicious! Would you prefer that with an appetizer or a refreshing drink?",
      "Certainly! Our chef prepares that fresh daily. Can I get you any dessert or the check when you're ready?",
      "Great choice! How would you like that prepared today?",
    ];
    aiReply = replies[count % replies.length];
    followUpQuestion = "Would you like to practice asking for the dessert menu or the bill?";
  } else if (s.includes("travel") || s.includes("hotel") || s.includes("airport")) {
    const replies = [
      "Traveling to new destinations is always thrilling! What has been the most memorable place you've ever explored?",
      "I have your reservation details noted. Would you like a room with a city view or near the quiet garden?",
      "Sounds like a fantastic trip plan! What local cuisine or landmarks are you most looking forward to?",
    ];
    aiReply = replies[count % replies.length];
    followUpQuestion = "Shall we practice asking for local directions or booking tickets?";
  } else if (s.includes("zoo") || s.includes("animal") || s.includes("pet")) {
    const replies = [
      "Animals are fascinating! Monkeys and elephants are always fun to watch. Which animal is your top favorite?",
      "That is wonderful! Do you enjoy visiting wildlife sanctuaries or learning about ocean creatures?",
    ];
    aiReply = replies[count % replies.length];
    followUpQuestion = "What sounds or tricks do your favorite animals make?";
  } else {
    const replies = [
      "I really enjoy talking with you about this. What inspired your interest in this subject?",
      "That makes total sense! Speaking regularly like this is the fastest way to master natural fluency.",
      "Fantastic articulation! What is another activity or goal you are excited about this week?",
    ];
    aiReply = replies[count % replies.length];
    followUpQuestion = "What other English topic would you like to explore together next?";
  }

  return {
    aiReply,
    grammarCorrection,
    betterSentence,
    vocabularySuggestions,
    explanation,
    followUpQuestion,
    pronunciationScore: 92 + (count % 6),
    fluencyScore: 88 + (count % 8),
  };
}
