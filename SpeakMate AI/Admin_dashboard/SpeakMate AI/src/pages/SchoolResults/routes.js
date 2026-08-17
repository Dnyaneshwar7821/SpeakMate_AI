import ResultsDashboard from './pages/ResultsDashboard';
import StudentResultDetails from './pages/StudentResultDetails';

export const resultsRoutes = [
  {
    path: '/results',
    component: ResultsDashboard,
    exact: true,
  },
  {
    path: '/results/:id',
    component: StudentResultDetails,
    exact: true,
  },
];

export default resultsRoutes;
