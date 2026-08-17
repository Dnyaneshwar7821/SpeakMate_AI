import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserRound, School, UserCheck, Search, SlidersHorizontal, X, RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal, Download, UserMinus, Eye, Pencil, Trash2, CheckCircle2, Plus, Settings2, Inbox, KeyRound } from "lucide-react";
import UserDetailSheet from "../components/admin/UserDetailSheet";
import UserFormDialog from "../components/admin/UserFormDialog";
import Tooltip from "../components/ui/Tooltip";
import { schoolOptions } from "../data/adminUsersMock";
import { useUserDetailQuery, useUsersQuery } from "../hooks/useAdminUsersQuery";

const emptyFilters = { userType: "", schoolId: "", classGrade: "", level: "", status: "", from: "", to: "", lastActive: "" };
const titleCase = v => v ? v[0] + v.slice(1).toLowerCase() : "";
const statusDot = { ACTIVE: "bg-emerald-500", INACTIVE: "bg-amber-500", SUSPENDED: "bg-rose-500" };
const statusBadge = { ACTIVE: "bg-emerald-50 text-emerald-700", INACTIVE: "bg-amber-50 text-amber-700", SUSPENDED: "bg-rose-50 text-rose-700" };
const formatDate = v => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const relative = v => {
  const diff = Date.now() - new Date(v).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const ALL_COLUMNS = [
  { key: "user", label: "User", defaultVisible: true },
  { key: "email", label: "Email", defaultVisible: true },
  { key: "userType", label: "User Type", defaultVisible: true },
  { key: "school", label: "School / Class", defaultVisible: true },
  { key: "level", label: "Level", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "lastActive", label: "Last Active", defaultVisible: true },
  { key: "registeredAt", label: "Registration", defaultVisible: false },
  { key: "actions", label: "Actions", defaultVisible: true },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const statusBorder = { ACTIVE: "border-l-emerald-500", INACTIVE: "border-l-amber-500", SUSPENDED: "border-l-rose-500" };

export default function AdminUsersPage() {
  const { data: users, setData: setUsers, isLoading } = useUsersQuery();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState({ key: "lastActiveAt", dir: "desc" });
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [detailUser, setDetailUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuTrigger, setMenuTrigger] = useState(null);
  const [toast, setToast] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [columns, setColumns] = useState(() => ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {}));
  const [columnToggleOpen, setColumnToggleOpen] = useState(false);
  const detail = useUserDetailQuery(detailUser);

  useEffect(() => { const id = setTimeout(() => setSearch(query), 300); return () => clearTimeout(id) }, [query]);
  useEffect(() => setPage(1), [search, filters, size]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    if (q && !`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)) return false;
    if (filters.userType && u.userType !== filters.userType) return false;
    if (filters.schoolId && u.schoolId !== filters.schoolId) return false;
    if (filters.classGrade && u.classGrade !== Number(filters.classGrade)) return false;
    if (filters.level && u.level !== filters.level) return false;
    if (filters.status && u.status !== filters.status) return false;
    if (filters.from && new Date(u.registeredAt) < new Date(filters.from)) return false;
    if (filters.to && new Date(u.registeredAt) > new Date(`${filters.to}T23:59:59`)) return false;
    if (filters.lastActive && (Date.now() - new Date(u.lastActiveAt)) / 86400000 > Number(filters.lastActive)) return false;
    return true;
  }).sort((a, b) => String(a[sort.key]).localeCompare(String(b[sort.key])) * (sort.dir === "asc" ? 1 : -1)), [users, search, filters, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const visible = filtered.slice((page - 1) * size, page * size);
  const activeCount = Object.values(filters).filter(Boolean).length;
  const visibleColumns = ALL_COLUMNS.filter(col => columns[col.key]);

  const metrics = [
    { label: "Total Users", value: users.length, trend: "+12% this month", Icon: Users, color: "bg-indigo-50 text-indigo-600", accent: "border-l-indigo-500" },
    { label: "Individual Users", value: users.filter(u => u.userType === "INDIVIDUAL").length, trend: "+7% this month", Icon: UserRound, color: "bg-sky-50 text-sky-600", accent: "border-l-sky-500" },
    { label: "School Users", value: users.filter(u => u.userType === "SCHOOL").length, trend: "+14% this month", Icon: School, color: "bg-violet-50 text-violet-600", accent: "border-l-violet-500" },
    { label: "Active Users", value: users.filter(u => u.status === "ACTIVE").length, trend: "+9% this month", Icon: UserCheck, color: "bg-emerald-50 text-emerald-600", accent: "border-l-emerald-500" },
  ];

  const patch = (key, value) => setFilters(f => ({ ...f, [key]: value, ...(key === "userType" && value === "INDIVIDUAL" ? { schoolId: "", classGrade: "" } : {}) }));
  const reset = () => { setFilters(emptyFilters); setQuery(""); setSearch(""); setSelected(new Set()); };
  const submitUser = values => {
    const school = schoolOptions.find(s => s.id === values.schoolId);
    if (editing) {
      const next = { ...editing, ...values, ...(values.userType === "SCHOOL" ? { schoolId: school.id, schoolName: school.name, classGrade: values.classGrade, classSection: values.classSection } : { schoolId: undefined, schoolName: undefined, classGrade: undefined, classSection: undefined }) };
      setUsers(old => old.map(u => u.id === editing.id ? next : u));
      if (detailUser?.id === editing.id) setDetailUser(next);
      setToast("User updated");
    } else {
      const next = { id: Date.now(), ...values, avatarUrl: "", ...(values.userType === "SCHOOL" ? { schoolId: school.id, schoolName: school.name, classGrade: values.classGrade, classSection: values.classSection } : {}), registeredAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), totalPracticeMinutes: 0, speakingSessions: 0, aiConversations: 0, lessonsCompleted: 0, currentStreak: 0, xp: 0, grammarScore: 0, fluencyScore: 0, vocabularyScore: 0, pronunciationScore: 0 };
      setUsers(old => [next, ...old]);
      setToast("User created");
    }
    setFormOpen(false);
    setEditing(null);
  };
  const closeActionMenu = useCallback(() => { setOpenMenuId(null); setMenuTrigger(null); }, []);
  const openEdit = user => { setEditing(user); setFormOpen(true); closeActionMenu(); };
  const requestDelete = (targets, label) => setConfirm({ type: "delete", ids: targets.map(u => u.id), label });
  const confirmAction = () => {
    if (confirm.type === "delete") {
      setUsers(old => old.filter(u => !confirm.ids.includes(u.id)));
      setSelected(new Set());
      if (detailUser && confirm.ids.includes(detailUser.id)) setDetailUser(null);
      setToast(confirm.ids.length > 1 ? "Users deleted" : "User deleted");
    } else setToast("Password reset link sent");
    setConfirm(null);
  };
  const toggle = user => { setUsers(old => old.map(u => u.id === user.id ? { ...u, status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : u)); setToast(user.status === "ACTIVE" ? "User deactivated" : "User reactivated"); closeActionMenu(); };
  const toggleActionMenu = (userId, trigger) => {
    if (openMenuId === userId) {
      closeActionMenu();
      return;
    }
    setOpenMenuId(userId);
    setMenuTrigger(trigger);
  };
  const sortBy = key => setSort(s => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
  const selectAll = () => setSelected(s => visible.every(u => s.has(u.id)) ? new Set([...s].filter(id => !visible.some(u => u.id === id))) : new Set([...s, ...visible.map(u => u.id)]));
  const bulkDeactivate = () => { setUsers(old => old.map(u => selected.has(u.id) ? { ...u, status: "INACTIVE" } : u)); setToast(`${selected.size} users deactivated`); setSelected(new Set()); };
  const toggleColumn = (key) => setColumns(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <motion.div className="space-y-6 overflow-x-hidden text-slate-900 dark:text-slate-100" initial="hidden" animate="show" variants={containerVariants}>
      <motion.div variants={itemVariants} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-700">Admin / Users</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">User Management</h2>
          <p className="mt-1.5 text-sm text-gray-500">Manage every independent and school learner account.</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true) }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"><Plus size={17} />Add User</button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid w-full grid-cols-2 gap-5 lg:grid-cols-4">
        {metrics.map(({ Icon, ...m }) => (
          <div key={m.label} className={`w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.02] dark:border-slate-700 dark:bg-slate-900 dark:ring-0 border-l-4 ${m.accent} transition-all hover:-translate-y-0.5 hover:shadow-md`}>
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{m.label}</p>
                <p className="mt-2 text-2xl font-bold">{m.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}><Icon size={20} /></div>
            </div>
            <p className="mt-3 text-xs font-medium text-emerald-600">{m.trend}</p>
          </div>
        ))}
      </motion.div>

      <motion.section variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-slate-900/[0.02] dark:border-slate-700 dark:bg-slate-900 dark:ring-0">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input aria-label="Search users" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email..." className="form-control !pl-10 border-gray-300 bg-white shadow-sm transition-all hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 dark:border-slate-600 dark:bg-slate-800 dark:shadow-none" />
            </div>
            <button onClick={() => setFiltersOpen(v => !v)} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold shadow-sm transition-all hover:border-indigo-300 hover:bg-gray-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:shadow-none dark:hover:border-indigo-500 dark:hover:bg-slate-800">
              <SlidersHorizontal size={17} />Filters{activeCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-indigo-600 px-1.5 text-[10px] text-white">{activeCount}</motion.span>}
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold shadow-sm transition-all hover:border-indigo-300 hover:bg-gray-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:shadow-none dark:hover:border-indigo-500 dark:hover:bg-slate-800"><RotateCcw size={16} />Reset</button>
            <div className="relative">
              <button onClick={() => setColumnToggleOpen(v => !v)} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold shadow-sm transition-all hover:border-indigo-300 hover:bg-gray-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:shadow-none dark:hover:border-indigo-500 dark:hover:bg-slate-800"><Settings2 size={17} />Columns</button>
              <AnimatePresence>
                {columnToggleOpen && (
                  <motion.div initial={{ opacity: 0, y: 4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    <p className="mb-2 px-2 text-xs font-semibold text-slate-500">Toggle Columns</p>
                    {ALL_COLUMNS.filter(c => c.key !== "actions").map(col => (
                      <label key={col.key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                        <input type="checkbox" checked={columns[col.key]} onChange={() => toggleColumn(col.key)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-200">{col.label}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
                <div className={`mt-4 gap-3 w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`}>
                  <Filter label="User Type" value={filters.userType} onChange={v => patch("userType", v)} options={["INDIVIDUAL", "SCHOOL"]} />
                  <Filter label="School" value={filters.schoolId} disabled={filters.userType === "INDIVIDUAL"} onChange={v => patch("schoolId", v)} options={schoolOptions.map(s => s.id)} labels={schoolOptions.map(s => s.name)} />
                  <Filter label="Class" value={filters.classGrade} onChange={v => patch("classGrade", v)} options={["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]} labels={["All Classes", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]} />
                  <Filter label="Level" value={filters.level} onChange={v => patch("level", v)} options={["BEGINNER", "INTERMEDIATE", "ADVANCED"]} />
                  <Filter label="Status" value={filters.status} onChange={v => patch("status", v)} options={["ACTIVE", "INACTIVE", "SUSPENDED"]} />
                  <Filter label="Last Active" value={filters.lastActive} onChange={v => patch("lastActive", v)} options={["1", "7", "30", "90"]} labels={["Today", "Last 7 days", "Last 30 days", "Last 90 days"]} />
                  <DateField label="Registered from" value={filters.from} onChange={v => patch("from", v)} />
                  <DateField label="Registered to" value={filters.to} onChange={v => patch("to", v)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-wrap gap-2">
              {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
                <motion.button key={k} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={() => patch(k, "")} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900">
                  {titleCase(k)}: {titleCase(v)}<X size={12} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.25 }} className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/50">
            <b className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">{selected.size} users selected</b>
            <div className="flex items-center gap-2">
              <Bulk Icon={UserMinus} onClick={bulkDeactivate}>Deactivate</Bulk>
              <Bulk Icon={Trash2} onClick={() => requestDelete(users.filter(u => selected.has(u.id)), `${selected.size} selected accounts`)}>Delete</Bulk>
              <Bulk Icon={Download} onClick={() => setToast("Bulk export started")}>Export</Bulk>
            </div>
            <button onClick={() => setSelected(new Set())} className="ml-auto rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-slate-900/[0.03] dark:border-slate-700 dark:bg-slate-900 dark:shadow-sm dark:ring-0">
        <div className="relative w-full overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700">
          <table className="min-w-[1340px] text-left text-sm">
            <thead className="sticky top-0 z-[2] bg-gray-50 text-[11px] uppercase text-slate-600 shadow-[0_1px_0_#e5e7eb] dark:bg-slate-800 dark:text-slate-400 dark:shadow-none">
              <tr>
                <th className="sticky left-0 z-[3] w-[40px] border-r border-gray-200/60 bg-gray-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"><input type="checkbox" aria-label="Select all" checked={visible.length > 0 && visible.every(u => selected.has(u.id))} onChange={selectAll} /></th>
                {visibleColumns.map(col => {
                  if (col.key === "user") return <SortHead key="user" label="User" onClick={() => sortBy("firstName")} className="min-w-[200px] max-w-[220px]" />;
                  if (col.key === "email") return <th key="email" className="px-3 py-3 whitespace-nowrap min-w-[200px] max-w-[260px]">Email</th>;
                  if (col.key === "userType") return <th key="userType" className="px-3 py-3 whitespace-nowrap min-w-[110px]">User Type</th>;
                  if (col.key === "school") return <th key="school" className="px-3 py-3 whitespace-nowrap min-w-[180px] max-w-[200px]">School / Class</th>;
                  if (col.key === "level") return <th key="level" className="relative z-[4] w-[130px] min-w-[130px] border-r border-gray-200/60 bg-gray-50 px-3 py-3 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">Level</th>;
                  if (col.key === "status") return <th key="status" className="px-3 py-3 whitespace-nowrap min-w-[100px]">Status</th>;
                  if (col.key === "lastActive") return <SortHead key="lastActive" label="Last Active" onClick={() => sortBy("lastActiveAt")} className="min-w-[110px] max-w-[130px]" />;
                  if (col.key === "registeredAt") return <SortHead key="registeredAt" label="Registration" onClick={() => sortBy("registeredAt")} className="min-w-[110px] max-w-[130px]" />;
                  if (col.key === "actions") return <th key="actions" className="sticky right-0 z-[3] w-[112px] min-w-[112px] border-l border-gray-200/60 bg-gray-50 px-3 py-3 text-right whitespace-nowrap shadow-[-4px_0_8px_-8px_rgba(15,23,42,0.2)] dark:border-slate-700 dark:bg-slate-800">Actions</th>;
                  return null;
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/70 dark:divide-slate-800">
              {isLoading ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />) : visible.map((u, idx) => (
                <motion.tr key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03, duration: 0.3 }} onClick={() => setDetailUser(u)} className={`group h-16 cursor-pointer align-middle transition-all duration-200 hover:bg-gray-50 hover:shadow-[inset_0_1px_0_#e5e7eb,inset_0_-1px_0_#e5e7eb] dark:hover:bg-slate-800/60 dark:hover:shadow-none border-l-2 ${statusBorder[u.status]} ${selected.has(u.id) ? "bg-indigo-50/70 dark:bg-indigo-950/30" : ""}`}>
                  <td className="sticky left-0 z-[2] w-[40px] border-r border-gray-200/60 bg-white px-4 py-3 group-hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:group-hover:bg-slate-800/60"><input type="checkbox" aria-label={`Select ${u.firstName} ${u.lastName}`} checked={selected.has(u.id)} onChange={e => { e.stopPropagation(); setSelected(s => { const next = new Set(s); if (next.has(u.id)) next.delete(u.id); else next.add(u.id); return next; }) }} onClick={e => e.stopPropagation()} className="rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/40" /></td>
                  {visibleColumns.some(c => c.key === "user") && <td className="px-3 py-3 whitespace-nowrap max-w-[220px]"><UserCell user={u} /></td>}
                  {visibleColumns.some(c => c.key === "email") && <td className="px-3 py-3 whitespace-nowrap text-slate-500 max-w-[260px] truncate">{u.email}</td>}
                  {visibleColumns.some(c => c.key === "userType") && <td className="px-3 py-3 whitespace-nowrap"><TypeBadge value={u.userType} /></td>}
                  {visibleColumns.some(c => c.key === "school") && <td className="max-w-[200px] px-3 py-3 whitespace-nowrap"><Tooltip content={u.userType === "INDIVIDUAL" ? "Individual user — no school" : `${u.schoolName || "—"}${u.classGrade ? ` ◆ Class ${u.classGrade}${u.classSection ? `, Section ${u.classSection}` : ""}` : ""}`}><div><b className="block truncate text-xs">{u.userType === "INDIVIDUAL" ? "—" : (u.schoolName || "—")}</b><span className="block truncate text-xs text-slate-500">{u.userType === "INDIVIDUAL" ? "—" : (u.classGrade ? `Class ${u.classGrade}${u.classSection ? ` ◆ Section ${u.classSection}` : ""}` : "—")}</span></div></Tooltip></td>}
                  {visibleColumns.some(c => c.key === "level") && <td className="relative z-[4] w-[130px] min-w-[130px] border-r border-gray-200/60 bg-white px-3 py-3 whitespace-nowrap group-hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:group-hover:bg-slate-800/60"><Level value={u.level} /></td>}
                  {visibleColumns.some(c => c.key === "status") && <td className="px-3 py-3 whitespace-nowrap"><Status value={u.status} /></td>}
                  {visibleColumns.some(c => c.key === "lastActive") && <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">{relative(u.lastActiveAt)}</td>}
                  {visibleColumns.some(c => c.key === "registeredAt") && <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">{formatDate(u.registeredAt)}</td>}
                  {visibleColumns.some(c => c.key === "actions") && (
                    <td className="sticky right-0 z-[2] w-[112px] min-w-[112px] border-l border-gray-200/60 bg-white px-3 py-3 text-right shadow-[-4px_0_8px_-8px_rgba(15,23,42,0.2)] group-hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:group-hover:bg-slate-800/60" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button onClick={() => setDetailUser(u)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950" aria-label="View"><Eye size={15} /></button>
                        <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950" aria-label="Edit"><Pencil size={15} /></button>
                        <button
                          onClick={event => toggleActionMenu(u.id, event.currentTarget)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                          aria-label={`Actions for ${u.firstName} ${u.lastName}`}
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === u.id}
                        ><MoreHorizontal size={15} /></button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !visible.length && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
              <Inbox className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No users found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search query.</p>
              <button onClick={reset} className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">Reset filters</button>
            </motion.div>
          )}
        </div>
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm sm:flex-row dark:border-slate-700">
          <span className="text-slate-500">Showing {filtered.length ? (page - 1) * size + 1 : 0}-{Math.min(page * size, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-2">
            <select aria-label="Page size" value={size} onChange={e => setSize(Number(e.target.value))} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800">
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-slate-200 p-1.5 transition hover:border-indigo-200 disabled:opacity-40 dark:border-slate-600"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${page === n ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{n}</button>
            ))}
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-slate-200 p-1.5 transition hover:border-indigo-200 disabled:opacity-40 dark:border-slate-600"><ChevronRight size={16} /></button>
          </div>
        </footer>
      </motion.section>

      {openMenuId !== null && menuTrigger && (() => {
        const user = users.find(candidate => candidate.id === openMenuId);
        return user ? (
          <ActionMenu
            user={user}
            trigger={menuTrigger}
            onClose={closeActionMenu}
            view={() => { setDetailUser(user); closeActionMenu(); }}
            edit={() => openEdit(user)}
            toggle={() => toggle(user)}
            reset={() => { setConfirm({ type: "reset", label: user.email }); closeActionMenu(); }}
            remove={() => { requestDelete([user], `${user.firstName} ${user.lastName}'s account`); closeActionMenu(); }}
          />
        ) : null;
      })()}

      <AnimatePresence>
        {formOpen && <UserFormDialog open={formOpen} user={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onSubmit={submitUser} />}
      </AnimatePresence>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {detailUser && <UserDetailSheet user={detailUser} detail={detail.data} loading={detail.isLoading} onClose={() => setDetailUser(null)} onEdit={openEdit} onDelete={u => requestDelete([u], `${u.firstName} ${u.lastName}'s account`)} />}
        </AnimatePresence>,
        document.body,
      )}
      <AnimatePresence>
        {confirm && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onClick={() => setConfirm(null)}>
            <motion.div role="alertdialog" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={e => e.stopPropagation()}>
              <Trash2 className="mb-3 text-rose-600" />
              <h3 className="font-bold">{confirm.type === "delete" ? "Delete account?" : "Reset password?"}</h3>
              <p className="mt-2 text-sm text-slate-500">{confirm.type === "delete" ? `This will permanently delete ${confirm.label}.` : `Send a password reset link to ${confirm.label}?`}</p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                <button onClick={confirmAction} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 ${confirm.type === "delete" ? "bg-rose-600" : "bg-indigo-600"}`}>Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div role="status" initial={{ opacity: 0, y: 20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: 20, x: 20 }} transition={{ type: "spring", damping: 20, stiffness: 200 }} className="fixed bottom-5 right-5 z-[110] flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Filter({ label, value, onChange, options, labels, disabled }) {
  return (
    <label className="min-w-0 w-full text-xs font-semibold text-slate-500">
      {label}
      <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className="form-control mt-1 transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20">
        <option value="">All</option>
        {options.map((o, i) => <option key={o} value={o}>{labels?.[i] || titleCase(o)}</option>)}
      </select>
    </label>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label className="min-w-0 w-full text-xs font-semibold text-slate-500">
      {label}
      <input type="date" value={value} onChange={e => onChange(e.target.value)} className="form-control mt-1 transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20" />
    </label>
  );
}

function UserCell({ user }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{user.firstName[0]}{user.lastName[0]}</div>
      <div className="min-w-0">
        <b className="block truncate transition-colors group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{user.firstName} {user.lastName}</b>
        <span className="text-[11px] text-slate-400">ID #{String(user.id).slice(-5)}</span>
      </div>
    </div>
  );
}

function TypeBadge({ value }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${value === "SCHOOL" ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"}`}>{titleCase(value)}</span>;
}

function Level({ value }) {
  const colors = { BEGINNER: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300", INTERMEDIATE: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300", ADVANCED: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" };
  return <span className={`relative z-10 inline-flex items-center whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold shadow-sm ring-1 ring-inset ring-current/10 ${colors[value] || "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>{titleCase(value)}</span>;
}

function Status({ value }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge[value]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[value]}`} />{titleCase(value)}
    </span>
  );
}

function SortHead({ label, onClick, className }) {
  return (
    <th className={`px-3 py-3 whitespace-nowrap ${className || "min-w-[200px]"}`}>
      <button onClick={onClick} className="inline-flex items-center gap-1 font-semibold uppercase transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">{label}<ArrowUpDown size={12} /></button>
    </th>
  );
}

function Skeleton() {
  return (
    <tr className="h-16">
      {Array.from({ length: 10 }).map((_, i) => (
        <td key={i} className="px-3 py-4">
          <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </td>
      ))}
    </tr>
  );
}

function Bulk({ Icon, children, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"><Icon size={14} />{children}</button>;
}

function ActionMenu({ user, trigger, onClose, view, edit, toggle, reset, remove }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, visibility: "hidden" });

  useLayoutEffect(() => {
    const positionMenu = () => {
      if (!trigger?.isConnected || !menuRef.current) {
        onClose();
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const gap = 6;
      const edge = 8;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const top = spaceBelow >= menuRect.height + gap
        ? triggerRect.bottom + gap
        : triggerRect.top - menuRect.height - gap;

      setPosition({
        top: Math.max(edge, Math.min(top, window.innerHeight - menuRect.height - edge)),
        left: Math.max(edge, Math.min(triggerRect.right - menuRect.width, window.innerWidth - menuRect.width - edge)),
        visibility: "visible",
      });
    };

    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [trigger, onClose]);

  useEffect(() => {
    const handleOutsideClick = event => {
      if (!menuRef.current?.contains(event.target) && !trigger?.contains(event.target)) onClose();
    };
    const handleKeyDown = event => {
      if (event.key === "Escape") {
        onClose();
        trigger?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [trigger, onClose]);

  return createPortal(
    <div ref={menuRef} role="menu" aria-label={`Actions for ${user.firstName} ${user.lastName}`} style={position} className="fixed z-[120] w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <MenuButton Icon={Eye} onClick={view}>View Profile</MenuButton>
      <MenuButton Icon={Pencil} onClick={edit}>Edit</MenuButton>
      <MenuButton Icon={UserMinus} onClick={toggle}>{user.status === "ACTIVE" ? "Deactivate" : "Reactivate"}</MenuButton>
      <MenuButton Icon={KeyRound} onClick={reset}>Reset Password</MenuButton>
      <MenuButton Icon={Trash2} onClick={remove} danger>Delete</MenuButton>
    </div>,
    document.body,
  );
}

function MenuButton({ Icon, children, onClick, danger }) {
  return <button role="menuitem" onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 ${danger ? "text-rose-600" : ""}`}><Icon size={15} />{children}</button>;
}
