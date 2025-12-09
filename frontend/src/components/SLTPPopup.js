import React from "react";

export default function SLTPPopup({ show, onClose, levels }) {
  if (!show || !levels) return null;

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 border border-white/20 p-6 rounded-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-red-500/80"
        >
          X
        </button>

        <h2 className="text-xl mb-4 text-teal-300 font-bold">Extracted Levels</h2>

        <div className="flex flex-col gap-3">
          {["entry", "stop_loss", "take_profit"].map((key) => (
            <div
              key={key}
              className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10"
            >
              <span className="capitalize text-white/90">{key.replace("_", " ")}:</span>
              <button
                onClick={() => copy(levels[key])}
                className="px-3 py-1 rounded bg-teal-500 text-white"
              >
                {levels[key] || "--"}
              </button>
            </div>
          ))}
        </div>

        {levels.risk_reward && (
          <p className="mt-3 text-center text-teal-300">
            R:R = {levels.risk_reward}
          </p>
        )}
      </div>
    </div>
  );
}
