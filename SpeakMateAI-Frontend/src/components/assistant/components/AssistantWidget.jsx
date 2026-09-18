import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AssistantProvider, useAssistant } from "../AssistantContext";
import AssistantBubble from "./AssistantBubble";
import AssistantPanel from "./AssistantPanel";

export function AssistantWidgetInner() {
    const { isOpen, toggle, closeWidget } = useAssistant();

    return (
        <>
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        key="assistant-panel"
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                        <AssistantPanel />
                    </motion.div>
                ) : null}
            </AnimatePresence>
            <AssistantBubble isOpen={isOpen} onClick={isOpen ? closeWidget : toggle} />
        </>
    );
}

export function AssistantWidget({ role, user }) {
    return (
        <AssistantProvider role={role} user={user}>
            <AssistantWidgetInner />
        </AssistantProvider>
    );
}

export default AssistantWidget;
