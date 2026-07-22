// DrawerContext
//
// Keep this context because DrawerSidebar uses it for profile/progress sync
// and for its own open/close animation state.
// Official React Navigation Drawer handles the drawer gesture and history,
// but the existing UI/animations in DrawerSidebar rely on this context.

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { profileService, progressService } from '../services/appServices';

export const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((v) => !v), []);

  const refreshSummary = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [profileData, progressData] = await Promise.all([
        profileService.get().catch(() => null),
        progressService.get().catch(() => null),
      ]);
      setProfile(profileData);
      setProgress(progressData);
    } catch (error) {
      console.warn('Failed to sync profile/progress in DrawerContext:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      profile,
      setProfile,
      progress,
      setProgress,
      isSyncing,
      refreshSummary,
    }),
    [
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      profile,
      progress,
      isSyncing,
      refreshSummary,
    ],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
};

export const useDrawer = () => useContext(DrawerContext);

