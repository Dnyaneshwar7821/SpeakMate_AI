export const teacherProfileMockData = {
    hasProfile: true,
    identity: {
        name: "Ananya Sharma",
        email: "ananya.sharma@speakmate.edu",
        teacherId: "TCH-2026-014",
        assignedStandard: "5th Standard",
        designation: "English Language Teacher",
        schoolName: "SpeakMate Public School",
    },
    professionalInformation: [
        {
            id: "qualification",
            label: "Qualification",
            value: "M.A. English, B.Ed.",
        },
        {
            id: "experience",
            label: "Experience",
            value: "8 years",
        },
        {
            id: "subjects",
            label: "Subjects",
            value: "English, Grammar, Communication Skills",
        },
        {
            id: "joining-date",
            label: "Joining Date",
            value: "12 June 2021",
        },
        {
            id: "employment-status",
            label: "Employment Status",
            value: "Active",
            status: true,
        },
    ],
    teachingOverview: [
        {
            id: "assigned-standard",
            label: "Assigned Standard",
            value: "5th Standard",
            context: "Primary class allocation",
            tone: "indigo",
        },
        {
            id: "total-students",
            label: "Total Students",
            value: "32",
            context: "Currently assigned learners",
            tone: "violet",
        },
        {
            id: "class-progress",
            label: "Average Class Progress",
            value: "78%",
            context: "Current academic session",
            tone: "emerald",
        },
        {
            id: "completed-reports",
            label: "Completed Reports",
            value: "24",
            context: "Weekly and monthly summaries",
            tone: "amber",
        },
    ],
    contactInformation: [
        {
            id: "email",
            label: "Email Address",
            value: "ananya.sharma@speakmate.edu",
            icon: "email",
        },
        {
            id: "phone",
            label: "Phone Number",
            value: "+91 98765 43210",
            icon: "phone",
        },
        {
            id: "office-address",
            label: "Office Address",
            value: "Faculty Room 2, Academic Block, SpeakMate Public School",
            icon: "location",
        },
    ],
    accountInformation: [
        {
            id: "username",
            label: "Username",
            value: "ananya.sharma",
        },
        {
            id: "role",
            label: "Role",
            value: "Teacher",
        },
        {
            id: "last-login",
            label: "Last Login",
            value: "Today, 08:45 AM",
        },
        {
            id: "account-status",
            label: "Account Status",
            value: "Active",
            status: true,
        },
    ],
    preferences: [
        {
            id: "theme",
            label: "Theme",
            value: "Light",
            description: "Current workspace appearance",
            icon: "theme",
        },
        {
            id: "language",
            label: "Language",
            value: "English",
            description: "Interface language preference",
            icon: "language",
        },
        {
            id: "notifications",
            label: "Notifications",
            value: "Email summaries",
            description: "Preferred notification channel",
            icon: "notification",
        },
    ],
    quickActions: [
        {
            id: "edit-profile",
            label: "Edit Profile",
            variant: "primary",
        },
        {
            id: "change-password",
            label: "Change Password",
            variant: "secondary",
        },
        {
            id: "download-profile",
            label: "Download Profile",
            variant: "secondary",
        },
    ],
};

export default teacherProfileMockData;
