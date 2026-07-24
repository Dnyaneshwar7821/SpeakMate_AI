import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function stopAllSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Error cancelling speech synthesis:", e);
    }
  }
}

export function useSpeechCleanup() {
  const location = useLocation();

  // Cancel speech whenever the route changes
  useEffect(() => {
    stopAllSpeech();
    return () => {
      stopAllSpeech();
    };
  }, [location.pathname]);

  // Cancel speech on tab close, page unload, or visibility change
  useEffect(() => {
    const handleUnloadOrHide = () => {
      stopAllSpeech();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllSpeech();
      }
    };

    window.addEventListener("beforeunload", handleUnloadOrHide);
    window.addEventListener("pagehide", handleUnloadOrHide);
    window.addEventListener("unload", handleUnloadOrHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopAllSpeech();
      window.removeEventListener("beforeunload", handleUnloadOrHide);
      window.removeEventListener("pagehide", handleUnloadOrHide);
      window.removeEventListener("unload", handleUnloadOrHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}

export default useSpeechCleanup;
