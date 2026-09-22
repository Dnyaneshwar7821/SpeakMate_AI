import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { RENDER_WHITELIST } from "../constants";
import { useAssistantTheme } from "../useAssistantTheme";

export function DeepLinkChip({ suggestion, role, onClose }) {
    const navigate = useNavigate();
    const theme = useAssistantTheme();

    const route = suggestion?.route;
    if (!route || !Object.prototype.hasOwnProperty.call(RENDER_WHITELIST, route)) {
        return null;
    }

    if (suggestion.targetRole && suggestion.targetRole !== role) {
        return null;
    }

    const handleClick = () => {
        onClose?.();
        navigate(route);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`group mt-2 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all duration-200 ${theme.badgeBg} ${theme.hoverBorder} hover:shadow-sm focus:outline-none focus-visible:ring-2 ${theme.ring} cursor-pointer`}
        >
            <span>{suggestion.label || "Open full analytics"}</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </button>
    );
}

export default DeepLinkChip;

