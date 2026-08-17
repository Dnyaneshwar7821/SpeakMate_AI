export const formatResultData = (data = []) => {
  return data;
};

export const filterResults = (
  data = [],
  { school = 'All Schools', standard = 'All Standards', subject = 'All Subjects', exam = 'All Exams', search = '' } = {}
) => {
  return data.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (item.studentName && item.studentName.toLowerCase().includes(query)) ||
      (item.rollNo && item.rollNo.toString().toLowerCase().includes(query));

    const matchesSchool = !school || school === 'All Schools' || school === 'All' || item.school === school;
    const matchesStandard = !standard || standard === 'All Standards' || standard === 'All' || item.standard === standard;

    return matchesSearch && matchesSchool && matchesStandard;
  });
};

export const calculateResultStats = (data = []) => {
  const totalStudents = data.length;
  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      avgPercentage: '0%',
      passPercentage: '0%',
      topScore: '0%',
      failedStudents: 0,
    };
  }

  const passedCount = data.filter((s) => s.status === 'Pass').length;
  const failedCount = data.filter((s) => s.status === 'Fail').length;

  const totalPercentageSum = data.reduce((acc, s) => {
    const val = typeof s.percentage === 'string' ? parseFloat(s.percentage) : (s.percentage || 0);
    return acc + val;
  }, 0);

  const avgPercentageNum = (totalPercentageSum / totalStudents).toFixed(1);
  const passPercentageNum = ((passedCount / totalStudents) * 100).toFixed(1);

  const maxPercentageNum = Math.max(
    ...data.map((s) => (typeof s.percentage === 'string' ? parseFloat(s.percentage) : (s.percentage || 0)))
  ).toFixed(1);

  return {
    totalStudents,
    avgPercentage: `${avgPercentageNum}%`,
    passPercentage: `${passPercentageNum}%`,
    topScore: `${maxPercentageNum}%`,
    failedStudents: failedCount,
  };
};

export const calculateSubjectAverages = (data = []) => {
  const subjectsConfig = [
    { key: 'english', label: 'English', icon: '📖', color: '#6C4CF1', gradient: 'linear-gradient(135deg, #818cf8 0%, #6c4cf1 100%)' },
    { key: 'maths', label: 'Maths', icon: '📐', color: '#2563EB', gradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)' },
    { key: 'science', label: 'Science', icon: '🧪', color: '#10B981', gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' },
    { key: 'history', label: 'History', icon: '🏛️', color: '#F59E0B', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
    { key: 'geography', label: 'Geography', icon: '🌍', color: '#EC4899', gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' },
  ];

  if (!data || data.length === 0) {
    return subjectsConfig.map((subj) => ({
      ...subj,
      subject: subj.label,
      avg: 0,
    }));
  }

  return subjectsConfig.map((subj) => {
    const totalMarks = data.reduce((acc, curr) => acc + (curr[subj.key] || 0), 0);
    const avg = parseFloat((totalMarks / data.length).toFixed(1));
    return {
      ...subj,
      subject: subj.label,
      avg,
    };
  });
};

export const getTopStudents = (data = [], limit = 5) => {
  return [...data]
    .sort((a, b) => {
      const pA = typeof a.percentage === 'string' ? parseFloat(a.percentage) : (a.percentage || 0);
      const pB = typeof b.percentage === 'string' ? parseFloat(b.percentage) : (b.percentage || 0);
      return pB - pA;
    })
    .slice(0, limit);
};

export default {
  formatResultData,
  filterResults,
  calculateResultStats,
  calculateSubjectAverages,
  getTopStudents,
};
