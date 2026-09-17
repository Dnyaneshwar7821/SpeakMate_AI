import React, { useState } from "react";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import {
  Bell,
  Volume2,
  VolumeX,
  Play,
  Sliders,
  ShieldCheck,
  GraduationCap,
  Users,
  Building2,
  Mic,
  Check,
  AlertTriangle,
  Radio,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { SOUND_THEMES, DEFAULT_NOTIFICATION_SETTINGS } from "@/hooks/useNotifications";

export function NotificationSettingsModal({
  isOpen,
  onClose,
  settings = DEFAULT_NOTIFICATION_SETTINGS,
  onUpdateSettings,
  onTestSound
}) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [testedTheme, setTestedTheme] = useState(null);

  // Sync state whenever modal opens with latest settings
  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleToggleGlobal = () => {
    const updated = { ...localSettings, enabled: !localSettings.enabled };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
  };

  const handleToggleChannel = (channelKey) => {
    const updated = { ...localSettings, [channelKey]: !localSettings[channelKey] };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
  };

  const handleToggleCategory = (categoryKey) => {
    const updated = {
      ...localSettings,
      categories: {
        ...localSettings.categories,
        [categoryKey]: !localSettings.categories?.[categoryKey]
      }
    };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
  };

  const handleSelectTheme = (themeId) => {
    const updated = { ...localSettings, soundTheme: themeId };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
    // Play sound sample
    handlePlaySample(themeId, localSettings.soundVolume);
  };

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value, 10);
    const updated = { ...localSettings, soundVolume: vol };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
  };

  const handlePlaySample = (themeId = localSettings.soundTheme, volume = localSettings.soundVolume) => {
    setTestedTheme(themeId);
    onTestSound?.(themeId, volume);
    setTimeout(() => setTestedTheme(null), 1200);
  };

  const handleResetDefaults = () => {
    setLocalSettings(DEFAULT_NOTIFICATION_SETTINGS);
    onUpdateSettings?.(DEFAULT_NOTIFICATION_SETTINGS);
    handlePlaySample(DEFAULT_NOTIFICATION_SETTINGS.soundTheme, DEFAULT_NOTIFICATION_SETTINGS.soundVolume);
  };

  const handleEnableAll = () => {
    const updated = {
      ...localSettings,
      enabled: true,
      soundEnabled: true,
      toastsEnabled: true,
      categories: {
        schools: true,
        teachers: true,
        students: true,
        activities: true,
        security: true
      }
    };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
  };

  const handleRequestDesktopPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const updated = { ...localSettings, desktopPushEnabled: true };
          setLocalSettings(updated);
          onUpdateSettings?.(updated);
          new Notification("SpeakMate AI Notifications", {
            body: "Desktop alerts are now actively enabled!",
            icon: "/favicon.ico"
          });
        } else {
          alert("Notification permission was denied in your browser settings.");
        }
      } catch (err) {
        console.error("Failed to request permission", err);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Preferences"
      description="Configure audio chimes, event triggers, and role-wide notification delivery."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-sm">
        {/* 1. Global Master Switch */}
        <div
          className={`flex items-center justify-between rounded-2xl border p-4.5 transition-all shadow-xs ${
            localSettings.enabled
              ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10"
              : "border-slate-300 dark:border-slate-800 bg-[var(--bg-subtle)] opacity-80"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <span
              className={`grid h-11 w-11 place-items-center rounded-xl font-bold transition ${
                localSettings.enabled
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}
            >
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[var(--text-primary)]">
                  Master Notifications
                </h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    localSettings.enabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {localSettings.enabled ? "ACTIVE" : "PAUSED"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Master switch for the entire admin panel. Turning off mutes all sound alerts and popups.
              </p>
            </div>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={Boolean(localSettings.enabled)}
              onChange={handleToggleGlobal}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
          </label>
        </div>

        {/* 2. Sound & Audio Customization */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2.5">
              <Volume2 className="h-4 w-4 text-[var(--color-primary)]" />
              <h4 className="font-bold text-[var(--text-primary)]">
                Notification Sound & Chimes
              </h4>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                disabled={!localSettings.enabled}
                checked={Boolean(localSettings.soundEnabled && localSettings.enabled)}
                onChange={() => handleToggleChannel("soundEnabled")}
                className="peer sr-only"
              />
              <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
            </label>
          </div>

          {/* Sound Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Choose Sound Tone:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SOUND_THEMES.map((theme) => {
                const isSelected = localSettings.soundTheme === theme.id;
                const isPlayingThis = testedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    disabled={!localSettings.enabled || !localSettings.soundEnabled}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--text-primary)] shadow-xs"
                        : "border-[var(--border-default)] hover:border-slate-400 bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                    } disabled:opacity-50 cursor-pointer`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{theme.icon}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text-primary)]">
                          <span>{theme.name}</span>
                          {isSelected && <Check className="h-3 w-3 text-[var(--color-primary)]" />}
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {theme.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySample(theme.id, localSettings.soundVolume);
                      }}
                      className={`h-7 w-7 shrink-0 grid place-items-center rounded-lg border transition ${
                        isPlayingThis
                          ? "bg-[var(--color-primary)] text-white border-transparent scale-105"
                          : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                      title="Test sound"
                    >
                      <Play className="h-3 w-3 fill-current ml-0.5" />
                    </button>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Control */}
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                {localSettings.soundVolume === 0 ? (
                  <VolumeX className="h-3.5 w-3.5 text-rose-500" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                )}
                Chime Volume
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {localSettings.soundVolume}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={!localSettings.enabled || !localSettings.soundEnabled}
                value={localSettings.soundVolume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)] disabled:opacity-50"
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!localSettings.enabled || !localSettings.soundEnabled}
                onClick={() => handlePlaySample()}
                className="!h-7 text-[11px] font-semibold shrink-0"
              >
                <Play className="h-3 w-3 mr-1 fill-current" />
                Test
              </Button>
            </div>
          </div>

          {/* Severity Sounds Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Urgent Warning for Deletions & Errors
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Automatically plays a distinct alert tone when an entity is deleted or an error occurs.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                disabled={!localSettings.enabled || !localSettings.soundEnabled}
                checked={Boolean(localSettings.severitySounds)}
                onChange={() => handleToggleChannel("severitySounds")}
                className="peer sr-only"
              />
              <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
            </label>
          </div>
        </div>

        {/* 3. Delivery Channels */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 space-y-3">
          <div className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] pb-2.5">
            <Radio className="h-4 w-4 text-[var(--color-primary)]" />
            <h4 className="font-bold text-[var(--text-primary)]">
              Visual Alert Channels
            </h4>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                In-App Toast Banners
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Display floating notification cards at the top right when new activity occurs.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                disabled={!localSettings.enabled}
                checked={Boolean(localSettings.toastsEnabled && localSettings.enabled)}
                onChange={() => handleToggleChannel("toastsEnabled")}
                className="peer sr-only"
              />
              <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5">
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Desktop Browser Push
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Receive operating system notifications even when working in another tab or window.
              </p>
            </div>
            {typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRequestDesktopPermission}
                className="!h-7 text-[11px] font-semibold"
              >
                Request Access
              </Button>
            ) : (
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  disabled={!localSettings.enabled}
                  checked={Boolean(localSettings.desktopPushEnabled && localSettings.enabled)}
                  onChange={() => handleToggleChannel("desktopPushEnabled")}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
              </label>
            )}
          </div>
        </div>

        {/* 4. Granular Category Switches */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2.5">
              <Sliders className="h-4 w-4 text-[var(--color-primary)]" />
              <h4 className="font-bold text-[var(--text-primary)]">
                Event Categories
              </h4>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              Toggle specific event sources
            </span>
          </div>

          <div className="space-y-2.5 divide-y divide-[var(--border-subtle)]">
            {/* Schools */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Schools & Institutions
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    New school registration, profile modifications, or deactivations.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  disabled={!localSettings.enabled}
                  checked={Boolean(localSettings.categories?.schools && localSettings.enabled)}
                  onChange={() => handleToggleCategory("schools")}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
              </label>
            </div>

            {/* Teachers */}
            <div className="flex items-center justify-between pt-2.5">
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Teachers & Staff
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    New teacher onboarding, class assignments, updates, and removals.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  disabled={!localSettings.enabled}
                  checked={Boolean(localSettings.categories?.teachers && localSettings.enabled)}
                  onChange={() => handleToggleCategory("teachers")}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
              </label>
            </div>

            {/* Students */}
            <div className="flex items-center justify-between pt-2.5">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Students & Enrollment
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    New student additions, standard/division transfers, and removals.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  disabled={!localSettings.enabled}
                  checked={Boolean(localSettings.categories?.students && localSettings.enabled)}
                  onChange={() => handleToggleCategory("students")}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
              </label>
            </div>

            {/* Activities */}
            <div className="flex items-center justify-between pt-2.5">
              <div className="flex items-center gap-2.5">
                <Mic className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Speaking Practice & Activities
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Speaking session completions, AI evaluations, and lesson milestones.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  disabled={!localSettings.enabled}
                  checked={Boolean(localSettings.categories?.activities && localSettings.enabled)}
                  onChange={() => handleToggleCategory("activities")}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
              </label>
            </div>

            {/* Security */}
            <div className="flex items-center justify-between pt-2.5">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-rose-500" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Security & System Alerts
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    School admin creation, password resets, role updates, and system events.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  disabled={!localSettings.enabled}
                  checked={Boolean(localSettings.categories?.security && localSettings.enabled)}
                  onChange={() => handleToggleCategory("security")}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none disabled:opacity-50" />
              </label>
            </div>
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetDefaults}
              className="!h-8 text-xs font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset Defaults
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEnableAll}
              className="!h-8 text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
              Enable All
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="!h-8 px-4 text-xs font-semibold"
          >
            Save & Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default NotificationSettingsModal;
