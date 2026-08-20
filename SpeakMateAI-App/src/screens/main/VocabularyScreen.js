import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  Alert,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Card, Screen } from '../../components/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { vocabularyService, settingsService, progressService } from '../../services/appServices';
import { VoiceService } from '../../services/VoiceService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

// ==========================================
// COMPREHENSIVE CURATED DECKS FOR ALL USERS
// ==========================================
export const CURATED_DECKS = {
  // --- SCHOOL STANDARDS (1st to 10th Std) ---
  '1st Std': [
    { id: 'v1_1', word: 'Apple', phonetic: '/ˈæp.əl/', partOfSpeech: 'noun', meaning: 'A sweet round fruit that grows on trees.', example: 'An apple a day keeps the doctor away.', collocations: 'fresh apple, apple tree', synonym: 'Fruit', antonym: 'None', level: '1st Std', favorite: true, mastered: false },
    { id: 'v1_2', word: 'Friend', phonetic: '/frend/', partOfSpeech: 'noun', meaning: 'A person you like and spend time with.', example: 'Sita is my best school friend.', collocations: 'best friend, close friend', synonym: 'Companion', antonym: 'Enemy', level: '1st Std', favorite: false, mastered: false },
    { id: 'v1_3', word: 'Happy', phonetic: '/ˈhæp.i/', partOfSpeech: 'adjective', meaning: 'Feeling or showing pleasure and joy.', example: 'I feel very happy on my birthday.', collocations: 'happy smile, happy day', synonym: 'Joyful', antonym: 'Sad', level: '1st Std', favorite: false, mastered: false },
    { id: 'v1_4', word: 'Smile', phonetic: '/smaɪl/', partOfSpeech: 'verb', meaning: 'Form a happy facial expression with mouth.', example: 'Always smile when greeting your teacher.', collocations: 'bright smile, gentle smile', synonym: 'Beam', antonym: 'Frown', level: '1st Std', favorite: false, mastered: false },
    { id: 'v1_5', word: 'Sunny', phonetic: '/ˈsʌn.i/', partOfSpeech: 'adjective', meaning: 'Bright with sunlight and warm weather.', example: 'It is a sunny morning for playing in the park.', collocations: 'sunny day, sunny morning', synonym: 'Bright', antonym: 'Cloudy', level: '1st Std', favorite: false, mastered: false },
    { id: 'v1_6', word: 'Puppy', phonetic: '/ˈpʌp.i/', partOfSpeech: 'noun', meaning: 'A young baby dog.', example: 'The playful puppy chased the red ball.', collocations: 'playful puppy, cute puppy', synonym: 'Doggy', antonym: 'None', level: '1st Std', favorite: false, mastered: false },
  ],
  '2nd Std': [
    { id: 'v2_1', word: 'Routine', phonetic: '/ruːˈtiːn/', partOfSpeech: 'noun', meaning: 'A regular sequence of daily actions.', example: 'Brushing teeth is part of my morning routine.', collocations: 'daily routine, morning routine', synonym: 'Schedule', antonym: 'Disorder', level: '2nd Std', favorite: true, mastered: false },
    { id: 'v2_2', word: 'Pencil', phonetic: '/ˈpen.səl/', partOfSpeech: 'noun', meaning: 'An instrument used for writing or drawing.', example: 'I sharpened my yellow pencil for class.', collocations: 'lead pencil, color pencil', synonym: 'Pen', antonym: 'None', level: '2nd Std', favorite: false, mastered: false },
    { id: 'v2_3', word: 'Weather', phonetic: '/ˈweð.ər/', partOfSpeech: 'noun', meaning: 'The state of the atmosphere (sunny, rainy, etc.).', example: 'The weather today is sunny and bright.', collocations: 'nice weather, rainy weather', synonym: 'Climate', antonym: 'None', level: '2nd Std', favorite: false, mastered: false },
    { id: 'v2_4', word: 'Playground', phonetic: '/ˈpleɪ.ɡraʊnd/', partOfSpeech: 'noun', meaning: 'An outdoor area for children to play games.', example: 'We play on the swings in the playground.', collocations: 'school playground, outdoor playground', synonym: 'Park', antonym: 'None', level: '2nd Std', favorite: false, mastered: false },
    { id: 'v2_5', word: 'Gentle', phonetic: '/ˈdʒen.təl/', partOfSpeech: 'adjective', meaning: 'Mild, kind, or tender in behavior.', example: 'Be gentle when holding the baby kitten.', collocations: 'gentle breeze, gentle touch', synonym: 'Kind', antonym: 'Harsh', level: '2nd Std', favorite: false, mastered: false },
  ],
  '3rd Std': [
    { id: 'v3_1', word: 'Helper', phonetic: '/ˈhel.pər/', partOfSpeech: 'noun', meaning: 'A person who helps or assists others.', example: 'Firefighters are brave community helpers.', collocations: 'community helper, eager helper', synonym: 'Assistant', antonym: 'Opponent', level: '3rd Std', favorite: true, mastered: false },
    { id: 'v3_2', word: 'Action', phonetic: '/ˈæk.ʃən/', partOfSpeech: 'noun', meaning: 'The process of doing something or performing a verb.', example: 'Running and jumping are action words.', collocations: 'take action, direct action', synonym: 'Activity', antonym: 'Inaction', level: '3rd Std', favorite: false, mastered: false },
    { id: 'v3_3', word: 'Polite', phonetic: '/pəˈlaɪt/', partOfSpeech: 'adjective', meaning: 'Having good manners and showing respect.', example: 'Saying "thank you" is very polite.', collocations: 'polite request, polite greeting', synonym: 'Courteous', antonym: 'Rude', level: '3rd Std', favorite: false, mastered: false },
    { id: 'v3_4', word: 'Schedule', phonetic: '/ˈskedʒ.uːl/', partOfSpeech: 'noun', meaning: 'A plan that lists times for activities.', example: 'Check our school timetable schedule.', collocations: 'busy schedule, daily schedule', synonym: 'Timetable', antonym: 'None', level: '3rd Std', favorite: false, mastered: false },
    { id: 'v3_5', word: 'Curious', phonetic: '/ˈkjʊr.i.əs/', partOfSpeech: 'adjective', meaning: 'Eager to know or learn something new.', example: 'The curious student asked wonderful science questions.', collocations: 'curious mind, curious student', synonym: 'Inquisitive', antonym: 'Uninterested', level: '3rd Std', favorite: false, mastered: false },
  ],
  '4th Std': [
    { id: 'v4_1', word: 'Expedition', phonetic: '/ˌek.spəˈdɪʃ.ən/', partOfSpeech: 'noun', meaning: 'A journey undertaken for a specific purpose.', example: 'Astronauts launched a space expedition to Mars.', collocations: 'scientific expedition, jungle expedition', synonym: 'Journey', antonym: 'Stay', level: '4th Std', favorite: true, mastered: false },
    { id: 'v4_2', word: 'Direction', phonetic: '/daɪˈrek.ʃən/', partOfSpeech: 'noun', meaning: 'The course along which someone or something moves.', example: 'Turn left to find the school library direction.', collocations: 'right direction, give directions', synonym: 'Route', antonym: 'None', level: '4th Std', favorite: false, mastered: false },
    { id: 'v4_3', word: 'Habit', phonetic: '/ˈhæb.ɪt/', partOfSpeech: 'noun', meaning: 'A settled or regular tendency or practice.', example: 'Drinking water daily is a healthy habit.', collocations: 'healthy habit, daily habit', synonym: 'Practice', antonym: 'None', level: '4th Std', favorite: false, mastered: false },
    { id: 'v4_4', word: 'Courage', phonetic: '/ˈkɜːr.ɪdʒ/', partOfSpeech: 'noun', meaning: 'Strength in the face of pain or grief.', example: 'It takes courage to stand up and speak on stage.', collocations: 'great courage, moral courage', synonym: 'Bravery', antonym: 'Fear', level: '4th Std', favorite: false, mastered: false },
  ],
  '5th Std': [
    { id: 'v5_1', word: 'Environment', phonetic: '/ɪnˈvaɪ.rən.mənt/', partOfSpeech: 'noun', meaning: 'The surroundings or conditions in which we live.', example: 'Planting trees protects our natural environment.', collocations: 'clean environment, protect environment', synonym: 'Surroundings', antonym: 'None', level: '5th Std', favorite: true, mastered: false },
    { id: 'v5_2', word: 'Experiment', phonetic: '/ɪkˈsper.ə.mənt/', partOfSpeech: 'noun', meaning: 'A scientific procedure undertaken to make a discovery.', example: 'We conducted a science experiment on plant growth.', collocations: 'conduct experiment, science experiment', synonym: 'Test', antonym: 'Theory', level: '5th Std', favorite: false, mastered: false },
    { id: 'v5_3', word: 'Recycle', phonetic: '/ˌriːˈsaɪ.kəl/', partOfSpeech: 'verb', meaning: 'Convert waste materials into reusable objects.', example: 'We recycle paper and plastic bottles at school.', collocations: 'recycle plastic, recycle paper', synonym: 'Reuse', antonym: 'Waste', level: '5th Std', favorite: false, mastered: false },
    { id: 'v5_4', word: 'Discovery', phonetic: '/dɪˈskʌv.ər.i/', partOfSpeech: 'noun', meaning: 'The act of finding or learning something for the first time.', example: 'The scientist made an important medical discovery.', collocations: 'major discovery, scientific discovery', synonym: 'Breakthrough', antonym: 'Loss', level: '5th Std', favorite: false, mastered: false },
  ],
  '6th Std': [
    { id: 'v6_1', word: 'Robotics', phonetic: '/roʊˈbɑː.t̬ɪks/', partOfSpeech: 'noun', meaning: 'The branch of technology dealing with robots.', example: 'She joined the school robotics club to build code.', collocations: 'robotics club, advanced robotics', synonym: 'Automation', antonym: 'None', level: '6th Std', favorite: true, mastered: false },
    { id: 'v6_2', word: 'Debate', phonetic: '/dɪˈbeɪt/', partOfSpeech: 'noun', meaning: 'A formal discussion on a particular topic in public.', example: 'Our team won the inter-school debate competition.', collocations: 'lively debate, debate competition', synonym: 'Discussion', antonym: 'Agreement', level: '6th Std', favorite: false, mastered: false },
    { id: 'v6_3', word: 'Assistance', phonetic: '/əˈsɪs.təns/', partOfSpeech: 'noun', meaning: 'Help or support given to someone.', example: 'The teacher offered polite assistance during the test.', collocations: 'financial assistance, mutual assistance', synonym: 'Aid', antonym: 'Hindrance', level: '6th Std', favorite: false, mastered: false },
    { id: 'v6_4', word: 'Biodiversity', phonetic: '/ˌbaɪ.oʊ.dɪˈvɜːr.sə.t̬i/', partOfSpeech: 'noun', meaning: 'The variety of plant and animal life in the world.', example: 'Tropical rainforests have rich biodiversity.', collocations: 'rich biodiversity, preserve biodiversity', synonym: 'Ecology', antonym: 'None', level: '6th Std', favorite: false, mastered: false },
  ],
  '7th Std': [
    { id: 'v7_1', word: 'Conservation', phonetic: '/ˌkɑːn.sɚˈveɪ.ʃən/', partOfSpeech: 'noun', meaning: 'Prevention of wasteful use of a resource.', example: 'Water conservation is vital for future generations.', collocations: 'wildlife conservation, energy conservation', synonym: 'Preservation', antonym: 'Destruction', level: '7th Std', favorite: true, mastered: false },
    { id: 'v7_2', word: 'Delegate', phonetic: '/ˈdel.ə.ɡeɪt/', partOfSpeech: 'verb', meaning: 'Entrust a task or responsibility to another person.', example: 'The leader delegates responsibilities to team members.', collocations: 'delegate authority, delegate tasks', synonym: 'Assign', antonym: 'Withhold', level: '7th Std', favorite: false, mastered: false },
    { id: 'v7_3', word: 'Perspective', phonetic: '/pɚˈspek.tɪv/', partOfSpeech: 'noun', meaning: 'A particular attitude toward or way of regarding something.', example: 'Reading history gives us a broader perspective on life.', collocations: 'fresh perspective, unique perspective', synonym: 'Viewpoint', antonym: 'None', level: '7th Std', favorite: false, mastered: false },
    { id: 'v7_4', word: 'Politeness', phonetic: '/pəˈlaɪt.nəs/', partOfSpeech: 'noun', meaning: 'Behavior that is respectful and considerate.', example: 'Politeness creates a harmonious classroom atmosphere.', collocations: 'genuine politeness, show politeness', synonym: 'Courtesy', antonym: 'Rudeness', level: '7th Std', favorite: false, mastered: false },
  ],
  '8th Std': [
    { id: 'v8_1', word: 'Leadership', phonetic: '/ˈliː.dɚ.ʃɪp/', partOfSpeech: 'noun', meaning: 'The action of leading a group or organization.', example: 'Student council develops strong leadership qualities.', collocations: 'strong leadership, leadership qualities', synonym: 'Guidance', antonym: 'Subordination', level: '8th Std', favorite: true, mastered: false },
    { id: 'v8_2', word: 'Rebuttal', phonetic: '/rɪˈbʌt̬.əl/', partOfSpeech: 'noun', meaning: 'A refutation or contradiction in a formal debate.', example: 'She delivered a powerful rebuttal during the debate.', collocations: 'effective rebuttal, offer rebuttal', synonym: 'Refutation', antonym: 'Confirmation', level: '8th Std', favorite: false, mastered: false },
    { id: 'v8_3', word: 'Innovation', phonetic: '/ˌɪn.əˈveɪ.ʃən/', partOfSpeech: 'noun', meaning: 'A new method, idea, or product.', example: 'Artificial intelligence is a major technological innovation.', collocations: 'technological innovation, foster innovation', synonym: 'Novelty', antonym: 'Stagnation', level: '8th Std', favorite: false, mastered: false },
    { id: 'v8_4', word: 'Aspiration', phonetic: '/ˌæs.pəˈreɪ.ʃən/', partOfSpeech: 'noun', meaning: 'A hope or ambition of achieving something.', example: 'Her career aspiration is to become an aerospace engineer.', collocations: 'career aspiration, high aspirations', synonym: 'Ambition', antonym: 'Apathy', level: '8th Std', favorite: false, mastered: false },
  ],
  '9th Std': [
    { id: 'v9_1', word: 'Diplomatic', phonetic: '/ˌdɪp.ləˈmæt̬.ɪk/', partOfSpeech: 'adjective', meaning: 'Handling sensitive situations tactfully and politely.', example: 'He used diplomatic language to resolve peer conflict.', collocations: 'diplomatic approach, diplomatic relations', synonym: 'Tactful', antonym: 'Tactless', level: '9th Std', favorite: true, mastered: false },
    { id: 'v9_2', word: 'Keynote', phonetic: '/ˈkiː.noʊt/', partOfSpeech: 'noun', meaning: 'A main speech outlining the central theme of a summit.', example: 'She delivered the opening keynote on climate change.', collocations: 'keynote speaker, keynote address', synonym: 'Main theme', antonym: 'None', level: '9th Std', favorite: false, mastered: false },
    { id: 'v9_3', word: 'Rhetoric', phonetic: '/ˈret.ər.ɪk/', partOfSpeech: 'noun', meaning: 'The art of effective or persuasive speaking and writing.', example: 'Mastering rhetoric enhances spoken essay presentations.', collocations: 'persuasive rhetoric, political rhetoric', synonym: 'Eloquence', antonym: 'None', level: '9th Std', favorite: false, mastered: false },
    { id: 'v9_4', word: 'Breakthrough', phonetic: '/ˈbreɪk.θruː/', partOfSpeech: 'noun', meaning: 'A sudden, dramatic, and important discovery or development.', example: 'Scientists announced a breakthrough in solar energy.', collocations: 'major breakthrough, scientific breakthrough', synonym: 'Advance', antonym: 'Setback', level: '9th Std', favorite: false, mastered: false },
  ],
  '10th Std': [
    { id: 'v10_1', word: 'Oratory', phonetic: '/ˈɔːr.ə.tɔːr.i/', partOfSpeech: 'noun', meaning: 'Formal public speaking characterized by high eloquence.', example: 'CEFR C1 mastery requires spontaneous oratory skill.', collocations: 'powerful oratory, political oratory', synonym: 'Eloquence', antonym: 'Inarticulacy', level: '10th Std', favorite: true, mastered: false },
    { id: 'v10_2', word: 'Simulation', phonetic: '/ˌsɪm.jəˈleɪ.ʃən/', partOfSpeech: 'noun', meaning: 'Imitation of a situation or process in realistic conditions.', example: 'We completed a 10th Board oral exam simulation.', collocations: 'computer simulation, realistic simulation', synonym: 'Model', antonym: 'Reality', level: '10th Std', favorite: false, mastered: false },
    { id: 'v10_3', word: 'Modulation', phonetic: '/ˌmɑː.dʒəˈleɪ.ʃən/', partOfSpeech: 'noun', meaning: 'Varying the pitch or tone of voice for expressive effect.', example: 'Vocal modulation makes speeches captivating.', collocations: 'voice modulation, tone modulation', synonym: 'Inflection', antonym: 'Monotone', level: '10th Std', favorite: false, mastered: false },
    { id: 'v10_4', word: 'Proficiency', phonetic: '/prəˈfɪʃ.ən.si/', partOfSpeech: 'noun', meaning: 'A high degree of skill and competence.', example: 'Fluency and accuracy demonstrate English proficiency.', collocations: 'language proficiency, high proficiency', synonym: 'Competence', antonym: 'Incompetence', level: '10th Std', favorite: false, mastered: false },
  ],

  // --- INDIVIDUAL USER AGE GROUPS & THEMES ---
  'Kids (6-12)': [
    { id: 'vk_1', word: 'Cheerful', phonetic: '/ˈtʃɪr.fəl/', partOfSpeech: 'adjective', meaning: 'Noticeably happy and optimistic.', example: 'She greeted her classmates with a cheerful smile.', collocations: 'cheerful voice, cheerful mood', synonym: 'Joyful', antonym: 'Gloomy', level: 'Beginner', favorite: true, mastered: false },
    { id: 'vk_2', word: 'Adventure', phonetic: '/ədˈven.tʃɚ/', partOfSpeech: 'noun', meaning: 'An unusual and exciting or daring experience.', example: 'We had a fun adventure in the treehouse.', collocations: 'exciting adventure, space adventure', synonym: 'Journey', antonym: 'Routine', level: 'Beginner', favorite: false, mastered: false },
    { id: 'vk_3', word: 'Playful', phonetic: '/ˈpleɪ.fəl/', partOfSpeech: 'adjective', meaning: 'Fond of games and amusement; lighthearted.', example: 'The playful kitten jumped on the soft cushion.', collocations: 'playful puppy, playful kitten', synonym: 'Frisky', antonym: 'Serious', level: 'Beginner', favorite: false, mastered: false },
    { id: 'vk_4', word: 'Brave', phonetic: '/breɪv/', partOfSpeech: 'adjective', meaning: 'Ready to face danger or pain without fear.', example: 'The brave knight protected the gentle animals.', collocations: 'brave hero, brave deed', synonym: 'Courageous', antonym: 'Cowardly', level: 'Beginner', favorite: false, mastered: false },
  ],
  'Teens (13-17)': [
    { id: 'vt_1', word: 'Relatable', phonetic: '/rɪˈleɪ.t̬ə.bəl/', partOfSpeech: 'adjective', meaning: 'Enabling a person to feel that they can understand or identify with it.', example: 'The singer lyrics are very relatable to teens.', collocations: 'relatable story, relatable character', synonym: 'Understandable', antonym: 'Distant', level: 'Intermediate', favorite: true, mastered: false },
    { id: 'vt_2', word: 'Spontaneous', phonetic: '/spɑːnˈteɪ.ni.əs/', partOfSpeech: 'adjective', meaning: 'Performed or occurring as a result of a sudden impulse without planning.', example: 'We took a spontaneous weekend bicycle trip.', collocations: 'spontaneous decision, spontaneous reaction', synonym: 'Unplanned', antonym: 'Premeditated', level: 'Intermediate', favorite: false, mastered: false },
    { id: 'vt_3', word: 'Passionate', phonetic: '/ˈpæʃ.ən.ət/', partOfSpeech: 'adjective', meaning: 'Showing or caused by strong feelings or a strong belief.', example: 'He is passionate about video game design and coding.', collocations: 'passionate speaker, passionate about', synonym: 'Enthusiastic', antonym: 'Indifferent', level: 'Intermediate', favorite: false, mastered: false },
    { id: 'vt_4', word: 'Collaborate', phonetic: '/kəˈlæb.ə.reɪt/', partOfSpeech: 'verb', meaning: 'Work jointly on an activity or project.', example: 'Our team collaborated to build the science project.', collocations: 'collaborate closely, collaborate on', synonym: 'Cooperate', antonym: 'Compete', level: 'Intermediate', favorite: false, mastered: false },
  ],
  'Young Adults (18-24)': [
    { id: 'vy_1', word: 'Articulate', phonetic: '/ɑːrˈtɪk.jə.lət/', partOfSpeech: 'adjective', meaning: 'Having or showing the ability to speak fluently and coherently.', example: 'An articulate speaker can convey complex ideas effortlessly.', collocations: 'articulate speaker, articulate thoughts', synonym: 'Eloquent', antonym: 'Inarticulate', level: 'Advanced', favorite: true, mastered: false },
    { id: 'vy_2', word: 'Resilient', phonetic: '/rɪˈzɪl.jənt/', partOfSpeech: 'adjective', meaning: 'Able to withstand or recover quickly from difficult conditions.', example: 'She showed a resilient mindset throughout university.', collocations: 'resilient mindset, resilient economy', synonym: 'Tough', antonym: 'Fragile', level: 'Advanced', favorite: false, mastered: false },
    { id: 'vy_3', word: 'Networking', phonetic: '/ˈnet.wɜːr.kɪŋ/', partOfSpeech: 'noun', meaning: 'The action or process of interacting with others to exchange information.', example: 'Attending college seminars is great for professional networking.', collocations: 'business networking, social networking', synonym: 'Connecting', antonym: 'Isolation', level: 'Advanced', favorite: false, mastered: false },
    { id: 'vy_4', word: 'Pragmatic', phonetic: '/præɡˈmæt̬.ɪk/', partOfSpeech: 'adjective', meaning: 'Dealing with things sensibly and realistically in a practical way.', example: 'They took a pragmatic approach to budget planning.', collocations: 'pragmatic solution, pragmatic approach', synonym: 'Practical', antonym: 'Idealistic', level: 'Advanced', favorite: false, mastered: false },
  ],
  'Working Adults (25-50)': [
    { id: 'vw_1', word: 'Strategic', phonetic: '/strəˈtiː.dʒɪk/', partOfSpeech: 'adjective', meaning: 'Carefully designed or planned to serve a particular purpose or advantage.', example: 'We established strategic milestones for quarterly goals.', collocations: 'strategic planning, strategic decision', synonym: 'Calculated', antonym: 'Random', level: 'Advanced', favorite: true, mastered: false },
    { id: 'vw_2', word: 'Leverage', phonetic: '/ˈlev.ɚ.ɪdʒ/', partOfSpeech: 'verb', meaning: 'Use something to maximum advantage.', example: 'We leverage AI technology to accelerate English learning.', collocations: 'leverage technology, leverage strengths', synonym: 'Utilize', antonym: 'Ignore', level: 'Advanced', favorite: false, mastered: false },
    { id: 'vw_3', word: 'Synergy', phonetic: '/ˈsɪn.ɚ.dʒi/', partOfSpeech: 'noun', meaning: 'The interaction of elements that when combined produce a total effect greater than the sum.', example: 'Team synergy enabled us to deliver the project ahead of schedule.', collocations: 'team synergy, create synergy', synonym: 'Collaboration', antonym: 'Conflict', level: 'Advanced', favorite: false, mastered: false },
    { id: 'vw_4', word: 'Facilitate', phonetic: '/fəˈsɪl.ə.teɪt/', partOfSpeech: 'verb', meaning: 'Make an action or process easy or easier.', example: 'The manager facilitated a smooth discussion between departments.', collocations: 'facilitate communication, facilitate growth', synonym: 'Enable', antonym: 'Obstruct', level: 'Advanced', favorite: false, mastered: false },
  ],
  'Seniors (50+)': [
    { id: 'vs_1', word: 'Serenity', phonetic: '/səˈren.ə.t̬i/', partOfSpeech: 'noun', meaning: 'The state of being calm, peaceful, and untroubled.', example: 'She enjoyed the morning serenity of her garden.', collocations: 'peace and serenity, inner serenity', synonym: 'Tranquility', antonym: 'Turmoil', level: 'Advanced', favorite: true, mastered: false },
    { id: 'vs_2', word: 'Nostalgia', phonetic: '/nɑːˈstæl.dʒə/', partOfSpeech: 'noun', meaning: 'A sentimental longing or affection for the past.', example: 'Looking at old family photos brought a wave of nostalgia.', collocations: 'warm nostalgia, feel nostalgia', synonym: 'Reminiscence', antonym: 'None', level: 'Advanced', favorite: false, mastered: false },
    { id: 'vs_3', word: 'Wisdom', phonetic: '/ˈwɪz.dəm/', partOfSpeech: 'noun', meaning: 'The quality of having experience, knowledge, and good judgment.', example: 'Her grandmother shared timeless wisdom on life and patience.', collocations: 'words of wisdom, timeless wisdom', synonym: 'Insight', antonym: 'Folly', level: 'Advanced', favorite: false, mastered: false },
    { id: 'vs_4', word: 'Benevolent', phonetic: '/bəˈnev.əl.ənt/', partOfSpeech: 'adjective', meaning: 'Well meaning and kindly.', example: 'He gave a benevolent contribution to the community hospital.', collocations: 'benevolent leader, benevolent act', synonym: 'Charitable', antonym: 'Malevolent', level: 'Advanced', favorite: false, mastered: false },
  ],
  'Everyday Idioms': [
    { id: 'vi_1', word: 'Break the ice', phonetic: '/breɪk ðiː aɪs/', partOfSpeech: 'idiom', meaning: 'Do or say something to relieve tension or get conversation started.', example: 'Playing a quick name game helped break the ice at the workshop.', collocations: 'break the ice smoothly, break the ice with a joke', synonym: 'Initiate conversation', antonym: 'Freeze up', level: 'Intermediate', favorite: true, mastered: false },
    { id: 'vi_2', word: 'Piece of cake', phonetic: '/piːs ʌv keɪk/', partOfSpeech: 'idiom', meaning: 'Something that is very easy to do.', example: 'The English vocabulary quiz was a piece of cake.', collocations: 'absolute piece of cake, total piece of cake', synonym: 'Effortless', antonym: 'Hard task', level: 'Beginner', favorite: false, mastered: false },
    { id: 'vi_3', word: 'Bite the bullet', phonetic: '/baɪt ðə ˈbʊl.ɪt/', partOfSpeech: 'idiom', meaning: 'Face a difficult situation with courage and fortitude.', example: 'I decided to bite the bullet and give the live presentation.', collocations: 'bite the bullet and speak', synonym: 'Face bravely', antonym: 'Hesitate', level: 'Intermediate', favorite: false, mastered: false },
    { id: 'vi_4', word: 'Hit the nail on the head', phonetic: '/hɪt ðə neɪl ɒn ðə hed/', partOfSpeech: 'idiom', meaning: 'State a truth exactly or describe a situation accurately.', example: 'Your feedback on pronunciation hit the nail on the head.', collocations: 'hit the nail on the head accurately', synonym: 'Spot on', antonym: 'Miss the point', level: 'Intermediate', favorite: false, mastered: false },
  ],
  'Travel & Tourism': [
    { id: 'vtr_1', word: 'Itinerary', phonetic: '/aɪˈtɪn.ə.rer.i/', partOfSpeech: 'noun', meaning: 'A planned route or journey schedule.', example: 'Our vacation itinerary includes visits to famous historical castles.', collocations: 'travel itinerary, flight itinerary', synonym: 'Schedule', antonym: 'None', level: 'Intermediate', favorite: true, mastered: false },
    { id: 'vtr_2', word: 'Hospitality', phonetic: '/ˌhɑː.spəˈtæl.ə.t̬i/', partOfSpeech: 'noun', meaning: 'The friendly and generous reception of guests.', example: 'The resort staff provided warm hospitality during our stay.', collocations: 'warm hospitality, generous hospitality', synonym: 'Warmth', antonym: 'Hostility', level: 'Intermediate', favorite: false, mastered: false },
    { id: 'vtr_3', word: 'Scenic', phonetic: '/ˈsiː.nɪk/', partOfSpeech: 'adjective', meaning: 'Providing or relating to views of impressive natural beauty.', example: 'We drove along the scenic mountain coastline route.', collocations: 'scenic view, scenic route', synonym: 'Picturesque', antonym: 'Ugly', level: 'Intermediate', favorite: false, mastered: false },
    { id: 'vtr_4', word: 'Boarding pass', phonetic: '/ˈbɔːr.dɪŋ ˌpæs/', partOfSpeech: 'noun', meaning: 'A pass that authorizes a passenger to board an aircraft.', example: 'Please have your boarding pass and passport ready at the gate.', collocations: 'electronic boarding pass, present boarding pass', synonym: 'Ticket', antonym: 'None', level: 'Beginner', favorite: false, mastered: false },
  ],
  'IELTS Academic': [
    { id: 'vie_1', word: 'Ubiquitous', phonetic: '/juːˈbɪk.wə.t̬əs/', partOfSpeech: 'adjective', meaning: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern education.', collocations: 'ubiquitous presence, become ubiquitous', synonym: 'Omnipresent', antonym: 'Rare', level: 'Advanced', favorite: true, mastered: false },
    { id: 'vie_2', word: 'Substantiate', phonetic: '/səbˈstæn.ʃi.eɪt/', partOfSpeech: 'verb', meaning: 'Provide evidence to support or prove the truth of.', example: 'You must substantiate your thesis arguments with credible data.', collocations: 'substantiate claims, substantiate findings', synonym: 'Validate', antonym: 'Disprove', level: 'Advanced', favorite: false, mastered: false },
    { id: 'vie_3', word: 'Comprehensive', phonetic: '/ˌkɑːm.prəˈhen.sɪv/', partOfSpeech: 'adjective', meaning: 'Complete and including everything that is necessary.', example: 'The course offers a comprehensive overview of English grammar.', collocations: 'comprehensive study, comprehensive review', synonym: 'Thorough', antonym: 'Incomplete', level: 'Advanced', favorite: false, mastered: false },
    { id: 'vie_4', word: 'Paramount', phonetic: '/ˈper.ə.maʊnt/', partOfSpeech: 'adjective', meaning: 'More important than anything else; supreme.', example: 'Consistent speaking practice is of paramount importance for fluency.', collocations: 'paramount importance, paramount concern', synonym: 'Supreme', antonym: 'Trivial', level: 'Advanced', favorite: false, mastered: false },
  ],
};

export default function VocabularyScreen() {
  const { isDark, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'flashcards', 'quiz'
  const [word, setWord] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'favorites', 'mastered', 'review'
  const [selectedDeck, setSelectedDeck] = useState('1st Std');
  const [saving, setSaving] = useState(false);
  const [userWords, setUserWords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings & Voices
  const [settings, setSettings] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [accountType, setAccountType] = useState('INDIVIDUAL_USER');
  const [userGrade, setUserGrade] = useState('1st Std');
  const [userAgeGroup, setUserAgeGroup] = useState('Young Adult');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  // Dynamic Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const quizScoreRef = useRef(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Load User Data & Decks
  const loadUserData = async () => {
    try {
      const [savedAccType, savedGrade, savedAgeGroup, s, voices, savedVoice, backendWords] = await Promise.all([
        AsyncStorage.getItem('speakmate_account_type'),
        AsyncStorage.getItem('speakmate_school_grade'),
        AsyncStorage.getItem('speakmate_age_group'),
        settingsService.get().catch(() => null),
        VoiceService.getAvailableEnglishVoices(),
        AsyncStorage.getItem('speakmate_selected_voice'),
        vocabularyService.all().catch(() => []),
      ]);

      const effAccType = savedAccType || 'INDIVIDUAL_USER';
      setAccountType(effAccType);

      const effectiveGrade = savedGrade || '1st Std';
      setUserGrade(effectiveGrade);

      const effectiveAge = savedAgeGroup || 'Young Adult';
      setUserAgeGroup(effectiveAge);

      const effectiveVoice = savedVoice || s?.aiVoice || 'Default';
      setSettings({ ...s, aiVoice: effectiveVoice });
      setAvailableVoices(voices);

      setUserWords(backendWords || []);

      // Set default deck based on profile
      if (effAccType === 'STUDENT') {
        setSelectedDeck(effectiveGrade);
      } else {
        if (effectiveAge.toLowerCase().includes('kid')) setSelectedDeck('Kids (6-12)');
        else if (effectiveAge.toLowerCase().includes('teen')) setSelectedDeck('Teens (13-17)');
        else if (effectiveAge.toLowerCase().includes('young')) setSelectedDeck('Young Adults (18-24)');
        else if (effectiveAge.toLowerCase().includes('senior')) setSelectedDeck('Seniors (50+)');
        else setSelectedDeck('Working Adults (25-50)');
      }
    } catch (e) {
      console.warn('Failed to load vocabulary data:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  // Combined Active Words: Deck words + Custom User Words
  const getActiveDeckWords = () => {
    let baseList = [];
    if (selectedDeck === 'My Custom Words') {
      baseList = userWords;
    } else if (CURATED_DECKS[selectedDeck]) {
      baseList = CURATED_DECKS[selectedDeck];
    } else {
      baseList = CURATED_DECKS['1st Std'];
    }

    // Merge any user saved words that match or combine
    return baseList;
  };

  // Filter and Search logic
  const activeWords = getActiveDeckWords();
  const filteredItems = activeWords.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      (item.word && item.word.toLowerCase().includes(query)) ||
      (item.meaning && item.meaning.toLowerCase().includes(query)) ||
      (item.collocations && item.collocations.toLowerCase().includes(query));

    let matchesFilter = true;
    if (filterType === 'favorites') matchesFilter = Boolean(item.favorite);
    if (filterType === 'mastered') matchesFilter = Boolean(item.mastered);
    if (filterType === 'review') matchesFilter = !item.mastered;

    return matchesSearch && matchesFilter;
  });

  // Pronunciation Spoken Audio
  const speak = (txt) => {
    if (settings?.isMuted || !txt) return;
    VoiceService.speak(txt, {
      voiceType: settings?.aiVoice || 'Default',
      availableVoices,
    });
  };

  // Add Custom Word with AI
  const addWord = async () => {
    const cleanWord = word.trim();
    if (!cleanWord) return;
    setSaving(true);
    try {
      const response = await vocabularyService.add(cleanWord);
      setWord('');
      Alert.alert('Word Added ✨', `"${cleanWord}" has been analyzed and added to your word bank! (+10 XP)`);
      setUserWords((prev) => [response, ...prev]);
    } catch (error) {
      const localItem = {
        id: 'local_' + Date.now(),
        word: cleanWord,
        phonetic: `/${cleanWord.toLowerCase()}/`,
        partOfSpeech: 'word',
        meaning: `Definition and usage for ${cleanWord}`,
        example: `Practice speaking "${cleanWord}" naturally in everyday conversations.`,
        collocations: `use ${cleanWord.toLowerCase()}, practice ${cleanWord.toLowerCase()}`,
        favorite: false,
        mastered: false,
      };
      setUserWords((prev) => [localItem, ...prev]);
      setWord('');
      Alert.alert('Saved ✨', `"${cleanWord}" added to your word bank!`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (item) => {
    try {
      if (typeof item.id === 'number' || !String(item.id).startsWith('v')) {
        await vocabularyService.toggleFavorite(item.id);
      }
      const updated = !item.favorite;
      // Update in active deck / userWords
      setUserWords((prev) => prev.map((w) => (w.id === item.id ? { ...w, favorite: updated } : w)));
      if (CURATED_DECKS[selectedDeck]) {
        const found = CURATED_DECKS[selectedDeck].find((w) => w.id === item.id);
        if (found) found.favorite = updated;
      }
    } catch (e) {
      // local toggle fallback
      item.favorite = !item.favorite;
    }
  };

  // Toggle Mastered (+15 XP)
  const toggleMastered = async (item) => {
    const newMastered = !item.mastered;
    try {
      if (typeof item.id === 'number' || !String(item.id).startsWith('v')) {
        await vocabularyService.toggleMastered(item.id);
      }
      setUserWords((prev) => prev.map((w) => (w.id === item.id ? { ...w, mastered: newMastered } : w)));
      if (CURATED_DECKS[selectedDeck]) {
        const found = CURATED_DECKS[selectedDeck].find((w) => w.id === item.id);
        if (found) found.mastered = newMastered;
      }
      if (newMastered) {
        Alert.alert('Mastered! 🏅', `You mastered "${item.word}"! (+15 XP earned)`);
      }
    } catch (e) {
      item.mastered = newMastered;
    }
  };

  // 3D Flip Card Animation
  const flipCard = () => {
    const nextFlipped = !flipped;
    Animated.spring(flipAnimation, {
      toValue: nextFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(nextFlipped);

    if (nextFlipped && filteredItems[currentCardIndex]) {
      const item = filteredItems[currentCardIndex];
      speak(item.meaning || item.word);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const nextCard = () => {
    if (flipped) flipCard();
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    }, 180);
  };

  const prevCard = () => {
    if (flipped) flipCard();
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    }, 180);
  };

  // ==========================================
  // DYNAMIC QUIZ GENERATOR
  // ==========================================
  const startQuiz = () => {
    setQuizLoading(true);
    setQuizError('');
    setQuizFinished(false);
    setQuizScore(0);
    quizScoreRef.current = 0;
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setEarnedXP(0);

    const sourcePool = [...activeWords, ...CURATED_DECKS['1st Std'], ...CURATED_DECKS['Young Adults (18-24)']];
    const uniquePool = [];
    const seen = new Set();
    for (const w of sourcePool) {
      if (w.word && !seen.has(w.word.toLowerCase())) {
        seen.add(w.word.toLowerCase());
        uniquePool.push(w);
      }
    }

    // Shuffle pool and take 5 questions
    const shuffled = [...uniquePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    const allMeanings = uniquePool.map((w) => w.meaning).filter(Boolean);

    const generated = selected.map((item, idx) => {
      const correctMeaning = item.meaning;
      const distractors = allMeanings
        .filter((m) => m !== correctMeaning)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      while (distractors.length < 3) {
        distractors.push('Expressing thoughts clearly in natural conversation.');
      }

      const options = [correctMeaning, ...distractors].sort(() => 0.5 - Math.random());
      return {
        id: `q_${idx}_${Date.now()}`,
        word: item.word,
        phonetic: item.phonetic,
        partOfSpeech: item.partOfSpeech,
        correctAnswer: correctMeaning,
        options,
        example: item.example,
      };
    });

    setQuizQuestions(generated);
    setQuizLoading(false);
    setActiveTab('quiz');
  };

  const submitQuizAnswer = (answer) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = answer === currentQ.correctAnswer;
    if (isCorrect) {
      quizScoreRef.current += 1;
      setQuizScore(quizScoreRef.current);
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    const finalScore = quizScoreRef.current;
    const totalQ = quizQuestions.length;
    const baseXP = finalScore * 20;
    const bonus = finalScore === totalQ && totalQ > 0 ? 30 : 0;
    const totalAwarded = baseXP + bonus;
    setEarnedXP(totalAwarded);

    try {
      const prog = await progressService.get().catch(() => null);
      if (prog) {
        const newXp = (prog.xp || 0) + totalAwarded;
        const newVocabCount = (prog.totalVocabularyWords || 0) + finalScore;
        await progressService.update({
          ...prog,
          xp: newXp,
          totalVocabularyWords: newVocabCount,
        });
      }
    } catch (e) {
      console.warn('Progress XP update error:', e);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setSelectedAnswer(null);
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  // Available Deck categories based on account
  const studentDecks = ['1st Std', '2nd Std', '3rd Std', '4th Std', '5th Std', '6th Std', '7th Std', '8th Std', '9th Std', '10th Std'];
  const individualDecks = ['Kids (6-12)', 'Teens (13-17)', 'Young Adults (18-24)', 'Working Adults (25-50)', 'Seniors (50+)', 'Everyday Idioms', 'Travel & Tourism', 'IELTS Academic'];
  const availableDecks = accountType === 'STUDENT' ? [...studentDecks, 'Everyday Idioms', 'My Custom Words'] : [...individualDecks, '10th Std', 'My Custom Words'];

  const currentCard = filteredItems[currentCardIndex] || filteredItems[0];

  return (
    <Screen
      title="Vocabulary Master"
      subtitle={
        accountType === 'STUDENT'
          ? `Standard Curriculum (${userGrade}) • 3D Flashcards & Quizzes`
          : `Linguistic Word Bank (${userAgeGroup}) • Spaced Repetition Mastery`
      }
    >
      {/* Dynamic Tab Bar */}
      <View style={[styles.tabContainer, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'list' && styles.tabButtonActive]}
          onPress={() => setActiveTab('list')}
        >
          <Ionicons name="book-outline" size={17} color={activeTab === 'list' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'list' && styles.tabButtonTextActive]}>
            Word Bank
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'flashcards' && styles.tabButtonActive]}
          onPress={() => {
            if (!filteredItems.length) {
              Alert.alert('No Words', 'Select a deck with vocabulary words to start flashcard practice.');
              return;
            }
            setCurrentCardIndex(0);
            setFlipped(false);
            flipAnimation.setValue(0);
            setActiveTab('flashcards');
          }}
        >
          <Ionicons name="albums-outline" size={17} color={activeTab === 'flashcards' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'flashcards' && styles.tabButtonTextActive]}>
            3D Flashcards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'quiz' && styles.tabButtonActive]}
          onPress={startQuiz}
        >
          <Ionicons name="trophy-outline" size={17} color={activeTab === 'quiz' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
          <Text style={[styles.tabButtonText, { color: isDark ? '#94A3B8' : '#64748B' }, activeTab === 'quiz' && styles.tabButtonTextActive]}>
            AI Quiz
          </Text>
        </TouchableOpacity>
      </View>

      {/* DECK SELECTOR HORIZONTAL SCROLLER */}
      {activeTab !== 'quiz' && (
        <View style={styles.deckSelectorWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deckScrollContent}>
            {availableDecks.map((deck) => {
              const isSelected = selectedDeck === deck;
              return (
                <TouchableOpacity
                  key={deck}
                  onPress={() => {
                    setSelectedDeck(deck);
                    setCurrentCardIndex(0);
                    setFlipped(false);
                  }}
                  style={[
                    styles.deckChip,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: isDark ? '#334155' : '#CBD5E1' },
                    isSelected && styles.deckChipSelected,
                  ]}
                >
                  <Text style={[styles.deckChipText, { color: isDark ? '#94A3B8' : '#64748B' }, isSelected && styles.deckChipTextSelected]}>
                    {deck}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ==========================================
          TAB 1: WORD BANK / LIST MODE
      ========================================== */}
      {activeTab === 'list' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Add Word Box with AI */}
          <Card style={[styles.addCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.addHeaderRow}>
              <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>✨ Instant AI Word Lookup</Text>
              <Text style={styles.xpBadge}>+10 XP</Text>
            </View>
            <Text style={[styles.addSubtitle, { color: theme.textSecondary }]}>
              Type any English word. SpeakMate AI analyzes IPA, part of speech, collocations, and examples instantly.
            </Text>
            <View style={styles.addInputRow}>
              <TextInput
                style={[styles.addInput, { backgroundColor: isDark ? '#334155' : '#F8FAFC', color: theme.textPrimary }]}
                placeholder="e.g. Eloquent, Resilient, Tenacious..."
                value={word}
                onChangeText={setWord}
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity style={styles.addButton} onPress={addWord} disabled={saving}>
                <Ionicons name={saving ? 'hourglass-outline' : 'sparkles'} size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Search & Filter Bar */}
          <View style={styles.searchFilterContainer}>
            <View style={[styles.searchBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder={`Search in ${selectedDeck}...`}
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter Pills */}
            <View style={styles.filterPillsRow}>
              {[
                { key: 'all', label: `All (${activeWords.length})` },
                { key: 'favorites', label: '⭐ Favorites' },
                { key: 'mastered', label: '✅ Mastered' },
                { key: 'review', label: '🔄 Learning' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.filterPill,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                    filterType === f.key && styles.filterPillActive,
                  ]}
                  onPress={() => setFilterType(f.key)}
                >
                  <Text style={[styles.filterPillText, { color: isDark ? '#94A3B8' : '#64748B' }, filterType === f.key && styles.filterPillTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Words List */}
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Words Found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Add custom words above or switch decks using the top selector!
              </Text>
            </View>
          ) : (
            filteredItems.map((item, idx) => (
              <Card key={item.id || idx} style={[styles.wordCard, { backgroundColor: theme.cardBg }]}>
                <View style={styles.wordHeaderRow}>
                  <View style={styles.wordTitleCol}>
                    <View style={styles.wordBadgeRow}>
                      <Text style={[styles.wordText, { color: theme.textPrimary }]}>{item.word}</Text>
                      {item.phonetic ? (
                        <Text style={[styles.phoneticText, { color: '#6366F1' }]}>{item.phonetic}</Text>
                      ) : null}
                      {item.partOfSpeech ? (
                        <View style={styles.posBadge}>
                          <Text style={styles.posBadgeText}>{item.partOfSpeech}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity onPress={() => speak(item.word)} style={styles.actionBtn}>
                      <Ionicons name="volume-high-outline" size={20} color="#6366F1" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.actionBtn}>
                      <Ionicons name={item.favorite ? 'star' : 'star-outline'} size={20} color={item.favorite ? '#F59E0B' : theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleMastered(item)} style={styles.actionBtn}>
                      <Ionicons name={item.mastered ? 'checkmark-circle' : 'checkmark-circle-outline'} size={20} color={item.mastered ? '#10B981' : theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.meaningText, { color: theme.textPrimary }]}>{item.meaning}</Text>

                {item.example ? (
                  <View style={[styles.exampleBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                    <Text style={[styles.exampleLabel, { color: theme.textSecondary }]}>Example:</Text>
                    <Text style={[styles.exampleText, { color: isDark ? '#E2E8F0' : '#334155' }]}>"{item.example}"</Text>
                  </View>
                ) : null}

                {item.collocations ? (
                  <View style={styles.collocationsRow}>
                    <Text style={[styles.collocationLabel, { color: theme.textSecondary }]}>Collocations: </Text>
                    <Text style={[styles.collocationText, { color: '#6366F1' }]}>{item.collocations}</Text>
                  </View>
                ) : null}

                {item.synonym && item.synonym !== 'None' ? (
                  <View style={styles.synonymsRow}>
                    <Text style={[styles.synonymLabel, { color: theme.textSecondary }]}>Synonyms: </Text>
                    <Text style={[styles.synonymText, { color: '#059669' }]}>{item.synonym}</Text>
                  </View>
                ) : null}
              </Card>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ==========================================
          TAB 2: 3D INTERACTIVE FLASHCARDS
      ========================================== */}
      {activeTab === 'flashcards' && currentCard && (
        <ScrollView contentContainerStyle={styles.flashcardContainer} showsVerticalScrollIndicator={false}>
          {/* Deck & Progress Header */}
          <View style={styles.flashcardHeader}>
            <Text style={[styles.flashcardDeckTitle, { color: theme.textSecondary }]}>
              Deck: <Text style={{ color: '#6366F1', fontWeight: '700' }}>{selectedDeck}</Text>
            </Text>
            <Text style={[styles.cardCounterText, { color: theme.textPrimary }]}>
              Card {currentCardIndex + 1} of {filteredItems.length}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentCardIndex + 1) / Math.max(1, filteredItems.length)) * 100}%` },
              ]}
            />
          </View>

          {/* 3D Flip Card Container */}
          <TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={styles.cardTouchWrapper}>
            {/* FRONT OF CARD */}
            <Animated.View
              style={[
                styles.flashcard3D,
                { backgroundColor: theme.cardBg, borderColor: isDark ? '#334155' : '#E2E8F0' },
                {
                  transform: [{ rotateY: frontInterpolate }],
                  opacity: frontOpacity,
                },
              ]}
            >
              <LinearGradient colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']} style={styles.cardInnerGradient}>
                <View style={styles.cardTopActions}>
                  <View style={styles.posBadge}>
                    <Text style={styles.posBadgeText}>{currentCard.partOfSpeech || 'Word'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => speak(currentCard.word)} style={styles.audioPillBtn}>
                    <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardCenterContent}>
                  <Text style={[styles.frontWordText, { color: theme.textPrimary }]}>{currentCard.word}</Text>
                  {currentCard.phonetic ? (
                    <Text style={styles.frontPhoneticText}>{currentCard.phonetic}</Text>
                  ) : null}
                </View>

                <View style={styles.cardBottomHint}>
                  <Ionicons name="sync-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.tapToFlipText, { color: theme.textSecondary }]}>Tap card to see meaning & examples</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* BACK OF CARD */}
            <Animated.View
              style={[
                styles.flashcard3D,
                styles.flashcardBack,
                { backgroundColor: theme.cardBg, borderColor: isDark ? '#334155' : '#E2E8F0' },
                {
                  transform: [{ rotateY: backInterpolate }],
                  opacity: backOpacity,
                },
              ]}
            >
              <LinearGradient colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']} style={styles.cardInnerGradient}>
                <View style={styles.cardTopActions}>
                  <Text style={[styles.backWordSmall, { color: '#6366F1' }]}>{currentCard.word}</Text>
                  <TouchableOpacity onPress={() => speak(`${currentCard.word}. ${currentCard.meaning}`)} style={styles.audioPillBtn}>
                    <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.backScrollContent} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.backMeaningText, { color: theme.textPrimary }]}>{currentCard.meaning}</Text>

                  {currentCard.example ? (
                    <View style={[styles.backExampleBox, { backgroundColor: isDark ? '#334155' : '#EDE9FE' }]}>
                      <Text style={[styles.backExampleText, { color: isDark ? '#E2E8F0' : '#4338CA' }]}>
                        "{currentCard.example}"
                      </Text>
                    </View>
                  ) : null}

                  {currentCard.collocations ? (
                    <View style={styles.backMetaRow}>
                      <Text style={[styles.backMetaLabel, { color: theme.textSecondary }]}>Collocations: </Text>
                      <Text style={[styles.backMetaValue, { color: '#6366F1' }]}>{currentCard.collocations}</Text>
                    </View>
                  ) : null}

                  {currentCard.synonym && currentCard.synonym !== 'None' ? (
                    <View style={styles.backMetaRow}>
                      <Text style={[styles.backMetaLabel, { color: theme.textSecondary }]}>Synonyms: </Text>
                      <Text style={[styles.backMetaValue, { color: '#059669' }]}>{currentCard.synonym}</Text>
                    </View>
                  ) : null}
                </ScrollView>

                <View style={styles.cardBottomHint}>
                  <Ionicons name="sync-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.tapToFlipText, { color: theme.textSecondary }]}>Tap card to flip back</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          {/* Retention Action Buttons */}
          <View style={styles.retentionActionsRow}>
            <TouchableOpacity
              style={[styles.retentionBtn, styles.retentionBtnReview]}
              onPress={() => {
                nextCard();
              }}
            >
              <Ionicons name="refresh-outline" size={18} color="#D97706" />
              <Text style={styles.retentionReviewText}>Need Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.retentionBtn, styles.retentionBtnMastered]}
              onPress={() => {
                toggleMastered(currentCard);
                nextCard();
              }}
            >
              <Ionicons name="checkmark-done" size={18} color="#059669" />
              <Text style={styles.retentionMasteredText}>Mastered (+15 XP)</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Controls */}
          <View style={styles.navControlsRow}>
            <TouchableOpacity onPress={prevCard} style={[styles.navBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={nextCard} style={[styles.navBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Ionicons name="chevron-forward" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ==========================================
          TAB 3: INTERACTIVE AI QUIZ
      ========================================== */}
      {activeTab === 'quiz' && (
        <ScrollView contentContainerStyle={styles.quizContainer} showsVerticalScrollIndicator={false}>
          {!quizFinished && quizQuestions.length > 0 && (
            <View style={{ width: '100%' }}>
              {/* Question Progress Header */}
              <View style={styles.quizProgressHeader}>
                <Text style={[styles.quizStepText, { color: theme.textSecondary }]}>
                  Question {currentQuizIndex + 1} of {quizQuestions.length}
                </Text>
                <Text style={[styles.quizLiveScore, { color: '#6366F1' }]}>
                  Score: {quizScore} / {quizQuestions.length}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` },
                  ]}
                />
              </View>

              {/* Question Prompt Card */}
              <Card style={[styles.quizQuestionCard, { backgroundColor: theme.cardBg }]}>
                <View style={styles.quizTargetWordRow}>
                  <Text style={[styles.quizTargetWord, { color: theme.textPrimary }]}>
                    {quizQuestions[currentQuizIndex]?.word}
                  </Text>
                  <TouchableOpacity onPress={() => speak(quizQuestions[currentQuizIndex]?.word)} style={styles.audioPillBtn}>
                    <Ionicons name="volume-high" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.quizQuestionPrompt, { color: theme.textSecondary }]}>
                  What is the correct definition of this word?
                </Text>
              </Card>

              {/* Options */}
              <View style={styles.quizOptionsList}>
                {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === quizQuestions[currentQuizIndex]?.correctAnswer;
                  let optStyle = [styles.quizOptionBtn, { backgroundColor: theme.cardBg, borderColor: isDark ? '#334155' : '#E2E8F0' }];

                  if (selectedAnswer !== null) {
                    if (isCorrect) {
                      optStyle.push(styles.quizOptionCorrect);
                    } else if (isSelected && !isCorrect) {
                      optStyle.push(styles.quizOptionWrong);
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      style={optStyle}
                      disabled={selectedAnswer !== null}
                      onPress={() => submitQuizAnswer(option)}
                    >
                      <View style={styles.optLetterBadge}>
                        <Text style={styles.optLetterText}>{String.fromCharCode(65 + idx)}</Text>
                      </View>
                      <Text style={[styles.quizOptionText, { color: theme.textPrimary }]}>{option}</Text>
                      {selectedAnswer !== null && isCorrect && (
                        <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                      )}
                      {selectedAnswer !== null && isSelected && !isCorrect && (
                        <Ionicons name="close-circle" size={22} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Next Question / Finish Button */}
              {selectedAnswer !== null && (
                <TouchableOpacity style={styles.quizNextBtn} onPress={nextQuizQuestion}>
                  <Text style={styles.quizNextBtnText}>
                    {currentQuizIndex < quizQuestions.length - 1 ? 'Next Question →' : 'View Results 🎉'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* QUIZ FINISHED CELEBRATION */}
          {quizFinished && (
            <Card style={[styles.celebrationCard, { backgroundColor: theme.cardBg }]}>
              <View style={styles.trophyCircle}>
                <Ionicons name="trophy" size={48} color="#F59E0B" />
              </View>
              <Text style={[styles.celebTitle, { color: theme.textPrimary }]}>Quiz Completed!</Text>
              <Text style={[styles.celebSubtitle, { color: theme.textSecondary }]}>
                You scored {quizScore} out of {quizQuestions.length} correct!
              </Text>

              <View style={styles.rewardXpBox}>
                <Text style={styles.rewardXpText}>+{earnedXP} XP Earned ✨</Text>
              </View>

              <TouchableOpacity style={styles.retakeBtn} onPress={startQuiz}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.retakeBtnText}>Retake Quiz with New Words</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backToListBtn} onPress={() => setActiveTab('list')}>
                <Text style={[styles.backToListBtnText, { color: theme.textSecondary }]}>Back to Word Bank</Text>
              </TouchableOpacity>
            </Card>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

// ==========================================
// STYLESHEET
// ==========================================
const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 16 },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#6366F1',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Deck selector
  deckSelectorWrapper: {
    marginBottom: 14,
  },
  deckScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  deckChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  deckChipSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  deckChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deckChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Add Card
  addCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  addHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  xpBadge: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  addSubtitle: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addInput: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search & Filter
  searchFilterContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterPillActive: {
    backgroundColor: '#6366F1',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // Word Cards
  wordCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  wordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordTitleCol: {
    flex: 1,
  },
  wordBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  wordText: {
    fontSize: 17,
    fontWeight: '700',
  },
  phoneticText: {
    fontSize: 13,
    fontWeight: '500',
  },
  posBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  posBadgeText: {
    color: '#4338CA',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 6,
  },
  meaningText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  exampleBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  exampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  collocationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  collocationLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  collocationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  synonymsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  synonymLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  synonymText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 30,
  },

  // Flashcards Tab
  flashcardContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  flashcardDeckTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardCounterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  cardTouchWrapper: {
    width: CARD_WIDTH,
    height: 320,
    marginBottom: 20,
  },
  flashcard3D: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  flashcardBack: {
    position: 'absolute',
    top: 0,
  },
  cardInnerGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioPillBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  frontWordText: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  frontPhoneticText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  cardBottomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tapToFlipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  backWordSmall: {
    fontSize: 16,
    fontWeight: '800',
  },
  backScrollContent: {
    flex: 1,
    marginVertical: 10,
  },
  backMeaningText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  backExampleBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  backExampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  backMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  backMetaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  backMetaValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Retention Action Buttons
  retentionActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  retentionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  retentionBtnReview: {
    backgroundColor: '#FEF3C7',
  },
  retentionBtnMastered: {
    backgroundColor: '#D1FAE5',
  },
  retentionReviewText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 13,
  },
  retentionMasteredText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },

  // Nav Controls
  navControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quiz Tab
  quizContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  quizProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quizStepText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quizLiveScore: {
    fontSize: 13,
    fontWeight: '700',
  },
  quizQuestionCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  quizTargetWordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizTargetWord: {
    fontSize: 26,
    fontWeight: '800',
  },
  quizQuestionPrompt: {
    fontSize: 13,
    lineHeight: 18,
  },
  quizOptionsList: {
    gap: 10,
    marginBottom: 20,
  },
  quizOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  optLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optLetterText: {
    color: '#4338CA',
    fontWeight: '700',
    fontSize: 13,
  },
  quizOptionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  quizOptionCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  quizOptionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  quizNextBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  quizNextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Celebration Card
  celebrationCard: {
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  trophyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  celebTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  celebSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardXpBox: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 24,
  },
  rewardXpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  retakeBtn: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  backToListBtn: {
    paddingVertical: 10,
  },
  backToListBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
