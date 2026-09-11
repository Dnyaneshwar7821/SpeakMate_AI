import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RouteProgressBar.jsx
 *
 * Displays a sleek, YouTube/GitHub-style animated loading progress bar at the
 * top of the screen whenever the user switches tabs or routes in the Super Admin panel.
 */
export function RouteProgressBar() {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setIsLoading(true);
        setProgress(25);

        const t1 = setTimeout(() => {
            setProgress(65);
        }, 100);

        const t2 = setTimeout(() => {
            setProgress(90);
        }, 220);

        const t3 = setTimeout(() => {
            setProgress(100);
        }, 360);

        const t4 = setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
        }, 550);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [location.pathname, location.search]);

    return (
        <AnimatePresence>
            {isLoading && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden bg-transparent"
                >
                    <motion.div
                        initial={{ width: "0%", opacity: 1 }}
                        animate={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            width: { duration: 0.25, ease: "easeOut" },
                            opacity: { duration: 0.2, ease: "easeIn" },
                        }}
                        className="h-full bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                    />
                </div>
            )}
        </AnimatePresence>
    );
}

export default RouteProgressBar;
