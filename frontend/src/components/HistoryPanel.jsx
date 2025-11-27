import React, { useEffect, useState } from "react";
import { FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("timfx1_history") || "[]");
    setHistory(data);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("timfx1_history");
    setHistory([]);
  };

  if (history.length === 0)
    return (
      <div className="mt-12 w-full max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl text-center shadow-xl">
        <h2 className="text-xl font-semibold text-teal-300 mb-2">
          Saved Analyses
        </h2>
        <p className="text-gray-400 text-sm">
          You haven’t saved any analyses yet. Run a prediction and click{" "}
          <span className="text-teal-300">“Save Analysis”</span> to start
          building your trading library.
        </p>
      </div>
    );

  return (
    <div className="mt-12 w-full max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-xl transition-all duration-500">
      {/* Header with Toggle */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex justify-between items-center cursor-pointer select-none"
      >
        <h2 className="text-xl font-semibold text-teal-300">Saved Analyses</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearHistory();
            }}
            className="flex items-center gap-2 text-xs bg-red-500/60 hover:bg-red-600 px-3 py-1 rounded-md"
          >
            <FaTrash /> Clear
          </button>
          {expanded ? (
            <FaChevronUp className="text-teal-300 text-lg" />
          ) : (
            <FaChevronDown className="text-teal-300 text-lg" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ${
          expanded ? "max-h-[2000px] mt-4" : "max-h-0"
        }`}
      >
        <div className="grid md:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition text-sm text-gray-200"
            >
              <img
                src={item.image}
                alt="Saved chart"
                className="w-full h-32 object-cover rounded-lg mb-2 border border-white/10"
              />
              <p>
                {item.label === "valid" ? (
                  <span className="text-green-400 font-semibold">
                    ✅ Valid
                  </span>
                ) : (
                  <span className="text-red-400 font-semibold">
                    ❌ Invalid
                  </span>
                )}
              </p>
              <p>Confidence: {(item.confidence * 100).toFixed(2)}%</p>
              {item.hybrid && <p>Hybrid: {item.hybrid.toFixed(1)}%</p>}
              <p className="text-xs text-gray-400 mt-1">{item.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
