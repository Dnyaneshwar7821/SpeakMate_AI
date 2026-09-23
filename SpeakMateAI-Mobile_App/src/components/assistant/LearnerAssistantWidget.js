import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { navigationRef } from '../../navigation/navigationRef';
import assistantApi from './assistantApi';
import AssistantFAB from './AssistantFAB';
import AssistantModal from './AssistantModal';

const generateSessionId = () => `mob_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function LearnerAssistantWidget() {
  const { isAuthenticated, user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sessionIdRef = useRef(generateSessionId());

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

  // Clear and reset conversation session
  const startNewChat = useCallback(() => {
    sessionIdRef.current = generateSessionId();
    setMessages([]);
    setError(null);
  }, []);

  // Send message to assistant endpoint
  const sendMessage = useCallback(async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || loading) return;

    setError(null);

    const userMsgId = `user_${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Bounded conversational turns
      const history = messages.slice(-4).map((m) => ({
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

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('[LearnerAssistantWidget] Message send failed:', err);
      const friendly = assistantApi.toFriendlyError(err);
      setError(friendly);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, role]);

  // Only render for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <AssistantFAB
          onPress={() => setIsOpen(true)}
          loading={loading}
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
