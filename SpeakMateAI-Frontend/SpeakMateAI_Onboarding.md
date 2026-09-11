# SpeakMate AI — Project Onboarding Document

## 1. Project Overview
SpeakMate AI is a frontend-first React application built with Vite, React Router, Tailwind CSS, and Framer Motion. It currently implements mock-only authentication and a set of Phase 1 learning pages, including AI Chat, speaking practice, grammar practice, vocabulary, listening practice, progress tracking, and profile/settings pages.

The app is structured for easy future backend integration: routes and constants are centralized, services are already defined as a stub layer, and auth state is managed by React Context.

---

## 2. Folder Structure and Purpose

### `src/`
The main application source folder. It contains all app code, including pages, components, context providers, routes, services, data, hooks, utilities, and styles.

### `src/components/`
Reusable UI components and page layout components.
- `components/common/`: shared primitives such as `Button`, `Card`, `Input`, `Loader`, `Navbar`, `Footer`, and `ModulePageShell`.
- `components/layout/`: layout shells for authenticated pages and auth pages.
- `components/dashboard/`: dashboard-specific widgets used to build the dashboard page.

### `src/constants/`
Holds application constants.
- `routes.js`: centralizes all route paths used throughout the app.
- `app.js`: theme/storage constants and app-level values.

### `src/context/`
Global React Context providers.
- `AuthContext.jsx`: mock authentication state and actions.
- `ThemeContext.jsx`: theme persistence and toggle logic.

### `src/data/`
Mock data used by pages.
- `dashboardMockData.js`: dashboard content and metrics.
- `chatMockData.js`: AI Chat starter messages and prompts.
- `moduleMockData.js`: mock content for speaking, grammar, vocabulary, listening, progress, profile, and settings.

### `src/hooks/`
Reusable custom React hooks.
- `useLocalStorage.js`: localStorage-backed state hook.

### `src/pages/`
Route views and major page components.
- Authentication pages: `Login`, `Register`, `ForgotPassword`, `LandingPage`.
- App pages: `Dashboard`, `AiChat`, `SpeakingPractice`, `GrammarPractice`, `Vocabulary`, `ListeningPractice`, `Progress`, `Profile`, `Settings`.
- `NotFound`: 404 page.

### `src/routes/`
Routing wrappers and route registration.
- `AppRoutes.jsx`: route tree and page transitions.
- `ProtectedRoute.jsx`: checks auth for protected pages.
- `PublicRoute.jsx`: prevents logged-in users from visiting auth pages.

### `src/services/`
Service layer and mock API logic.
- `api.js`: placeholder axios instance with mock auth service.
- `aiChat.js`: mock AI chat reply service.

### `src/styles/`
Global CSS and Tailwind setup.
- `globals.css`: base styles and Tailwind import.

### `src/animations/`
Shared Framer Motion animation variants.
- `variants.js`: reusable animation patterns.

### `src/utils/`
Utility helper functions.
- `formatters.js`: formatting utilities used by pages and components.

---

## 3. Core App Startup and Flow

### `src/main.jsx`
Bootstraps the app and renders React into the DOM root.
- Imports `App` and `index.css`.
- Creates the root using `createRoot`.
- Renders `<App />` inside `StrictMode`.

### `src/App.jsx`
App root component.
- Wraps the application in `AuthProvider` and `BrowserRouter`.
- Renders `AppRoutes` to define page navigation.

### `src/routes/AppRoutes.jsx`
Defines the route structure.
- Uses `AnimatePresence` and `motion` page transitions.
- Public page routes use `AppLayout`.
- Auth pages use `AuthLayout`.
- Protected pages are wrapped with `ProtectedRoute` and `AppLayout`.
- Includes a 404 route and wildcard redirect.

### Routing details
- `ROUTES.HOME`: `/`
- `ROUTES.LOGIN`: `/login`
- `ROUTES.REGISTER`: `/register`
- `ROUTES.FORGOT_PASSWORD`: `/forgot-password`
- `ROUTES.DASHBOARD`: `/dashboard`
- `ROUTES.AI_CHAT`: `/ai-chat`
- `ROUTES.SPEAKING`: `/speaking`
- `ROUTES.GRAMMAR`: `/grammar`
- `ROUTES.VOCABULARY`: `/vocabulary`
- `ROUTES.LISTENING`: `/listening`
- `ROUTES.PROGRESS`: `/progress`
- `ROUTES.PROFILE`: `/profile`
- `ROUTES.SETTINGS`: `/settings`
- `ROUTES.NOT_FOUND`: `/404`

---

## 4. Authentication and Context

### `src/context/AuthContext.jsx`
This is the primary auth provider.
- Creates `AuthContext` and exports `AuthProvider`.
- Stores `user` state and derives `isAuthenticated`.
- Provides `login`, `register`, and `logout` methods.
- Current implementation uses a static `mockUser` object.
- The `login` and `register` calls are asynchronous and return a mock success response.
- `useAuth()` is a hook to consume auth state safely.

