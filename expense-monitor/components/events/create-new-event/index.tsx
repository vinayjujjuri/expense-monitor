"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateEventComponent() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValid = name.trim().length > 2 && startDate;

  async function submit() {
    if (!isValid) return;

    try {
      setLoading(true);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, startDate }),
      });

      const event = await res.json();
      router.push(`/events/${event._id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-100 p-6 space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Event / Trip
          </h1>
          <p className="text-sm text-gray-500">
            Track all expenses for an upcoming event or journey
          </p>
        </div>

        {/* Event Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Event / Trip name
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Eg: Goa Trip, Wedding Expenses"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Start date
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* CTA */}
        <button
          onClick={submit}
          disabled={!isValid || loading}
          className={`w-full rounded-lg py-2.5 text-sm font-medium transition
            ${
              isValid
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Creating..." : "Create Tracker"}
        </button>

        {/* Hint */}
        <p className="text-xs text-center text-gray-400">
          You can close the event when all expenses are done
        </p>
      </div>
    </div>
  );
}
