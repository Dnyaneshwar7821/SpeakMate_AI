import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Card from "@components/common/Card";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";
import { dashboardMockData } from "@data/dashboardMockData";
import StatisticsCards from "@components/dashboard/StatisticsCards";
import ContinueLearningCard from "@components/dashboard/ContinueLearningCard";
import XPPointsCard from "@components/dashboard/XPPointsCard";
import WeeklyGoal from "@components/dashboard/WeeklyGoal";
import LearningCalendar from "@components/dashboard/LearningCalendar";
import AchievementBadges from "@components/dashboard/AchievementBadges";
import RecentActivity from "@components/dashboard/RecentActivity";
import DailyMotivation from "@components/dashboard/DailyMotivation";

const quickActions = [
  {
    title: "AI Chat Coach",
    text: "Practice short conversations with guided corrections.",
    route: ROUTES.AI_CHAT,
  },
  {
    title: "Speaking Practice",
    text: "Warm up pronunciation with daily speaking drills.",
    route: ROUTES.SPEAKING,
  },
  {
    title: "Grammar Review",
    text: "Review common errors from your recent answers.",
    route: ROUTES.GRAMMAR,
  },
];

export function Dashboard() {
  const { user } = useAuth();

  // Handlers prepared for future API/navigation integration
  const handleContinueLearning = () => {
    console.log(
      "Navigating to last learning activity: ",
      dashboardMockData.continueLearning.title,
    );
    alert(`Launching session: ${dashboardMockData.continueLearning.title}`);
  };

  const handleAcceptChallenge = () => {
    console.log(
      "Accepting daily challenge: ",
      dashboardMockData.motivation.challenge,
    );
    alert(`Starting challenge: ${dashboardMockData.motivation.challenge}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
          Welcome back, {user?.name || "Learner"}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            Level {dashboardMockData.xpStats.level}
          </span>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            {dashboardMockData.xpStats.totalXp} XP
          </span>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
            🔥 {dashboardMockData.calendarData.streak} Day Streak
          </span>
        </div>

        <p className="mt-4 max-w-2xl text-slate-600">
          Improve your English every day with AI-powered conversations, speaking
          practice, grammar exercises, and personalized learning insights.
        </p>
      </motion.div>

      {/* 7. Statistics Cards Row */}
      <div className="mb-8">
        <StatisticsCards statistics={dashboardMockData.statistics} />
      </div>

      {/* Main Grid: 2 Columns left (wide details), 1 Column right (stats/gamification summary) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (lg:col-span-2) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Existing Completed Functionality: Daily Goal & Streak */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="grid gap-5 md:grid-cols-3"
          >
            <Card className="p-6 md:col-span-2">
              <p className="text-sm font-semibold text-slate-500">Daily goal</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Practice for {user?.dailyGoal || 20} minutes
              </h2>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/5 rounded-full bg-indigo-600" />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                8 of 20 minutes completed today.
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm font-semibold text-slate-500">
                Current streak
              </p>
              <h2 className="mt-2 text-4xl font-black text-slate-950">
                {user?.streak || 0} days
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Come back tomorrow to keep your streak alive.
              </p>
            </Card>
          </motion.div>

          {/* 1. Continue Learning Card */}
          <ContinueLearningCard
            activity={dashboardMockData.continueLearning}
            onContinue={handleContinueLearning}
          />

          {/* 5. Learning Calendar */}
          <LearningCalendar calendarData={dashboardMockData.calendarData} />

          {/* 3. Recent Activity (Timeline Layout) */}
          <RecentActivity activities={dashboardMockData.recentActivities} />
        </div>

        {/* Right Column (lg:col-span-1) */}
        <div className="space-y-6">
          {/* 2. XP Points Card */}
          <XPPointsCard xpStats={dashboardMockData.xpStats} />

          {/* 4. Weekly Goal */}
          <WeeklyGoal goal={dashboardMockData.weeklyGoal} />

          {/* 6. Achievement Badges */}
          <AchievementBadges badges={dashboardMockData.badges} />

          {/* 8. Daily Motivation Card */}
          <DailyMotivation
            motivation={dashboardMockData.motivation}
            onAcceptChallenge={handleAcceptChallenge}
          />
        </div>
      </div>

      {/* Existing Completed Functionality: Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-12"
      >
        <h2 className="text-xl font-black text-slate-950">Quick actions</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {quickActions.map((action) => (
            <Card key={action.title} className="p-6">
              <h3 className="text-lg font-bold text-slate-950">
                {action.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {action.text}
              </p>
              <Link
                to={action.route}
                className="mt-5 inline-flex items-center text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Open now →
              </Link>
            </Card>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default Dashboard;
