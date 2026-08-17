import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import Input from "@components/common/Input";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "USER",
  active: true,
};

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.75rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.25em 1.25em",
          paddingRight: "2.5rem",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function UserFormModal({ open, onClose, onSubmit, user }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (user) {
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          role: user.role || "USER",
          active: Boolean(user.active),
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [open, user]);

  if (!open) return null;

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Invalid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role,
      active: form.active,
    });
  };

  const update = (key, value) => setForm({ ...form, [key]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-lg p-0 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserPlus size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                {user ? "Edit User" : "Add User"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {user ? "Update user details and permissions" : "Create a new user account"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              error={errors.firstName}
              placeholder="Jane"
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              error={errors.lastName}
              placeholder="Cooper"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
            placeholder="jane@example.com"
          />

          <SelectField
            label="Role"
            value={form.role}
            onChange={(val) => update("role", val)}
            options={[
              { value: "USER", label: "USER" },
              { value: "ADMIN", label: "ADMIN" },
            ]}
          />

          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div>
              <p className="text-sm font-semibold text-slate-700">Account Status</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {form.active ? "User can sign in and access the platform" : "User access is disabled"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => update("active", !form.active)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${form.active ? "bg-indigo-600" : "bg-slate-200"}`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.active ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default UserFormModal;
