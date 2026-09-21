import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Maps assistant route suggestions (e.g. '/progress', '/speaking', '/lessons', etc.)
 * to the corresponding screen in DrawerNavigator / BottomNavigator.
 */
export function mapRouteToScreen(route) {
  if (!route) return null;
  const clean = String(route).toLowerCase().trim();

  // Tab routes (inside BottomTabs)
  if (clean === '/speaking' || clean === 'speaking' || clean === '/practice') {
    return { type: 'tab', tab: 'Speaking' };
  }
  if (clean === '/dashboard' || clean === 'dashboard' || clean === '/' || clean === '/home') {
    return { type: 'tab', tab: 'Dashboard' };
  }
  if (clean === '/profile' || clean === 'profile') {
    return { type: 'tab', tab: 'Profile' };
  }
  if (clean === '/chat' || clean === 'chat' || clean === '/aichat') {
    return { type: 'tab', tab: 'AIChat' };
  }

  // Drawer routes
  if (clean === '/progress' || clean === 'progress') {
    return { type: 'drawer', screen: 'Progress' };
  }
  if (clean === '/lessons' || clean === 'lessons' || clean === '/study') {
    return { type: 'drawer', screen: 'Lessons' };
  }
  if (clean === '/vocabulary' || clean === 'vocabulary' || clean === '/words') {
    return { type: 'drawer', screen: 'Vocabulary' };
  }
  if (clean === '/grammar' || clean === 'grammar') {
    return { type: 'drawer', screen: 'Grammar' };
  }
  if (clean === '/assignments' || clean === 'assignments' || clean === '/homework') {
    return { type: 'drawer', screen: 'Assignments' };
  }
  if (clean === '/achievements' || clean === 'achievements') {
    return { type: 'drawer', screen: 'Achievements' };
  }
  if (clean === '/settings' || clean === 'settings') {
    return { type: 'drawer', screen: 'Settings' };
  }
  if (clean === '/subscription' || clean === 'subscription' || clean === '/plans') {
    return { type: 'drawer', screen: 'Subscription' };
  }
  if (clean === '/notifications' || clean === 'notifications') {
    return { type: 'drawer', screen: 'Notifications' };
  }
  if (clean === '/help' || clean === 'help') {
    return { type: 'drawer', screen: 'Help' };
  }

  return null;
}

/**
 * Programmatically navigate to target route using mapped screen definition.
 */
export function navigateToAssistantRoute(route) {
  if (!navigationRef.isReady()) {
    console.warn('[navigationRef] Navigator is not ready yet');
    return false;
  }

  const target = mapRouteToScreen(route);
  if (!target) return false;

  try {
    if (target.type === 'tab') {
      navigationRef.navigate('Main', {
        screen: 'BottomTabs',
        params: { screen: target.tab },
      });
      return true;
    }

    if (target.type === 'drawer') {
      navigationRef.navigate('Main', {
        screen: target.screen,
      });
      return true;
    }
  } catch (err) {
    console.warn('[navigationRef] Navigation failed:', err?.message);
    try {
      if (target.type === 'tab') {
        navigationRef.navigate('BottomTabs', { screen: target.tab });
      } else {
        navigationRef.navigate(target.screen);
      }
      return true;
    } catch (fallbackErr) {
      console.warn('[navigationRef] Fallback navigation failed:', fallbackErr?.message);
    }
  }

  return false;
}
