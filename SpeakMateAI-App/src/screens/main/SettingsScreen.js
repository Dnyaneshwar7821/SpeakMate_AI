import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, StateView } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { settingsService, onboardingService } from '../../services/appServices';
import { VoiceService, VOICE_PROFILES } from '../../services/VoiceService';
import { OnboardingVoiceService } from '../../services/OnboardingVoiceService';
import { COLORS } from '../../constants/colors';

const AGE_OPTIONS = [
  { code: 'Kids', label: 'Kids (6-12) 🎈', desc: 'Simple words, fun stories & high encouragement' },
  { code: 'Teens', label: 'Teens (13-17) ⚡', desc: 'School life, pop culture & casual chatter' },
  { code: 'Young Adult', label: 'Young Adults (18-24) 🎓', desc: 'Campus life, travel & interview prep' },
  { code: 'Professional', label: 'Professionals (25-50) 💼', desc: 'Business English, executive tone & presentations' },
  { code: 'Senior', label: 'Seniors (50+) ☕', desc: 'Relaxed conversation, culture & life stories' },
];

const LANGUAGE_OPTIONS = [
  { code: 'English', label: 'English 🇺🇸', native: 'English' },
  { code: 'Spanish', label: 'Spanish 🇪🇸', native: 'Español' },
  { code: 'French', label: 'French 🇫🇷', native: 'Français' },
  { code: 'German', label: 'German 🇩🇪', native: 'Deutsch' },
  { code: 'Japanese', label: 'Japanese 🇯🇵', native: '日本語' },
  { code: 'Chinese', label: 'Chinese 🇨🇳', native: '中文' },
  { code: 'Italian', label: 'Italian 🇮🇹', native: 'Italiano' },
  { code: 'Portuguese', label: 'Portuguese 🇵🇹', native: 'Português' },
  { code: 'Russian', label: 'Russian 🇷🇺', native: 'Русский' },
  { code: 'Korean', label: 'Korean 🇰🇷', native: '한국어' },
  { code: 'Hindi', label: 'Hindi 🇮🇳', native: 'हिन्दी' },
  { code: 'Arabic', label: 'Arabic 🇦🇪', native: 'العربية' },
  { code: 'Dutch', label: 'Dutch 🇳🇱', native: 'Nederlands' },
  { code: 'Turkish', label: 'Turkish 🇹🇷', native: 'Türkçe' },
  { code: 'Vietnamese', label: 'Vietnamese 🇻🇳', native: 'Tiếng Việt' },
  { code: 'Swedish', label: 'Swedish 🇸🇪', native: 'Svenska' },
  { code: 'Polish', label: 'Polish 🇵🇱', native: 'Polski' },
];

const defaults = {
  darkMode: false,
  notificationsEnabled: true,
  language: 'English',
  aiVoice: 'Default',
  ageGroup: 'Professional',
  soundEffects: true,
  autoPlayAudio: false,
  dailyReminder: true,
};

