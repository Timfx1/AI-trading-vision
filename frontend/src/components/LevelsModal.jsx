import React from "react";
import { IoClose } from "react-icons/io5";

export default function LevelsModal({ show, onClose, levels }) {
  if (!show || !levels) return null;

  const copy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[999]">
      <div className="glass p-6 rounded-2xl w-80 relative">

        <button
          className="absolute top-2 right-2 text-xl"
          onClick={onClose}
        >
          <IoClose />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-accent">
          Extracted Levels
        </h2>

        <div className="space-y-3">
          <LevelItem label="Entry" value={levels.entry} copy={copy} />
          <LevelItem label="Stop Loss" value={levels.stop_loss} copy={copy} />
          <LevelItem label="Take Profit" value={levels.take_profit} copy={copy} />

          {levels.risk_reward && (
            <p className="mt-3 text-center opacity-60">
              R:R = <span className="font-bold">{levels.risk_reward}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LevelItem({ label, value, copy }) {
  return (
    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
      <span>{label}: <b>{value || "—"}</b></span>

      {value && (
        <button
          className="px-2 py-1 bg-accent text-black rounded text-xs hover:opacity-80"
          onClick={() => copy(value)}
        >
          Copy
        </button>
      )}
    </div>
  );
}
