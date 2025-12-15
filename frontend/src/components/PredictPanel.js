import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import ComparisonPanel from "./ComparisonPanel";
import { backendFetch } from "../utils/backendFetch";


export default function PredictPanel() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState([]);
  const [mode, setMode] = useState("simple"); // 'simple' | 'smart' | 'hybrid'
  const [showInfo, setShowInfo] = useState(false);
  const [infoMode, setInfoMode] = useState("simple"); // which info box to show

  const infoText = {
    simple: {
      title: "Simple Vision",
      desc: `Uses perceptual image hashes to compare your upload
to past setups.\n\nGood for:\n• Very similar screenshots\n• Same template / colors / zoom\n• Quick lightweight comparisons`,
    },
    smart: {
      title: "Smart Vision (CNN)",
      desc: `Uses deep-learning embeddings from your trained CNN model
to compare market structure, not just pixels.\n\nGood for:\n• Different zoom levels\n• Slightly different templates\n• Structural pattern similarity (swings, legs, context)`,
    },
    hybrid: {
      title: "Hybrid Vision",
      desc: `Combines Simple + Smart Vision.\n\nBehaviour:\n• Calls both comparison engines\n• Merges and ranks matches\n• Gives you both “looks like the same screenshot” AND “behaves like similar structure”.\n\nBest when you want a full picture.`,
    },
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setPrediction(null);
    setComparisons([]);
  };

  // Helpers to call backend
  // const callPredict = async () => {
  //   const formData = new FormData();
  //   formData.append("image", file);
  //   const res = await fetch("http://127.0.0.1:5000/api/predict", {
  //     method: "POST",
  //     body: formData,
  //   });
  //   return res.json();
  // };
  const callPredict = async () => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await backendFetch("/api/predict", {
    method: "POST",
    body: formData,
  });

  return res.json();
};


  // const callSimilarSimple = async () => {
  //   const formData = new FormData();
  //   formData.append("image", file);
  //   const res = await fetch("http://127.0.0.1:5000/api/similar", {
  //     method: "POST",
  //     body: formData,
  //   });
  //   return res.json();
  // };
  const callSimilarSimple = async () => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await backendFetch("/api/similar", {
    method: "POST",
    body: formData,
  });

  return res.json();
};


  // const callSimilarSmart = async () => {
  //   const formData = new FormData();
  //   formData.append("image", file);
  //   const res = await fetch("http://127.0.0.1:5000/api/similar_smart", {
  //     method: "POST",
  //     body: formData,
  //   });
  //   return res.json();
  // };
  const callSimilarSmart = async () => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await backendFetch("/api/similar_smart", {
    method: "POST",
    body: formData,
  });

  return res.json();
};


  const normalizeSimple = (arr) =>
    (arr || []).map((x) => {
      const dist = typeof x.distance === "number" ? x.distance : 0;
      const sim = 1 / (1 + dist); // turn distance into 0–1 similarity
      return {
        path: x.path || x.url || "",
        label: x.label || "unknown",
        similarity: sim,
        source: "simple",
      };
    });

  const normalizeSmart = (arr) =>
    (arr || []).map((x) => {
      const dist = typeof x.distance === "number" ? x.distance : 0;
      const sim = 1 / (1 + dist);
      return {
        path: x.path || x.url || "",
        label: x.label || "unknown",
        similarity: sim,
        source: "smart",
      };
    });

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a chart image first.");
      return;
    }

    setLoading(true);
    setPrediction(null);
    setComparisons([]);

    try {
      // 1) Always get a prediction from /api/predict
      const predData = await callPredict();
      setPrediction(predData);

      // 2) Decide which comparison engines to use
      let allComparisons = [];

      if (mode === "simple" || mode === "hybrid") {
        try {
          const simpleData = await callSimilarSimple();
          const simpleNorm = normalizeSimple(simpleData);
          allComparisons = allComparisons.concat(simpleNorm);
        } catch (e) {
          console.error("Simple Vision failed:", e);
        }
      }

      if (mode === "smart" || mode === "hybrid") {
        try {
          const smartData = await callSimilarSmart();
          const smartNorm = normalizeSmart(smartData);
          allComparisons = allComparisons.concat(smartNorm);
        } catch (e) {
          console.error("Smart Vision failed:", e);
        }
      }

      // Fallback if nothing selected (shouldn't happen, but safe)
      if (!mode && allComparisons.length === 0) {
        const simpleData = await callSimilarSimple();
        allComparisons = normalizeSimple(simpleData);
      }

      // Sort by similarity desc and take top 6
      allComparisons.sort((a, b) => b.similarity - a.similarity);
      setComparisons(allComparisons.slice(0, 6));
    } catch (err) {
      console.error(err);
      alert("Prediction or comparison failed — check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleModeClick = (newMode) => {
    setMode(newMode);
  };

  const openInfo = (m) => {
    setInfoMode(m);
    setShowInfo(true);
  };

  return (
    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-xl text-white mt-6">
      <h2 className="text-2xl font-semibold text-teal-300 mb-2">
        Pattern Prediction & Comparisons
      </h2>
      <p className="text-sm text-white/70 mb-4">
        Upload a chart, choose how you want the AI to “see” it, and compare
        your setup to real, labeled examples from your own trading log.
      </p>

      {/* Vision Mode Selector */}
      <div className="mb-5 p-3 rounded-2xl bg-black/30 border border-white/10">
        <p className="text-xs uppercase tracking-wide text-white/50 mb-2">
          Vision Mode
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Simple Vision */}
          <button
            type="button"
            onClick={() => handleModeClick("simple")}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border transition 
              ${
                mode === "simple"
                  ? "bg-emerald-500/80 border-emerald-300 shadow-lg"
                  : "bg-white/5 border-white/20 hover:bg-white/10"
              }`}
          >
            <span>Simple Vision</span>
            <FaInfoCircle
              className="cursor-pointer text-xs opacity-80 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                openInfo("simple");
              }}
            />
          </button>

          {/* Smart Vision */}
          <button
            type="button"
            onClick={() => handleModeClick("smart")}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border transition 
              ${
                mode === "smart"
                  ? "bg-sky-500/80 border-sky-300 shadow-lg"
                  : "bg-white/5 border-white/20 hover:bg-white/10"
              }`}
          >
            <span>Smart Vision</span>
            <FaInfoCircle
              className="cursor-pointer text-xs opacity-80 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                openInfo("smart");
              }}
            />
          </button>

          {/* Hybrid Vision */}
          <button
            type="button"
            onClick={() => handleModeClick("hybrid")}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border transition 
              ${
                mode === "hybrid"
                  ? "bg-purple-500/80 border-purple-300 shadow-lg"
                  : "bg-white/5 border-white/20 hover:bg-white/10"
              }`}
          >
            <span>Hybrid Vision</span>
            <FaInfoCircle
              className="cursor-pointer text-xs opacity-80 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                openInfo("hybrid");
              }}
            />
          </button>
        </div>
        <p className="mt-2 text-xs text-white/60">
          Tip: Simple is fast & screenshot-focused, Smart is pattern-focused, Hybrid
          combines both.
        </p>
      </div>

      {/* Upload + Predict Button */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                     file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-800/60 transition px-5 py-2 rounded-full font-medium text-white shadow-md"
        >
          {loading ? "Analyzing setup..." : "Run Analysis"}
        </button>
      </div>

      {/* Preview */}
      {file && (
        <div className="mt-5 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <p className="text-sm text-white/60 mb-2">Uploaded chart preview</p>
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-full max-w-lg rounded-2xl shadow-lg border border-white/10"
            />
          </div>

          {/* Prediction Result */}
          {prediction && (
            <div className="md:w-1/2 mt-4 md:mt-0">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-center h-full flex flex-col justify-center">
                <h3 className="text-lg text-teal-200 font-semibold mb-2">
                  Prediction Result
                </h3>
                <p className="text-xl mb-1">
                  {prediction.label === "valid" ? (
                    <span className="text-green-400 font-bold">
                      ✅ Valid Setup
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold">
                      ❌ Invalid Setup
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-200">
                  Confidence:{" "}
                  {(prediction.confidence * 100).toFixed(2)}%
                </p>
                {prediction.note && (
                  <p className="text-xs text-amber-200 mt-2">
                    Note: {prediction.note}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparisons */}
      <ComparisonPanel comparisons={comparisons} activeMode={mode} />

      {/* Info modal */}
      {showInfo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-slate-900/90 border border-white/20 rounded-2xl p-5 w-[90%] max-w-md text-sm text-white relative">
            <h3 className="text-lg font-semibold text-teal-300 mb-2">
              {infoText[infoMode].title}
            </h3>
            <p className="whitespace-pre-line text-white/80">
              {infoText[infoMode].desc}
            </p>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 px-4 py-1.5 rounded-full bg-teal-500 hover:bg-teal-600 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
