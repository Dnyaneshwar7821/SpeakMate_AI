import { motion } from "framer-motion";
import { Check, X, BarChart3, Pencil, Trash2, Users } from "lucide-react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
];

function getAvatarColor(id) {
  return avatarColors[(id - 1) % avatarColors.length];
}

export function UsersTable({ users, onViewProgress, onEdit, onDelete, onActivate, onDeactivate, selectedUserId }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user, index) => {
              const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "User";
              const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");
              const isSelected = selectedUserId === user.id;
              const avatarColor = getAvatarColor(user.id);

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className={`group relative transition-colors duration-150 ${
                    isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}>
                        {initials || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-950 truncate">{fullName}</p>
                        <p className="text-xs text-slate-500 truncate">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-700/10"
                          : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-700/10"
                      }`}
                    >
                      {user.role === "ADMIN" && <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        user.active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10"
                          : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-700/10"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${user.active ? "bg-emerald-500" : "bg-red-500"}`} />
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewProgress?.(user)}
                        title="View progress"
                        className="h-9 w-9 p-0 rounded-lg hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <BarChart3 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(user)}
                        title="Edit user"
                        className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100"
                      >
                        <Pencil size={16} className="text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(user.id)}
                        title="Delete user"
                        className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                      <div className="w-px h-5 bg-slate-200 mx-1" />
                      {!user.active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onActivate?.(user.id)}
                          title="Activate user"
                          className="h-9 w-9 p-0 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Check size={16} className="text-emerald-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeactivate?.(user.id)}
                          title="Deactivate user"
                          className="h-9 w-9 p-0 rounded-lg hover:bg-amber-50 hover:text-amber-700"
                        >
                          <X size={16} className="text-amber-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
            <Users size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-900">No users found</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </Card>
  );
}

export default UsersTable;
