"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  name?: string;
  email: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminUsersApprovals() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);


  const fetchPendingUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/pending");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const updateStatus = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/admin/users/${id}/${action}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to update user status");
      }

      // 🔄 Re-fetch latest pending users
      setLoading(true);
      await fetchPendingUsers();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-200 via-teal-200 to-green-200">
        <p className="rounded-lg bg-white px-6 py-3 shadow">
          Loading pending requests...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-200 via-teal-200 to-green-200">
        <p className="rounded-lg bg-red-50 px-6 py-3 text-red-600 shadow">
          {error}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-md sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Pending User Requests
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Approve or reject new user registrations
          </p>
        </div>

        {/* Empty State */}
        {users.length === 0 ? (
          <div className="rounded-lg bg-green-50 px-4 py-6 text-center text-green-700">
            🎉 No pending requests
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                {/* User Info */}
                <div>
                  <p className="font-semibold text-gray-800">
                    {user.name || "No Name"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.email}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-medium text-yellow-700">
                    Pending
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() =>
                      updateStatus(user._id, "approve")
                    }
                    disabled={actionLoading}
                    className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(user._id, "reject")
                    }
                    disabled={actionLoading}
                    className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
