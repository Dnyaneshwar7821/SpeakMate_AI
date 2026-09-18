import React from "react";
import AssistantWidget from "./AssistantWidget";
import { useAuth } from "../../../context/AuthContext";

/**
 * Dedicated Learner AI Assistant Chatbot (Student / General User).
 * Dynamically switches persona based on user account type:
 * - School Student (accountType === 'STUDENT' or isSchoolStudent):
 *   Grade/curriculum-aware, syllabus scenarios, school homework and streaks.
 * - General Individual User (accountType === 'INDIVIDUAL_USER' / 'USER'):
 *   Conversational English, personal fluency, everyday scenarios, and subscription.
 *
 * Rendered only for authenticated users on learner pages.
 */
export function LearnerAssistant() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    const isStudent =
        user?.accountType === "STUDENT" ||
        user?.role === "STUDENT" ||
        Boolean(user?.isSchoolStudent) ||
        localStorage.getItem("speakmate_account_type") === "STUDENT";

    const role = isStudent ? "STUDENT" : "USER";

    return <AssistantWidget role={role} user={user} />;
}

export default LearnerAssistant;
