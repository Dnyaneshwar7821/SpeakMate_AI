import { useState, useEffect, useRef } from "react";
import { vocabularyService, progressService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { useTheme } from "../context/ThemeContext";

// =========================================================================
// ONBOARDING CALIBRATED VOCABULARY CURRICULUMS (STUDENTS & INDIVIDUAL USERS)
// =========================================================================
const CURRICULUM_DATA = {
  // Students by Grade (1st to 10th Std)
  "1st Std": [
    { id: "v1_1", word: "Apple", phonetic: "/ˈæp.əl/", partOfSpeech: "noun", meaning: "A sweet round fruit that grows on trees.", exampleSentence: "An apple a day keeps the doctor away.", collocations: "fresh apple, red apple", synonym: "Fruit", favorite: true },
    { id: "v1_2", word: "Friend", phonetic: "/frend/", partOfSpeech: "noun", meaning: "A person you like and enjoy spending time with.", exampleSentence: "Sita is my best school friend.", collocations: "best friend, close friend", synonym: "Companion", favorite: false },
    { id: "v1_3", word: "Happy", phonetic: "/ˈhæp.i/", partOfSpeech: "adjective", meaning: "Feeling or showing pleasure, contentment, and joy.", exampleSentence: "I feel very happy on my birthday.", collocations: "happy smile, happy moment", synonym: "Joyful", favorite: false },
    { id: "v1_4", word: "Smile", phonetic: "/smaɪl/", partOfSpeech: "verb", meaning: "Form a pleased or happy facial expression.", exampleSentence: "Always smile when greeting your teacher.", collocations: "warm smile, bright smile", synonym: "Beam", favorite: false },
    { id: "v1_5", word: "Sunny", phonetic: "/ˈsʌn.i/", partOfSpeech: "adjective", meaning: "Bright with sunlight and pleasant warm weather.", exampleSentence: "It is a sunny morning for playing in the park.", collocations: "sunny day, sunny morning", synonym: "Bright", favorite: false },
  ],
  "2nd Std": [
    { id: "v2_1", word: "Routine", phonetic: "/ruːˈtiːn/", partOfSpeech: "noun", meaning: "A regular sequence of actions followed regularly.", exampleSentence: "Brushing teeth is part of my morning routine.", collocations: "daily routine, morning routine", synonym: "Schedule", favorite: true },
    { id: "v2_2", word: "Pencil", phonetic: "/ˈpen.səl/", partOfSpeech: "noun", meaning: "An instrument used for writing or drawing on paper.", exampleSentence: "I sharpened my yellow pencil for class.", collocations: "lead pencil, colored pencil", synonym: "Pen", favorite: false },
    { id: "v2_3", word: "Weather", phonetic: "/ˈweð.ər/", partOfSpeech: "noun", meaning: "The state of the atmosphere at a place and time.", exampleSentence: "The weather today is sunny and pleasant.", collocations: "nice weather, cold weather", synonym: "Climate", favorite: false },
    { id: "v2_4", word: "Playground", phonetic: "/ˈpleɪ.ɡraʊnd/", partOfSpeech: "noun", meaning: "An outdoor area provided for children to play.", exampleSentence: "We play on the swings in the playground.", collocations: "school playground, outdoor playground", synonym: "Park", favorite: false },
  ],
  "3rd Std": [
    { id: "v3_1", word: "Helper", phonetic: "/ˈhel.pər/", partOfSpeech: "noun", meaning: "A person who helps or assists others in daily life.", exampleSentence: "Firefighters are brave community helpers.", collocations: "community helper, helpful assistant", synonym: "Assistant", favorite: true },
    { id: "v3_2", word: "Action", phonetic: "/ˈæk.ʃən/", partOfSpeech: "noun", meaning: "The process of doing something or achieving an aim.", exampleSentence: "Running and jumping are active action words.", collocations: "take action, direct action", synonym: "Activity", favorite: false },
    { id: "v3_3", word: "Polite", phonetic: "/pəˈlaɪt/", partOfSpeech: "adjective", meaning: "Having or showing behavior that is respectful and considerate.", exampleSentence: "Saying please and thank you is very polite.", collocations: "polite behavior, polite request", synonym: "Courteous", favorite: false },
    { id: "v3_4", word: "Schedule", phonetic: "/ˈskedʒ.uːl/", partOfSpeech: "noun", meaning: "A plan that lists expected times for activities.", exampleSentence: "Check our school timetable schedule.", collocations: "daily schedule, busy schedule", synonym: "Timetable", favorite: false },
  ],
  "4th Std": [
    { id: "v4_1", word: "Expedition", phonetic: "/ˌek.spəˈdɪʃ.ən/", partOfSpeech: "noun", meaning: "A journey undertaken by a group with a specific purpose.", exampleSentence: "Astronauts launched a space expedition to Mars.", collocations: "scientific expedition, jungle expedition", synonym: "Journey", favorite: true },
    { id: "v4_2", word: "Direction", phonetic: "/daɪˈrek.ʃən/", partOfSpeech: "noun", meaning: "The course along which someone or something moves.", exampleSentence: "Turn left to find the school library direction.", collocations: "right direction, give directions", synonym: "Route", favorite: false },
    { id: "v4_3", word: "Habit", phonetic: "/ˈhæb.ɪt/", partOfSpeech: "noun", meaning: "A settled or regular tendency that is hard to give up.", exampleSentence: "Drinking clean water daily is a healthy habit.", collocations: "healthy habit, daily habit", synonym: "Practice", favorite: false },
  ],
  "5th Std": [
    { id: "v5_1", word: "Environment", phonetic: "/ɪnˈvaɪ.rən.mənt/", partOfSpeech: "noun", meaning: "The surroundings or conditions in which nature and humans live.", exampleSentence: "Planting trees protects our natural environment.", collocations: "protect environment, clean environment", synonym: "Surroundings", favorite: true },
    { id: "v5_2", word: "Experiment", phonetic: "/ɪkˈsper.ə.mənt/", partOfSpeech: "noun", meaning: "A scientific procedure undertaken to make a discovery.", exampleSentence: "We conducted a science experiment on plant growth.", collocations: "conduct experiment, science experiment", synonym: "Test", favorite: false },
    { id: "v5_3", word: "Recycle", phonetic: "/ˌriːˈsaɪ.kəl/", partOfSpeech: "verb", meaning: "Convert waste materials into reusable objects.", exampleSentence: "We recycle paper and plastic bottles at school.", collocations: "recycle waste, recycle plastic", synonym: "Reuse", favorite: false },
  ],
  "6th Std": [
    { id: "v6_1", word: "Robotics", phonetic: "/roʊˈbɑː.t̬ɪks/", partOfSpeech: "noun", meaning: "The branch of technology dealing with the design and use of robots.", exampleSentence: "She joined the school robotics club to build code.", collocations: "robotics club, advanced robotics", synonym: "Automation", favorite: true },
    { id: "v6_2", word: "Debate", phonetic: "/dɪˈbeɪt/", partOfSpeech: "noun", meaning: "A formal discussion on a particular topic in a public meeting.", exampleSentence: "Our team won the inter-school debate competition.", collocations: "lively debate, debate competition", synonym: "Discussion", favorite: false },
  ],
  "7th Std": [
    { id: "v7_1", word: "Conservation", phonetic: "/ˌkɑːn.sɚˈveɪ.ʃən/", partOfSpeech: "noun", meaning: "Prevention of wasteful use of a natural resource.", exampleSentence: "Water conservation is vital for future generations.", collocations: "wildlife conservation, resource conservation", synonym: "Preservation", favorite: true },
    { id: "v7_2", word: "Perspective", phonetic: "/pɚˈspek.tɪv/", partOfSpeech: "noun", meaning: "A particular attitude toward or way of regarding something.", exampleSentence: "Reading history gives us a broader perspective on life.", collocations: "fresh perspective, unique perspective", synonym: "Viewpoint", favorite: false },
  ],
  "8th Std": [
    { id: "v8_1", word: "Leadership", phonetic: "/ˈliː.dɚ.ʃɪp/", partOfSpeech: "noun", meaning: "The action of leading a group of people or an organization.", exampleSentence: "Student council develops strong leadership qualities.", collocations: "strong leadership, leadership qualities", synonym: "Guidance", favorite: true },
    { id: "v8_2", word: "Innovation", phonetic: "/ˌɪn.əˈveɪ.ʃən/", partOfSpeech: "noun", meaning: "A new method, idea, or product that creates positive change.", exampleSentence: "Artificial intelligence is a major technological innovation.", collocations: "technological innovation, foster innovation", synonym: "Novelty", favorite: false },
  ],
  "9th Std": [
    { id: "v9_1", word: "Diplomatic", phonetic: "/ˌdɪp.ləˈmæt̬.ɪk/", partOfSpeech: "adjective", meaning: "Handling sensitive situations tactfully and politely without offending.", exampleSentence: "He used diplomatic language to resolve peer conflict.", collocations: "diplomatic approach, diplomatic relations", synonym: "Tactful", favorite: true },
    { id: "v9_2", word: "Keynote", phonetic: "/ˈkiː.noʊt/", partOfSpeech: "noun", meaning: "A main speech outlining the central theme of a conference.", exampleSentence: "She delivered the opening keynote on climate change.", collocations: "keynote speech, keynote address", synonym: "Main theme", favorite: false },
  ],
  "10th Std": [
    { id: "v10_1", word: "Oratory", phonetic: "/ˈɔːr.ə.tɔːr.i/", partOfSpeech: "noun", meaning: "Formal public speaking characterized by high eloquence.", exampleSentence: "CEFR C1 mastery requires spontaneous oratory skill.", collocations: "powerful oratory, political oratory", synonym: "Eloquence", favorite: true },
    { id: "v10_2", word: "Simulation", phonetic: "/ˌsɪm.jəˈleɪ.ʃən/", partOfSpeech: "noun", meaning: "Imitation of a situation or process in realistic conditions.", exampleSentence: "We completed a 10th Board oral exam simulation.", collocations: "realistic simulation, computer simulation", synonym: "Model", favorite: false },
    { id: "v10_3", word: "Proficiency", phonetic: "/prəˈfɪʃ.ən.si/", partOfSpeech: "noun", meaning: "A high degree of skill, competence, and fluency.", exampleSentence: "Consistent speaking demonstrates English proficiency.", collocations: "high proficiency, language proficiency", synonym: "Competence", favorite: false },
  ],

  // Individual Users by Age Group
  Kids: [
    { id: "vk_1", word: "Cheerful", phonetic: "/ˈtʃɪr.fəl/", partOfSpeech: "adjective", meaning: "Noticeably happy, energetic, and optimistic.", exampleSentence: "She greeted her classmates with a cheerful smile.", collocations: "cheerful smile, cheerful mood", synonym: "Joyful", favorite: true },
    { id: "vk_2", word: "Adventure", phonetic: "/ədˈven.tʃɚ/", partOfSpeech: "noun", meaning: "An unusual, exciting, or daring experience.", exampleSentence: "We had a fun adventure in the treehouse.", collocations: "exciting adventure, space adventure", synonym: "Journey", favorite: false },
    { id: "vk_3", word: "Playful", phonetic: "/ˈpleɪ.fəl/", partOfSpeech: "adjective", meaning: "Fond of games and lighthearted amusement.", exampleSentence: "The playful kitten jumped on the soft cushion.", collocations: "playful puppy, playful mood", synonym: "Frisky", favorite: false },
  ],
  Teens: [
    { id: "vt_1", word: "Relatable", phonetic: "/rɪˈleɪ.t̬ə.bəl/", partOfSpeech: "adjective", meaning: "Enabling a person to feel that they can identify with it.", exampleSentence: "The song lyrics are very relatable to teenagers.", collocations: "relatable story, relatable character", synonym: "Understandable", favorite: true },
    { id: "vt_2", word: "Spontaneous", phonetic: "/spɑːnˈteɪ.ni.əs/", partOfSpeech: "adjective", meaning: "Performed or occurring as a result of a sudden impulse.", exampleSentence: "We took a spontaneous weekend bicycle trip.", collocations: "spontaneous decision, spontaneous reaction", synonym: "Unplanned", favorite: false },
    { id: "vt_3", word: "Collaborate", phonetic: "/kəˈlæb.ə.reɪt/", partOfSpeech: "verb", meaning: "Work jointly on an activity or creative project.", exampleSentence: "Our team collaborated to build the science project.", collocations: "collaborate closely, collaborate on", synonym: "Cooperate", favorite: false },
  ],
  "Young Adult": [
    { id: "vy_1", word: "Articulate", phonetic: "/ɑːrˈtɪk.jə.lət/", partOfSpeech: "adjective", meaning: "Having or showing the ability to speak fluently and coherently.", exampleSentence: "An articulate speaker can convey complex ideas effortlessly.", collocations: "articulate speaker, articulate thoughts", synonym: "Eloquent", favorite: true },
    { id: "vy_2", word: "Resilient", phonetic: "/rɪˈzɪl.jənt/", partOfSpeech: "adjective", meaning: "Able to withstand or recover quickly from difficult conditions.", exampleSentence: "She showed a resilient mindset throughout university.", collocations: "resilient mindset, resilient spirit", synonym: "Tough", favorite: false },
    { id: "vy_3", word: "Pragmatic", phonetic: "/præɡˈmæt̬.ɪk/", partOfSpeech: "adjective", meaning: "Dealing with things sensibly and realistically in a practical way.", exampleSentence: "They took a pragmatic approach to budget planning.", collocations: "pragmatic approach, pragmatic solution", synonym: "Practical", favorite: false },
    { id: "vy_4", word: "Tenacious", phonetic: "/təˈneɪ.ʃəs/", partOfSpeech: "adjective", meaning: "Tending to keep a firm hold of something; persistent.", exampleSentence: "Her tenacious effort helped her master English speaking.", collocations: "tenacious effort, tenacious spirit", synonym: "Persistent", favorite: false },
  ],
  Professional: [
    { id: "vw_1", word: "Strategic", phonetic: "/strəˈtiː.dʒɪk/", partOfSpeech: "adjective", meaning: "Carefully designed or planned to serve a clear advantage.", exampleSentence: "We established strategic milestones for quarterly goals.", collocations: "strategic planning, strategic decision", synonym: "Calculated", favorite: true },
    { id: "vw_2", word: "Leverage", phonetic: "/ˈlev.ɚ.ɪdʒ/", partOfSpeech: "verb", meaning: "Use something to maximum advantage.", exampleSentence: "We leverage AI technology to accelerate English learning.", collocations: "leverage technology, leverage strengths", synonym: "Utilize", favorite: false },
    { id: "vw_3", word: "Synergy", phonetic: "/ˈsɪn.ɚ.dʒi/", partOfSpeech: "noun", meaning: "The combined effect of items greater than the sum of their individual effects.", exampleSentence: "Team synergy enabled us to deliver the project early.", collocations: "team synergy, create synergy", synonym: "Harmony", favorite: false },
  ],
  Senior: [
    { id: "vs_1", word: "Serenity", phonetic: "/səˈren.ə.t̬i/", partOfSpeech: "noun", meaning: "The state of being calm, peaceful, and untroubled.", exampleSentence: "She enjoyed the morning serenity of her garden.", collocations: "peaceful serenity, morning serenity", synonym: "Tranquility", favorite: true },
    { id: "vs_2", word: "Nostalgia", phonetic: "/nɑːˈstæl.dʒə/", partOfSpeech: "noun", meaning: "A sentimental longing or affection for the past.", exampleSentence: "Looking at old family photos brought a wave of nostalgia.", collocations: "feeling of nostalgia, nostalgic memory", synonym: "Reminiscence", favorite: false },
    { id: "vs_3", word: "Wisdom", phonetic: "/ˈwɪz.dəm/", partOfSpeech: "noun", meaning: "The quality of having experience and sound judgment.", exampleSentence: "Her grandmother shared timeless wisdom on life and patience.", collocations: "timeless wisdom, words of wisdom", synonym: "Insight", favorite: false },
  ],
};

export function Vocabulary() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'flashcards', 'quiz'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordInput, setWordInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [userProfileTitle, setUserProfileTitle] = useState("My Vocabulary");

  // 3D Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Next-Level Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [mistakesList, setMistakesList] = useState([]);
  const [showMistakes, setShowMistakes] = useState(false);

  const loadVocabulary = async () => {
    setLoading(true);
    try {
      const savedAccType = localStorage.getItem("speakmate_account_type") || "INDIVIDUAL_USER";
      const savedGrade = localStorage.getItem("speakmate_school_grade") || "1st Std";
      const savedAge = localStorage.getItem("speakmate_age_group") || "Young Adult";

      let profileKey = "1st Std";
      let title = "Vocabulary";

      if (savedAccType === "STUDENT") {
        profileKey = savedGrade;
        title = `Student Standard: ${savedGrade}`;
      } else {
        if (savedAge.toLowerCase().includes("kid")) profileKey = "Kids";
        else if (savedAge.toLowerCase().includes("teen")) profileKey = "Teens";
        else if (savedAge.toLowerCase().includes("senior")) profileKey = "Senior";
        else if (savedAge.toLowerCase().includes("pro") || savedAge.toLowerCase().includes("work")) profileKey = "Professional";
        else profileKey = "Young Adult";
        title = `Age Group: ${savedAge}`;
      }

      setUserProfileTitle(title);

      const curatedBase = CURRICULUM_DATA[profileKey] || CURRICULUM_DATA["1st Std"];
      const backendWords = await vocabularyService.all().catch(() => []);

      const combined = [...(backendWords || [])];
      for (const cw of curatedBase) {
        if (!combined.some((w) => w.word.toLowerCase() === cw.word.toLowerCase())) {
          combined.push(cw);
        }
      }

      setItems(combined);
    } catch (e) {
      setItems(CURRICULUM_DATA["1st Std"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVocabulary();
  }, []);

  const handleSpeak = (text) => {
    if (!text) return;
    speakGlobalText(text, 1.0);
  };

  // Play audio on initial card mount in Flashcards tab
  useEffect(() => {
    if (activeTab === "flashcards" && items.length > 0 && items[cardIndex] && !isFlipped) {
      handleSpeak(items[cardIndex].word);
    }
  }, [activeTab, cardIndex]);

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.word && item.word.toLowerCase().includes(q)) ||
      (item.meaning && item.meaning.toLowerCase().includes(q));

    const matchesFilter = filterType === "all" || (filterType === "favorites" && item.favorite);
    return matchesSearch && matchesFilter;
  });

  const currentCard = filteredItems[cardIndex] || filteredItems[0];

  const handleAddWord = async () => {
    if (!wordInput.trim()) return;
    setAdding(true);
    try {
      const res = await vocabularyService.add(wordInput.trim());
      setWordInput("");
      setItems((prev) => [res, ...prev]);
    } catch (e) {
      const fallback = {
        id: "loc_" + Date.now(),
        word: wordInput.trim(),
        phonetic: `/${wordInput.trim().toLowerCase()}/`,
        partOfSpeech: "word",
        meaning: `Definition and conversational usage for ${wordInput.trim()}`,
        exampleSentence: `Practice using "${wordInput.trim()}" in daily English.`,
        collocations: `practice ${wordInput.trim()}`,
        favorite: false,
      };
      setItems((prev) => [fallback, ...prev]);
      setWordInput("");
    } finally {
      setAdding(false);
    }
  };

  const toggleFavorite = async (item) => {
    try {
      if (typeof item.id === "number" || !String(item.id).startsWith("v")) {
        await vocabularyService.toggleFavorite(item.id);
      }
      const updated = !item.favorite;
      setItems((prev) => prev.map((w) => (w.id === item.id ? { ...w, favorite: updated } : w)));
    } catch (e) {
      setItems((prev) => prev.map((w) => (w.id === item.id ? { ...w, favorite: !item.favorite } : w)));
    }
  };

  // 3D Flashcard Flip & Audio Trigger
  const handleCardClick = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    if (nextFlipped && currentCard) {
      // Tapping front card -> flips to back and AI speaks the meaning!
      handleSpeak(currentCard.meaning ? `${currentCard.word}. ${currentCard.meaning}` : currentCard.word);
    } else if (!nextFlipped && currentCard) {
      // Tapping back card -> speaks the word again as it turns back to front
      handleSpeak(currentCard.word);
    }
  };

  const handleSpeakerClick = (e, isBackSide = false) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (currentCard) {
      if (isBackSide) {
        handleSpeak(currentCard.meaning ? `${currentCard.word}. ${currentCard.meaning}` : currentCard.word);
      } else {
        handleSpeak(currentCard.word);
      }
    }
  };

  // Next-Level Multi-Format High-Accuracy Quiz
  const startQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setStreakCount(0);
    setMaxStreak(0);
    setQuizFinished(false);
    setMistakesList([]);
    setShowMistakes(false);
    setEarnedXP(0);

    const allPools = [
      ...items,
      ...CURRICULUM_DATA["1st Std"],
      ...CURRICULUM_DATA["3rd Std"],
      ...CURRICULUM_DATA["5th Std"],
      ...CURRICULUM_DATA["7th Std"],
      ...CURRICULUM_DATA["10th Std"],
      ...CURRICULUM_DATA["Young Adult"],
      ...CURRICULUM_DATA["Professional"],
    ];

    const uniquePool = [];
    const seenWords = new Set();
    for (const w of allPools) {
      if (w.word && !seenWords.has(w.word.toLowerCase().trim())) {
        seenWords.add(w.word.toLowerCase().trim());
        uniquePool.push(w);
      }
    }

    const activePool = items.length >= 5 ? items : uniquePool;
    const shuffledActive = [...activePool].sort(() => 0.5 - Math.random());
    const selectedTargets = shuffledActive.slice(0, 5);

    const questions = selectedTargets.map((item, idx) => {
      const qType = idx % 4;
      let questionBadge = "";
      let promptTitle = "";
      let promptSubtitle = "";
      let correctAnswer = "";
      let options = [];

      if (qType === 0 && item.exampleSentence) {
        questionBadge = "📝 Sentence Context";
        const regex = new RegExp(`\\b${item.word}\\b`, "gi");
        promptTitle = item.exampleSentence.replace(regex, "_______");
        promptSubtitle = "Choose the correct word to complete the sentence:";
        correctAnswer = item.word;

        const otherWords = uniquePool
          .filter((w) => w.word.toLowerCase() !== item.word.toLowerCase())
          .map((w) => w.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        options = [item.word, ...otherWords].sort(() => 0.5 - Math.random());
      } else if (qType === 1 && item.synonym && item.synonym !== "None" && item.synonym !== "Fruit") {
        questionBadge = "🔀 Synonym Finder";
        promptTitle = `Which word is the closest synonym for "${item.word}"?`;
        promptSubtitle = "Select the word with the most similar meaning:";
        correctAnswer = item.synonym;

        const otherSynonyms = uniquePool
          .filter((w) => w.synonym && w.synonym !== "None" && w.synonym.toLowerCase() !== item.synonym.toLowerCase())
          .map((w) => w.synonym)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        while (otherSynonyms.length < 3) {
          otherSynonyms.push(["Hesitation", "Confusion", "Disruption", "Hesitant"][otherSynonyms.length]);
        }

        options = [item.synonym, ...otherSynonyms].sort(() => 0.5 - Math.random());
      } else if (qType === 2) {
        questionBadge = "🔊 Listening Comprehension";
        promptTitle = `Listen to the pronunciation of "${item.word}"`;
        promptSubtitle = "What is the accurate definition of this word?";
        correctAnswer = item.meaning;

        const otherMeanings = uniquePool
          .filter((w) => w.meaning && w.meaning !== item.meaning)
          .map((w) => w.meaning)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        options = [item.meaning, ...otherMeanings].sort(() => 0.5 - Math.random());
      } else {
        questionBadge = "📖 Definition Match";
        promptTitle = `What is the correct definition of "${item.word}"?`;
        promptSubtitle = "Choose the precise meaning:";
        correctAnswer = item.meaning;

        const otherMeanings = uniquePool
          .filter((w) => w.meaning && w.meaning !== item.meaning)
          .map((w) => w.meaning)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        options = [item.meaning, ...otherMeanings].sort(() => 0.5 - Math.random());
      }

      return {
        id: `q_${idx}_${Date.now()}`,
        questionBadge,
        promptTitle,
        promptSubtitle,
        targetWord: item.word,
        correctAnswer,
        options,
        exampleSentence: item.exampleSentence,
        meaning: item.meaning,
      };
    });

    setQuizQuestions(questions);
    setActiveTab("quiz");
  };

  const submitQuizAnswer = (opt) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(opt);
    const currentQ = quizQuestions[currentQuizIdx];
    const isCorrect = opt === currentQ.correctAnswer;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreakCount(0);
      setMistakesList((prev) => [...prev, { ...currentQ, userAnswer: opt }]);
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    const totalQ = quizQuestions.length;
    const baseXP = quizScore * 20;
    const streakBonus = maxStreak >= 3 ? 25 : 0;
    const perfectBonus = quizScore === totalQ && totalQ > 0 ? 30 : 0;
    const totalAwarded = baseXP + streakBonus + perfectBonus;
    setEarnedXP(totalAwarded);

    try {
      const prog = await progressService.get().catch(() => null);
      if (prog) {
        await progressService.update({
          ...prog,
          xp: (prog.xp || 0) + totalAwarded,
          totalVocabularyWords: (prog.totalVocabularyWords || 0) + quizScore,
        });
      }
    } catch (e) {
      console.warn("Quiz progress update error:", e);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIdx < quizQuestions.length - 1) {
      setSelectedQuizAnswer(null);
      setCurrentQuizIdx((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-2xl shadow-sm">
              📚
            </span>
            Vocabulary Master
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 font-semibold text-sm">
            {userProfileTitle} • 3D Flashcards & Interactive AI Quizzes
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/80 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-300/80 dark:border-slate-700/80 w-fit shadow-inner">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "list"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            📖 My List
          </button>
          <button
            onClick={() => {
              if (!filteredItems.length) {
                alert("Please add vocabulary words to start flashcards.");
                return;
              }
              setCardIndex(0);
              setIsFlipped(false);
              setActiveTab("flashcards");
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "flashcards"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🃏 3D Flashcards
          </button>
          <button
            onClick={startQuiz}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "quiz"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🏆 AI Quiz
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MY LIST (WORD BANK WITH SAMPLE EXAMPLES & FAVORITE STARS)
      ========================================================================= */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Add Word Box */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                ✨ AI Word Lookup & Add
              </h2>
              <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">+10 XP</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium">
              Type any English word. SpeakMate AI automatically extracts phonetic IPA, pronunciation, meaning, and examples.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Eloquent, Resilient, Articulate..."
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <button
                onClick={handleAddWord}
                disabled={adding}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
              >
                {adding ? "Analyzing..." : "Add Word ✨"}
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search words, meanings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
            </div>

            <div className="flex gap-2">
              {[
                { key: "all", label: `All Words (${items.length})` },
                { key: "favorites", label: "⭐ Favorites" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    filterType === f.key
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Word Cards Grid with Favorite Stars */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-4xl mb-3 block">📖</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Words Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 font-medium">
                Add custom words above using the AI word lookup bar!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">{item.word}</h3>
                          {item.phonetic && (
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {item.phonetic}
                            </span>
                          )}
                          {item.partOfSpeech && (
                            <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase font-black px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-900">
                              {item.partOfSpeech}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeak(item.word)}
                          className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:scale-105 transition-all text-sm shadow-sm"
                          title="Listen Pronunciation"
                        >
                          🔊
                        </button>
                        <button
                          onClick={() => toggleFavorite(item)}
                          className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-500 flex items-center justify-center hover:scale-105 transition-all text-base shadow-sm"
                          title="Toggle Favorite"
                        >
                          {item.favorite ? "⭐" : "☆"}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold mb-3 leading-relaxed">
                      {item.meaning}
                    </p>

                    {item.exampleSentence && (
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 mb-3 text-xs text-slate-700 dark:text-slate-300 italic font-medium">
                        "{item.exampleSentence}"
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {item.collocations && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Collocations: </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{item.collocations}</span>
                      </p>
                    )}
                    {item.synonym && item.synonym !== "None" && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Synonym: </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.synonym}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: 3D FLASHCARDS (WORD -> TAP -> SPEAKS MEANING & FLIPS)
      ========================================================================= */}
      {activeTab === "flashcards" && currentCard && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400">
            <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-xl font-extrabold text-xs">
              CARD {cardIndex + 1} OF {filteredItems.length}
            </span>
            <button
              onClick={() => toggleFavorite(currentCard)}
              className="text-2xl hover:scale-110 transition-all p-1"
            >
              {currentCard.favorite ? "⭐" : "☆"}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((cardIndex + 1) / filteredItems.length) * 100}%` }}
            />
          </div>

          {/* Realistic 3D Flip Card Container */}
          <div
            style={{ perspective: "1000px" }}
            className="w-full h-[360px] cursor-pointer select-none"
            onClick={handleCardClick}
          >
            <div
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              className="w-full h-full relative"
            >
              {/* FRONT OF CARD (WORD ONLY - NO PHONETIC) */}
              <div
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-8 shadow-xl flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs uppercase font-black px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">
                    {currentCard.partOfSpeech || "Vocabulary Word"}
                  </span>
                  <button
                    onClick={handleSpeakerClick}
                    className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 hover:scale-105 transition-all text-sm"
                    title="Play Pronunciation"
                  >
                    🔊
                  </button>
                </div>

                <div className="text-center my-auto space-y-2">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentCard.word}
                  </h2>
                </div>

                <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">🔄</span> Tap card to reveal meaning
                </div>
              </div>

              {/* BACK OF CARD (MEANING + EXAMPLES) */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
                className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-8 shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {currentCard.word}
                    </span>
                    {currentCard.partOfSpeech && (
                      <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-900">
                        {currentCard.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleSpeakerClick(e, true)}
                    className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 hover:scale-105 transition-all text-sm"
                    title="Play Meaning Audio"
                  >
                    🔊
                  </button>
                </div>

                <div className="my-auto space-y-3 text-left overflow-y-auto max-h-[220px] pr-1">
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <p className="text-[11px] uppercase font-black text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                      <span>📖</span> MEANING & DEFINITION
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                      {currentCard.meaning}
                    </p>
                  </div>

                  {currentCard.exampleSentence && (
                    <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
                      <p className="text-[11px] uppercase font-black text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                        <span>💬</span> EXAMPLE IN CONTEXT
                      </p>
                      <p className="text-xs italic text-slate-800 dark:text-slate-200 font-medium">
                        "{currentCard.exampleSentence}"
                      </p>
                    </div>
                  )}

                  {currentCard.synonym && currentCard.synonym !== "None" && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      🌿 <span className="font-bold">Synonym:</span> {currentCard.synonym}
                    </div>
                  )}
                </div>

                <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">🔄</span> Tap card to hear word & flip back
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
              }}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              ← Previous
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev + 1) % filteredItems.length);
              }}
              className="px-6 py-3 bg-indigo-600 font-bold text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/30"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: NEXT-LEVEL MULTI-FORMAT HIGH-ACCURACY AI QUIZ
      ========================================================================= */}
      {activeTab === "quiz" && (
        <div className="max-w-xl mx-auto space-y-6">
          {!quizFinished && quizQuestions.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600 dark:text-slate-400 font-extrabold text-xs">
                  QUESTION {currentQuizIdx + 1} OF {quizQuestions.length}
                </span>
                <div className="flex items-center gap-3">
                  {streakCount >= 2 && (
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                      🔥 {streakCount} Streak!
                    </span>
                  )}
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">
                    Score: {quizScore} / {quizQuestions.length}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuizIdx + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50 border border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="bg-indigo-600 text-white text-xs uppercase font-extrabold px-3 py-1 rounded-lg shadow-sm">
                    {quizQuestions[currentQuizIdx]?.questionBadge}
                  </span>
                  <button
                    onClick={() => handleSpeak(quizQuestions[currentQuizIdx]?.promptTitle)}
                    className="p-2 bg-indigo-600 text-white rounded-full hover:scale-110 transition-all text-xs shadow-sm"
                  >
                    🔊
                  </button>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                  {quizQuestions[currentQuizIdx]?.promptTitle}
                </h2>
                {quizQuestions[currentQuizIdx]?.promptSubtitle && (
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                    {quizQuestions[currentQuizIdx]?.promptSubtitle}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {quizQuestions[currentQuizIdx]?.options.map((opt, i) => {
                  const isSel = selectedQuizAnswer === opt;
                  const isCorrect = opt === quizQuestions[currentQuizIdx]?.correctAnswer;
                  let btnClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-indigo-400";

                  if (selectedQuizAnswer !== null) {
                    if (isCorrect) {
                      btnClass = "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                    } else if (isSel && !isCorrect) {
                      btnClass = "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200 font-bold";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={selectedQuizAnswer !== null}
                      onClick={() => submitQuizAnswer(opt)}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all flex items-center gap-3 shadow-sm ${btnClass}`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {selectedQuizAnswer !== null && (
                <div className="bg-blue-50 dark:bg-slate-800/90 border border-blue-200 dark:border-blue-900/60 p-4 rounded-2xl text-xs space-y-1.5 shadow-sm">
                  <p className="font-extrabold text-blue-700 dark:text-blue-400">💡 Context & Meaning:</p>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">
                    <strong className="text-slate-900 dark:text-white">{quizQuestions[currentQuizIdx]?.targetWord}:</strong> {quizQuestions[currentQuizIdx]?.meaning}
                  </p>
                  {quizQuestions[currentQuizIdx]?.exampleSentence && (
                    <p className="italic text-slate-600 dark:text-slate-400 font-medium">
                      "{quizQuestions[currentQuizIdx]?.exampleSentence}"
                    </p>
                  )}
                </div>
              )}

              {/* Next Question */}
              {selectedQuizAnswer !== null && (
                <button
                  onClick={nextQuizQuestion}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-indigo-600/30"
                >
                  {currentQuizIdx < quizQuestions.length - 1 ? "Next Question →" : "Finish Quiz 🎉"}
                </button>
              )}
            </div>
          )}

          {/* Finished Celebration */}
          {quizFinished && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-4xl shadow-inner">
                🏆
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Quiz Completed!</h2>
                <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">
                  You scored <strong className="text-indigo-600 dark:text-indigo-400 font-black">{quizScore}</strong> out of {quizQuestions.length} correct!
                </p>
              </div>

              <div className="inline-block bg-emerald-500 text-white font-black px-6 py-2.5 rounded-2xl text-base shadow-md shadow-emerald-500/20">
                +{earnedXP} XP Earned ✨
              </div>

              {/* Mistakes Review */}
              {mistakesList.length > 0 ? (
                <div>
                  <button
                    onClick={() => setShowMistakes(!showMistakes)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {showMistakes ? "Hide Mistakes ▲" : `Review ${mistakesList.length} Mistakes ▼`}
                  </button>
                  {showMistakes && (
                    <div className="space-y-2 mt-3 text-left">
                      {mistakesList.map((m, i) => (
                        <div key={i} className="bg-rose-50 dark:bg-slate-800 p-3 rounded-2xl text-xs space-y-1 border border-rose-200 dark:border-rose-900">
                          <p className="font-bold text-slate-900 dark:text-white">{m.targetWord}</p>
                          <p className="text-rose-600 dark:text-rose-400 font-semibold">Your Answer: {m.userAnswer}</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold">Correct: {m.correctAnswer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-emerald-600 font-extrabold text-sm">🌟 100% Perfect Accuracy! 🌟</p>
              )}

              <div className="space-y-3 pt-4">
                <button
                  onClick={startQuiz}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/30"
                >
                  Retake Quiz with New Questions 🔄
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className="w-full py-3 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-sm"
                >
                  Back to Word Bank
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Vocabulary;
