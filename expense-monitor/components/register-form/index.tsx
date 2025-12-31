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

  // 🔕 OTP states (disabled for now)
  // const [otp, setOtp] = useState("");
  // const [otpSent, setOtpSent] = useState(false);
  // const [emailVerified, setEmailVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🧾 Register user directly (NO OTP)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Registration submitted. Await admin approval.");
      setForm({ name: "", email: "", password: "" });
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
            Registration requires admin approval
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
          <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* Email */}
          <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* Password */}
          <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
          <input
            type="password"
            name="password"
            placeholder="Enter a secure password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
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