export default function SettingsScreen({ navigation }) {
  const { isDark: globalIsDark, setDarkMode } = useTheme();
  const [form, setForm] = useState(defaults);
  const [state, setState] = useState({ loading: true, error: '' });
  const [saving, setSaving] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  
  // Search text for language modal
  const [languageSearch, setLanguageSearch] = useState('');

  // Onboarding voice style fallback for system default
  const [onboardingVoiceStyle, setOnboardingVoiceStyle] = useState('Friendly');

  // Modals visibility
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);

  const load = async () => {
    try {
      const [settings, voices, onboardingVoice, onboardingData] = await Promise.all([
        settingsService.get(),
        VoiceService.getAvailableEnglishVoices(),
        AsyncStorage.getItem('speakmate_onboarding_voice'),
        onboardingService.get().catch(() => null),
      ]);
      setForm({ ...defaults, ...settings, ageGroup: onboardingData?.ageGroup || 'Professional' });
      setAvailableVoices(voices);
      if (onboardingVoice) {
        setOnboardingVoiceStyle(onboardingVoice);
      }
      if (settings && settings.darkMode !== undefined) {
        setDarkMode(settings.darkMode);
      }
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: '' });
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      // updateSettings on backend auto-creates settings if not found
      await Promise.all([
        settingsService.update(form),
        onboardingService.update({ ageGroup: form.ageGroup }).catch(() => null),
      ]);
      // Apply dark mode immediately after saving
      await setDarkMode(form.darkMode);
      Alert.alert('Saved ✓', 'Your preferences have been updated.');
    } catch (error) {
      Alert.alert('Save failed', error.userMessage || 'Unable to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isDark = globalIsDark;
  const labelColor = isDark ? '#F1F5F9' : '#0F172A';
  const sublabelColor = isDark ? '#94A3B8' : '#64748B';
  const dividerColor = isDark ? '#334155' : '#F1F5F9';
  const modalBg = isDark ? '#1E293B' : '#FFFFFF';
  const optionActiveBg = isDark ? '#334155' : '#EEF2FF';

  // Filtered languages based on search query
  const filteredLanguages = LANGUAGE_OPTIONS.filter((lang) => 
    lang.label.toLowerCase().includes(languageSearch.toLowerCase()) || 
    lang.native.toLowerCase().includes(languageSearch.toLowerCase())
  );

  return (
    <Screen title="Settings" subtitle="Sync learning preferences with your backend account.">
      <StateView loading={state.loading} error={state.error} onRetry={load}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* ACTIVE SPEAKING TUTOR STATUS CARD */}
          <Card style={[styles.statusCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
            <View style={styles.statusContainer}>
              <View style={[styles.avatarBg, { backgroundColor: isDark ? '#2E224F' : '#F3E8FF' }]}>
                <Ionicons name="mic-sharp" size={24} color="#7C3AED" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>ACTIVE SPEAKING TUTOR</Text>
                <Text style={[styles.statusVoiceName, { color: labelColor }]}>
                  {OnboardingVoiceService.isSystemDefault(form.aiVoice)
                    ? `System Default (${onboardingVoiceStyle})`
                    : (VOICE_PROFILES.find((o) => o.code === form.aiVoice)?.label || form.aiVoice)}
                </Text>
              </View>
              <View style={styles.waveContainer}>
                <View style={[styles.waveBar, { height: 10, backgroundColor: '#7C3AED' }]} />
                <View style={[styles.waveBar, { height: 22, backgroundColor: '#7C3AED', marginHorizontal: 3 }]} />
                <View style={[styles.waveBar, { height: 14, backgroundColor: '#7C3AED' }]} />
              </View>
            </View>
          </Card>

          {/* CATEGORY 1: LEARNING & PREFERENCES */}
          <View style={styles.sectionHeaderContainer}>
            <Ionicons name="school-outline" size={16} color={COLORS.primary} />
            <Text style={[styles.sectionHeader, { color: sublabelColor }]}>Learning Preferences</Text>
          </View>
          <Card style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }}>
            {/* Target Language Selector */}
            <TouchableOpacity 
              style={styles.pickerRow} 
              activeOpacity={0.7}
              onPress={() => {
                setLanguageSearch('');
                setShowLanguageModal(true);
              }}
            >
              <View style={styles.pickerRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#1D2D44' : '#E0F2FE' }]}>
                  <Ionicons name="language" size={18} color="#0284C7" />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.rowTitle, { color: labelColor }]}>Language Focus</Text>
                  <Text style={[styles.rowDesc, { color: sublabelColor }]}>Language you are learning</Text>
                </View>
              </View>
              <View style={styles.pickerRowRight}>
                <Text style={styles.pickerValueText} numberOfLines={1} ellipsizeMode="tail">{form.language}</Text>
                <Ionicons name="chevron-forward" size={16} color={sublabelColor} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* AI Voice Selector */}
            <TouchableOpacity 
              style={styles.pickerRow} 
              activeOpacity={0.7}
              onPress={() => setShowVoiceModal(true)}
            >
              <View style={styles.pickerRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#2E224F' : '#F3E8FF' }]}>
                  <Ionicons name="volume-medium" size={18} color="#7C3AED" />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.rowTitle, { color: labelColor }]}>AI Speaking Voice</Text>
                  <Text style={[styles.rowDesc, { color: sublabelColor }]}>Audio pronunciation tutor model</Text>
                </View>
              </View>
              <View style={styles.pickerRowRight}>
                <Text style={styles.pickerValueText} numberOfLines={1} ellipsizeMode="tail">
                  {OnboardingVoiceService.isSystemDefault(form.aiVoice)
                    ? `System Default (${onboardingVoiceStyle})`
                    : (VOICE_PROFILES.find((o) => o.code === form.aiVoice)?.label || form.aiVoice)}
                </Text>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Age Group Selector */}
            <TouchableOpacity 
              style={styles.pickerRow} 
              activeOpacity={0.7}
              onPress={() => setShowAgeModal(true)}
            >
              <View style={styles.pickerRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#3B2E1E' : '#FEF3C7' }]}>
                  <Ionicons name="people" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.rowTitle, { color: labelColor }]}>Age Group</Text>
                  <Text style={[styles.rowDesc, { color: sublabelColor }]}>Personalizes conversation topics & level</Text>
                </View>
              </View>
              <View style={styles.pickerRowRight}>
                <Text style={styles.pickerValueText} numberOfLines={1} ellipsizeMode="tail">
                  {AGE_OPTIONS.find((a) => a.code === form.ageGroup)?.label || form.ageGroup || 'Professional'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={sublabelColor} />
              </View>
            </TouchableOpacity>
          </Card>

          {/* CATEGORY 2: GENERAL APP BEHAVIOR */}
          <View style={styles.sectionHeaderContainer}>
            <Ionicons name="options-outline" size={16} color="#7C3AED" />
            <Text style={[styles.sectionHeader, { color: sublabelColor }]}>App Behavior</Text>
          </View>
          <Card style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }}>
            {/* Auto Play Audio Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#2E224F' : '#F3E8FF' }]}>
                  <Ionicons name="play-circle" size={18} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: labelColor }]}>Auto-play Pronunciation</Text>
                  <Text style={[styles.rowDesc, { color: sublabelColor }]}>Automatically play audio voice clips</Text>
                </View>
              </View>
              <Switch 
                value={Boolean(form.autoPlayAudio)} 
                onValueChange={(value) => update('autoPlayAudio', value)} 
                trackColor={{ true: COLORS.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Sound Effects Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#3B1E30' : '#FCE7F3' }]}>
                  <Ionicons name="musical-notes" size={18} color="#EC4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: labelColor }]}>Sound Effects</Text>
                  <Text style={[styles.rowDesc, { color: sublabelColor }]}>Audio effects on correct quiz answers</Text>
                </View>
              </View>
              <Switch 
                value={Boolean(form.soundEffects)} 
                onValueChange={(value) => update('soundEffects', value)} 
                trackColor={{ true: COLORS.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Dark Mode Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                  <Ionicons name="moon" size={18} color={isDark ? '#E2E8F0' : '#475569'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: labelColor }]}>Night Theme Mode</Text>
                  <Text style={[styles.rowDesc, { color: sublabelColor }]}>Toggle dark mode visual layout</Text>
                </View>
              </View>
              <Switch 
                value={Boolean(form.darkMode)} 
                onValueChange={(value) => update('darkMode', value)} 
                trackColor={{ true: COLORS.primary }}
              />
            </View>
          </Card>

          {/* CATEGORY 3: NOTIFICATIONS */}
          <View style={styles.sectionHeaderContainer}>
            <Ionicons name="notifications-outline" size={16} color="#059669" />
            <Text style={[styles.sectionHeader, { color: sublabelColor }]}>Alerts & Notifications</Text>
          </View>
          <Card style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }}>
            {/* Notifications Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#122D25' : '#D1FAE5' }]}>
                  <Ionicons name="notifications" size={18} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: labelColor }]}>Push Notifications</Text>
                  <Text style={[styles.rowDesc, { color: sublabelColor }]}>Receive vocabulary reminders</Text>
                </View>
              </View>
              <Switch 
                value={Boolean(form.notificationsEnabled)} 
                onValueChange={(value) => update('notificationsEnabled', value)} 
                trackColor={{ true: COLORS.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Daily Reminder Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#3B2A18' : '#FEF3C7' }]}>
                  <Ionicons name="alarm" size={18} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: labelColor }]}>Daily Reminder Alerts</Text>
                  <Text style={[styles.rowDesc, { color: sublabelColor }]}>Maintain your daily study streak</Text>
                </View>
              </View>
              <Switch 
                value={Boolean(form.dailyReminder)} 
                onValueChange={(value) => update('dailyReminder', value)} 
                trackColor={{ true: COLORS.primary }}
              />
            </View>
          </Card>

          {/* PREMIUM SAVE SETTINGS BUTTON */}
          <TouchableOpacity
            onPress={save}
            disabled={saving}
            activeOpacity={0.85}
            style={[styles.enhancedSaveBtn, { backgroundColor: COLORS.primary }]}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={styles.saveBtnIcon} />
            <Text style={styles.enhancedSaveBtnText}>
              {saving ? 'Saving Preferences...' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ENHANCED LANGUAGE SELECTION MODAL */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
              <View style={[styles.modalHeader, { borderBottomColor: dividerColor }]}>
                <Text style={[styles.modalTitle, { color: labelColor }]}>Select Language</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color={sublabelColor} />
                </TouchableOpacity>
              </View>

              {/* SEARCH INPUT BAR */}
              <View style={[styles.searchBarContainer, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <Ionicons name="search" size={18} color={sublabelColor} style={styles.searchIcon} />
                <TextInput
                  value={languageSearch}
                  onChangeText={setLanguageSearch}
                  placeholder="Search languages..."
                  placeholderTextColor={sublabelColor}
                  style={[styles.searchInput, { color: labelColor }]}
                />
                {languageSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setLanguageSearch('')} style={styles.searchClearIcon}>
                    <Ionicons name="close-circle" size={18} color={sublabelColor} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((item) => {
                    const isSelected = form.language === item.code;
                    return (
                      <TouchableOpacity
                        key={item.code}
                        style={[
                          styles.modalOptionRow, 
                          isSelected && { backgroundColor: optionActiveBg }
                        ]}
                        onPress={() => {
                          update('language', item.code);
                          setShowLanguageModal(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={[
                            styles.modalOptionText, 
                            { color: isDark ? '#E2E8F0' : '#475569' },
                            isSelected && { color: COLORS.primary }
                          ]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.modalOptionSubtext, { color: sublabelColor }]}>{item.native}</Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={32} color={sublabelColor} />
                    <Text style={[styles.noResultsText, { color: sublabelColor }]}>No languages match search</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* VOICE SELECTION MODAL */}
        <Modal
          visible={showVoiceModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowVoiceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
              <View style={[styles.modalHeader, { borderBottomColor: dividerColor }]}>
                <Text style={[styles.modalTitle, { color: labelColor }]}>Choose Speaking Tutor Voice</Text>
                <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                  <Ionicons name="close" size={24} color={sublabelColor} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
                {VOICE_PROFILES.map((profile) => {
                  const isSelected = form.aiVoice === profile.code;
                  return (
                    <TouchableOpacity
                      key={profile.code}
                      style={[
                        styles.modalOptionRow,
                        isSelected && { backgroundColor: optionActiveBg }
                      ]}
                      onPress={async () => {
                        update('aiVoice', profile.code);

                        if (profile.code === 'Default') {
                          // Load the exact saved onboarding voice config and play it
                          const onboardingConfig = await OnboardingVoiceService.load();
                          const previewMsg = `Hello! I am your ${onboardingConfig.style.toLowerCase()} English tutor.`;
                          VoiceService.speak(previewMsg, {
                            voiceType: 'Default', // speak() will resolve via OnboardingVoiceService
                            availableVoices,
                          });
                        } else {
                          const previewMsg = `Hello! I'm your ${profile.accent} English tutor.`;
                          VoiceService.speak(previewMsg, {
                            voiceType: profile.code,
                            availableVoices,
                          });
                        }

                        setShowVoiceModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          { color: isDark ? '#E2E8F0' : '#475569', flex: 1, paddingRight: 8 },
                          isSelected && { color: COLORS.primary }
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {profile.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  );
        {/* AGE GROUP SELECTION MODAL */}
        <Modal
          visible={showAgeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAgeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
              <View style={[styles.modalHeader, { borderBottomColor: dividerColor }]}>
                <Text style={[styles.modalTitle, { color: labelColor }]}>Select Your Age Group</Text>
                <TouchableOpacity onPress={() => setShowAgeModal(false)}>
                  <Ionicons name="close" size={24} color={sublabelColor} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
                {AGE_OPTIONS.map((opt) => {
                  const isSelected = form.ageGroup === opt.code;
                  return (
                    <TouchableOpacity
                      key={opt.code}
                      style={[
                        styles.modalOptionRow,
                        isSelected && { backgroundColor: optionActiveBg },
                        { paddingVertical: 12 }
                      ]}
                      onPress={() => {
                        update('ageGroup', opt.code);
                        setShowAgeModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text
                          style={[
                            styles.modalOptionText,
                            { color: isDark ? '#E2E8F0' : '#475569', fontWeight: '600' },
                            isSelected && { color: COLORS.primary }
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={{ fontSize: 12, color: sublabelColor, marginTop: 2 }}>
                          {opt.desc}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </StateView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 30,
    paddingHorizontal: 4,
  },
  statusCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 14,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: 0.8,
  },
  statusVoiceName: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
    paddingLeft: 4,
    gap: 6,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  pickerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rowDesc: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  pickerValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  switchRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  enhancedSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    marginTop: 28,
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  enhancedSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  saveBtnIcon: {
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
  },
  searchClearIcon: {
    padding: 2,
  },
  modalScrollView: {
    marginTop: 2,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOptionSubtext: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  noResultsText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
