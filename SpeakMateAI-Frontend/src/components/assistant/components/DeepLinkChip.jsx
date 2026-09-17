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
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3.5 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors duration-200 hover:bg-[var(--color-primary)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            {suggestion.label || "Open full analytics"}
        </button>
    );
}

export default DeepLinkChip;
