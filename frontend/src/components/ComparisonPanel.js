import React, { useState, useEffect } from "react";

export default function ComparisonPanel({ comparisons, activeMode }) {
  const [selected, setSelected] = useState(null); // for zoomed image

  // Debug helper – you’ll see the raw data in the browser console
  useEffect(() => {
    console.log("🔍 Comparisons from backend:", comparisons);
  }, [comparisons]);

  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="h-full bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center text-xs md:text-sm text-white/50 p-4">
        No comparisons yet. Upload a chart and run{" "}
        <span className="mx-1 font-semibold text-teal-300">
          Predict &amp; Compare
        </span>{" "}
        to see similar setups from your dataset.
      </div>
    );
  }

  const modeLabel =
    activeMode === "hybrid"
      ? "Hybrid Vision"
      : activeMode === "smart"
      ? "Smart Vision"
      : "Simple Vision";

  // 🔑 Turn any messy path into a clean image URL that Flask can serve
  const toImageUrl = (rawPath) => {
    if (!rawPath) return "";

    const BASE = "http://127.0.0.1:5000/images/";

    // 1) If it already starts with our /images base, clean everything AFTER it
    if (rawPath.startsWith(BASE)) {
      let rest = rawPath.slice(BASE.length); // strip base prefix

      // Normalize slashes
      rest = rest.replace(/\\/g, "/");

      // Remove any leading ../../.. stuff up to and including "dataset/"
      // Example:
      //   ../../../../Downloads/.../backend/dataset/valid_setup/AC.png
      // -> valid_setup/AC.png
      rest = rest.replace(/^(\.\.\/)+.*dataset\//, "");

      return BASE + rest;
    }

    // 2) If it's some other http(s) URL, just return as-is
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return rawPath;
    }

    // 3) Plain local filesystem path: strip up to dataset/ and map to /images/
    // Example:
    //   C:\...\backend\dataset\valid_setup\AC.png
    let rel = rawPath.replace(/\\/g, "/");
    rel = rel.replace(/^.*dataset\//, ""); // -> valid_setup/AC.png

    return BASE + rel;
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-teal-300">
            Similar Setups
          </h2>
          <p className="text-[11px] text-white/60">
            Top matches from your <span className="font-mono">dataset/</span>{" "}
            folders.
          </p>
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900/70 border border-white/20 text-white/70">
          {modeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 overflow-y-auto max-h-[320px] pr-1">
        {comparisons.map((c, i) => {
          const imgUrl = toImageUrl(c.path);

          const hasSim = c.similarity !== undefined && c.similarity !== null;
          const similarity =
            hasSim && c.similarity <= 1 ? c.similarity * 100 : c.similarity;
          const distance = c.distance;

          const labelText =
            c.label === "valid" || c.label === "valid_setup"
              ? "Valid"
              : c.label === "invalid" || c.label === "invalid_setup"
              ? "Invalid"
              : (c.label || "").toString();

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(c)}
              className="group text-left rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 overflow-hidden shadow-sm transition flex flex-col"
            >
              <div className="relative">
                <img
                  src={imgUrl}
                  alt={`Similar setup ${i + 1}`}
                  className="w-full h-24 md:h-28 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="p-2 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded-md border ${
                      labelText.toLowerCase() === "valid"
                        ? "bg-green-500/20 border-green-400/50 text-green-200"
                        : labelText.toLowerCase() === "invalid"
                        ? "bg-red-500/20 border-red-400/50 text-red-200"
                        : "bg-slate-600/40 border-slate-400/60 text-slate-100"
                    }`}
                  >
                    {labelText}
                  </span>
                  {hasSim && (
                    <span className="text-teal-300 font-semibold">
                      {similarity.toFixed(1)}%
                    </span>
                  )}
                </div>
                {distance !== undefined && (
                  <p className="text-[10px] text-white/50">
                    Distance:{" "}
                    {typeof distance === "number"
                      ? distance.toFixed(3)
                      : distance}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Zoom modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="max-w-4xl w-[95%] md:w-[80%] bg-slate-900/95 border border-white/20 rounded-2xl p-4 md:p-6 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80"
            >
              Close
            </button>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="flex-1 flex items-center justify-center bg-black/60 rounded-xl border border-white/15">
                <img
                  src={toImageUrl(selected.path)}
                  alt="Zoomed similar setup"
                  className="max-h-[70vh] w-full object-contain rounded-lg"
                />
              </div>
              <div className="w-full md:w-64 flex flex-col gap-2 text-sm">
                <h3 className="text-teal-300 font-semibold text-base md:text-lg">
                  Similar Setup Details
                </h3>
                <p className="text-xs text-white/60">
                  Mode:{" "}
                  <span className="font-medium text-white/90">
                    {selected.mode === "smart"
                      ? "Smart Vision"
                      : selected.mode === "simple"
                      ? "Simple Vision"
                      : "Hybrid Vision"}
                  </span>
                </p>
                <p className="text-xs text-white/60">
                  Label:{" "}
                  <span className="font-medium text-white/90">
                    {selected.label}
                  </span>
                </p>
                {selected.similarity !== undefined && (
                  <p className="text-xs text-white/60">
                    Similarity:{" "}
                    <span className="font-medium text-teal-300">
                      {(
                        (selected.similarity <= 1
                          ? selected.similarity * 100
                          : selected.similarity) || 0
                      ).toFixed(1)}
                      %
                    </span>
                  </p>
                )}
                {selected.distance !== undefined && (
                  <p className="text-xs text-white/60">
                    Distance metric:{" "}
                    <span className="font-mono">
                      {typeof selected.distance === "number"
                        ? selected.distance.toFixed(4)
                        : selected.distance}
                    </span>
                  </p>
                )}
                <p className="text-[11px] text-white/50 mt-2">
                  Tip: Use this to visually compare your current idea to past
                  patterns and check if your execution is consistent with your
                  best setups.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
