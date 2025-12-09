import React, { useState, useEffect } from "react";
import { cleanImagePath } from "../utils/cleanPath";
import { useLang } from "../lang/LanguageContext";

export default function ComparisonPanel({ comparisons }) {
  const { strings } = useLang();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    console.log("Comparisons:", comparisons);
  }, [comparisons]);

  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="glass p-4 rounded-xl text-sm opacity-80">
        {strings.similarSetups}: None yet.
      </div>
    );
  }

  return (
    <div className="mt-8 glass p-4 rounded-xl">
      <h3 className="title mb-3">{strings.similarSetups}</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {comparisons.map((c, idx) => {
          const fixedPath = cleanImagePath(c.path);

          return (
            <div
              key={idx}
              className="bg-black/20 rounded-lg border border-white/10 p-2 hover:bg-black/30 cursor-pointer"
              onClick={() => setSelected(c)}
            >
              <img src={fixedPath} className="rounded-md h-28 w-full object-cover" />

              <p className="text-xs mt-1 opacity-70">
                {c.label?.toUpperCase?.()} — {c.distance?.toFixed?.(3)}
              </p>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="modal-bg fixed inset-0 flex items-center justify-center z-50">
          <div className="glass p-6 rounded-xl relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 bg-red-500 px-2 py-1 text-white rounded"
            >
              X
            </button>

            <img
              src={cleanImagePath(selected.path)}
              className="max-h-[80vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
