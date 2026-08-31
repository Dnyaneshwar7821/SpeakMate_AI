import React, { useCallback, useContext, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppButton, AppInput, Card, Screen, StateView } from '../../components/ui';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { profileService } from '../../services/appServices';
import { authService } from '../../services/authService';
import { getDisplayName } from '../../utils/format';
import { COLORS } from '../../constants/colors';

const PRESET_AVATARS = ['🎓', '🦁', '🚀', '🦉', '👑', '⚡', '🦊', '🎯', '💎', '🌟', '🔥', '🏆'];

const getRankTier = (xp = 0) => {
  if (xp < 100) return { name: 'Bronze III', icon: '🥉', colors: ['#CD7F32', '#A0522D'] };
  if (xp < 300) return { name: 'Bronze II', icon: '🥉', colors: ['#D2691E', '#8B4513'] };
  if (xp < 600) return { name: 'Bronze I', icon: '🥉', colors: ['#CD7F32', '#B8860B'] };
  if (xp < 1000) return { name: 'Silver III', icon: '🥈', colors: ['#94A3B8', '#64748B'] };
  if (xp < 1500) return { name: 'Silver II', icon: '🥈', colors: ['#94A3B8', '#64748B'] };
  if (xp < 2200) return { name: 'Silver I', icon: '🥈', colors: ['#CBD5E1', '#475569'] };
  if (xp < 3000) return { name: 'Gold III', icon: '🥇', colors: ['#F59E0B', '#D97706'] };
  if (xp < 4000) return { name: 'Gold II', icon: '🥇', colors: ['#F59E0B', '#D97706'] };
  if (xp < 5000) return { name: 'Gold I', icon: '🥇', colors: ['#F59E0B', '#D97706'] };
  if (xp < 7000) return { name: 'Platinum Master', icon: '💎', colors: ['#06B6D4', '#0284C7'] };
  return { name: 'Diamond Orator', icon: '👑', colors: ['#8B5CF6', '#6D28D9'] };
};

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const [accountType, setAccountType] = useState(() => user?.accountType || (user?.role === 'STUDENT' ? 'STUDENT' : 'INDIVIDUAL_USER'));
  const isStudent = Boolean(
    accountType === 'STUDENT' ||
    user?.role === 'STUDENT' ||
    user?.accountType === 'STUDENT' ||
    user?.schoolId ||
    user?.schoolCode
  );
  
  const [state, setState] = useState({ loading: true, error: '', profile: null });
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [updatingLevel, setUpdatingLevel] = useState(false);
  const [tutorGender, setTutorGender] = useState('female');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('Professional');

  // Delete Account Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleOpenDeleteModal = () => {
    setDeleteEmail(user?.email || state.profile?.email || form.email || '');
    setDeleteOtp('');
    setOtpSent(false);
    setShowDeleteModal(true);
  };

  const handleSendDeleteOtp = async () => {
    const cleanEmail = deleteEmail.trim().toLowerCase();
    if (!cleanEmail) {
      Alert.alert('Validation Error', 'Please enter your registered email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setSendingOtp(true);
    try {
      await authService.sendDeleteAccountOtp({ email: cleanEmail });
      setOtpSent(true);
      Alert.alert(
        'Verification Code Sent 📧',
        `A 6-digit OTP verification code has been sent to ${cleanEmail}. Please check your inbox or spam folder.`
      );
    } catch (err) {
      Alert.alert('Send Failed', err.response?.data?.message || err.userMessage || 'Failed to send deletion OTP. Ensure email is registered.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    const cleanEmail = deleteEmail.trim().toLowerCase();
    const cleanOtp = deleteOtp.trim();

    if (!cleanEmail) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    if (!cleanOtp || cleanOtp.length !== 6) {
      Alert.alert('Validation Error', 'Please enter the 6-digit OTP code.');
      return;
    }

    Alert.alert(
      'Final Confirmation ⚠️',
      'Are you completely sure you want to delete your SpeakMateAI account? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);
            try {
              await authService.deleteAccount({ email: cleanEmail, otp: cleanOtp });
              await AsyncStorage.removeItem(`speakmate_onboarding_${cleanEmail}`);
              setShowDeleteModal(false);
              Alert.alert(
                'Account Deleted',
                'Your account and all related learning data have been permanently deleted. We are sorry to see you go!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (logout) logout();
                    },
                  },
                ]
              );
            } catch (err) {
              Alert.alert('Deletion Failed', err.response?.data?.message || err.userMessage || 'Invalid or expired OTP code.');
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const load = async () => {
    try {
      const [profile, savedAccType, savedVoice, savedGender, savedAvatarModel, savedAgeGroup, savedGrade] = await Promise.all([
        profileService.get().catch(() => null),
        AsyncStorage.getItem('speakmate_account_type'),
        AsyncStorage.getItem('speakmate_selected_voice'),
        AsyncStorage.getItem('speakmate_voice_gender'),
        AsyncStorage.getItem('speakmate_avatar_model'),
        AsyncStorage.getItem('speakmate_age_group'),
        AsyncStorage.getItem('speakmate_school_grade'),
      ]);
      setForm({
        firstName: profile?.firstName || user?.firstName || '',
        lastName: profile?.lastName || user?.lastName || '',
        email: profile?.email || user?.email || '',
      });
      setAccountType(savedAccType || profile?.accountType || user?.accountType || 'INDIVIDUAL_USER');
      if (savedAvatarModel === 'robopaws' || savedGender === 'robopaws' || (savedVoice && savedVoice.toLowerCase().includes('robo'))) {
        setTutorGender('robopaws');
      } else if (savedAvatarModel === 'chitose' || savedGender === 'male' || (savedVoice && savedVoice.toLowerCase().includes('male'))) {
        setTutorGender('male');
      } else {
        setTutorGender('female');
      }
      const effectiveAge = savedAgeGroup || profile?.ageGroup || user?.ageGroup || 'Professional';
      const effectiveGrade = savedGrade || profile?.schoolGrade || user?.schoolGrade || '1st Std';
      setSelectedAgeGroup(effectiveAge);
      const mergedProfile = {
        ...profile,
        ageGroup: effectiveAge,
        schoolGrade: effectiveGrade,
      };
      setState({ loading: false, error: '', profile: mergedProfile });
      if (updateUser && mergedProfile) {
        updateUser(mergedProfile);
      }
    } catch (error) {
      const savedAge = await AsyncStorage.getItem('speakmate_age_group').catch(() => null);
      const savedGrd = await AsyncStorage.getItem('speakmate_school_grade').catch(() => null);
      const fallbackAge = savedAge || user?.ageGroup || 'Professional';
      setSelectedAgeGroup(fallbackAge);
      setForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
      });
      setState({
        loading: false,
        error: error.userMessage || 'Unable to load profile.',
        profile: {
          ...user,
          ageGroup: fallbackAge,
          schoolGrade: savedGrd || user?.schoolGrade || '1st Std',
        }
      });
    }
  };

  const handleSelectTutor = async (genderOrModel) => {
    setTutorGender(genderOrModel);
    try {
      if (genderOrModel === 'robopaws') {
        await AsyncStorage.setItem('speakmate_avatar_model', 'robopaws');
        await AsyncStorage.setItem('speakmate_voice_gender', 'robopaws');
        await AsyncStorage.setItem('speakmate_selected_voice', 'Robo-Paws');
        await AsyncStorage.setItem('speakmate_ai_voice', 'Robo-Paws');
        showToast('Tutor Updated ✓', 'success', '🤖 Robo-Paws (Kids Robot Buddy) active');
      } else if (genderOrModel === 'male') {
        await AsyncStorage.setItem('speakmate_avatar_model', 'chitose');
        await AsyncStorage.setItem('speakmate_voice_gender', 'male');
        await AsyncStorage.setItem('speakmate_selected_voice', 'US Male');
        await AsyncStorage.setItem('speakmate_ai_voice', 'US Male');
        showToast('Tutor Updated ✓', 'success', '👨 Chitose (Male Tutor) active');
      } else {
        await AsyncStorage.setItem('speakmate_avatar_model', 'haru');
        await AsyncStorage.setItem('speakmate_voice_gender', 'female');
        await AsyncStorage.setItem('speakmate_selected_voice', 'Default');
        await AsyncStorage.setItem('speakmate_ai_voice', 'Default');
        showToast('Tutor Updated ✓', 'success', '👩 Haru (Female Tutor) active');
      }
    } catch (e) {}
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const save = async () => {
    const cleanFirstName = form.firstName.trim();
    const cleanLastName = form.lastName.trim();
    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanFirstName) {
      Alert.alert('Validation Error', 'First name cannot be empty.');
      return;
    }
    if (!cleanLastName) {
      Alert.alert('Validation Error', 'Last name cannot be empty.');
      return;
    }
    if (!cleanEmail) {
      Alert.alert('Validation Error', 'Email cannot be empty.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    // Check if email has changed
    const emailChanged = state.profile && state.profile.email && state.profile.email.toLowerCase() !== cleanEmail;

    const executeSave = async () => {
      setSaving(true);
      try {
        const profile = await profileService.update({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: cleanEmail,
        });
        setState({ loading: false, error: '', profile });
        if (updateUser) updateUser(profile);
        showToast('Profile Updated ✓', 'success', 'Your personal details were saved successfully');
      } catch (error) {
        showToast('Profile Update Failed', 'error', error.userMessage || 'Unable to update profile.');
      } finally {
        setSaving(false);
      }
    };

    if (emailChanged) {
      Alert.alert(
        'Change Email Address? 📧',
        'Changing your email address updates your login username ID. You will need to use this new email to log in next time.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Change Email', onPress: executeSave },
        ]
      );
    } else {
      executeSave();
    }
  };

  // ── Gallery Image Upload ─────────────────────────────────────────────
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast('Permission Required', 'warning', 'Please enable gallery access in Settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        showToast('Image Error', 'error', 'Could not read image data. Please try again.');
        return;
      }

      const mimeType = asset.mimeType || 'image/jpeg';
      const dataUri = `data:${mimeType};base64,${asset.base64}`;

      setUploadingPhoto(true);
      try {
        const updated = await profileService.updateAvatar(dataUri);
        setState((curr) => ({ ...curr, profile: updated }));
        if (updateUser) updateUser(updated);
        showToast('Photo Updated 📸', 'success', 'Your new profile avatar is live!');
      } catch (uploadError) {
        showToast('Upload Failed', 'error', uploadError.userMessage || 'Unable to update profile photo.');
      } finally {
        setUploadingPhoto(false);
      }
    } catch (e) {
      showToast('Gallery Error', 'error', 'Failed to open the image gallery.');
    }
  };

  const handleSelectPresetAvatar = async (emoji) => {
    setShowAvatarModal(false);
    setUploadingPhoto(true);
    try {
      const updated = await profileService.updateAvatar(emoji);
      setState((curr) => ({ ...curr, profile: updated }));
      if (updateUser) updateUser(updated);
      showToast('Avatar Changed 🎉', 'success', `Avatar set to ${emoji}`);
    } catch (uploadError) {
      showToast('Avatar Update Failed', 'error', uploadError.userMessage || 'Unable to update avatar.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSelectSchoolGrade = async (newGrade) => {
    setUpdatingLevel(true);
    try {
      const updated = await profileService.update({
        firstName: form.firstName || user?.firstName,
        lastName: form.lastName || user?.lastName,
        email: form.email || user?.email,
        schoolGrade: newGrade,
      });
      await AsyncStorage.setItem('speakmate_school_grade', newGrade);
      setState((curr) => ({ ...curr, profile: updated }));
      if (updateUser) updateUser(updated);
      showToast('Grade Updated 🎓', 'success', `School curriculum set to ${newGrade}`);
    } catch (err) {
      showToast('Update Failed', 'error', 'Could not update School Grade.');
    } finally {
      setUpdatingLevel(false);
    }
  };

  const handleSelectProficiencyLevel = async (newLevel) => {
    setUpdatingLevel(true);
    try {
      const updated = await profileService.update({
        firstName: form.firstName || user?.firstName,
        lastName: form.lastName || user?.lastName,
        email: form.email || user?.email,
        englishLevel: newLevel,
      });
      setState((curr) => ({ ...curr, profile: updated }));
      if (updateUser) updateUser(updated);
      showToast('Proficiency Updated 🎯', 'success', `AI Tutor level set to ${newLevel}`);
    } catch (err) {
      showToast('Update Failed', 'error', 'Could not update English proficiency level.');
    } finally {
      setUpdatingLevel(false);
    }
  };

  const handleSelectAgeGroup = async (newAge) => {
    setSelectedAgeGroup(newAge);
    setUpdatingLevel(true);
    try {
      await AsyncStorage.setItem('speakmate_age_group', newAge);
      const updated = await profileService.update({
        firstName: form.firstName || user?.firstName,
        lastName: form.lastName || user?.lastName,
        email: form.email || user?.email,
        ageGroup: newAge,
      });
      await onboardingService.update({ ageGroup: newAge }).catch(() => {});
      setState((curr) => ({
        ...curr,
        profile: {
          ...curr.profile,
          ...updated,
          ageGroup: newAge,
        }
      }));
      if (updateUser) {
        updateUser({
          ...user,
          ...updated,
          ageGroup: newAge,
        });
      }
      showToast('Age Group Updated 👥', 'success', `Target audience set to ${newAge}`);
    } catch (err) {
      showToast('Update Failed', 'error', 'Could not update Age Group.');
    } finally {
      setUpdatingLevel(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of SpeakMateAI?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const avatarValue = state.profile?.avatar || '🎓';
  const isPhotoUri = avatarValue.startsWith('data:') || avatarValue.startsWith('http') || avatarValue.startsWith('file:');

  // Math for Level Progress Bar (500 XP per Level)
  const xp = state.profile?.xp || 0;
  const currentLevel = state.profile?.level || 1;
  const xpInCurrentLevel = xp % 500;
  const levelProgress = xpInCurrentLevel / 500;
  const rankTier = getRankTier(xp);
  const currentSchoolGrade = state.profile?.schoolGrade || user?.schoolGrade || '1st Std';
  const currentEnglishLevel = state.profile?.englishLevel || user?.englishLevel || 'Beginner';
  const currentAgeGroup = selectedAgeGroup || state.profile?.ageGroup || user?.ageGroup || 'Professional';
  const isKidsAgeGroup = Boolean(currentAgeGroup && currentAgeGroup.toLowerCase() === 'kids');

  // Custom colors for dark mode sync
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const labelColor = isDark ? '#F1F5F9' : '#0F172A';
  const sublabelColor = isDark ? '#94A3B8' : '#64748B';
  const dividerColor = isDark ? '#334155' : '#F1F5F9';
  const optionRowBg = isDark ? '#1E293B' : '#FFFFFF';
  const optionBorder = isDark ? '#334155' : '#F1F5F9';

  return (
    <Screen title="Profile" subtitle="Manage your SpeakMateAI account details.">
      <StateView loading={state.loading} error={state.error} onRetry={load}>
        {/* Modernized Profile Header Card with Premium Background Decor */}
        <Card style={[styles.profileHeaderCard, { backgroundColor: cardBg }]}>
          <LinearGradient
            colors={isDark ? ['#1E1B4B', '#312E81'] : ['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerDecoBg}
          />
          
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.9}
            onPress={() => setShowAvatarModal(true)}
            disabled={uploadingPhoto}
          >
            <View style={styles.avatarBorderGlow}>
              {isPhotoUri ? (
                <Image source={{ uri: avatarValue }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{avatarValue}</Text>
                </View>
              )}
            </View>

            {/* Premium Camera Overlay Badge */}
            <View style={styles.avatarEditBadge}>
              {uploadingPhoto ? (
                <Ionicons name="hourglass" size={12} color="#FFF" />
              ) : (
                <Ionicons name="camera" size={12} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={[styles.profileName, { color: labelColor }]}>{getDisplayName(state.profile)}</Text>
          <Text style={[styles.profileEmail, { color: sublabelColor }]}>{state.profile?.email}</Text>

          {/* Rank Tier Badge */}
          <LinearGradient
            colors={rankTier.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rankTierBadge}
          >
            <Text style={styles.rankTierIcon}>{rankTier.icon}</Text>
            <Text style={styles.rankTierName}>{rankTier.name} Rank</Text>
          </LinearGradient>

          {/* Level Progress Indicator */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelLabelRow}>
              <Text style={[styles.levelProgressText, { color: sublabelColor }]}>Level {currentLevel}</Text>
              <Text style={[styles.levelProgressText, { color: COLORS.primary, fontWeight: '800' }]}>{xpInCurrentLevel}/500 XP</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${levelProgress * 100}%` }]} />
            </View>
          </View>

          {/* Expanded Learning Metrics display */}
          <View style={[styles.metricsRow, { borderTopColor: dividerColor }]}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{currentLevel}</Text>
              <Text style={[styles.metricLbl, { color: sublabelColor }]}>Level</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{xp}</Text>
              <Text style={[styles.metricLbl, { color: sublabelColor }]}>Total XP</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{state.profile?.currentStreak || 0}d</Text>
              <Text style={[styles.metricLbl, { color: sublabelColor }]}>Streak</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{state.profile?.totalPracticeMinutes || 0}m</Text>
              <Text style={[styles.metricLbl, { color: sublabelColor }]}>Practice</Text>
            </View>
          </View>
        </Card>

        {/* Dynamic Setting Section based on Student vs Individual User */}
        {isStudent ? (
          /* Student Mode: School Standard Grade Card */
          <Card style={{ backgroundColor: cardBg, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={[styles.cardHeaderTitle, { color: labelColor, marginBottom: 2 }]}>
                  🎓 School Standard Grade
                </Text>
                <Text style={{ fontSize: 12, color: sublabelColor }}>
                  Configured curriculum standard for school practice
                </Text>
              </View>
              {updatingLevel && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {[
                '1st Std',
                '2nd Std',
                '3rd Std',
                '4th Std',
                '5th Std',
                '6th Std',
                '7th Std',
                '8th Std',
                '9th Std',
                '10th Std',
              ].map((grade) => {
                const active = currentSchoolGrade.toLowerCase() === grade.toLowerCase();
                return (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.levelSegmentBtn,
                      active && styles.levelSegmentBtnActive,
                      isDark && !active && { backgroundColor: '#334155' },
                      { paddingHorizontal: 14, minWidth: 72 }
                    ]}
                    onPress={() => handleSelectSchoolGrade(grade)}
                    disabled={updatingLevel}
                  >
                    <Text
                      style={[
                        styles.levelSegmentText,
                        active && styles.levelSegmentTextActive,
                        isDark && !active && { color: '#94A3B8' },
                      ]}
                    >
                      {grade}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Card>
        ) : (
          /* Individual User Mode: English Proficiency Level + Target Age Group Cards */
          <>
            <Card style={{ backgroundColor: cardBg, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View>
                  <Text style={[styles.cardHeaderTitle, { color: labelColor, marginBottom: 2 }]}>
                    👤 AI Tutor English Level
                  </Text>
                  <Text style={{ fontSize: 12, color: sublabelColor }}>
                    Controls speaking & chat response complexity
                  </Text>
                </View>
                {updatingLevel && <ActivityIndicator size="small" color={COLORS.primary} />}
              </View>

              <View style={styles.levelSegmentRow}>
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                  const active = currentEnglishLevel.toLowerCase() === lvl.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.levelSegmentBtn,
                        active && styles.levelSegmentBtnActive,
                        isDark && !active && { backgroundColor: '#334155' },
                      ]}
                      onPress={() => handleSelectProficiencyLevel(lvl)}
                      disabled={updatingLevel}
                    >
                      <Text
                        style={[
                          styles.levelSegmentText,
                          active && styles.levelSegmentTextActive,
                          isDark && !active && { color: '#94A3B8' },
                        ]}
                      >
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            <Card style={{ backgroundColor: cardBg, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View>
                  <Text style={[styles.cardHeaderTitle, { color: labelColor, marginBottom: 2 }]}>
                    👥 Target Age Group
                  </Text>
                  <Text style={{ fontSize: 12, color: sublabelColor }}>
                    Personalizes conversation topics and learning style
                  </Text>
                </View>
                {updatingLevel && <ActivityIndicator size="small" color={COLORS.primary} />}
              </View>

              <View style={styles.levelSegmentRow}>
                {['Kids', 'Teens', 'Young Adult', 'Professional', 'Senior'].map((age) => {
                  const active = currentAgeGroup.toLowerCase() === age.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={age}
                      style={[
                        styles.levelSegmentBtn,
                        active && styles.levelSegmentBtnActive,
                        isDark && !active && { backgroundColor: '#334155' },
                        { paddingHorizontal: 9 }
                      ]}
                      onPress={() => handleSelectAgeGroup(age)}
                      disabled={updatingLevel}
                    >
                      <Text
                        style={[
                          styles.levelSegmentText,
                          active && styles.levelSegmentTextActive,
                          isDark && !active && { color: '#94A3B8' },
                          { fontSize: 11 }
                        ]}
                      >
                        {age}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </>
        )}

        {/* AI Speaking Tutor Avatar Selection Card */}
        <Card style={{ backgroundColor: cardBg, marginBottom: 14 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.cardHeaderTitle, { color: labelColor, marginBottom: 2 }]}>
              🎭 AI Speaking Tutor
            </Text>
            <Text style={{ fontSize: 12, color: sublabelColor }}>
              {isKidsAgeGroup
                ? 'Select your Live2D cartoon buddy or tutor'
                : 'Select your Live2D avatar practice tutor'}
            </Text>
          </View>

          <View style={styles.tutorCardsRow}>
            {/* HARU (FEMALE) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectTutor('female')}
              style={[
                styles.tutorCard,
                {
                  backgroundColor: tutorGender === 'female' || (tutorGender === 'robopaws' && !isKidsAgeGroup) ? (isDark ? '#2E224F' : '#EEF2FF') : (isDark ? '#334155' : '#F8FAFC'),
                  borderColor: tutorGender === 'female' || (tutorGender === 'robopaws' && !isKidsAgeGroup) ? '#6366F1' : (isDark ? '#475569' : '#E2E8F0'),
                  borderWidth: tutorGender === 'female' || (tutorGender === 'robopaws' && !isKidsAgeGroup) ? 2 : 1,
                }
              ]}
            >
              <Text style={styles.tutorCardEmoji}>👩</Text>
              <Text style={[styles.tutorCardName, { color: tutorGender === 'female' || (tutorGender === 'robopaws' && !isKidsAgeGroup) ? '#6366F1' : labelColor }]}>
                Haru (Female)
              </Text>
              <Text style={[styles.tutorCardDesc, { color: sublabelColor }]} numberOfLines={2}>
                Warm & encouraging
              </Text>
              {(tutorGender === 'female' || (tutorGender === 'robopaws' && !isKidsAgeGroup)) && (
                <View style={styles.tutorCheckmark}>
                  <Ionicons name="checkmark-circle" size={16} color="#6366F1" />
                </View>
              )}
            </TouchableOpacity>

            {/* CHITOSE (MALE) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectTutor('male')}
              style={[
                styles.tutorCard,
                {
                  backgroundColor: tutorGender === 'male' ? (isDark ? '#2E224F' : '#EEF2FF') : (isDark ? '#334155' : '#F8FAFC'),
                  borderColor: tutorGender === 'male' ? '#6366F1' : (isDark ? '#475569' : '#E2E8F0'),
                  borderWidth: tutorGender === 'male' ? 2 : 1,
                }
              ]}
            >
              <Text style={styles.tutorCardEmoji}>👨</Text>
              <Text style={[styles.tutorCardName, { color: tutorGender === 'male' ? '#6366F1' : labelColor }]}>
                Chitose (Male)
              </Text>
              <Text style={[styles.tutorCardDesc, { color: sublabelColor }]} numberOfLines={2}>
                Confident & supportive
              </Text>
              {tutorGender === 'male' && (
                <View style={styles.tutorCheckmark}>
                  <Ionicons name="checkmark-circle" size={16} color="#6366F1" />
                </View>
              )}
            </TouchableOpacity>

            {/* ROBO-PAWS (CARTOON ROBOT CAT) - Only if Age Group is Kids / Early Primary */}
            {isKidsAgeGroup && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelectTutor('robopaws')}
                style={[
                  styles.tutorCard,
                  {
                    backgroundColor: tutorGender === 'robopaws' ? (isDark ? '#2E224F' : '#EEF2FF') : (isDark ? '#334155' : '#F8FAFC'),
                    borderColor: tutorGender === 'robopaws' ? '#6366F1' : (isDark ? '#475569' : '#E2E8F0'),
                    borderWidth: tutorGender === 'robopaws' ? 2 : 1,
                  }
                ]}
              >
                <Text style={styles.tutorCardEmoji}>🤖</Text>
                <Text style={[styles.tutorCardName, { color: tutorGender === 'robopaws' ? '#6366F1' : labelColor }]}>
                  Robo-Paws
                </Text>
                <Text style={[styles.tutorCardDesc, { color: sublabelColor }]} numberOfLines={2}>
                  Kids Robot Buddy
                </Text>
                {tutorGender === 'robopaws' && (
                  <View style={styles.tutorCheckmark}>
                    <Ionicons name="checkmark-circle" size={16} color="#6366F1" />
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Edit Info Form - Modern layout with full fields */}
        <Card style={{ backgroundColor: cardBg }}>
          <Text style={[styles.cardHeaderTitle, { color: labelColor }]}>Personal Information</Text>
          
          <View style={styles.nameRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppInput
                label="First name"
                value={form.firstName}
                onChangeText={(value) => setForm((current) => ({ ...current, firstName: value }))}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppInput
                label="Last name"
                value={form.lastName}
                onChangeText={(value) => setForm((current) => ({ ...current, lastName: value }))}
              />
            </View>
          </View>

          <AppInput
            label="Email Address"
            value={form.email}
            onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
            keyboardType="email-address"
          />

          <AppButton
            title="Save Changes"
            onPress={save}
            loading={saving}
            style={styles.saveBtn}
          />
        </Card>

        {/* Account Utilities Options */}
        <View style={styles.optionsList}>
          <TouchableOpacity
            style={[styles.optionRow, { backgroundColor: optionRowBg, borderColor: optionBorder }]}
            activeOpacity={0.7}
            onPress={handlePickImage}
            disabled={uploadingPhoto}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="image" size={20} color="#059669" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: labelColor }]}>Upload Profile Photo</Text>
              <Text style={[styles.optionSubtitle, { color: sublabelColor }]}>
                {uploadingPhoto ? 'Uploading your photo…' : 'Choose a photo from your gallery'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={sublabelColor} />
          </TouchableOpacity>

          {/* Subscription & Pro Management for Individual Users */}
          {!isStudent && (
            <TouchableOpacity
              style={[styles.optionRow, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', borderColor: isDark ? '#4338CA' : '#C7D2FE' }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Subscription')}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="diamond" size={20} color="#D97706" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: isDark ? '#FFFFFF' : '#312E81', fontWeight: '800' }]}>
                  {(!isStudent && (user?.isPro || user?.pro)) ? '⭐ SpeakMate Pro Member' : '⭐ Upgrade to Pro'}
                </Text>
                <Text style={[styles.optionSubtitle, { color: isDark ? '#A5B4FC' : '#4F46E5' }]}>
                  {(!isStudent && (user?.isPro || user?.pro)) ? 'Manage your active subscription' : 'Unlimited AI Speaking & Accent Coach'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={isDark ? '#818CF8' : '#4F46E5'} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.optionRow, { backgroundColor: optionRowBg, borderColor: optionBorder }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="settings" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: labelColor }]}>App Settings</Text>
              <Text style={[styles.optionSubtitle, { color: sublabelColor }]}>Languages, AI Voice, Sound effects</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={sublabelColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionRow, styles.logoutOptionRow, { backgroundColor: optionRowBg, borderColor: isDark ? '#7f1d1d' : '#FEE2E2' }]}
            activeOpacity={0.7}
            onPress={handleLogoutPress}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: '#EF4444' }]}>Log Out</Text>
              <Text style={[styles.optionSubtitle, { color: sublabelColor }]}>Sign out from this device</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
          </TouchableOpacity>

          {/* Delete Account Option */}
          <TouchableOpacity
            style={[styles.optionRow, styles.logoutOptionRow, { backgroundColor: optionRowBg, borderColor: isDark ? '#7f1d1d' : '#FEE2E2', marginTop: 10 }]}
            activeOpacity={0.7}
            onPress={handleOpenDeleteModal}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: '#DC2626', fontWeight: '800' }]}>Delete Account</Text>
              <Text style={[styles.optionSubtitle, { color: sublabelColor }]}>Permanently remove account & data via Email OTP</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
          </TouchableOpacity>
        </View>
      </StateView>

      {/* ── DELETE ACCOUNT MODAL ────────────────────────────────────── */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: isDark ? '#451A1A' : '#FEF2F2' }]}>
                <Ionicons name="trash" size={24} color="#EF4444" />
              </View>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={[styles.modalTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Delete Account</Text>
                <Text style={[styles.modalSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Verification code required to delete account
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingVertical: 12 }} keyboardShouldPersistTaps="handled">
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={18} color="#D97706" style={{ marginTop: 2 }} />
                <Text style={styles.warningText}>
                  This action is permanent. Enter your registered email address to receive a 6-digit OTP code before proceeding.
                </Text>
              </View>

              {/* Email Section */}
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.inputLabel, { color: isDark ? '#CBD5E1' : '#475569' }]}>Registered Email Address</Text>
                <View style={[styles.emailRow, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                  <Ionicons name="mail" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <AppInput
                    value={deleteEmail}
                    onChangeText={setDeleteEmail}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }}
                  />
                  <TouchableOpacity
                    onPress={handleSendDeleteOtp}
                    disabled={sendingOtp}
                    style={[styles.sendOtpInlineBtn, { backgroundColor: otpSent ? '#10B981' : COLORS.primary }]}
                  >
                    <Text style={styles.sendOtpInlineText}>
                      {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* OTP Section (Expands when sent) */}
              {otpSent && (
                <View style={[styles.otpExpandCard, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: isDark ? '#059669' : '#A7F3D0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="shield-checkmark" size={18} color="#10B981" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#D1FAE5' : '#065F46' }}>
                      Enter 6-digit OTP Code
                    </Text>
                  </View>
                  <AppInput
                    value={deleteOtp}
                    onChangeText={setDeleteOtp}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={{
                      textAlign: 'center',
                      fontSize: 22,
                      fontWeight: '800',
                      letterSpacing: 8,
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderColor: '#10B981',
                    }}
                  />
                </View>
              )}

              {/* Confirm Deletion Button */}
              {otpSent && (
                <TouchableOpacity
                  onPress={handleConfirmDeleteAccount}
                  disabled={deletingAccount}
                  activeOpacity={0.8}
                  style={[styles.deleteConfirmBtn, { opacity: deletingAccount ? 0.7 : 1 }]}
                >
                  <Ionicons name="trash" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.deleteConfirmBtnText}>
                    {deletingAccount ? 'Deleting Account...' : 'Permanently Delete Account'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── AVATAR PICKER MODAL ────────────────────────────────────── */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
                <Ionicons name="happy" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={[styles.modalTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Choose Avatar</Text>
                <Text style={[styles.modalSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Select a learning avatar or upload a custom photo
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Gallery Upload Option Button */}
            <TouchableOpacity
              style={[styles.galleryUploadBtn, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
              onPress={() => {
                setShowAvatarModal(false);
                setTimeout(() => handlePickImage(), 200);
              }}
            >
              <Ionicons name="images" size={22} color={COLORS.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: labelColor }]}>Upload Photo from Gallery</Text>
                <Text style={[styles.optionSubtitle, { color: sublabelColor }]}>Choose a custom image from your device</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={sublabelColor} />
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { color: isDark ? '#CBD5E1' : '#475569', marginTop: 16, marginBottom: 10 }]}>
              Or Pick an Avatar Emoji
            </Text>

            {/* Avatar Emojis Grid */}
            <View style={styles.avatarGrid}>
              {PRESET_AVATARS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.avatarGridItem, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}
                  onPress={() => handleSelectPresetAvatar(emoji)}
                >
                  <Text style={{ fontSize: 32 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeaderCard: {
    alignItems: 'center',
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: 24,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  headerDecoBg: {
    height: 115,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarWrapper: {
    marginTop: 28,
    marginBottom: 12,
    position: 'relative',
  },
  avatarBorderGlow: {
    padding: 4,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 42,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFF',
    elevation: 3,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 3,
    textAlign: 'center',
  },
  levelProgressContainer: {
    width: '85%',
    marginTop: 18,
    alignItems: 'center',
  },
  levelLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  levelProgressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 22,
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  metricLbl: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveBtn: {
    marginTop: 8,
  },
  optionsList: {
    marginTop: 6,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  logoutOptionRow: {
    borderWidth: 1,
  },
  optionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  optionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  // Delete Account Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 2,
    marginBottom: 14,
  },
  sendOtpInlineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendOtpInlineText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  otpExpandCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  deleteConfirmBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  deleteConfirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  rankTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
    gap: 6,
    elevation: 2,
  },
  rankTierIcon: {
    fontSize: 14,
  },
  rankTierName: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  levelSegmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  levelSegmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelSegmentBtnActive: {
    backgroundColor: COLORS.primary,
    elevation: 2,
  },
  levelSegmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  levelSegmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  galleryUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  avatarGridItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  tutorCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tutorCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tutorCardEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  tutorCardName: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'center',
  },
  tutorCardDesc: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  tutorCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
