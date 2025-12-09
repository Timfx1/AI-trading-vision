import React from "react";

export default function AiLabelResult({ data }) {
  if (!data) return null;

  return (
    <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-xs text-white">
      <h3 className="text-teal-300 font-semibold mb-2">AI Auto-Label Result</h3>

      <pre className="whitespace-pre-wrap bg-black/30 p-3 rounded-lg border border-white/10 text-[11px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
