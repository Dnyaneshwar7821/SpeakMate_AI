import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakingService } from "../services/appServices";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useToast } from "../context/ToastContext";
import { warmupSpeechAutoplay } from "../utils/speechHelper";

// ─── Age-Wise Scenarios Data (10 scenarios per age group) ───────────────────
const AGE_SCENARIOS = {
  Kids: [
    { id: "k1", title: "Show & Tell", category: "General", difficulty: "Beginner", duration: 4, xp: 15, icon: "🎨", desc: "Share your favorite toy, book, or pet with your AI friend." },
    { id: "k2", title: "At the Zoo", category: "Daily Life", difficulty: "Beginner", duration: 5, xp: 15, icon: "🐾", desc: "Talk to the zoo guide about your favorite animals." },
    { id: "k3", title: "Ordering Ice Cream", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍦", desc: "Choose your favorite flavors and toppings at the ice cream shop." },
    { id: "k4", title: "My Favorite Superhero", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "⚡", desc: "Describe a superhero and their special powers!" },
    { id: "k5", title: "School Lunch Time", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍱", desc: "Chat with classmates about your lunch and playground games." },
    { id: "k6", title: "Space Adventure", category: "Travel", difficulty: "Intermediate", duration: 6, xp: 20, icon: "🚀", desc: "Explore new planets and talk to an alien space buddy." },
    { id: "k7", title: "Playing at the Park", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "⚽", desc: "Invite a friend to play on the swings and slides." },
    { id: "k8", title: "Birthday Party Fun", category: "General", difficulty: "Beginner", duration: 5, xp: 20, icon: "🎁", desc: "Wish a happy birthday, open gifts, and talk about party games." },
    { id: "k9", title: "Visiting the Doctor", category: "General", difficulty: "Intermediate", duration: 5, xp: 20, icon: "🩺", desc: "Explain how you feel to a friendly nurse or doctor." },
    { id: "k10", title: "Bedtime Story Time", category: "General", difficulty: "Intermediate", duration: 6, xp: 25, icon: "🌙", desc: "Co-create a fun bedtime fairytale with your AI coach." },
  ],
  Teens: [
    { id: "t1", title: "First Day at High School", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "🏫", desc: "Introduce yourself and make new friends at school." },
    { id: "t2", title: "Ordering Fast Food", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍔", desc: "Order burgers, fries, and drinks with your friends." },
    { id: "t3", title: "Gaming & Hobbies", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "🎮", desc: "Discuss your favorite video games, sports, and music bands." },
    { id: "t4", title: "Planning a Weekend Outing", category: "Daily Life", difficulty: "Intermediate", duration: 6, xp: 20, icon: "🎟️", desc: "Group chat to pick a movie or visit an amusement park." },
    { id: "t5", title: "Asking for Homework Help", category: "General", difficulty: "Intermediate", duration: 5, xp: 20, icon: "📚", desc: "Chat with a classmate or tutor about a tricky science assignment." },
    { id: "t6", title: "Shopping for Clothes", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "👕", desc: "Try on cool styles, check shoe sizes, and ask for discounts." },
    { id: "t7", title: "Preparing for School Exams", category: "Career", difficulty: "Intermediate", duration: 6, xp: 20, icon: "📓", desc: "Study session prep and sharing study tips with friends." },
    { id: "t8", title: "Joining a High School Club", category: "General", difficulty: "Intermediate", duration: 6, xp: 25, icon: "👥", desc: "Interview for the robotics, drama, or sports club." },
    { id: "t9", title: "Talking About Future Dreams", category: "Career", difficulty: "Advanced", duration: 7, xp: 30, icon: "🏆", desc: "Discuss dream colleges, tech careers, and personal goals." },
    { id: "t10", title: "Handling Peer Situations", category: "General", difficulty: "Advanced", duration: 7, xp: 30, icon: "💬", desc: "Resolve a misunderstanding with a friend politely." },
  ],
  "Young Adult": [
    { id: "y1", title: "Daily Conversation", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "💬", desc: "Chat about campus life, daily habits, and weekend plans." },
    { id: "y2", title: "Campus Coffee Shop", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "☕", desc: "Order artisan coffee, study snacks, and chat with baristas." },
    { id: "y3", title: "College Admission Interview", category: "Career", difficulty: "Intermediate", duration: 8, xp: 30, icon: "🎓", desc: "Answer admission questions and explain your choice of major." },
    { id: "y4", title: "Hostel & Roommate Chat", category: "Daily Life", difficulty: "Intermediate", duration: 5, xp: 20, icon: "🏠", desc: "Discuss sharing house chores, schedules, and groceries." },
    { id: "y5", title: "Backpacking & Travel", category: "Travel", difficulty: "Intermediate", duration: 6, xp: 25, icon: "✈️", desc: "Ask for local directions, book hostel beds, and meet travelers." },
    { id: "y6", title: "Part-time Job Interview", category: "Career", difficulty: "Intermediate", duration: 7, xp: 25, icon: "💼", desc: "Practice answering basic interview and customer service questions." },
    { id: "y7", title: "Attending a Tech Fest", category: "Career", difficulty: "Intermediate", duration: 6, xp: 25, icon: "⚙️", desc: "Network with peers and pitch ideas at a campus hackathon." },
    { id: "y8", title: "Renting Your First Apartment", category: "Daily Life", difficulty: "Advanced", duration: 7, xp: 30, icon: "🔑", desc: "Talk to a landlord about monthly rent, leases, and utilities." },
    { id: "y9", title: "Group Project Discussion", category: "General", difficulty: "Advanced", duration: 8, xp: 35, icon: "🖥️", desc: "Divide presentation roles and set project deadlines." },
    { id: "y10", title: "Public Speaking & Debate", category: "Work", difficulty: "Advanced", duration: 8, xp: 35, icon: "🎤", desc: "Pitch an argument clearly in a campus debate or presentation." },
  ],
  Professional: [
    { id: "p1", title: "Daily Conversation", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "💬", desc: "Chat about your day, hobbies, and general interests." },
    { id: "p2", title: "Ordering in Restaurant", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🍽️", desc: "Order food, ask about the menu, and pay the bill." },
    { id: "p3", title: "Hotel Check-in", category: "Travel", difficulty: "Beginner", duration: 5, xp: 20, icon: "🏨", desc: "Check in, request room services, and ask for local recommendations." },
    { id: "p4", title: "Airport Customs", category: "Travel", difficulty: "Intermediate", duration: 6, xp: 25, icon: "✈️", desc: "Declare items, answer security questions, and handle arrivals." },
    { id: "p5", title: "Office Small Talk", category: "Work", difficulty: "Intermediate", duration: 5, xp: 20, icon: "💼", desc: "Engage with colleagues, discuss weekends, and plan lunches." },
    { id: "p6", title: "Business Meeting", category: "Work", difficulty: "Advanced", duration: 8, xp: 30, icon: "👥", desc: "Present updates, pitch ideas, and negotiate corporate terms." },
    { id: "p7", title: "Job Interview Practice", category: "Career", difficulty: "Advanced", duration: 10, xp: 40, icon: "📄", desc: "Practice typical HR questions and explain your career goals." },
    { id: "p8", title: "Salary & Contract Negotiation", category: "Career", difficulty: "Advanced", duration: 8, xp: 35, icon: "💵", desc: "Negotiate compensation, benefits, and start date." },
    { id: "p9", title: "Presentation Skills", category: "Work", difficulty: "Advanced", duration: 7, xp: 30, icon: "🖼️", desc: "Practice starting, structuring, and concluding a keynote presentation." },
    { id: "p10", title: "Executive Coaching Session", category: "Work", difficulty: "Advanced", duration: 9, xp: 45, icon: "🎯", desc: "Refine high-level executive communication, leadership tone, and feedback." },
  ],
  Senior: [
    { id: "s1", title: "Relaxed Daily Conversation", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "💬", desc: "Chat comfortably about morning routines, weather, and life." },
    { id: "s2", title: "Tea Time & Gardening", category: "General", difficulty: "Beginner", duration: 5, xp: 15, icon: "🌿", desc: "Discuss plants, cooking recipes, and home hobbies." },
    { id: "s3", title: "Visiting the Pharmacy", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "🩺", desc: "Ask a pharmacist about prescription directions and advice." },
    { id: "s4", title: "Neighborhood Cafe", category: "Daily Life", difficulty: "Beginner", duration: 4, xp: 15, icon: "☕", desc: "Order breakfast and chat pleasantly with local staff." },
    { id: "s5", title: "Sharing Life Stories", category: "General", difficulty: "Intermediate", duration: 7, xp: 25, icon: "📖", desc: "Tell stories about childhood, family, and past trips." },
    { id: "s6", title: "Guided Museum Tour", category: "Travel", difficulty: "Intermediate", duration: 6, xp: 25, icon: "🏛️", desc: "Ask a tour guide questions about art, history, and culture." },
    { id: "s7", title: "Book & Movie Discussion", category: "General", difficulty: "Intermediate", duration: 6, xp: 25, icon: "🎬", desc: "Share thoughts on a favorite novel, movie, or biography." },
    { id: "s8", title: "Booking Holiday Travel", category: "Travel", difficulty: "Intermediate", duration: 6, xp: 25, icon: "🚆", desc: "Reserve train or plane tickets and ask about senior assistance." },
    { id: "s9", title: "Calling Customer Support", category: "Daily Life", difficulty: "Intermediate", duration: 5, xp: 20, icon: "📞", desc: "Get assistance with home internet, TV, or phone service." },
    { id: "s10", title: "Family & Grandchildren Chat", category: "General", difficulty: "Advanced", duration: 6, xp: 25, icon: "❤️", desc: "Practice modern terms and catch up with family news." },
  ],
};

// ─── School Grade Scenarios Data ─────────────────────────────────────────────
const STANDARD_SCENARIOS = {
  "1st Std": [
    { id: "std1_1", title: "Alphabet & Sounds Fun", category: "General", difficulty: "1st Std", duration: 4, xp: 15, icon: "🎨", desc: "Practice letters A to Z and phonics sounds with your SpeakMate AI teacher." },
    { id: "std1_2", title: "Colors & Drawing", category: "General", difficulty: "1st Std", duration: 4, xp: 15, icon: "🖌️", desc: "Describe your favorite colors and what you love to draw." },
    { id: "std1_3", title: "Animal Friends at Zoo", category: "Daily Life", difficulty: "1st Std", duration: 5, xp: 15, icon: "🐾", desc: "Talk about lions, monkeys, and elephants at the zoo." },
    { id: "std1_4", title: "Friendly School Greetings", category: "Daily Life", difficulty: "1st Std", duration: 4, xp: 15, icon: "👋", desc: "Say Good Morning, Hello Teacher, and Thank You at school." },
    { id: "std1_5", title: "My Body Parts & Health", category: "General", difficulty: "1st Std", duration: 4, xp: 15, icon: "😊", desc: "Learn and speak names of eyes, ears, hands, and feet." },
    { id: "std1_6", title: "My Family Members", category: "Daily Life", difficulty: "1st Std", duration: 4, xp: 15, icon: "❤️", desc: "Introduce your Father, Mother, Brother, and Sister." },
  ],
  "2nd Std": [
    { id: "std2_1", title: "Classroom Objects & Tools", category: "General", difficulty: "2nd Std", duration: 4, xp: 15, icon: "🏫", desc: "Name pencils, erasers, notebooks, and school bags." },
    { id: "std2_2", title: "My Daily Morning Routine", category: "Daily Life", difficulty: "2nd Std", duration: 5, xp: 15, icon: "☀️", desc: "Describe waking up, brushing teeth, and eating breakfast." },
    { id: "std2_3", title: "Weather & Clothes Today", category: "Daily Life", difficulty: "2nd Std", duration: 4, xp: 15, icon: "🌧️", desc: "Talk about sunny, rainy, and cold days and what you wear." },
    { id: "std2_4", title: "Ordering Ice Cream", category: "Daily Life", difficulty: "2nd Std", duration: 4, xp: 15, icon: "🍦", desc: "Practice ordering chocolate, vanilla, and fruit scoops." },
    { id: "std2_5", title: "Toys & Playground Games", category: "General", difficulty: "2nd Std", duration: 5, xp: 15, icon: "⚽", desc: "Invite friends to play on swings, slides, and football ground." },
    { id: "std2_6", title: "Expressing My Feelings", category: "Daily Life", difficulty: "2nd Std", duration: 4, xp: 15, icon: "💬", desc: "Practice saying 'I am happy', 'I am tired', and 'I like reading'." },
  ],
  "3rd Std": [
    { id: "std3_1", title: "Community Helpers", category: "General", difficulty: "3rd Std", duration: 5, xp: 20, icon: "🩺", desc: "Talk about doctors, firefighters, police officers, and teachers." },
    { id: "std3_2", title: "Telling Time & Schedules", category: "Daily Life", difficulty: "3rd Std", duration: 4, xp: 15, icon: "⏰", desc: "Practice saying time, school hours, and bedtime schedules." },
    { id: "std3_3", title: "My Favorite Storybook", category: "General", difficulty: "3rd Std", duration: 5, xp: 20, icon: "📖", desc: "Tell your AI teacher about a fairy tale or story you read." },
    { id: "std3_4", title: "Healthy Food & Snacks", category: "Daily Life", difficulty: "3rd Std", duration: 4, xp: 15, icon: "🍎", desc: "Discuss fruits, vegetables, and canteen lunch items." },
    { id: "std3_5", title: "Seasons & Festivals", category: "General", difficulty: "3rd Std", duration: 5, xp: 20, icon: "🎉", desc: "Talk about summer holidays, Diwali, Christmas, and rain." },
    { id: "std3_6", title: "Visiting the Zoo Guide", category: "Travel", difficulty: "3rd Std", duration: 5, xp: 20, icon: "🦁", desc: "Ask questions to a zookeeper about wild animals." },
  ],
  "4th Std": [
    { id: "std4_1", title: "Hobbies & Sports Club", category: "General", difficulty: "4th Std", duration: 5, xp: 20, icon: "🏸", desc: "Discuss badminton, cricket, chess, and art classes." },
    { id: "std4_2", title: "Asking Directions in School", category: "Daily Life", difficulty: "4th Std", duration: 4, xp: 15, icon: "🗺️", desc: "Ask for library, computer lab, and playground directions." },
    { id: "std4_3", title: "Science Fair Project", category: "General", difficulty: "4th Std", duration: 6, xp: 25, icon: "🔬", desc: "Present a simple solar system or plant experiment." },
    { id: "std4_4", title: "School Picnic Experience", category: "Travel", difficulty: "4th Std", duration: 5, xp: 20, icon: "🚌", desc: "Describe traveling on a school bus to a water park." },
    { id: "std4_5", title: "Buying Books at Stationery", category: "Daily Life", difficulty: "4th Std", duration: 5, xp: 20, icon: "📚", desc: "Ask prices, choose notebooks, and pay shopkeeper." },
    { id: "std4_6", title: "Environmental Protection", category: "General", difficulty: "4th Std", duration: 6, xp: 25, icon: "🌱", desc: "Speak about saving water, planting trees, and recycling." },
  ],
  "5th Std": [
    { id: "std5_1", title: "School Assembly Speech", category: "Work", difficulty: "5th Std", duration: 6, xp: 25, icon: "🎤", desc: "Deliver a short thought for the day in morning assembly." },
    { id: "std5_2", title: "Planning Birthday Celebration", category: "Daily Life", difficulty: "5th Std", duration: 5, xp: 20, icon: "🎂", desc: "Invite classmates, select cake flavors, and organize games." },
    { id: "std5_3", title: "Visiting a Science Museum", category: "Travel", difficulty: "5th Std", duration: 6, xp: 25, icon: "🏛️", desc: "Discuss space exhibits and dinosaur fossils with a guide." },
    { id: "std5_4", title: "Computer Lab & Internet", category: "General", difficulty: "5th Std", duration: 5, xp: 20, icon: "💻", desc: "Talk about typing, search engines, and coding basics." },
    { id: "std5_5", title: "Favorite Historical Hero", category: "General", difficulty: "5th Std", duration: 6, xp: 25, icon: "👑", desc: "Describe freedom fighters and historical leaders." },
    { id: "std5_6", title: "Discussing Exam Preparation", category: "Career", difficulty: "5th Std", duration: 5, xp: 20, icon: "📓", desc: "Share study timetables and revise chapters with friends." },
  ],
  "6th Std": [
    { id: "std6_1", title: "Class Monitor Duties", category: "Work", difficulty: "6th Std", duration: 6, xp: 25, icon: "📋", desc: "Manage classroom discipline and report to class teacher." },
    { id: "std6_2", title: "Ordering Food at Cafe", category: "Daily Life", difficulty: "6th Std", duration: 5, xp: 20, icon: "🍕", desc: "Order pizza, juice, and check bill receipt." },
    { id: "std6_3", title: "Debate: Books vs Tablets", category: "General", difficulty: "6th Std", duration: 7, xp: 30, icon: "💬", desc: "Express points for reading physical books versus e-readers." },
    { id: "std6_4", title: "Inter-School Sports Meet", category: "General", difficulty: "6th Std", duration: 6, xp: 25, icon: "🏆", desc: "Cheer for team members and talk to coach after match." },
    { id: "std6_5", title: "Solar System & Space Exploration", category: "General", difficulty: "6th Std", duration: 7, xp: 30, icon: "🪐", desc: "Discuss Mars rovers, astronauts, and moon missions." },
    { id: "std6_6", title: "First Aid & Health Safety", category: "Daily Life", difficulty: "6th Std", duration: 5, xp: 20, icon: "🩹", desc: "Explain minor injuries and emergency phone numbers." },
  ],
  "7th Std": [
    { id: "std7_1", title: "Robotics Club Interview", category: "Career", difficulty: "7th Std", duration: 7, xp: 30, icon: "🤖", desc: "Pitch your interest in building sensors and electronic circuits." },
    { id: "std7_2", title: "Tourist Guide in Hometown", category: "Travel", difficulty: "7th Std", duration: 6, xp: 25, icon: "🏰", desc: "Guide tourists around famous local monuments and markets." },
    { id: "std7_3", title: "Book Review Presentation", category: "General", difficulty: "7th Std", duration: 7, xp: 30, icon: "📖", desc: "Review plot, main characters, and moral of your favorite book." },
    { id: "std7_4", title: "Budgeting Pocket Money", category: "Daily Life", difficulty: "7th Std", duration: 6, xp: 25, icon: "💵", desc: "Explain savings, expense tracking, and piggy bank goals." },
    { id: "std7_5", title: "Clean & Green City Campaign", category: "General", difficulty: "7th Std", duration: 7, xp: 30, icon: "🌆", desc: "Speak on waste segregation and plastic ban awareness." },
    { id: "std7_6", title: "Student Council Election Speech", category: "Work", difficulty: "7th Std", duration: 8, xp: 35, icon: "🗳️", desc: "Deliver an election speech pitching student improvements." },
  ],
  "8th Std": [
    { id: "std8_1", title: "Model United Nations (MUN) Intro", category: "Work", difficulty: "8th Std", duration: 8, xp: 35, icon: "🌐", desc: "Represent a country delegate and present climate resolutions." },
    { id: "std8_2", title: "Discussing AI & Future Tech", category: "Career", difficulty: "8th Std", duration: 7, xp: 30, icon: "⚡", desc: "Discuss robotics, AI assistants, and future job trends." },
    { id: "std8_3", title: "Train Station Booking & Travel", category: "Travel", difficulty: "8th Std", duration: 6, xp: 25, icon: "🚆", desc: "Inquire about train schedules, platform numbers, and tickets." },
    { id: "std8_4", title: "Resolving Friend Misunderstanding", category: "Daily Life", difficulty: "8th Std", duration: 6, xp: 25, icon: "🤝", desc: "Practice polite conflict resolution and empathy." },
    { id: "std8_5", title: "Preparing for Board Exam Stream", category: "Career", difficulty: "8th Std", duration: 7, xp: 30, icon: "🎯", desc: "Discuss Science, Commerce, and Arts options with counselor." },
    { id: "std8_6", title: "Managing Exam Stress & Time", category: "General", difficulty: "8th Std", duration: 6, xp: 25, icon: "🧘", desc: "Share meditation tips, study breaks, and sleep habits." },
  ],
  "9th Std": [
    { id: "std9_1", title: "Career Guidance Counseling", category: "Career", difficulty: "9th Std", duration: 8, xp: 35, icon: "🎓", desc: "Discuss engineering, medical, design, and business streams." },
    { id: "std9_2", title: "Group Discussion: Social Media", category: "General", difficulty: "9th Std", duration: 8, xp: 35, icon: "📱", desc: "Participate in a group discussion on social media pros & cons." },
    { id: "std9_3", title: "High School Internship Pitch", category: "Career", difficulty: "9th Std", duration: 8, xp: 35, icon: "💼", desc: "Pitch your skills for a summer volunteer or youth internship." },
    { id: "std9_4", title: "Airport International Terminal", category: "Travel", difficulty: "9th Std", duration: 7, xp: 30, icon: "✈️", desc: "Handle passport control, luggage check-in, and boarding." },
    { id: "std9_5", title: "Cyber Safety & Privacy Debate", category: "General", difficulty: "9th Std", duration: 8, xp: 35, icon: "🔒", desc: "Discuss online safety, password security, and digital footprints." },
    { id: "std9_6", title: "Organizing School Cultural Fest", category: "Work", difficulty: "9th Std", duration: 8, xp: 35, icon: "🎭", desc: "Manage event schedules, invitations, and stage lighting." },
  ],
  "10th Std": [
    { id: "std10_1", title: "Board Exam Oral Assessment Prep", category: "Career", difficulty: "10th Std", duration: 9, xp: 40, icon: "📄", desc: "Practice formal viva-voce examination with AI English examiner." },
    { id: "std10_2", title: "Stream Selection (Science/Comm/Arts)", category: "Career", difficulty: "10th Std", duration: 8, xp: 35, icon: "📊", desc: "Justify your 11th standard subjects choice with mentors." },
    { id: "std10_3", title: "Formal Letter to Principal", category: "Work", difficulty: "10th Std", duration: 7, xp: 30, icon: "✉️", desc: "Verbally draft a request for leave or lab equipment upgrade." },
    { id: "std10_4", title: "Scholarship & Grant Interview", category: "Career", difficulty: "10th Std", duration: 9, xp: 40, icon: "🏆", desc: "Answer competitive scholarship interview questions." },
    { id: "std10_5", title: "National Level Debate Final", category: "Work", difficulty: "10th Std", duration: 9, xp: 40, icon: "⚖️", desc: "Argue complex global economic and technological topics." },
    { id: "std10_6", title: "Farewell Day Gratitude Speech", category: "General", difficulty: "10th Std", duration: 8, xp: 35, icon: "🎓", desc: "Deliver an emotional farewell speech thanking teachers and friends." },
  ],
};

const CATEGORIES = ["All", "General", "Daily Life", "Travel", "Work", "Career"];

export function SpeakingPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const modal = useModal();
  const toast = useToast();

  const accountType = localStorage.getItem("speakmate_account_type") || "INDIVIDUAL_USER";
  const isStudent = accountType === "STUDENT";
  const selectedGrade = user?.schoolGrade || localStorage.getItem("speakmate_school_grade") || "1st Std";
  const selectedAgeGroup = localStorage.getItem("speakmate_age_group") || user?.ageGroup || "Professional";

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const activeScenarios = isStudent
    ? STANDARD_SCENARIOS[selectedGrade] || STANDARD_SCENARIOS["1st Std"]
    : AGE_SCENARIOS[selectedAgeGroup] || AGE_SCENARIOS.Professional;

  const streakDays = user?.streak || 0;
  const totalXP = user?.xp || 0;
  const totalMinutes = Math.round((history.reduce((acc, curr) => acc + (curr.duration || 0), 0)) / 60);
  const totalSessions = history.length;

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = speakingService.getHistory || speakingService.history;
    if (typeof fetchHistory === "function") {
      fetchHistory()
        .then((data) => {
          if (isMounted) {
            setHistory(data || []);
            setLoadingHistory(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load speaking history:", err);
          if (isMounted) setLoadingHistory(false);
        });
    } else {
      if (isMounted) setLoadingHistory(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredScenarios = activeScenarios.filter((sc) => {
    const matchesCat = selectedCategory === "All" || sc.category === selectedCategory;
    const matchesSearch =
      sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStartScenario = (scenario) => {
    warmupSpeechAutoplay();
    navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=${scenario.id}&title=${encodeURIComponent(scenario.title)}`);
  };

  const handleDeleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    const confirmed = await modal.confirm({
      title: "Delete Practice Record?",
      message: "Are you sure you want to delete this speaking practice history item?",
      confirmText: "Delete Record",
      cancelText: "Keep Record",
      type: "danger",
    });

    if (confirmed) {
      try {
        const removeFn = speakingService.deleteHistory || speakingService.remove;
        if (typeof removeFn === "function") {
          await removeFn(id);
        }
        setHistory((prev) => prev.filter((h) => h.id !== id));
        toast.success("Practice record deleted successfully!");
      } catch (err) {
        console.error("Failed to delete history item:", err);
        toast.error("Could not delete speaking session record.");
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-4 animate-in fade-in duration-300">
      {/* Hero Banner with 4-Stat Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-indigo-800 via-indigo-700 to-purple-700 p-6 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
              {isStudent ? `🎓 School Grade: ${selectedGrade}` : `👤 Target Profile: ${selectedAgeGroup}`}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">Speaking Practice</h1>
            <p className="text-sm sm:text-base text-indigo-100/90 font-medium leading-relaxed">
              Interactive AI conversation scenarios tailored to your{" "}
              <strong>{isStudent ? selectedGrade : selectedAgeGroup}</strong> curriculum and goals.
            </p>
          </div>
        </div>

        {/* 4-Stat Dashboard Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-black text-amber-400">{streakDays} 🔥</span>
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mt-1">Streak Days</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-black text-sky-300">{totalMinutes}m</span>
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mt-1">Total Mins</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-black text-amber-300">{totalXP} ⭐</span>
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mt-1">XP Earned</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-black text-white">{totalSessions}</span>
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mt-1">Sessions</span>
          </div>
        </div>
      </div>

      {/* Student Badge Indicator */}
      {isStudent && (
        <div className="px-4 py-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-indigo-300 font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm">
          <span>🎓 School Grade Curriculum Level: <strong>{selectedGrade}</strong></span>
        </div>
      )}

      {/* Category Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar Input */}
        <input
          type="text"
          placeholder="🔍 Search conversation scenarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 w-full sm:w-72 shadow-inner"
        />
      </div>

      {/* Conversation Scenarios Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span>{isStudent ? `🏫 ${selectedGrade} Practice Scenarios` : `🗣️ ${selectedAgeGroup} Conversation Scenarios`}</span>
          </h3>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            {filteredScenarios.length} Scenarios Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => handleStartScenario(scenario)}
              className="group glass-card-interactive p-6 rounded-3xl space-y-4 flex flex-col justify-between cursor-pointer border border-[var(--border-default)] hover:border-indigo-500/60 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-3xl p-3.5 rounded-2xl bg-[var(--bg-elevated)] shadow-inner">
                    {scenario.icon}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-300">
                      {scenario.category}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500">
                      ⭐ +{scenario.xp} XP
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-base sm:text-lg text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">
                    {scenario.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5 line-clamp-2 font-medium">
                    {scenario.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] font-bold">
                  ⏱️ {scenario.duration} mins • {isStudent ? selectedGrade : scenario.difficulty}
                </span>
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:opacity-90 text-white font-extrabold text-xs shadow-md transition-all">
                  Start Practice →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Speaking History Section ── */}
      <div className="space-y-4 pt-4 border-t border-[var(--border-default)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span>📜 Speaking Practice History</span>
          </h3>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            {history.length} Practice Records Saved
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-center space-y-3">
            <span className="text-4xl block">🎙️</span>
            <h4 className="font-black text-base text-[var(--text-primary)]">No speaking history yet</h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto font-medium">
              Start any conversation scenario above to practice your spoken English and build your transcript history!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`${ROUTES.SPEAKING_HISTORY_DETAIL}?sessionId=${item.id}`)}
                className="group p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-indigo-500/50 transition-all flex items-start justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-500 text-xl shrink-0">
                    💬
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm text-[var(--text-primary)] truncate group-hover:text-indigo-500 transition-colors">
                      {item.scenario || "Speaking Practice Session"}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] font-bold mt-0.5">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"} • {Math.round((item.duration || 0) / 60)} min •{" "}
                      <span className="text-emerald-500 font-extrabold">{item.score || 85}% Score</span>
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-1 mt-1">
                      {item.previewMessage || item.feedback || "Completed speaking practice simulation."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                  title="Delete record"
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 font-extrabold text-sm"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpeakingPractice;
