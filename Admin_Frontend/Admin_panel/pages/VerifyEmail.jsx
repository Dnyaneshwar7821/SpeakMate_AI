import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import apiClient from "../../src/services/apiClient";
import ROUTES from "../constants/routes";
import LogoSection from "../components/layout/LogoSection";
import AdminCard from "../components/common/AdminCard";
import AdminFooter from "../components/layout/AdminFooter";

export function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    
    const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("Verification token is missing. Please click a valid link from your email.");
            return;
        }

        const verify = async () => {
            try {
                // Call backend verify email
                await apiClient.post(`/api/auth/verify-email?token=${token}`);
                setStatus("success");
            } catch (err) {
                console.error("Verification error:", err);
                const msg = err.response?.data?.message || err.response?.data || err.message || "Invalid or expired token.";
                setStatus("error");
                setErrorMessage(typeof msg === 'string' ? msg : "Invalid or expired verification token.");
            }
        };

        // Delay slightly for smooth transition
        const timer = setTimeout(() => {
            verify();
        }, 800);

        return () => clearTimeout(timer);
    }, [token]);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.10),_transparent_60%)]" />
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
                <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
            </div>
            <div className="relative w-full max-w-[29rem]">
                <LogoSection />
                <AdminCard className="mt-6 p-7 sm:p-9">
                    {status === "verifying" && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                            <h2 className="mt-4 text-xl font-bold text-slate-900">Verifying Account</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Please wait while we verify your email and activate your account...
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            <h2 className="mt-4 text-xl font-bold text-slate-900">Verification Successful!</h2>
                            <div className="mt-3 text-sm text-slate-600 space-y-2">
                                <p>Your School Admin account is now verified and active.</p>
                                <p className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-500 font-mono">
                                    Temporary Password: <span className="font-semibold text-indigo-600">changeMe123!</span>
                                </p>
                            </div>
                            <Link
                                to={ROUTES.SCHOOL_ADMIN_LOGIN}
                                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-400 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-200"
                            >
                                Go to School Admin Login
                            </Link>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <XCircle className="h-12 w-12 text-rose-500" />
                            <h2 className="mt-4 text-xl font-bold text-slate-900">Verification Failed</h2>
                            <p className="mt-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 w-full">
                                {errorMessage}
                            </p>
                            <p className="mt-4 text-xs text-slate-500">
                                If you believe this is an error, please contact your school administrator or request a new invitation.
                            </p>
                            <Link
                                to={ROUTES.SCHOOL_ADMIN_LOGIN}
                                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-all duration-200"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}
                </AdminCard>
                <AdminFooter />
            </div>
        </div>
    );
}

export default VerifyEmail;
