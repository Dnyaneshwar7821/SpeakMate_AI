import { useState } from "react";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Input from "@components/common/Input";
import { authService } from "@services/api";

export function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.data.message || `OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleVerifyAndReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const verifyRes = await authService.verifyOtp(email, otp);
      const token = verifyRes.data.token;
      setResetToken(token);
      
      const resetRes = await authService.resetPassword(token, newPassword);
      setMessage(resetRes.data.message || "Password reset successfully!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code or failed to reset password.");
    }
  };

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-black text-slate-950">
        {step === 1 ? "Forgot your password?" : step === 2 ? "Enter OTP Code" : "Password Reset Complete"}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {step === 1
          ? "Enter your registered email address to receive a 6-digit OTP verification code."
          : step === 2
          ? `Enter the 6-digit OTP sent to ${email} and choose a new password.`
          : "Your password has been successfully updated."}
      </p>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">{error}</p>}
      {message && <p className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm font-medium text-indigo-700">{message}</p>}

      {step === 1 && (
        <form className="mt-8 space-y-5" onSubmit={handleSendOtp}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Send OTP Code
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="mt-8 space-y-5" onSubmit={handleVerifyAndReset}>
          <Input
            label="6-Digit OTP Code"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Verify OTP & Reset Password
          </Button>
          <button
            type="button"
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-indigo-600"
            onClick={() => setStep(1)}
          >
            ← Change email address
          </button>
        </form>
      )}
    </Card>
  );
}

export default ForgotPassword;
