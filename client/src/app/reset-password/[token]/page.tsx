"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();
    setPasswordsMatch(trimmedNew === trimmedConfirm && trimmedNew.length > 0);
  }, [newPassword, confirmPassword]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("At least one number");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("At least one special character");
    return errors;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    // Debug output
    console.log("Submitting passwords:", {
      new: trimmedNew,
      confirm: trimmedConfirm,
      match: trimmedNew === trimmedConfirm
    });

    if (trimmedNew !== trimmedConfirm) {
      return toast.error("Passwords do not match when trimmed");
    }

    const errors = validatePassword(trimmedNew);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return toast.error("Password does not meet security requirements");
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          newPassword: trimmedNew,
          confirmPassword: trimmedConfirm 
        }),
      });

      const contentType = res.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Unknown error occurred");
      }

      if (!res.ok) {
        console.log("Server error response:", data);
        throw new Error(data.message || "Failed to reset password");
      }

      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      console.error("Reset error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900 text-white py-8">
      <ToastContainer />
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4 border border-purple-700">
        <h2 className="text-2xl font-bold text-center text-yellow-400">Reset Your Password</h2>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordErrors(validatePassword(e.target.value));
                }}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-700 text-white text-sm"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-700 text-white text-sm"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={`text-sm ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
              {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
            </div>
          </div>

          {passwordErrors.length > 0 && (
            <div className="text-red-400 text-xs p-2 bg-gray-900 rounded">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside">
                {passwordErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={!passwordsMatch || loading || passwordErrors.length > 0}
            className={`w-full py-2 mt-4 rounded-lg font-semibold text-sm flex items-center justify-center ${
              !passwordsMatch || loading || passwordErrors.length > 0
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Processing...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-2">
          <span 
            onClick={() => router.push("/login")} 
            className="text-yellow-400 hover:underline cursor-pointer"
          >
            Back to Login
          </span>
        </p>
      </div>
    </main>
  );
}