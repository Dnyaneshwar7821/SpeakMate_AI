import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { navigationRef } from '../../navigation/navigationRef';
import assistantApi from './assistantApi';
import AssistantFAB from './AssistantFAB';
import AssistantModal from './AssistantModal';
import { subscribeLearnerAssistant, openLearnerAssistant } from './assistantEvents';

export { openLearnerAssistant };

const generateSessionId = () => `mob_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// Screens where the floating assistant must be suppressed to avoid competing UI overlays
const DEDICATED_TUTOR_PRACTICE_SCREENS = new Set([
  'conversationchat',
  'conversation',
  'aichathome',
  'lessondetail',
]);

// Screens that display the bottom tab navigation bar
const BOTTOM_TAB_SCREENS = new Set([
  'dashboard',
  'speakinghome',
  'profile',
]);

export function LearnerAssistantWidget() {
  const { isAuthenticated, user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRouteName, setCurrentRouteName] = useState(null);

  const sessionIdRef = useRef(generateSessionId());

  // Listen for programmatic open requests
  useEffect(() => {
    return subscribeLearnerAssistant(() => setIsOpen(true));
  }, []);

  // Listen to navigation transitions for route-aware visibility & bottom tab bounds
  useEffect(() => {
    const handleRouteSync = () => {
      if (navigationRef.isReady()) {
        const cur = navigationRef.getCurrentRoute();
        if (cur?.name) {
          setCurrentRouteName(cur.name);
        }
      }
    };

    handleRouteSync();
    const unsubscribe = navigationRef.addListener('state', handleRouteSync);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Isolate conversation history per authenticated user to prevent cross-account data leakage
  const userStorageKey = useMemo(() => {
    if (!isAuthenticated || !user) return null;
    const identifier = user.id || user._id || (user.email ? String(user.email).toLowerCase().trim() : null);
    return identifier ? `speakmate_assistant_msgs_${identifier}` : null;
  }, [isAuthenticated, user]);

  // Load user-specific conversation history from AsyncStorage on mount or account switch
  useEffect(() => {
    if (!userStorageKey) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    AsyncStorage.getItem(userStorageKey)
      .then((saved) => {
        if (isMounted && saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setMessages(parsed);
            }
          } catch (_) {}
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [userStorageKey]);

  // Persist updated message history for current authenticated user
  const persistMessages = useCallback(
    (newMessages) => {
      if (!userStorageKey) return;
      try {
        const bounded = newMessages.slice(-30); // Cap stored history to last 30 turns
        AsyncStorage.setItem(userStorageKey, JSON.stringify(bounded)).catch(() => {});
      } catch (_) {}
    },
    [userStorageKey]
  );

  // Determine role: school student gets syllabus/grade persona, general user gets conversational fluency persona
  const role = useMemo(() => {
    const isStudent = Boolean(
      user?.accountType === 'STUDENT' ||
      user?.role === 'STUDENT' ||
      user?.isSchoolStudent ||
      user?.schoolGrade ||
      user?.schoolId
    );
    return isStudent ? 'STUDENT' : 'USER';
  }, [user]);

  // Reset conversation session & clear user-scoped persistence
  const startNewChat = useCallback(() => {
    sessionIdRef.current = generateSessionId();
    setMessages([]);
    setError(null);
    if (userStorageKey) {
      AsyncStorage.removeItem(userStorageKey).catch(() => {});
    }
  }, [userStorageKey]);

  // Send message to assistant endpoint
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = String(text || '').trim();
      if (!trimmed || loading) return;

      setError(null);

      const userMsgId = `user_${Date.now()}`;
      const userMsg = {
        id: userMsgId,
        sender: 'user',
        content: trimmed,
      };

      const updatedWithUser = [...messages, userMsg];
      setMessages(updatedWithUser);
      persistMessages(updatedWithUser);
      setLoading(true);

      try {
        // Multi-turn context strategy: send up to 8 recent user/assistant turns
        const history = messages
          .filter((m) => m.id !== 'welcome' && m.content && m.content.trim())
          .slice(-8)
          .map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content || '',
          }));

        let activeRoute = '/dashboard';
        if (navigationRef.isReady()) {
          const cur = navigationRef.getCurrentRoute();
          if (cur?.name) {
            activeRoute = '/' + cur.name.toLowerCase();
          }
        }

        const res = await assistantApi.sendMessage({
          sessionId: sessionIdRef.current,
          message: trimmed,
          currentRoute: activeRoute,
          history,
          role,
        });

        if (res?.sessionId) {
          sessionIdRef.current = res.sessionId;
        }

        const assistantMsg = {
          id: `assistant_${Date.now()}`,
          sender: 'assistant',
          content: res.markdown || "I couldn't find an answer for that. Please try rephrasing.",
          stats: Array.isArray(res.stats) ? res.stats : [],
          suggestions: Array.isArray(res.suggestions) ? res.suggestions : [],
          chart: res.chart || null,
          accessDenied: Boolean(res.accessDenied),
        };

        const updatedWithAssistant = [...updatedWithUser, assistantMsg];
        setMessages(updatedWithAssistant);
        persistMessages(updatedWithAssistant);
      } catch (err) {
        console.warn('[LearnerAssistantWidget] Message send failed:', err);
        const friendly = assistantApi.toFriendlyError(err);
        setError(friendly);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, persistMessages, role]
  );

  // Determine if the current screen has bottom tabs or is a full-screen tutor practice screen
  const normalizedRoute = (currentRouteName || '').toLowerCase().trim();
  const isDedicatedTutorScreen = DEDICATED_TUTOR_PRACTICE_SCREENS.has(normalizedRoute);
  const hasBottomTabs = BOTTOM_TAB_SCREENS.has(normalizedRoute);

  // Only render for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button (hidden when modal is open or when on dedicated tutor/voice screens) */}
      {!isOpen && !isDedicatedTutorScreen && (
        <AssistantFAB
          onPress={() => setIsOpen(true)}
          loading={loading}
          hasBottomTabs={hasBottomTabs}
        />
      )}

      {/* Assistant Sheet Modal with Fullscreen Blurred Backdrop */}
      <AssistantModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        loading={loading}
        error={error}
        role={role}
        onSendMessage={sendMessage}
        onResetChat={startNewChat}
        onClearError={() => setError(null)}
      />
    </>
  );
}

export default LearnerAssistantWidget;
