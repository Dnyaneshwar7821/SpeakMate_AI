import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  BookOpen,
  MessageSquarePlus,
  DollarSign,
  GraduationCap,
  FileBarChart2,
} from "lucide-react";
import ROUTES from "@constants/routes";

import AdminDashboardHeader from "@components/admin/DashboardHeader";
import MetricCardGrid from "@components/admin/MetricCardGrid";
import ActivityChart from "@components/admin/ActivityChart";
import UserOverviewChart from "@components/admin/UserOverviewChart";
import LessonOverviewChart from "@components/admin/LessonOverviewChart";
import UsersTable from "@components/admin/UsersTable";
import QuickActions from "@components/admin/QuickActions";
import AdminRecentTransactions from "@components/admin/AdminRecentTransactions";
import Button from "@components/common/Button";

const metricConfig = [
  { icon: Users, label: "Total Users", valueKey: "totalUsers" },
  { icon: UserCheck, label: "Active Users", valueKey: "activeUsers" },
  { icon: BookOpen, label: "Total Lessons", valueKey: "totalLessons" },
  { icon: BookOpen, label: "Active Lessons", valueKey: "activeLessons" },
  { icon: DollarSign, label: "Revenue", valueKey: "revenue" },
  { icon: MessageSquarePlus, label: "Subscriptions", valueKey: "subscriptions" },
  { icon: GraduationCap, label: "Certificates", valueKey: "certificates" },
  { icon: FileBarChart2, label: "Reports", valueKey: "reports" },
];

const mockDashboard = {
  totalUsers: 1284,
  activeUsers: 947,
  totalLessons: 48,
  activeLessons: 35,
  totalSpeakingSessions: 340,
  totalVocabularyWords: 1250,
  totalAchievements: 89,
  totalNotifications: 12,
  revenue: 45231,
  subscriptions: 1240,
  certificates: 89,
  reports: 16,
};

const mockUsers = [
  {
    id: 1,
    firstName: "Jane",
    lastName: "Cooper",
    email: "jane.cooper@example.com",
    role: "ADMIN",
    active: true,
    createdAt: "2024-06-15T10:00:00Z",
  },
  {
    id: 2,
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com",
    role: "USER",
    active: true,
    createdAt: "2024-07-02T14:30:00Z",
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
    role: "USER",
    active: true,
    createdAt: "2024-07-10T09:15:00Z",
  },
  {
    id: 4,
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    role: "USER",
    active: false,
    createdAt: "2024-05-20T11:45:00Z",
  },
  {
    id: 5,
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    role: "USER",
    active: true,
    createdAt: "2024-07-18T16:20:00Z",
  },
];

function mapDashboardToMetrics(dashboard) {
  const trends = [
    { direction: "up", value: "12%" },
    { direction: "up", value: "8%" },
    { direction: "up", value: "5%" },
    { direction: "up", value: "3%" },
    { direction: "up", value: "14%" },
    { direction: "up", value: "22%" },
    { direction: "down", value: "2%" },
    { direction: "down", value: "1%" },
  ];

  return metricConfig.map((cfg, idx) => ({
    icon: cfg.icon,
    label: cfg.label,
    value: dashboard?.[cfg.valueKey] ?? "—",
    trend: trends[idx] || null,
  }));
}

function buildChartData(dashboard) {
  if (!dashboard) return { userData: [], lessonData: [], sessionData: [] };

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString("default", { month: "short" }));
  }

  const baseUsers = Number(dashboard.totalUsers) || 120;
  const baseActive = Number(dashboard.activeUsers) || 85;
  const baseLessons = Number(dashboard.totalLessons) || 48;
  const baseActiveLessons = Number(dashboard.activeLessons) || 35;
  const baseSessions = Number(dashboard.totalSpeakingSessions) || 340;

  const userData = months.map((name, idx) => ({
    name,
    total: Math.max(10, baseUsers - (5 - idx) * 12 + Math.floor(Math.random() * 10)),
    active: Math.max(5, baseActive - (5 - idx) * 8 + Math.floor(Math.random() * 8)),
  }));

  const lessonData = months.map((name, idx) => ({
    name,
    total: Math.max(5, baseLessons - (5 - idx) * 3 + Math.floor(Math.random() * 4)),
    active: Math.max(3, baseActiveLessons - (5 - idx) * 2 + Math.floor(Math.random() * 3)),
  }));

  const sessionData = months.map((name, idx) => ({
    name,
    count: Math.max(20, baseSessions - (5 - idx) * 40 + Math.floor(Math.random() * 30)),
  }));

  return { userData, lessonData, sessionData };
}

export function AdminDashboardPage() {
  const dashboardData = mockDashboard;
  const users = mockUsers;

  const metrics = useMemo(() => mapDashboardToMetrics(dashboardData), [dashboardData]);
  const chartData = useMemo(() => buildChartData(dashboardData), [dashboardData]);

  const handleActivateUser = async (id) => {
    console.log("Activate user:", id);
  };

  const handleDeactivateUser = async (id) => {
    console.log("Deactivate user:", id);
  };

  return (
    <div className="space-y-8">
      <AdminDashboardHeader onRefresh={() => window.location.reload()} loading={false} />

      <section>
        <MetricCardGrid metrics={metrics} />
      </section>

      <section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ActivityChart data={dashboardData} loading={false} error={null} onRetry={() => { }} />
          </div>
          <div className="lg:col-span-4">
            <UserOverviewChart data={chartData.userData} loading={false} error={null} onRetry={() => { }} />
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-950">Recent Users</h2>
              <Link to={ROUTES.ADMIN_USERS}>
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <UsersTable
              users={users}
              usersLoading={false}
              usersError={null}
              onRetry={() => { }}
              onActivate={handleActivateUser}
              onDeactivate={handleDeactivateUser}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="h-[380px]">
              <LessonOverviewChart data={chartData.lessonData} loading={false} error={null} onRetry={() => { }} />
            </div>
            <AdminRecentTransactions />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Quick Actions</h2>
        <QuickActions />
      </section>
    </div>
  );
}

export default AdminDashboardPage;

