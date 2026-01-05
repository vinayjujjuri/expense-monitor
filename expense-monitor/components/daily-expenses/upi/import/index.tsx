"use client";

import { useState } from "react";
import ImportPreviewTable, { ImportedExpense } from "./import-preview-table";

export default function ImportUPIExpenses() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ImportedExpense[] | null>(null)

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PDF_BACKEND_URL}/api/parse-phonepe`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse file")

      const data = await res.json()
      setPreviewData(data.expenses)
      console.log(data);

      setMessage(`Imported ${data.count} expenses successfully`);
    } catch (err: any) {
      setMessage(err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  }



  async function handleConfirm(selected: ImportedExpense[]) {
    await fetch("/api/import/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expenses: selected }),
    })

    setPreviewData(null)
    alert("Expenses imported successfully")
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Import Expenses</h1>
      <p className="text-sm text-gray-600 mb-6">
        Upload PhonePe statement (PDF)
      </p>

      <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50">
        <input
          type="file"
          accept=".pdf"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
    

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-md disabled:opacity-60"
        >
          {loading ? "Importing..." : "Upload & Import"}
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
      )}

      <p className="mt-6 text-xs text-gray-500 text-center">
        🔒 We never access your PhonePe or bank account.
      </p>

      {/* Preview Section */}
      {previewData && (
        <ImportPreviewTable
          data={previewData}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
