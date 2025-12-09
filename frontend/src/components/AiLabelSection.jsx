import React, { useState } from "react";
import AiLabelResult from "./AiLabelResult";

export default function AiLabelSection({ imageFile }) {
  const [loading, setLoading] = useState(false);
  const [labelData, setLabelData] = useState(null);
  const [saving, setSaving] = useState(false);

  const runLabel = async () => {
    if (!imageFile) {
      alert("Upload an image first.");
      return;
    }

    setLoading(true);
    setLabelData(null);

    const form = new FormData();
    form.append("image", imageFile);

    const res = await fetch("http://127.0.0.1:5000/api/label", {
      method: "POST",
      body: form
    });

    const data = await res.json();
    setLabelData(data.metadata);
    setLoading(false);
  };

  const saveLabel = async () => {
    if (!imageFile) return;

    setSaving(true);

    const form = new FormData();
    form.append("image", imageFile);

    const res = await fetch("http://127.0.0.1:5000/api/label/save", {
      method: "POST",
      body: form
    });

    const data = await res.json();
    console.log("Saved:", data);
    setSaving(false);
    alert("Saved to dataset folder!");
  };

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mt-6 shadow-lg">
      <h3 className="text-teal-300 font-semibold mb-2">AI Auto-Label (GPT-4o)</h3>
      <p className="text-xs text-white/60 mb-3">
        Get a deep-analysis metadata label from GPT-4o Vision.
      </p>

      <button
        onClick={runLabel}
        disabled={loading}
        className="px-4 py-2 bg-sky-600 rounded-full hover:bg-sky-700 text-white text-sm"
      >
        {loading ? "Analyzing..." : "Run AI Auto-Label"}
      </button>

      {labelData && (
        <div className="mt-4">
          <AiLabelResult data={labelData} />

          <button
            onClick={saveLabel}
            disabled={saving}
            className="mt-3 px-4 py-2 bg-emerald-600 rounded-full hover:bg-emerald-700 text-white text-sm"
          >
            {saving ? "Saving..." : "Save to Dataset"}
          </button>
        </div>
      )}
    </div>
  );
}
