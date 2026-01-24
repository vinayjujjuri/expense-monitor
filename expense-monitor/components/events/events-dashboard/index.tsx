"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Event {
  _id: string
  name: string
  startDate: string
  endDate?: string | null
  status: "active" | "closed"
}

export default function EventsDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [closingId, setClosingId] = useState<string | null>(null)
  const router = useRouter()

  async function loadEvents() {
    setLoading(true)
    const res = await fetch("/api/events", { cache: "no-store" })
    const data = await res.json()
    setEvents(data)
    setLoading(false)
  }

  async function closeEvent(eventId: string) {
    const ok = confirm(
      "Close this event?\nYou won’t be able to add expenses after closing."
    )
    if (!ok) return

    setClosingId(eventId)
    await fetch(`/api/events/${eventId}/delete`, { method: "DELETE" })
    setClosingId(null)
    loadEvents()
  }

  useEffect(() => {
    loadEvents()
  }, [])

  /* ---------------- Loading Skeleton ---------------- */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-white p-5 shadow"
          >
            <div className="h-4 w-2/3 rounded bg-gray-200 mb-3" />
            <div className="h-3 w-1/2 rounded bg-gray-200 mb-2" />
            <div className="h-3 w-1/3 rounded bg-gray-200 mb-4" />
            <div className="h-8 w-full rounded bg-gray-200" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Events & Trips
          </h1>
          <p className="text-sm text-gray-500">
            Track expenses separately for trips & special events
          </p>
        </div>

        <button
          onClick={() => router.push("/events/create-event")}
          className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition"
        >
          + Create Event
        </button>
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-600">
            No events created yet.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Create an event or trip to track related expenses.
          </p>

          <button
            onClick={() => router.push("/events/create-event")}
            className="mt-4 rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Create First Event
          </button>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {events.map((event) => (
          <div
            key={event._id}
            className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
          >
            {/* Header */}
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
                }`}
              >
                {event.status === "active" ? "Active" : "Closed"}
              </span>
            </div>

            {/* Dates */}
            <div className="mt-2 space-y-1 text-sm text-gray-600">
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
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push(`/events/${event._id}`)}
                className="inline-flex items-center justify-center rounded-md bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition"
              >
                View Expenses →
              </button>

              {event.status === "active" && (
                <button
                  onClick={() => closeEvent(event._id)}
                  disabled={closingId === event._id}
                  className="inline-flex items-center justify-center rounded-md bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200 transition disabled:opacity-60"
                >
                  {closingId === event._id ? "Closing…" : "Close Event"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
