// src/components/PredictPanel.js
import React, { useState } from "react";
import axios from "axios";

import LevelsModal from "./LevelsModal";
import RuleAdvisor from "./RuleAdvisor";
import RiskAdvisor from "./RiskAdvisor";
import { FaCopy } from "react-icons/fa";


import { useLang } from "../lang/LanguageContext";
import { useAccent } from "../context/AccentContext";
import { useAuth } from "../auth/AuthContext";

export default function PredictPanel() {
const BACKEND = "https://timfx1-api.onrender.com";

  const { strings } = useLang();
  const { accent } = useAccent();
  const { user } = useAuth();

  // UI State
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Backend results
  const [cnnResult, setCnnResult] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [llmLabel, setLlmLabel] = useState(null);
  const [levels, setLevels] = useState(null);

  // Modal
  const [showLevels, setShowLevels] = useState(false);

  // Other
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("hybrid");
  const [copyMsg, setCopyMsg] = useState("");

  // --------------------------
  // File handler
  // --------------------------
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  // --------------------------
  // Clean backend Windows path
  // --------------------------
  const cleanPath = (raw) => {
    if (!raw) return "";
    const BASE = `${BACKEND}/images/`;
    let p = raw.replace(/\\/g, "/");
    p = p.replace(/^.*dataset\//, "");
    return BASE + p;
  };

  // --------------------------
  // Save analysis to history
  // --------------------------
  const saveResult = () => {
    if (!cnnResult) return;

    if (!user) {
      alert("You must be logged in to save history.");
      return;
    }

    const entry = {
      id: Date.now(),
      image: preview,
      label: cnnResult.label,
      confidence: cnnResult.confidence,
      date: new Date().toLocaleString(),
    };

    const existing = JSON.parse(localStorage.getItem("timfx1_history") || "[]");
    existing.unshift(entry);

    localStorage.setItem("timfx1_history", JSON.stringify(existing));

    alert("Saved to your history!");
  };

  // --------------------------
  // Copy helper
  // --------------------------
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopyMsg(`Copied: ${txt}`);
    setTimeout(() => setCopyMsg(""), 1200);
  };

  // --------------------------
  // RUN FULL ANALYSIS
  // --------------------------
  const runAnalysis = async () => {
    if (!image) return alert(strings.upload);

    setLoading(true);
    setCnnResult(null);
    setSimilar([]);
    setLlmLabel(null);
    setLevels(null);

    const form = new FormData();
    form.append("image", image);

    try {
      // 🔹 CNN
      const cnn = await axios.post(`${BACKEND}/api/predict`, form);
      setCnnResult(cnn.data);

      // 🔹 Similar sets
      const simple = await axios.post(`${BACKEND}/api/similar`, form);
      const smart = await axios.post(`${BACKEND}/api/similar_smart`, form);

      let combined = [];

      if (mode === "simple") combined = simple.data;
      else if (mode === "smart") combined = smart.data;
      else {
        combined = [...simple.data, ...smart.data]
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 8);
      }

      combined = combined.map((x) => ({ ...x, path: cleanPath(x.path) }));
      setSimilar(combined);

      // 🔹 LLM Label
      const llm = await axios.post(`${BACKEND}/api/llm/label`, form);
      setLlmLabel(llm.data);

      // 🔹 Levels (SL/TP)
      const lvl = await axios.post(`${BACKEND}/api/extract_levels`, form);
      setLevels(lvl.data);

      setShowLevels(true);

    } catch (err) {
      console.error(err);
      alert("Backend error. Check terminal.");
    }

    setLoading(false);
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="glass p-6 rounded-2xl w-full max-w-3xl shadow-xl">

      <h2 className="text-xl font-bold mb-4 title">{strings.upload}</h2>

      {/* Upload */}
      <input type="file" accept="image/*" onChange={handleFile} />

      {preview && (
        <img
          src={preview}
          className="mt-3 rounded-xl border border-white/10 max-h-56 object-contain"
        />
      )}

      {/* Mode Switch */}
      <div className="mt-4 flex gap-3">
        {["simple", "smart", "hybrid"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{ borderColor: "var(--accent)" }}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              mode === m ? "btn-accent text-black" : "btn-accent-outline"
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Run Button */}
      <button
        onClick={runAnalysis}
        disabled={loading}
        className="btn-accent px-5 py-2 rounded-xl mt-4"
      >
        {loading ? "Analyzing…" : strings.analyze}
      </button>

      {cnnResult && (
        <button
          onClick={saveResult}
          className="btn-accent-outline ml-3 px-4 py-2 rounded-xl"
        >
          {strings.save}
        </button>
      )}

      {/* Copy popup */}
      {copyMsg && (
        <div className="fixed bottom-8 right-8 glass px-4 py-2 rounded-xl text-sm">
          {copyMsg}
        </div>
      )}

      {/* -----------------------------
          CNN RESULT PANEL
      ------------------------------ */}
      {cnnResult && (
        <div className="mt-6 p-4 glass rounded-xl">

          <h3 className="title text-lg mb-1">CNN Prediction</h3>

         <div className="flex items-center gap-2">
  <span>Label: {cnnResult.label}</span>
  <RuleAdvisor result={cnnResult} />
</div>


          <p>Confidence: {(cnnResult.confidence * 100).toFixed(1)}%</p>

          {/* RISK ADVISOR */}
          <RiskAdvisor result={cnnResult} />
        </div>
      )}

      {/* -----------------------------
          LLM RESULT
      ------------------------------ */}
      {llmLabel && (
  <div className="mt-4 p-4 glass rounded-xl relative">

    <h3 className="title text-lg flex justify-between items-center">
      {strings.patternInsight}

      {/* COPY SUMMARY BUTTON */}
      <button
        onClick={() => copyText(llmLabel.reason)}
        className="text-xs px-3 py-1 flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20"
      >
        <FaCopy size={12} /> Copy
      </button>
    </h3>

    <p className="mt-2"><b>Pattern:</b> {llmLabel.pattern}</p>
    <p className="text-sm opacity-75 whitespace-pre-line mt-1">{llmLabel.reason}</p>
  </div>
)}

      {levels && (
  <div className="mt-4 p-4 glass rounded-xl">
    <h3 className="title text-lg mb-2">SL / TP Levels</h3>

    <p className="text-sm opacity-80">SL: {levels.sl}</p>
    <p className="text-sm opacity-80">TP1: {levels.tp1}</p>
    <p className="text-sm opacity-80">TP2: {levels.tp2}</p>

    <button
      onClick={() =>
        copyText(`SL: ${levels.sl}, TP1: ${levels.tp1}, TP2: ${levels.tp2}`)
      }
      className="btn-accent-outline px-4 py-2 mt-3 rounded-lg"
    >
      Copy Levels
    </button>
  </div>
)}


      {/* -----------------------------
          SL/TP MODAL
      ------------------------------ */}
      <LevelsModal
        show={showLevels}
        onClose={() => setShowLevels(false)}
        levels={levels}
        copyText={copyText}
      />
    </div>
  );
}
