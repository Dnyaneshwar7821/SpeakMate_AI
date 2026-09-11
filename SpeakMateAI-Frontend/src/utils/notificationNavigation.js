import { ROUTES } from "@constants/routes";

/**
 * Determine the target route and navigation state for a notification.
 * 
 * Rules:
 * - entityId must be present and valid (number/string convertible to positive integer)
 * - entityType is resolved from notification.entityType or notification.type
 * - Never guess a target or fallback to random/first entity.
 */
export function getNotificationTarget(notification, role = "") {
  if (!notification) return null;

  const rawEntityId = notification.entityId ?? notification.raw?.entityId;
  const entityId = rawEntityId != null && !isNaN(Number(rawEntityId)) && Number(rawEntityId) > 0
    ? Number(rawEntityId)
    : null;

  const entityType = (
    notification.entityType ||
    notification.raw?.entityType ||
    ""
  ).toUpperCase();

  const notifType = (notification.type || "").toUpperCase();
  const normalizedRole = String(role || "").toUpperCase();

  // If no entityId is present, check if type/entityType allows routing to the section list
  if (!entityId) {
    let route = null;
    let entityLabel = "List";

    if (entityType === "STUDENT" || notifType.includes("STUDENT")) {
      route = normalizedRole.includes("SCHOOL") ? ROUTES.SCHOOL_ADMIN_STUDENTS : ROUTES.ADMIN_SCHOOL_USERS;
      entityLabel = "School Users List";
    } else if (entityType === "TEACHER" || notifType.includes("TEACHER")) {
      route = normalizedRole.includes("SCHOOL") ? ROUTES.SCHOOL_ADMIN_TEACHERS : ROUTES.ADMIN_TEACHERS;
      entityLabel = "Teachers List";
    } else if (entityType === "SCHOOL" || notifType.includes("SCHOOL")) {
      route = ROUTES.ADMIN_ADD_SCHOOL;
      entityLabel = "Schools List";
    } else if (entityType === "USER" || notifType.includes("USER")) {
      route = ROUTES.ADMIN_USERS;
      entityLabel = "Users List";
    }

    if (route) {
      return {
        hasTarget: true,
        route,
        state: { notificationNotice: notification.message },
        entityLabel,
      };
    }

    return {
      hasTarget: false,
      reason: "Details are not available for this notification.",
    };
  }

  // Handle Deletion / removal notifications: route to list page view
  const msgText = String(notification.message || "").toLowerCase();
  const isDeletedOrRemoved =
    notifType.includes("DELETE") ||
    notifType.includes("REMOVE") ||
    msgText.includes("removed") ||
    msgText.includes("deleted");

  // Check for Student entity
  if (
    entityType === "STUDENT" ||
    notifType.includes("STUDENT") ||
    notifType === "SPEAKING_ACTIVITY_COMPLETED" ||
    notifType === "LESSON_COMPLETED" ||
    notifType === "ASSESSMENT_COMPLETED"
  ) {
    let route = ROUTES.ADMIN_SCHOOL_USERS;
    if (normalizedRole.includes("SCHOOL")) {
      route = ROUTES.SCHOOL_ADMIN_STUDENTS;
    } else if (normalizedRole.includes("TEACHER")) {
      route = ROUTES.TEACHER_STUDENTS;
    }
    return {
      hasTarget: true,
      route,
      state: isDeletedOrRemoved ? { notificationNotice: notification.message } : { viewStudentId: entityId },
      entityLabel: isDeletedOrRemoved ? "School Users List" : "Student Profile",
    };
  }

  // Check for Teacher entity
  if (
    entityType === "TEACHER" ||
    notifType.includes("TEACHER") ||
    notifType === "STANDARD_ASSIGNED"
  ) {
    let route = ROUTES.ADMIN_TEACHERS;
    if (normalizedRole.includes("SCHOOL")) {
      route = ROUTES.SCHOOL_ADMIN_TEACHERS;
    }
    return {
      hasTarget: true,
      route,
      state: isDeletedOrRemoved ? { notificationNotice: notification.message } : { viewTeacherId: entityId },
      entityLabel: isDeletedOrRemoved ? "Teachers List" : "Teacher Details",
    };
  }

  // Check for School entity
  if (
    entityType === "SCHOOL" ||
    notifType.includes("SCHOOL")
  ) {
    return {
      hasTarget: true,
      route: ROUTES.ADMIN_ADD_SCHOOL,
      state: isDeletedOrRemoved ? { notificationNotice: notification.message } : { viewSchoolId: entityId },
      entityLabel: isDeletedOrRemoved ? "Schools List" : "School Details",
    };
  }

  // Check for General User entity
  if (
    entityType === "USER" ||
    notifType.includes("USER")
  ) {
    return {
      hasTarget: true,
      route: ROUTES.ADMIN_USERS,
      state: isDeletedOrRemoved ? { notificationNotice: notification.message } : { viewUserId: entityId },
      entityLabel: isDeletedOrRemoved ? "Users List" : "User Profile",
    };
  }

  return {
    hasTarget: false,
    reason: "Details are not available for this notification.",
  };
}

/**
 * Executes the "View Details" flow:
 * 1. Marks notification as read in database & local state.
 * 2. If entity target is valid, navigates to that exact entity's profile.
 * 3. If entity target is missing, triggers fallback warning/toast without guessing.
 */
export async function handleViewNotificationDetails(
  notification,
  navigate,
  markAsRead,
  onNotice,
  role = ""
) {
  if (!notification) return;

  // 1. Mark as read
  if (notification.id && !notification.isRead && typeof markAsRead === "function") {
    try {
      await markAsRead(notification.id);
    } catch (e) {
      console.warn("Failed to mark notification as read before navigating:", e);
    }
  }

  // 2. Resolve destination
  const target = getNotificationTarget(notification, role);

  if (!target || !target.hasTarget) {
    const msg = target?.reason || "Details are not available for this notification.";
    if (typeof onNotice === "function") {
      onNotice(msg);
    } else {
      alert(msg);
    }
    return;
  }

  // 3. Navigate to target with exact entity ID in state
  navigate(target.route, { state: target.state });
}
