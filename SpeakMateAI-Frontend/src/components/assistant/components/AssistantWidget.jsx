import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AssistantProvider, useAssistant } from "../AssistantContext";
import AssistantBubble from "./AssistantBubble";
import AssistantPanel from "./AssistantPanel";

class AssistantErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.warn("[AssistantWidget] Assistant widget caught render error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            // Failsafe fallback: Render a minimal reset trigger so users can reopen cleanly without crashing the page
            return (
                <AssistantBubble
                    isOpen={false}
                    loading={false}
                    onClick={() => {
                        this.setState({ hasError: false });
                    }}
                />
            );
        }
        return this.props.children;
    }
}

export function AssistantWidgetInner() {
    const { isOpen, toggle, closeWidget, loading } = useAssistant();

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
            <AssistantBubble isOpen={isOpen} loading={loading} onClick={isOpen ? closeWidget : toggle} />
        </>
    );
}

export function AssistantWidget({ role, user }) {
    return (
        <AssistantErrorBoundary>
            <AssistantProvider role={role} user={user}>
                <AssistantWidgetInner />
            </AssistantProvider>
        </AssistantErrorBoundary>
    );
}

export default AssistantWidget;
