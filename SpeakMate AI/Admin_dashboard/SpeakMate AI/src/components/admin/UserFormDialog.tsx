import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, UserPlus } from "lucide-react";
import { schoolOptions, type User } from "../../data/adminUsersMock";

const schema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.email("Enter a valid email"),
    userType: z.enum(["INDIVIDUAL", "SCHOOL"]),
    schoolId: z.string().optional(),
    classGrade: z.coerce.number().min(1).max(10).optional(),
    classSection: z.string().optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
}).superRefine((data, context) => {
    if (data.userType === "SCHOOL" && !data.schoolId) context.addIssue({ code: "custom", path: ["schoolId"], message: "School is required" });
    if (data.userType === "SCHOOL" && !data.classGrade) context.addIssue({ code: "custom", path: ["classGrade"], message: "Class grade is required" });
});

type FormValues = z.infer<typeof schema>;

export default function UserFormDialog({ open, user, onClose, onSubmit }: { open: boolean; user: User | null; onClose: () => void; onSubmit: (values: FormValues) => void }) {
    const firstInput = useRef<HTMLInputElement>(null);
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { userType: "INDIVIDUAL", level: "BEGINNER", status: "ACTIVE" } });
    const userType = watch("userType");
    const schoolId = watch("schoolId");
    const selectedSchool = schoolOptions.find((school) => school.id === schoolId);

    useEffect(() => {
        if (!open) return;
        reset(user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, userType: user.userType, schoolId: user.schoolId || "", classGrade: user.classGrade ?? "", classSection: user.classSection || "", level: user.level, status: user.status } : { firstName: "", lastName: "", email: "", userType: "INDIVIDUAL", schoolId: "", classGrade: "", classSection: "", level: "BEGINNER", status: "ACTIVE" });
        requestAnimationFrame(() => firstInput.current?.focus());
    }, [open, user, reset]);

    useEffect(() => { if (userType === "INDIVIDUAL") { setValue("schoolId", ""); setValue("classGrade", ""); setValue("classSection", ""); } }, [userType, setValue]);
    useEffect(() => { setValue("classSection", user && user.schoolId === schoolId ? user.classSection || "" : ""); }, [schoolId, setValue, user]);
    useEffect(() => {
        const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close);
    }, [onClose]);
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, [open]);
    if (!open) return null;

    return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="user-form-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex-shrink-0 border-b border-slate-200 p-5 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950"><UserPlus size={20} /></span>
                        <div>
                            <h2 id="user-form-title" className="font-bold text-slate-950 dark:text-white">{user ? "Edit user" : "Add user"}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user ? "Update account information" : "Create a new learner account"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close form" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"><X size={19} /></button>
                </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="First Name" error={errors.firstName?.message}><input {...register("firstName")} ref={(element) => { register("firstName").ref(element); firstInput.current = element; }} className="form-control" /></Field>
                        <Field label="Last Name" error={errors.lastName?.message}><input {...register("lastName")} className="form-control" /></Field>
                        <div className="sm:col-span-2"><Field label="Email" error={errors.email?.message}><input type="email" {...register("email")} className="form-control" /></Field></div>
                        <div className="sm:col-span-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">User Type</span>
                            <div className="mt-2 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                                {["INDIVIDUAL", "SCHOOL"].map((type) => {
                                    const active = userType === type;
                                    const baseClass = "cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors";
                                    const activeClass = active ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400";
                                    return (
                                        <label key={type} className={`${baseClass} ${activeClass}`}>
                                            <input className="sr-only" type="radio" value={type} {...register("userType")} />
                                            {type === "INDIVIDUAL" ? "Individual" : "School"}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        {userType === "SCHOOL" && <><Field label="School" error={errors.schoolId?.message}><select {...register("schoolId")} className="form-control"><option value="">Select school</option>{schoolOptions.map((school) => <option value={school.id} key={school.id}>{school.name}</option>)}</select></Field><Field label="Class Grade" error={errors.classGrade?.message}><select {...register("classGrade")} className="form-control"><option value="">Select grade</option>{[1,2,3,4,5,6,7,8,9,10].map((g) => <option value={String(g)} key={g}>Class {g}</option>)}</select></Field><Field label="Section" error={errors.classSection?.message}><select {...register("classSection")} className="form-control"><option value="">Select section</option>{selectedSchool?.sections.map((item) => <option value={item} key={item}>Section {item}</option>)}</select></Field></>}
                        <Field label="Level" error={errors.level?.message}><select {...register("level")} className="form-control"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></select></Field>
                        <Field label="Status" error={errors.status?.message}><select {...register("status")} className="form-control"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option></select></Field>
                    </div>
                </div>
                <div className="flex-shrink-0 border-t border-slate-100 p-5 dark:border-slate-700">
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                        <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">{user ? "Save changes" : "Create user"}</button>
                    </div>
                </div>
            </form>
        </div>
    </div>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}{children}{error && <span className="mt-1.5 block font-normal text-rose-600">{error}</span>}</label>; }
export type { FormValues };
