"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  _id: string;
  name: string;
  startDate: string;
  endDate?: string | null;
  status: "active" | "closed";
}

export default function EventsDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);
  const router = useRouter();

  async function loadEvents() {
    setLoading(true);
    const res = await fetch("/api/events", { cache: "no-store" });
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }

  async function closeEvent(eventId: string) {
    const confirmClose = confirm(
      "Are you sure you want to close this event? You won’t be able to add expenses after closing."
    );
    if (!confirmClose) return;

    setClosingId(eventId);

    await fetch(`/api/events/${eventId}/close`, {
      method: "PATCH",
    });

    setClosingId(null);
    loadEvents();
  }

  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) {
    return (
      <p className="p-6 text-gray-500 text-center">
        Loading events...
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          My Events & Trips
        </h1>

        <button
          onClick={() => router.push("/events/create-event")}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition"
        >
          + Create Event
        </button>
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No events created yet.  
          <br />
          Start by creating a new event or trip.
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {events.map((event) => (
          <div
            key={event._id}
            className="rounded-xl bg-white p-5 shadow hover:shadow-md transition"
          >
            {/* Title */}
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {event.name}
              </h2>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium
                  ${
                    event.status === "active"
                      ? "bg-teal-100 text-teal-700"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
              >
                {event.status === "active" ? "Active" : "Closed"}
              </span>
            </div>

            {/* Dates */}
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Start:</span>{" "}
                {new Date(event.startDate).toLocaleDateString()}
              </p>

              {event.endDate && (
                <p>
                  <span className="font-medium">End:</span>{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => router.push(`/events/${event._id}`)}
                className="text-sm font-medium text-teal-600 hover:underline"
              >
                View Expenses →
              </button>

              {event.status === "active" && (
                <button
                  onClick={() => closeEvent(event._id)}
                  disabled={closingId === event._id}
                  className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition disabled:opacity-60"
                >
                  {closingId === event._id ? "Closing..." : "Close Event"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
