const fs = require('fs');
let lines = fs.readFileSync('d:/IntegrationOfSpeakMate/frontend/Admin_panel/pages/TeacherSettings.jsx', 'utf8').split('\n');

const correctTop = `import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ROUTES from "@constants/routes";
import Modal from "@components/common/Modal";
import {
    Settings as SettingsIcon,
    Bell,
    Globe,
    Moon,
    Shield,
    KeyRound,
    Database,
    HelpCircle,
    Save,
    RotateCcw,
    ExternalLink,
    Check,
    AlertTriangle,
    CreditCard,
    Cpu,
    CheckCircle2,
    Lock,
    Trash2,
    User,
    Laptop,
    Sun,
    Info,
    Calendar,
    ArrowUpRight,
    Edit2,
    X,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import SectionCard from "@admin/components/SectionCard";
import { useTheme } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import { teacherDataApi } from "../../src/services/teacherDataApi";
import { schoolApi } from "../../src/services/schoolApi";

/**
 * admin-dashboard/pages/Settings.jsx
 *
 * Highly polished SaaS Settings page with a responsive vertical layout
 * and 7 functional sections: General, Account & Security, Notifications,
 * Appearance, Billing & Subscription, Integrations, and Danger Zone.
 */`;

// Find where the actual functional component or constants start
let startIndex = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const TABS = [')) {
        startIndex = i;
        break;
    }
}

const newContent = correctTop + '\n\n' + lines.slice(startIndex).join('\n');
fs.writeFileSync('d:/IntegrationOfSpeakMate/frontend/Admin_panel/pages/TeacherSettings.jsx', newContent);
console.log('Fixed imports!');
