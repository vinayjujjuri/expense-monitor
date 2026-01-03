"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toTitleCase } from "@/utils/format";

interface DebitCategory {
  _id: string;
  name: string;
  isActive: boolean;
}

export default function ManageDebitTypes() {
  const { status } = useSession();
  const [categories, setCategories] = useState<DebitCategory[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };


  useEffect(() => {
    if (status === "authenticated") fetchCategories();
  }, [status]);

  useEffect(() => {
  if (success || error) {
    const timer = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 6000);
    return () => clearTimeout(timer);
  }
}, [success, error]);


  const fetchCategories = async () => {
  try {
    setLoading(true);
    const res = await fetch("/api/debit-categories");
    if (!res.ok) throw new Error("Failed to load debit types");
    setCategories(await res.json());
  } catch (err: any) {
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  const addCategory = async () => {
  if (!name.trim()) {
    setError("Category name is required");
    return;
  }

  clearMessages();
  setSaving(true);

  try {
    const res = await fetch("/api/debit-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to add category");
    }

    setName("");
    setSuccess("Debit type added successfully");
    fetchCategories();
  } catch (err: any) {
    setError(err.message || "Unable to add debit type");
  } finally {
    setSaving(false);
  }
};


  const disableCategory = async (id: string) => {
  clearMessages();

  try {
    const res = await fetch(`/api/debit-categories/${id}`, {
      method: "PATCH",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to disable category");
    }

    setSuccess("Debit type disabled successfully");
    fetchCategories();
  } catch (err: any) {
    setError(err.message || "Unable to disable debit type");
  }
};


  if (status === "loading") return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Debit Types
        </h1>
        <p className="mt-1 text-gray-600">
          Customize expense categories based on your spending habits
        </p>
      </div>

      {/* Add Debit Type */}
      <div className="mb-10 rounded-xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Add New Debit Type
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Food, Travel, Rent..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          <button
            onClick={addCategory}
            disabled={saving}
            className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Type"}
          </button>
        </div>
        
      </div>

          {error && (
              <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                  {error}
              </div>
          )}

          {success && (
              <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
                  {success}
              </div>
          )}

      {/* Existing Debit Types */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Your Debit Types
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-6 text-center text-gray-500">
            No debit types added yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">
                    {toTitleCase(cat.name)}
                  </span>
                </div>

                <button
                  onClick={() => disableCategory(cat._id)}
                  className="rounded-md border border-violet-200 px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-violet-50"
                >
                  Disable
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
