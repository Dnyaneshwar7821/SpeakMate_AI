import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Card from "@components/common/Card";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";
import { dashboardMockData } from "@data/dashboardMockData";

import DashboardHeader from "@components/dashboard/DashboardHeader";
import StatisticsCards from "@components/dashboard/StatisticsCards";
import ChartsSection from "@components/dashboard/ChartsSection";
import ContinueLearningCard from "@components/dashboard/ContinueLearningCard";
import XPPointsCard from "@components/dashboard/XPPointsCard";
import WeeklyGoal from "@components/dashboard/WeeklyGoal";
import LearningCalendar from "@components/dashboard/LearningCalendar";
import AchievementBadges from "@components/dashboard/AchievementBadges";
import RecentActivity from "@components/dashboard/RecentActivity";
import DailyMotivation from "@components/dashboard/DailyMotivation";
import TransactionsTable from "@components/dashboard/TransactionsTable";
import UpcomingTasks from "@components/dashboard/UpcomingTasks";
import PerformanceSummary from "@components/dashboard/PerformanceSummary";
import LatestNotifications from "@components/dashboard/LatestNotifications";

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

  const handleRefresh = () => {
    console.log("Refreshing dashboard data...");
    window.location.reload();
  };

  const handleViewDetails = () => {
    console.log("Navigate to performance details");
  };

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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard Header with Search, Notifications, Profile */}
      <DashboardHeader onRefresh={handleRefresh} loading={false} />

      {/* Daily Goal & Streak Highlight Row */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-6 grid gap-5 md:grid-cols-3"
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
          <p className="text-sm font-semibold text-slate-500">Current streak</p>
          <h2 className="mt-2 text-4xl font-black text-slate-950">
            {user?.streak || 0} days
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Come back tomorrow to keep your streak alive.
          </p>
        </Card>
      </motion.div>

      {/* KPI / Stats Cards */}
      <div className="mt-8">
        <StatisticsCards statistics={dashboardMockData.statistics} />
      </div>

      {/* Charts Section */}
      <div className="mt-8">
        <ChartsSection chartData={dashboardMockData.chartData} loading={false} />
      </div>

      {/* Main Dashboard Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <ContinueLearningCard
            activity={dashboardMockData.continueLearning}
            onContinue={handleContinueLearning}
          />

          <RecentActivity activities={dashboardMockData.recentActivities} />

          <TransactionsTable transactions={dashboardMockData.transactions} loading={false} />

          <UpcomingTasks tasks={dashboardMockData.upcomingTasks} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <XPPointsCard xpStats={dashboardMockData.xpStats} />

          <WeeklyGoal goal={dashboardMockData.weeklyGoal} />

          <LearningCalendar calendarData={dashboardMockData.calendarData} />

          <AchievementBadges badges={dashboardMockData.badges} />

          <PerformanceSummary
            performance={dashboardMockData.performanceSummary}
            onViewDetails={handleViewDetails}
          />

          <LatestNotifications notifications={dashboardMockData.notifications} loading={false} />

          <DailyMotivation
            motivation={dashboardMockData.motivation}
            onAcceptChallenge={handleAcceptChallenge}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-12"
      >
        <h2 className="text-xl font-black text-slate-950">Quick actions</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
