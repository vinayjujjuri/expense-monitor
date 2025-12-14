"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📩 Send OTP
  const sendOtp = async () => {
    if (!form.email) {
      setError("Please enter email");
      return;
    }

    setOtpLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOtpSent(true);
      setSuccess("OTP sent to your email");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    setOtpLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setEmailVerified(true);
      setSuccess("Email verified successfully ✅");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  // 🧾 Register user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerified) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Registration submitted. Await admin approval.");
      setForm({ name: "", email: "", password: "" });
      setOtp("");
      setOtpSent(false);
      setEmailVerified(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-200 via-teal-200 to-green-200 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Create Account ✨
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Verify email before registration
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* Email + OTP */}
          <div className="space-y-2">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={otpSent}
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
            />

            {!emailVerified && (
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpLoading || otpSent}
                className="w-full rounded-lg bg-sky-600 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {otpLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            )}
          </div>

          {/* OTP Verification */}
          {otpSent && !emailVerified && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />

              <button
                type="button"
                onClick={verifyOtp}
                disabled={otpLoading}
                className="w-full rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700"
              >
                Verify OTP
              </button>
            </div>
          )}

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Create password"
            value={form.password}
            onChange={handleChange}
            disabled={!emailVerified}
            className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={!emailVerified || loading}
            className="w-full rounded-lg bg-teal-600 py-2 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="cursor-pointer font-medium text-teal-700 hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