### `src/context/ThemeContext.jsx`
Handles theme state.
- Maintains `theme` state initialized from `localStorage`.
- Writes theme to `document.documentElement` attribute.
- Exposes `toggleTheme`, `isDark`, and `setTheme`.
- This is useful for future theme toggling and persistent styling.

---

## 5. Layouts and Navigation

### `src/components/layout/AppLayout.jsx`
Authenticated app shell.
- Includes `Navbar`, `Outlet`, and `Footer`.
- Renders the active protected page inside the layout.

### `src/components/layout/AuthLayout.jsx`
Auth page shell.
- Displays top auth header and `Outlet` for login/register/forgot screens.
- Keeps auth screens separate from the main app chrome.

### `src/components/common/Navbar.jsx`
Authenticated navigation component.
- Displays the logo, `Dashboard`, `Practice`, `Progress`, and profile dropdown.
- Implements a premium dropdown menu for practice links and a profile panel.
- Supports mobile menu toggling and outside-click closing.
- Uses `useAuth()` to display user info and handle logout.
- Provides active-route highlighting via `NavLink`.

### `src/components/layout/Sidebar.jsx`
Secondary sidebar nav.
- Displays links to top app pages and practice modules.
- Provides active styling for current route.
- Used on larger screens if the layout includes it.

---

## 6. Reusable Components

### `src/components/common/Button.jsx`
Reusable button with variants:
- `primary`
- `secondary`
- `ghost`
Used throughout forms, cards, and action bars.

### `src/components/common/Card.jsx`
Generic white card wrapper.
- Adds border, rounded corners, and shadow.
- Used across dashboard panels, module pages, forms, and landing content.

### `src/components/common/Input.jsx`
Form field component.
- Supports labels, errors, and password visibility toggle.
- Used by `Login`, `Register`, and `ForgotPassword`.

### `src/components/common/Loader.jsx`
Simple spinner component.
- Used on pages that simulate async loading.

### `src/components/common/ModulePageShell.jsx`
Reusable shell for module pages.
- Renders title, subtitle, badge, and action buttons.
- Used by speaking, grammar, vocabulary, listening, progress, profile, and settings pages.

### `src/components/common/Footer.jsx`
Page footer.
- Used by `AppLayout` to render a consistent footer across authenticated pages.

---

## 7. Mock Data and Services

### `src/data/chatMockData.js`
Contains AI chat initial content:
- `starterMessages`
- `suggestedPrompts`
- `title`
- `topic`
Used by `AiChat.jsx`.

### `src/data/dashboardMockData.js`
Dashboard UI seed data:
- Continue learning card
- XP stats
- Recent activities
- Weekly goal
- Learning calendar
- Achievement badges
- Statistics cards
- Daily motivation
Used by `Dashboard.jsx` and its widgets.

### `src/data/moduleMockData.js`
Mock content for module pages,
including speaking, grammar, vocabulary, listening, progress, profile, and settings.
Each export supports one page's display logic.

### `src/services/api.js`
Mock API service layer. It exports:
- axios `api` instance with a base URL
- `authService` with mocked `login`, `register`, and `forgotPassword`
This file is the future integration point for backend API calls.

### `src/services/aiChat.js`
Simulates AI chat responses.
- `buildReply()` generates answers based on keywords.
- `sendMessage()` returns a delayed promise, emulating a remote text response.
Used by `AiChat.jsx`.

---

## 8. Pages Explained

### `src/pages/LandingPage.jsx`
Public home page.
- Displays marketing copy and feature highlights.
- Provides CTA buttons for register and login.
- Uses `Button` and `Card` for presentation.

### `src/pages/Login.jsx`
Login form.
- Contains `email` and `password` inputs.
- Calls `useAuth().login(form)`.
- Redirects to dashboard on success.

### `src/pages/Register.jsx`
Registration form.
- Collects name, email, password, and confirm password.
- Checks password match.
- Calls `useAuth().register(form)`.
- Redirects to dashboard.

### `src/pages/ForgotPassword.jsx`
Password reset UI.
- Calls `authService.forgotPassword(email)`.
- Displays a mock success message.

### `src/pages/Dashboard.jsx`
Authenticated landing page.
- Renders welcome banner and user greeting.
- Displays summary cards, progress metrics, calendar, badges, and quick actions.
- Uses `dashboardMockData` and dashboard widget components.

### `src/pages/AiChat.jsx`
Interactive AI chat page.
- Maintains message state and draft input.
- Sends messages to `sendMessage()`.
- Displays assistant and user bubbles with timestamps.
- Includes suggested prompt buttons.

### `src/pages/SpeakingPractice.jsx`
Speaking practice page.
- Loads mock speaking drills and tips.
- Uses `ModulePageShell` and `speakingPracticeMockData`.

