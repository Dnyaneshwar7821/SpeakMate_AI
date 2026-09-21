import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { RENDER_WHITELIST } from "../constants";

export function DeepLinkChip({ suggestion, role, onClose }) {
    const navigate = useNavigate();

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
            className="group mt-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 shadow-xs transition-all duration-200 hover:border-indigo-500 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 hover:text-indigo-700 dark:hover:text-white hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
        >
            <span>{suggestion.label || "Open full analytics"}</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </button>
    );
}

export default DeepLinkChip;
