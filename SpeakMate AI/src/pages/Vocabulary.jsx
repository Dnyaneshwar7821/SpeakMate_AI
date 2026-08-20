import { useState, useEffect, useRef } from "react";
import { vocabularyService, progressService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { recordVocabularyMastered } from "../utils/progressTracker";

// ==========================================
// COMPREHENSIVE CURATED DECKS FOR WEB APP
// ==========================================
export const CURATED_DECKS = {
  // --- SCHOOL STANDARDS (1st to 10th Std) ---
  "1st Std": [
    { id: "v1_1", word: "Apple", phonetic: "/ˈæp.əl/", partOfSpeech: "noun", meaning: "A sweet round fruit that grows on trees.", exampleSentence: "An apple a day keeps the doctor away.", collocations: "fresh apple, apple tree", synonym: "Fruit", antonym: "None", favorite: true, mastered: false },
    { id: "v1_2", word: "Friend", phonetic: "/frend/", partOfSpeech: "noun", meaning: "A person you like and spend time with.", exampleSentence: "Sita is my best school friend.", collocations: "best friend, close friend", synonym: "Companion", antonym: "Enemy", favorite: false, mastered: false },
    { id: "v1_3", word: "Happy", phonetic: "/ˈhæp.i/", partOfSpeech: "adjective", meaning: "Feeling or showing pleasure and joy.", exampleSentence: "I feel very happy on my birthday.", collocations: "happy smile, happy day", synonym: "Joyful", antonym: "Sad", favorite: false, mastered: false },
    { id: "v1_4", word: "Smile", phonetic: "/smaɪl/", partOfSpeech: "verb", meaning: "Form a happy facial expression with mouth.", exampleSentence: "Always smile when greeting your teacher.", collocations: "bright smile, gentle smile", synonym: "Beam", antonym: "Frown", favorite: false, mastered: false },
    { id: "v1_5", word: "Sunny", phonetic: "/ˈsʌn.i/", partOfSpeech: "adjective", meaning: "Bright with sunlight and warm weather.", exampleSentence: "It is a sunny morning for playing in the park.", collocations: "sunny day, sunny morning", synonym: "Bright", antonym: "Cloudy", favorite: false, mastered: false },
  ],
  "2nd Std": [
    { id: "v2_1", word: "Routine", phonetic: "/ruːˈtiːn/", partOfSpeech: "noun", meaning: "A regular sequence of daily actions.", exampleSentence: "Brushing teeth is part of my morning routine.", collocations: "daily routine, morning routine", synonym: "Schedule", antonym: "Disorder", favorite: true, mastered: false },
    { id: "v2_2", word: "Pencil", phonetic: "/ˈpen.səl/", partOfSpeech: "noun", meaning: "An instrument used for writing or drawing.", exampleSentence: "I sharpened my yellow pencil for class.", collocations: "lead pencil, color pencil", synonym: "Pen", antonym: "None", favorite: false, mastered: false },
    { id: "v2_3", word: "Weather", phonetic: "/ˈweð.ər/", partOfSpeech: "noun", meaning: "The state of the atmosphere (sunny, rainy, etc.).", exampleSentence: "The weather today is sunny and bright.", collocations: "nice weather, rainy weather", synonym: "Climate", antonym: "None", favorite: false, mastered: false },
    { id: "v2_4", word: "Playground", phonetic: "/ˈpleɪ.ɡraʊnd/", partOfSpeech: "noun", meaning: "An outdoor area for children to play games.", exampleSentence: "We play on the swings in the playground.", collocations: "school playground, outdoor playground", synonym: "Park", antonym: "None", favorite: false, mastered: false },
  ],
  "3rd Std": [
    { id: "v3_1", word: "Helper", phonetic: "/ˈhel.pər/", partOfSpeech: "noun", meaning: "A person who helps or assists others.", exampleSentence: "Firefighters are brave community helpers.", collocations: "community helper, eager helper", synonym: "Assistant", antonym: "Opponent", favorite: true, mastered: false },
    { id: "v3_2", word: "Action", phonetic: "/ˈæk.ʃən/", partOfSpeech: "noun", meaning: "The process of doing something or performing a verb.", exampleSentence: "Running and jumping are action words.", collocations: "take action, direct action", synonym: "Activity", antonym: "Inaction", favorite: false, mastered: false },
    { id: "v3_3", word: "Polite", phonetic: "/pəˈlaɪt/", partOfSpeech: "adjective", meaning: "Having good manners and showing respect.", exampleSentence: "Saying \"thank you\" is very polite.", collocations: "polite request, polite greeting", synonym: "Courteous", antonym: "Rude", favorite: false, mastered: false },
    { id: "v3_4", word: "Schedule", phonetic: "/ˈskedʒ.uːl/", partOfSpeech: "noun", meaning: "A plan that lists times for activities.", exampleSentence: "Check our school timetable schedule.", collocations: "busy schedule, daily schedule", synonym: "Timetable", antonym: "None", favorite: false, mastered: false },
  ],
  "4th Std": [
    { id: "v4_1", word: "Expedition", phonetic: "/ˌek.spəˈdɪʃ.ən/", partOfSpeech: "noun", meaning: "A journey undertaken for a specific purpose.", exampleSentence: "Astronauts launched a space expedition to Mars.", collocations: "scientific expedition, jungle expedition", synonym: "Journey", antonym: "Stay", favorite: true, mastered: false },
    { id: "v4_2", word: "Direction", phonetic: "/daɪˈrek.ʃən/", partOfSpeech: "noun", meaning: "The course along which someone or something moves.", exampleSentence: "Turn left to find the school library direction.", collocations: "right direction, give directions", synonym: "Route", antonym: "None", favorite: false, mastered: false },
    { id: "v4_3", word: "Habit", phonetic: "/ˈhæb.ɪt/", partOfSpeech: "noun", meaning: "A settled or regular tendency or practice.", exampleSentence: "Drinking water daily is a healthy habit.", collocations: "healthy habit, daily habit", synonym: "Practice", antonym: "None", favorite: false, mastered: false },
  ],
  "5th Std": [
    { id: "v5_1", word: "Environment", phonetic: "/ɪnˈvaɪ.rən.mənt/", partOfSpeech: "noun", meaning: "The surroundings or conditions in which we live.", exampleSentence: "Planting trees protects our natural environment.", collocations: "clean environment, protect environment", synonym: "Surroundings", antonym: "None", favorite: true, mastered: false },
    { id: "v5_2", word: "Experiment", phonetic: "/ɪkˈsper.ə.mənt/", partOfSpeech: "noun", meaning: "A scientific procedure undertaken to make a discovery.", exampleSentence: "We conducted a science experiment on plant growth.", collocations: "conduct experiment, science experiment", synonym: "Test", antonym: "Theory", favorite: false, mastered: false },
    { id: "v5_3", word: "Recycle", phonetic: "/ˌriːˈsaɪ.kəl/", partOfSpeech: "verb", meaning: "Convert waste materials into reusable objects.", exampleSentence: "We recycle paper and plastic bottles at school.", collocations: "recycle plastic, recycle paper", synonym: "Reuse", antonym: "Waste", favorite: false, mastered: false },
  ],
  "6th Std": [
    { id: "v6_1", word: "Robotics", phonetic: "/roʊˈbɑː.t̬ɪks/", partOfSpeech: "noun", meaning: "The branch of technology dealing with robots.", exampleSentence: "She joined the school robotics club to build code.", collocations: "robotics club, advanced robotics", synonym: "Automation", antonym: "None", favorite: true, mastered: false },
    { id: "v6_2", word: "Debate", phonetic: "/dɪˈbeɪt/", partOfSpeech: "noun", meaning: "A formal discussion on a particular topic in public.", exampleSentence: "Our team won the inter-school debate competition.", collocations: "lively debate, debate competition", synonym: "Discussion", antonym: "Agreement", favorite: false, mastered: false },
    { id: "v6_3", word: "Assistance", phonetic: "/əˈsɪs.təns/", partOfSpeech: "noun", meaning: "Help or support given to someone.", exampleSentence: "The teacher offered polite assistance during the test.", collocations: "financial assistance, mutual assistance", synonym: "Aid", antonym: "Hindrance", favorite: false, mastered: false },
  ],
  "7th Std": [
    { id: "v7_1", word: "Conservation", phonetic: "/ˌkɑːn.sɚˈveɪ.ʃən/", partOfSpeech: "noun", meaning: "Prevention of wasteful use of a resource.", exampleSentence: "Water conservation is vital for future generations.", collocations: "wildlife conservation, energy conservation", synonym: "Preservation", antonym: "Destruction", favorite: true, mastered: false },
    { id: "v7_2", word: "Delegate", phonetic: "/ˈdel.ə.ɡeɪt/", partOfSpeech: "verb", meaning: "Entrust a task or responsibility to another person.", exampleSentence: "The leader delegates responsibilities to team members.", collocations: "delegate authority, delegate tasks", synonym: "Assign", antonym: "Withhold", favorite: false, mastered: false },
    { id: "v7_3", word: "Perspective", phonetic: "/pɚˈspek.tɪv/", partOfSpeech: "noun", meaning: "A particular attitude toward or way of regarding something.", exampleSentence: "Reading history gives us a broader perspective on life.", collocations: "fresh perspective, unique perspective", synonym: "Viewpoint", antonym: "None", favorite: false, mastered: false },
  ],
  "8th Std": [
    { id: "v8_1", word: "Leadership", phonetic: "/ˈliː.dɚ.ʃɪp/", partOfSpeech: "noun", meaning: "The action of leading a group or organization.", exampleSentence: "Student council develops strong leadership qualities.", collocations: "strong leadership, leadership qualities", synonym: "Guidance", antonym: "Subordination", favorite: true, mastered: false },
    { id: "v8_2", word: "Rebuttal", phonetic: "/rɪˈbʌt̬.əl/", partOfSpeech: "noun", meaning: "A refutation or contradiction in a formal debate.", exampleSentence: "She delivered a powerful rebuttal during the debate.", collocations: "effective rebuttal, offer rebuttal", synonym: "Refutation", antonym: "Confirmation", favorite: false, mastered: false },
    { id: "v8_3", word: "Innovation", phonetic: "/ˌɪn.əˈveɪ.ʃən/", partOfSpeech: "noun", meaning: "A new method, idea, or product.", exampleSentence: "Artificial intelligence is a major technological innovation.", collocations: "technological innovation, foster innovation", synonym: "Novelty", antonym: "Stagnation", favorite: false, mastered: false },
  ],
  "9th Std": [
    { id: "v9_1", word: "Diplomatic", phonetic: "/ˌdɪp.ləˈmæt̬.ɪk/", partOfSpeech: "adjective", meaning: "Handling sensitive situations tactfully and politely.", exampleSentence: "He used diplomatic language to resolve peer conflict.", collocations: "diplomatic approach, diplomatic relations", synonym: "Tactful", antonym: "Tactless", favorite: true, mastered: false },
    { id: "v9_2", word: "Keynote", phonetic: "/ˈkiː.noʊt/", partOfSpeech: "noun", meaning: "A main speech outlining the central theme of a summit.", exampleSentence: "She delivered the opening keynote on climate change.", collocations: "keynote speaker, keynote address", synonym: "Main theme", antonym: "None", favorite: false, mastered: false },
    { id: "v9_3", word: "Rhetoric", phonetic: "/ˈret.ər.ɪk/", partOfSpeech: "noun", meaning: "The art of effective or persuasive speaking and writing.", exampleSentence: "Mastering rhetoric enhances spoken essay presentations.", collocations: "persuasive rhetoric, political rhetoric", synonym: "Eloquence", antonym: "None", favorite: false, mastered: false },
  ],
  "10th Std": [
    { id: "v10_1", word: "Oratory", phonetic: "/ˈɔːr.ə.tɔːr.i/", partOfSpeech: "noun", meaning: "Formal public speaking characterized by high eloquence.", exampleSentence: "CEFR C1 mastery requires spontaneous oratory skill.", collocations: "powerful oratory, political oratory", synonym: "Eloquence", antonym: "Inarticulacy", favorite: true, mastered: false },
    { id: "v10_2", word: "Simulation", phonetic: "/ˌsɪm.jəˈleɪ.ʃən/", partOfSpeech: "noun", meaning: "Imitation of a situation or process in realistic conditions.", exampleSentence: "We completed a 10th Board oral exam simulation.", collocations: "computer simulation, realistic simulation", synonym: "Model", antonym: "Reality", favorite: false, mastered: false },
    { id: "v10_3", word: "Modulation", phonetic: "/ˌmɑː.dʒəˈleɪ.ʃən/", partOfSpeech: "noun", meaning: "Varying the pitch or tone of voice for expressive effect.", exampleSentence: "Vocal modulation makes speeches captivating.", collocations: "voice modulation, tone modulation", synonym: "Inflection", antonym: "Monotone", favorite: false, mastered: false },
  ],

  // --- INDIVIDUAL USER THEMES ---
  "Kids (6-12)": [
    { id: "vk_1", word: "Cheerful", phonetic: "/ˈtʃɪr.fəl/", partOfSpeech: "adjective", meaning: "Noticeably happy and optimistic.", exampleSentence: "She greeted her classmates with a cheerful smile.", collocations: "cheerful voice, cheerful mood", synonym: "Joyful", antonym: "Gloomy", favorite: true, mastered: false },
    { id: "vk_2", word: "Adventure", phonetic: "/ədˈven.tʃɚ/", partOfSpeech: "noun", meaning: "An unusual and exciting or daring experience.", exampleSentence: "We had a fun adventure in the treehouse.", collocations: "exciting adventure, space adventure", synonym: "Journey", antonym: "Routine", favorite: false, mastered: false },
    { id: "vk_3", word: "Playful", phonetic: "/ˈpleɪ.fəl/", partOfSpeech: "adjective", meaning: "Fond of games and amusement; lighthearted.", exampleSentence: "The playful kitten jumped on the soft cushion.", collocations: "playful puppy, playful kitten", synonym: "Frisky", antonym: "Serious", favorite: false, mastered: false },
  ],
  "Teens (13-17)": [
    { id: "vt_1", word: "Relatable", phonetic: "/rɪˈleɪ.t̬ə.bəl/", partOfSpeech: "adjective", meaning: "Enabling a person to feel that they can understand or identify with it.", exampleSentence: "The singer lyrics are very relatable to teens.", collocations: "relatable story, relatable character", synonym: "Understandable", antonym: "Distant", favorite: true, mastered: false },
    { id: "vt_2", word: "Spontaneous", phonetic: "/spɑːnˈteɪ.ni.əs/", partOfSpeech: "adjective", meaning: "Performed or occurring as a result of a sudden impulse without planning.", exampleSentence: "We took a spontaneous weekend bicycle trip.", collocations: "spontaneous decision, spontaneous reaction", synonym: "Unplanned", antonym: "Premeditated", favorite: false, mastered: false },
    { id: "vt_3", word: "Collaborate", phonetic: "/kəˈlæb.ə.reɪt/", partOfSpeech: "verb", meaning: "Work jointly on an activity or project.", exampleSentence: "Our team collaborated to build the science project.", collocations: "collaborate closely, collaborate on", synonym: "Cooperate", antonym: "Compete", favorite: false, mastered: false },
  ],
  "Young Adults (18-24)": [
    { id: "vy_1", word: "Articulate", phonetic: "/ɑːrˈtɪk.jə.lət/", partOfSpeech: "adjective", meaning: "Having or showing the ability to speak fluently and coherently.", exampleSentence: "An articulate speaker can convey complex ideas effortlessly.", collocations: "articulate speaker, articulate thoughts", synonym: "Eloquent", antonym: "Inarticulate", favorite: true, mastered: false },
    { id: "vy_2", word: "Resilient", phonetic: "/rɪˈzɪl.jənt/", partOfSpeech: "adjective", meaning: "Able to withstand or recover quickly from difficult conditions.", exampleSentence: "She showed a resilient mindset throughout university.", collocations: "resilient mindset, resilient economy", synonym: "Tough", antonym: "Fragile", favorite: false, mastered: false },
    { id: "vy_3", word: "Pragmatic", phonetic: "/præɡˈmæt̬.ɪk/", partOfSpeech: "adjective", meaning: "Dealing with things sensibly and realistically in a practical way.", exampleSentence: "They took a pragmatic approach to budget planning.", collocations: "pragmatic solution, pragmatic approach", synonym: "Practical", antonym: "Idealistic", favorite: false, mastered: false },
  ],
  "Working Adults (25-50)": [
    { id: "vw_1", word: "Strategic", phonetic: "/strəˈtiː.dʒɪk/", partOfSpeech: "adjective", meaning: "Carefully designed or planned to serve a particular purpose or advantage.", exampleSentence: "We established strategic milestones for quarterly goals.", collocations: "strategic planning, strategic decision", synonym: "Calculated", antonym: "Random", favorite: true, mastered: false },
    { id: "vw_2", word: "Leverage", phonetic: "/ˈlev.ɚ.ɪdʒ/", partOfSpeech: "verb", meaning: "Use something to maximum advantage.", exampleSentence: "We leverage AI technology to accelerate English learning.", collocations: "leverage technology, leverage strengths", synonym: "Utilize", antonym: "Ignore", favorite: false, mastered: false },
    { id: "vw_3", word: "Synergy", phonetic: "/ˈsɪn.ɚ.dʒi/", partOfSpeech: "noun", meaning: "The interaction of elements that when combined produce a total effect greater than the sum.", exampleSentence: "Team synergy enabled us to deliver the project ahead of schedule.", collocations: "team synergy, create synergy", synonym: "Collaboration", antonym: "Conflict", favorite: false, mastered: false },
  ],
  "Everyday Idioms": [
    { id: "vi_1", word: "Break the ice", phonetic: "/breɪk ðiː aɪs/", partOfSpeech: "idiom", meaning: "Do or say something to relieve tension or get conversation started.", exampleSentence: "Playing a quick name game helped break the ice at the workshop.", collocations: "break the ice smoothly, break the ice with a joke", synonym: "Initiate conversation", antonym: "Freeze up", favorite: true, mastered: false },
    { id: "vi_2", word: "Piece of cake", phonetic: "/piːs ʌv keɪk/", partOfSpeech: "idiom", meaning: "Something that is very easy to do.", exampleSentence: "The English vocabulary quiz was a piece of cake.", collocations: "absolute piece of cake, total piece of cake", synonym: "Effortless", antonym: "Hard task", favorite: false, mastered: false },
    { id: "vi_3", word: "Bite the bullet", phonetic: "/baɪt ðə ˈbʊl.ɪt/", partOfSpeech: "idiom", meaning: "Face a difficult situation with courage and fortitude.", exampleSentence: "I decided to bite the bullet and give the live presentation.", collocations: "bite the bullet and speak", synonym: "Face bravely", antonym: "Hesitate", favorite: false, mastered: false },
  ],
  "IELTS Academic": [
    { id: "vie_1", word: "Ubiquitous", phonetic: "/juːˈbɪk.wə.t̬əs/", partOfSpeech: "adjective", meaning: "Present, appearing, or found everywhere.", exampleSentence: "Smartphones have become ubiquitous in modern education.", collocations: "ubiquitous presence, become ubiquitous", synonym: "Omnipresent", antonym: "Rare", favorite: true, mastered: false },
    { id: "vie_2", word: "Substantiate", phonetic: "/səbˈstæn.ʃi.eɪt/", partOfSpeech: "verb", meaning: "Provide evidence to support or prove the truth of.", exampleSentence: "You must substantiate your thesis arguments with credible data.", collocations: "substantiate claims, substantiate findings", synonym: "Validate", antonym: "Disprove", favorite: false, mastered: false },
    { id: "vie_3", word: "Paramount", phonetic: "/ˈper.ə.maʊnt/", partOfSpeech: "adjective", meaning: "More important than anything else; supreme.", exampleSentence: "Consistent speaking practice is of paramount importance for fluency.", collocations: "paramount importance, paramount concern", synonym: "Supreme", antonym: "Trivial", favorite: false, mastered: false },
  ],
};

export function Vocabulary() {
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'flashcards', 'quiz'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordInput, setWordInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [speakingWord, setSpeakingWord] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState("1st Std");

  // Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Dynamic Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const loadVocabulary = async () => {
    setLoading(true);
    try {
      const data = await vocabularyService.all();
      setItems(data || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVocabulary();
  }, []);

  const handleSpeak = (text) => {
    if (!text) return;
    setSpeakingWord(text);
    speakGlobalText(text, 1.0, {
      onend: () => setSpeakingWord(null),
      onerror: () => setSpeakingWord(null),
    });
  };

  // Active Words
  const getActiveDeckWords = () => {
    if (selectedDeck === "My Custom Words") {
      return items;
    }
    return CURATED_DECKS[selectedDeck] || CURATED_DECKS["1st Std"];
  };

  const activeWords = getActiveDeckWords();
  const filteredItems = activeWords.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.word && item.word.toLowerCase().includes(q)) ||
      (item.meaning && item.meaning.toLowerCase().includes(q)) ||
      (item.collocations && item.collocations.toLowerCase().includes(q));

    let matchesFilter = true;
    if (filterType === "favorites") matchesFilter = Boolean(item.favorite);
    if (filterType === "mastered") matchesFilter = Boolean(item.mastered);
    if (filterType === "review") matchesFilter = !item.mastered;

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
        meaning: `Definition and usage for ${wordInput.trim()}`,
        exampleSentence: `Practice using "${wordInput.trim()}" in daily English.`,
        collocations: `practice ${wordInput.trim().toLowerCase()}`,
        favorite: false,
        mastered: false,
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
      if (CURATED_DECKS[selectedDeck]) {
        const found = CURATED_DECKS[selectedDeck].find((w) => w.id === item.id);
        if (found) found.favorite = updated;
      }
    } catch (e) {
      item.favorite = !item.favorite;
    }
  };

  const toggleMastered = async (item) => {
    const nextMastered = !item.mastered;
    try {
      if (typeof item.id === "number" || !String(item.id).startsWith("v")) {
        await vocabularyService.toggleMastered(item.id);
      }
      setItems((prev) => prev.map((w) => (w.id === item.id ? { ...w, mastered: nextMastered } : w)));
      if (CURATED_DECKS[selectedDeck]) {
        const found = CURATED_DECKS[selectedDeck].find((w) => w.id === item.id);
        if (found) found.mastered = nextMastered;
      }
      if (nextMastered) {
        recordVocabularyMastered(item.word);
      }
    } catch (e) {
      item.mastered = nextMastered;
    }
  };

  const startQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setEarnedXP(0);

    const sourcePool = [...activeWords, ...CURATED_DECKS["1st Std"], ...CURATED_DECKS["Young Adults (18-24)"]];
    const uniquePool = [];
    const seen = new Set();
    for (const w of sourcePool) {
      if (w.word && !seen.has(w.word.toLowerCase())) {
        seen.add(w.word.toLowerCase());
        uniquePool.push(w);
      }
    }

    const shuffled = [...uniquePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    const allMeanings = uniquePool.map((w) => w.meaning).filter(Boolean);

    const questions = selected.map((item, idx) => {
      const correctMeaning = item.meaning;
      const distractors = allMeanings
        .filter((m) => m !== correctMeaning)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      while (distractors.length < 3) {
        distractors.push("Expressing thoughts naturally in conversation.");
      }

      const options = [correctMeaning, ...distractors].sort(() => 0.5 - Math.random());
      return {
        id: `q_${idx}_${Date.now()}`,
        word: item.word,
        phonetic: item.phonetic,
        partOfSpeech: item.partOfSpeech,
        correctAnswer: correctMeaning,
        options,
        exampleSentence: item.exampleSentence,
      };
    });

    setQuizQuestions(questions);
    setActiveTab("quiz");
  };

  const submitQuizAnswer = (opt) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(opt);
    const isCorrect = opt === quizQuestions[currentQuizIdx]?.correctAnswer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    const finalScore = quizScore;
    const totalQ = quizQuestions.length;
    const baseXP = finalScore * 20;
    const bonus = finalScore === totalQ && totalQ > 0 ? 30 : 0;
    const totalAwarded = baseXP + bonus;
    setEarnedXP(totalAwarded);

    try {
      const prog = await progressService.get().catch(() => null);
      if (prog) {
        await progressService.update({
          ...prog,
          xp: (prog.xp || 0) + totalAwarded,
          totalVocabularyWords: (prog.totalVocabularyWords || 0) + finalScore,
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

  const allDecks = [
    "1st Std", "2nd Std", "3rd Std", "4th Std", "5th Std",
    "6th Std", "7th Std", "8th Std", "9th Std", "10th Std",
    "Kids (6-12)", "Teens (13-17)", "Young Adults (18-24)", "Working Adults (25-50)",
    "Everyday Idioms", "IELTS Academic", "My Custom Words"
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              📚
            </span>
            Vocabulary Master
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Standard Curriculums (1st–10th Std) & Curated Decks • 3D Flashcards & Adaptive AI Quizzes
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-fit">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "list"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            📖 Word Bank
          </button>
          <button
            onClick={() => {
              if (!filteredItems.length) {
                alert("Please select a deck with vocabulary words to start flashcards.");
                return;
              }
              setCardIndex(0);
              setIsFlipped(false);
              setActiveTab("flashcards");
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "flashcards"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🃏 3D Flashcards
          </button>
          <button
            onClick={startQuiz}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "quiz"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🏆 AI Quiz
          </button>
        </div>
      </div>

      {/* Deck Selector Bar */}
      {activeTab !== "quiz" && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {allDecks.map((deck) => {
            const isSel = selectedDeck === deck;
            return (
              <button
                key={deck}
                onClick={() => {
                  setSelectedDeck(deck);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSel
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                }`}
              >
                {deck}
              </button>
            );
          })}
        </div>
      )}

      {/* ==========================================
          TAB 1: WORD BANK
      ========================================== */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* AI Instant Lookup Box */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/40 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                ✨ Instant AI Word Lookup
              </h2>
              <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-full">+10 XP</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Enter any English word. SpeakMate AI extracts IPA phonetic transcription, part of speech, collocations, and contextual examples.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Eloquent, Resilient, Articulate..."
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddWord}
                disabled={adding}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
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
                placeholder={`Search in ${selectedDeck}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: `All (${activeWords.length})` },
                { key: "favorites", label: "⭐ Favorites" },
                { key: "mastered", label: "✅ Mastered" },
                { key: "review", label: "🔄 Learning" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === f.key
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Word Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <span className="text-4xl mb-3 block">📖</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Words in this View</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Add custom words above or explore another category from the top deck selector.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                              {item.phonetic}
                            </span>
                          )}
                          {item.partOfSpeech && (
                            <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                              {item.partOfSpeech}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSpeak(item.word)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition-all"
                          title="Listen Pronunciation"
                        >
                          🔊
                        </button>
                        <button
                          onClick={() => toggleFavorite(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          title="Toggle Favorite"
                        >
                          {item.favorite ? "⭐" : "☆"}
                        </button>
                        <button
                          onClick={() => toggleMastered(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          title="Toggle Mastered"
                        >
                          {item.mastered ? "✅" : "⭕"}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3">{item.meaning}</p>

                    {item.exampleSentence && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3 text-xs text-slate-600 dark:text-slate-400 italic">
                        "{item.exampleSentence}"
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    {item.collocations && (
                      <p className="text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Collocations: </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{item.collocations}</span>
                      </p>
                    )}
                    {item.synonym && item.synonym !== "None" && (
                      <p className="text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Synonyms: </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{item.synonym}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: 3D FLASHCARDS
      ========================================== */}
      {activeTab === "flashcards" && currentCard && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex justify-between items-center text-sm font-bold text-slate-500">
            <span>
              Deck: <strong className="text-indigo-600 dark:text-indigo-400">{selectedDeck}</strong>
            </span>
            <span>
              Card {cardIndex + 1} of {filteredItems.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((cardIndex + 1) / filteredItems.length) * 100}%` }}
            />
          </div>

          {/* Interactive Card */}
          <div
            onClick={() => {
              setIsFlipped(!isFlipped);
              handleSpeak(isFlipped ? currentCard.word : currentCard.meaning);
            }}
            className="cursor-pointer select-none min-h-[340px] bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs uppercase font-extrabold px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                {currentCard.partOfSpeech || "Vocabulary Word"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(`${currentCard.word}. ${currentCard.meaning}`);
                }}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 hover:scale-105 transition-all"
              >
                🔊
              </button>
            </div>

            {!isFlipped ? (
              <div className="text-center my-8 space-y-2">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">{currentCard.word}</h2>
                {currentCard.phonetic && (
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{currentCard.phonetic}</p>
                )}
              </div>
            ) : (
              <div className="my-6 space-y-4 text-center">
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentCard.word}</h3>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{currentCard.meaning}</p>
                {currentCard.exampleSentence && (
                  <p className="text-sm italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                    "{currentCard.exampleSentence}"
                  </p>
                )}
              </div>
            )}

            <div className="text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
              <span>🔄</span> Click card to {isFlipped ? "flip back" : "see definition & examples"}
            </div>
          </div>

          {/* Retention Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev + 1) % filteredItems.length);
              }}
              className="flex-1 py-3.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-extrabold rounded-2xl hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-all flex items-center justify-center gap-2"
            >
              🔄 Need Review
            </button>
            <button
              onClick={() => {
                toggleMastered(currentCard);
                setIsFlipped(false);
                setCardIndex((prev) => (prev + 1) % filteredItems.length);
              }}
              className="flex-1 py-3.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold rounded-2xl hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-all flex items-center justify-center gap-2"
            >
              ✅ Mastered (+15 XP)
            </button>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
              }}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              ← Previous
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev + 1) % filteredItems.length);
              }}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: INTERACTIVE AI QUIZ
      ========================================== */}
      {activeTab === "quiz" && (
        <div className="max-w-xl mx-auto space-y-6">
          {!quizFinished && quizQuestions.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500">
                  Question {currentQuizIdx + 1} of {quizQuestions.length}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">
                  Score: {quizScore} / {quizQuestions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuizIdx + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-extrabold text-indigo-500">Vocabulary Quiz</span>
                  <button
                    onClick={() => handleSpeak(quizQuestions[currentQuizIdx]?.word)}
                    className="p-1 text-indigo-600 dark:text-indigo-400 hover:scale-110"
                  >
                    🔊
                  </button>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  {quizQuestions[currentQuizIdx]?.word}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  What is the correct definition of this word?
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {quizQuestions[currentQuizIdx]?.options.map((opt, i) => {
                  const isSel = selectedQuizAnswer === opt;
                  const isCorrect = opt === quizQuestions[currentQuizIdx]?.correctAnswer;
                  let btnClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400";

                  if (selectedQuizAnswer !== null) {
                    if (isCorrect) {
                      btnClass = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                    } else if (isSel && !isCorrect) {
                      btnClass = "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={selectedQuizAnswer !== null}
                      onClick={() => submitQuizAnswer(opt)}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all flex items-center gap-3 ${btnClass}`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Next Question */}
              {selectedQuizAnswer !== null && (
                <button
                  onClick={nextQuizQuestion}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
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
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  You scored <strong className="text-indigo-600 dark:text-indigo-400">{quizScore}</strong> out of {quizQuestions.length} correct!
                </p>
              </div>

              <div className="inline-block bg-emerald-500 text-white font-black px-6 py-2.5 rounded-2xl text-base shadow-md shadow-emerald-500/20">
                +{earnedXP} XP Earned ✨
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={startQuiz}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/20"
                >
                  Retake Quiz with New Words 🔄
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className="w-full py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-sm"
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