### `src/pages/GrammarPractice.jsx`
Grammar module page.
- Displays example challenges and focus areas.
- Uses `grammarPracticeMockData`.

### `src/pages/Vocabulary.jsx`
Vocabulary module page.
- Renders word cards and study goals.
- Uses `vocabularyMockData`.

### `src/pages/ListeningPractice.jsx`
Listening practice page.
- Shows lessons and listening tips.
- Uses `listeningPracticeMockData`.

### `src/pages/Progress.jsx`
Progress overview page.
- Displays metrics and milestones.
- Uses `progressMockData`.

### `src/pages/Profile.jsx`
Profile details page.
- Displays mock profile details and preferences.
- Uses `profileMockData`.

### `src/pages/Settings.jsx`
Settings page.
- Displays mock settings options with save action.
- Uses `settingsMockData`.

### `src/pages/NotFound.jsx`
404 fallback page.
- Renders when a route does not match.
- Offers a link back to home.

---

## 9. File-by-File Summary

### `src/main.jsx`
App entrypoint. Sets up React root rendering and loads `App`.

### `src/App.jsx`
Application root; wraps routes with `AuthProvider` and `BrowserRouter`.

### `src/routes/AppRoutes.jsx`
Main route configuration. Handles page transitions, layouts, auth guard wrappers, and 404 fallback.

### `src/routes/ProtectedRoute.jsx`
Protects authenticated pages by redirecting unauthenticated users to login.

### `src/routes/PublicRoute.jsx`
Protects public screens by redirecting authenticated users away from login/register.

### `src/constants/routes.js`
Route path constants for centralized navigation.

### `src/context/AuthContext.jsx`
Mock auth state provider, login/register/logout handlers.

### `src/context/ThemeContext.jsx`
Theme state and persistence provider.

### `src/components/layout/AppLayout.jsx`
Authenticated layout shell with navbar and footer.

### `src/components/layout/AuthLayout.jsx`
Auth layout shell for login/register/forgot screens.

### `src/components/common/Navbar.jsx`
Authenticated top navigation with dropdowns, profile menu, and mobile menu.

### `src/components/layout/Sidebar.jsx`
Sidebar navigation for app sections.

### `src/components/common/Button.jsx`
Reusable button with style variants.

### `src/components/common/Card.jsx`
Generic card wrapper.

### `src/components/common/Input.jsx`
Reusable input field with label and password toggle.

### `src/components/common/Loader.jsx`
Loading spinner component.

### `src/components/common/ModulePageShell.jsx`
Reusable module page header and wrapper.

### `src/components/common/Footer.jsx`
App footer component.

### `src/hooks/useLocalStorage.js`
Persistent localStorage hook.

### `src/services/api.js`
Mock auth API placeholder with axios setup.

### `src/services/aiChat.js`
Mock AI chat service.

### `src/data/chatMockData.js`
AI chat initial content and prompt suggestions.

### `src/data/dashboardMockData.js`
Dashboard metrics, activity, badges, and motivation.

### `src/data/moduleMockData.js`
Mock data for all practice and personal pages.

### `src/animations/variants.js`
Shared animation variants for motion components.

### `src/styles/globals.css`
Base styles and Tailwind integration.

### `src/pages/LandingPage.jsx`
Marketing landing page.

### `src/pages/Login.jsx`
Login page, form submission, and redirect.

### `src/pages/Register.jsx`
Registration page, form validation, and redirect.

### `src/pages/ForgotPassword.jsx`
Mock password reset page.

### `src/pages/Dashboard.jsx`
Main authenticated dashboard.

### `src/pages/AiChat.jsx`
AI chat experience with stateful messaging.

### `src/pages/SpeakingPractice.jsx`
Speaking practice page.

### `src/pages/GrammarPractice.jsx`
Grammar practice page.

### `src/pages/Vocabulary.jsx`
Vocabulary practice page.

### `src/pages/ListeningPractice.jsx`
Listening practice page.

### `src/pages/Progress.jsx`
Progress metrics page.

### `src/pages/Profile.jsx`
User profile page.

### `src/pages/Settings.jsx`
User settings page.

### `src/pages/NotFound.jsx`
404 page fallback.

---

## 10. What to Know Before Backend Work

- The app is mock-first, so the next step is replacing `AuthContext` and `authService` with real login/register API calls.
- `src/services/api.js` is the natural integration point for axios, token handling, and backend requests.
- `src/data/*.js` files are good temporary fixtures; later they should be replaced with API fetching logic and state management.
- `ProtectedRoute` and `PublicRoute` provide the necessary auth guards already, so JWT integration can build on this route architecture.

---

## 11. Recommended Next Step
Convert `authService` into a real backend client and update `AuthContext` to store JWT tokens, then replace mock page data with API calls as the Spring Boot backend becomes available.

---

## 12. Notes
This document is based on the current project state and the features already implemented in the frontend. No code has been changed during the creation of this document.
