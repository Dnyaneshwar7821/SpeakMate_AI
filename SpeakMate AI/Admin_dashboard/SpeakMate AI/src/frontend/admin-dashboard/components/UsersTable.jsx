import { formatDate, getInitials } from "@utils/formatters";

/**
 * admin-dashboard/components/UsersTable.jsx
 *
 * Lists users with role/status pills and row actions.
 * Uses theme CSS variables so it adapts to light/dark themes.
 */
export function UsersTable({ users, onEdit, onDelete }) {
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">No users found</p>
                <p className="text-sm text-[var(--text-secondary)]">
                    Try adjusting your search, or add a new user.
                </p>
            </div>
        );
    }

    return (
        <div className="thin-scrollbar -mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="px-4 py-3 sm:px-5">User</th>
                        <th className="px-4 py-3 sm:px-5">Role</th>
                        <th className="px-4 py-3 sm:px-5">Status</th>
                        <th className="px-4 py-3 sm:px-5">Joined</th>
                        <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--bg-hover)]"
                        >
                            <td className="px-4 py-3 sm:px-5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6c63ff] to-[#ff6584] text-xs font-bold text-white">
                                        {getInitials(user.name)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-[var(--text-primary)]">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-xs text-[var(--text-secondary)]">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td className="px-4 py-3 sm:px-5">
                                <span className="inline-flex max-w-full truncate rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                                    {user.role}
                                </span>
                            </td>

                            <td className="px-4 py-3 sm:px-5">
                                <span
                                    className={[
                                        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
                                        user.status === "active"
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : "bg-[var(--bg-subtle)] text-[var(--text-muted)]",
                                    ].join(" ")}
                                >
                                    <span
                                        className={[
                                            "h-1.5 w-1.5 rounded-full",
                                            user.status === "active" ? "bg-emerald-500" : "bg-[var(--text-muted)]",
                                        ].join(" ")}
                                    />
                                    {user.status === "active" ? "Active" : "Inactive"}
                                </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)] sm:px-5">
                                {formatDate(user.joinedAt, { month: "short", day: "numeric", year: "numeric" })}
                            </td>

                            <td className="px-4 py-3 sm:px-5">
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        aria-label={`Edit ${user.name}`}
                                        onClick={() => onEdit(user)}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        aria-label={`Delete ${user.name}`}
                                        onClick={() => onDelete(user)}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsersTable;
