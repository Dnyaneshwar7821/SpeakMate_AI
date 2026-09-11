import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

// ─── Global crash catcher ────────────────────────────────────────────────────
// Catches ALL JS errors (including module-level) before React mounts.
// The error will appear in the Metro console so we can diagnose it.
if (typeof ErrorUtils !== 'undefined') {
  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[GLOBAL ERROR]', isFatal ? 'FATAL' : 'NON-FATAL');
    console.error('[GLOBAL ERROR] Message:', error?.message);
    console.error('[GLOBAL ERROR] Stack:', error?.stack);
    if (previousHandler) previousHandler(error, isFatal);
  });
}
// ─────────────────────────────────────────────────────────────────────────────

import App from './App';

registerRootComponent(App);
