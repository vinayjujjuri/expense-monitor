"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type NotificationItem = {
  id: string;
  title: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
  payload?: any;
  forAdmin?: boolean;
};

export default function NotificationsComponent() {
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError(null);

        const isAdmin = session?.user?.role === "admin";
        const userEmail = session?.user?.email;
        const url = isAdmin
          ? "/api/notifications?forAdmin=true"
          : userEmail
          ? `/api/notifications?userEmail=${encodeURIComponent(userEmail)}`
          : "/api/notifications";

        const res = await fetch(url, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load notifications");
        }

        const data = await res.json();

        if (!mounted) return;

        setNotifications(data.notifications ?? []);
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to fetch notifications");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [session]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl bg-white p-5 shadow-md">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            My Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here are your latest notifications.
          </p>
        </div>

        {loading && (
          <div className="py-6 text-sm text-gray-500">
            Loading notifications...
          </div>
        )}

        {error && (
          <div className="py-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="py-6 text-sm text-gray-500">
            No notifications found.
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border p-4 ${
                  item.isRead
                    ? "border-gray-200 bg-white"
                    : "border-teal-100 bg-teal-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">
                      {item.title}
                    </h2>

                    {item.message && (
                      <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                    )}

                    {item.payload && (
                      <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-700">
                        <p>User Name: {item.payload?.name ?? item.payload?.email ?? "User approval request"}</p>
                      </div>
                    )}
                  </div>

                  {!item.isRead && (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                      New
                    </span>
                  )}
                </div>

                {item.createdAt && (
                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}