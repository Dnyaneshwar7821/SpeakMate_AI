import React from "react";
import AssistantWidget from "./AssistantWidget";

/**
 * Dedicated Teacher AI Assistant Chatbot.
 * Strictly scoped to role="TEACHER" with access only to assigned classes
 * and students enrolled in those classes.
 */
export function TeacherAssistant() {
    return <AssistantWidget role="TEACHER" />;
}

export default TeacherAssistant;
