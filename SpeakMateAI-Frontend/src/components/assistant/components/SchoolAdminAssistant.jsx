import React from "react";
import AssistantWidget from "./AssistantWidget";

/**
 * Dedicated School Admin AI Assistant Chatbot.
 * Strictly scoped to role="SCHOOL_ADMIN" with single-school tenant isolation
 * (teachers, classes, divisions, and students belonging to their school).
 */
export function SchoolAdminAssistant() {
    return <AssistantWidget role="SCHOOL_ADMIN" />;
}

export default SchoolAdminAssistant;
