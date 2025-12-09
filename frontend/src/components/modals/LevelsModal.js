import React from "react";

export default function LevelsModal({ show, onClose, levels }) {
  if (!show || !levels) return null;

  const copy = (v) => {
    navigator.clipboard.writeText(v || "");
    alert("Copied!");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-black/70 border border-white/20 p-6 rounded-2xl relative w-96">
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded"
        >
          X
        </button>

        <h3 className="text-xl text-teal-300 font-bold mb-4">
          Extracted Levels
        </h3>

        {["entry", "stop_loss", "take_profit", "risk_reward"].map((k) => (
          <div key={k} className="flex justify-between items-center mb-3">
            <span className="capitalize">{k.replace("_", " ")}:</span>
            <button
              className="px-3 py-1 bg-teal-600 rounded-lg"
              onClick={() => copy(levels[k])}
            >
              {levels[k] || "—"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
