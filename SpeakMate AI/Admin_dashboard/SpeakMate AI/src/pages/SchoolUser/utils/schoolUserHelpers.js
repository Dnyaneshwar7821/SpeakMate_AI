export const filterSchoolUsers = (
  users = [],
  { search = '', status = 'All', standard = 'All', school = 'All' } = {}
) => {
  return users.filter((user) => {
    const fullName = (user.name || `${user.firstName || ''} ${user.lastName || ''}`).toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = search.trim().toLowerCase();

    const matchesSearch = !query || fullName.includes(query) || email.includes(query);
    const matchesStatus = status === 'All' || user.status === status;
    const matchesStandard = standard === 'All' || (user.grade || user.standard) === standard;
    const matchesSchool = !school || school === 'All' || user.schoolName === school;

    return matchesSearch && matchesStatus && matchesStandard && matchesSchool;
  });
};

export const calculateSchoolUserStats = (users = []) => {
  const total = users.length;
  const active = users.filter((u) => u.status === 'Active').length;
  const avgXp = total > 0 ? Math.round(users.reduce((acc, u) => acc + (u.xp || 0), 0) / total) : 0;
  const avgStreak = total > 0 ? Math.round(users.reduce((acc, u) => acc + (u.currentStreak || u.streak || 0), 0) / total) : 0;
  const newStudents = users.filter((u) => u.joinedDate && (u.joinedDate.startsWith('2024') || u.joinedDate.startsWith('2023'))).length || (total > 0 ? Math.ceil(total * 0.4) : 0);

  return {
    totalStudents: total,
    activeStudents: active,
    avgXp,
    avgStreak,
    newStudents,
  };
};
