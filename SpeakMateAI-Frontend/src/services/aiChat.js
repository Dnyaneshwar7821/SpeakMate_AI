const buildReply = (message) => {
  const normalized = message.toLowerCase().trim();

  if (!normalized) {
    return "Please type a message so I can help you practice.";
  }

  if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("hey")) {
    return "Hello! I am ready to help you practice. Tell me what you want to say in English.";
  }

  if (normalized.includes("thank") || normalized.includes("thanks")) {
    return "You are welcome. I am happy to help you sound clearer and more confident.";
  }

  if (normalized.includes("interview")) {
    return "That is a strong topic for practice. A polished version could be: 'I am excited to discuss how I can contribute to your team.'";
  }

  if (normalized.includes("work") || normalized.includes("job") || normalized.includes("career")) {
    return "That sounds like a useful conversation. A more natural version could be: 'I would love to learn more about the role and how I can contribute.'";
  }

  if (normalized.includes("travel") || normalized.includes("holiday") || normalized.includes("trip")) {
    return "Great choice. You could say: 'I really enjoy traveling because it helps me experience new cultures and meet new people.'";
  }

  if (normalized.includes("school") || normalized.includes("study") || normalized.includes("learn")) {
    return "That is a smart topic to practice. A clearer phrasing could be: 'I am focusing on improving my communication skills so I can speak more confidently.'";
  }

  if (normalized.includes("restaurant") || normalized.includes("food") || normalized.includes("order")) {
    return "That is a practical everyday topic. A natural sentence could be: 'Can I please see the menu and get a recommendation?'";
  }

  if (normalized.includes("meeting") || normalized.includes("presentation") || normalized.includes("team")) {
    return "That is a solid business-English topic. A polished version could be: 'I would like to share a quick update on our progress today.'";
  }

  if (normalized.includes("shopping") || normalized.includes("buy") || normalized.includes("store")) {
    return "That is a useful real-life conversation. You could say: 'I am looking for something practical and affordable.'";
  }

  if (normalized.includes("introduce") || normalized.includes("self-introduction") || normalized.includes("my name")) {
    return "That is a great first step. A fluent introduction could be: 'My name is Alex, and I am a student who enjoys learning new skills.'";
  }

  if (normalized.includes("business") || normalized.includes("client") || normalized.includes("email")) {
    return "That is a smart professional topic. A stronger version could be: 'I would be happy to help with that and provide an update shortly.'";
  }

  if (normalized.includes("help") || normalized.includes("how")) {
    return "That is a thoughtful question. A smoother version could be: 'Could you please help me understand this more clearly?'";
  }

  if (normalized.includes("?")) {
    return "That is a thoughtful question. A more natural reply could be: 'I would be happy to explain that in a simpler way.'";
  }

  const alternatives = [
    `I like that idea. You can say: "${message}" in a more natural way by slowing down and using simpler words.`,
    `That is a useful sentence to practice. I can help you make it sound smoother and more confident.`,
    `Nice point. Let us refine it together so it sounds more polished and natural.`,
    `That sounds meaningful. I can help you turn it into a clearer and more fluent sentence.`,
  ];

  return alternatives[Math.floor(Math.random() * alternatives.length)];
};

export const sendMessage = async (message) => {
  const reply = buildReply(message);

  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({ data: { reply } });
    }, 700);
  });
};

export default sendMessage;
