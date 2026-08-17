import { motion } from "framer-motion";
import UserOverviewChart from "@components/admin/UserOverviewChart";
import LessonOverviewChart from "@components/admin/LessonOverviewChart";
import SpeakingSessionsChart from "@components/admin/SpeakingSessionsChart";

export function ChartsSection({ userChartData, lessonChartData, sessionChartData, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      <UserOverviewChart data={userChartData} loading={loading} />
      <LessonOverviewChart data={lessonChartData} loading={loading} />
      <SpeakingSessionsChart data={sessionChartData} loading={loading} />
    </motion.div>
  );
}

export default ChartsSection;