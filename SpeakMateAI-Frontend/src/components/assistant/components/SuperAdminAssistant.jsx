import React from "react";
import AssistantWidget from "./AssistantWidget";

/**
 * Dedicated Super Admin AI Assistant Chatbot.
 * Strictly scoped to role="SUPER_ADMIN" with full platform intelligence
 * and cross-school student progress lookup capabilities.
 */
export function SuperAdminAssistant() {
    return <AssistantWidget role="SUPER_ADMIN" />;
}

export default SuperAdminAssistant;
