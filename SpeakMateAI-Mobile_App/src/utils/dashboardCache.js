// In-memory cache to make dashboard, profile, and lessons page transitions instant across tabs
let cachedDashboardData = null;
let cachedUserId = null;

export const DashboardCache = {
  get: (userId) => {
    if (userId && cachedUserId && cachedUserId !== userId) {
      return null;
    }
    return cachedDashboardData;
  },
  set: (data, userId) => {
    cachedDashboardData = data;
    if (userId) cachedUserId = userId;
  },
  updateProfileAvatar: (avatar) => {
    if (cachedDashboardData && cachedDashboardData.profile) {
      cachedDashboardData.profile.avatar = avatar;
    }
  },
  clear: () => {
    cachedDashboardData = null;
    cachedUserId = null;
  },
};

// In-memory cache for lessons and continue-learning items to prevent stale flashing
let cachedContinueItems = null;
let cachedLessonsList = null;
let cachedCompletedSet = new Set();
let cachedCurriculumUserId = null;
let cachedCurriculumGrade = null;

export const CurriculumCache = {
  getContinueItems: (userId, grade) => {
    if (userId && cachedCurriculumUserId && String(cachedCurriculumUserId) !== String(userId)) return null;
    if (grade && cachedCurriculumGrade && String(cachedCurriculumGrade) !== String(grade)) return null;
    return cachedContinueItems;
  },
  setContinueItems: (items, userId, grade) => {
    cachedContinueItems = items;
    if (userId) cachedCurriculumUserId = userId;
    if (grade) cachedCurriculumGrade = grade;
  },
  getLessons: (userId, grade) => {
    if (userId && cachedCurriculumUserId && String(cachedCurriculumUserId) !== String(userId)) return null;
    if (grade && cachedCurriculumGrade && String(cachedCurriculumGrade) !== String(grade)) return null;
    return cachedLessonsList;
  },
  setLessons: (lessons, userId, grade) => {
    cachedLessonsList = lessons;
    if (userId) cachedCurriculumUserId = userId;
    if (grade) cachedCurriculumGrade = grade;
  },
  getCompletedSet: () => cachedCompletedSet,
  setCompletedSet: (set) => {
    cachedCompletedSet = set instanceof Set ? set : new Set(set || []);
  },
  markLessonCompleted: (lessonId, lessonTitle) => {
    const idKey = String(lessonId || '').toLowerCase();
    const titleKey = (lessonTitle || '').trim().toLowerCase();
    if (idKey) cachedCompletedSet.add(idKey);
    if (titleKey) cachedCompletedSet.add(titleKey);

    // Remove completed lesson from cached continue items
    if (cachedContinueItems && Array.isArray(cachedContinueItems)) {
      cachedContinueItems = cachedContinueItems.filter(item => {
        const iId = String(item.id || item.lessonId || '').toLowerCase();
        const iTitle = (item.title || item.lessonTitle || '').trim().toLowerCase();
        if (idKey && iId === idKey) return false;
        if (titleKey && iTitle === titleKey) return false;
        return true;
      });
    }

    // Update in cached lessons list
    if (cachedLessonsList && Array.isArray(cachedLessonsList)) {
      cachedLessonsList = cachedLessonsList.map(item => {
        const iId = String(item.id || '').toLowerCase();
        const iTitle = (item.title || '').trim().toLowerCase();
        if ((idKey && iId === idKey) || (titleKey && iTitle === titleKey)) {
          return { ...item, completed: true, progressPercent: 100 };
        }
        return item;
      });
    }
  },
  updateLessonProgress: (lessonId, lessonTitle, progressPercent, extraData = {}) => {
    const idKey = String(lessonId || '').toLowerCase();
    const titleKey = (lessonTitle || '').trim().toLowerCase();

    // Update in cached lessons list
    if (cachedLessonsList && Array.isArray(cachedLessonsList)) {
      cachedLessonsList = cachedLessonsList.map(item => {
        const iId = String(item.id || '').toLowerCase();
        const iTitle = (item.title || '').trim().toLowerCase();
        if ((idKey && iId === idKey) || (titleKey && iTitle === titleKey)) {
          return { ...item, progressPercent, ...extraData };
        }
        return item;
      });
    }

    // Update in cached continue items
    if (cachedContinueItems && Array.isArray(cachedContinueItems)) {
      let found = false;
      cachedContinueItems = cachedContinueItems.map(item => {
        const iId = String(item.id || item.lessonId || '').toLowerCase();
        const iTitle = (item.title || item.lessonTitle || '').trim().toLowerCase();
        if ((idKey && iId === idKey) || (titleKey && iTitle === titleKey)) {
          found = true;
          return { ...item, progressPercent, ...extraData };
        }
        return item;
      });
      if (!found && extraData && (extraData.title || titleKey)) {
        cachedContinueItems.unshift({
          id: lessonId,
          title: extraData.title || lessonTitle,
          progressPercent,
          ...extraData,
        });
      }
    }
  },
  clear: () => {
    cachedContinueItems = null;
    cachedLessonsList = null;
    cachedCompletedSet = new Set();
    cachedCurriculumUserId = null;
    cachedCurriculumGrade = null;
  },
};

export default DashboardCache;
