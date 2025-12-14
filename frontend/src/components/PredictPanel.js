// src/components/PredictPanel.js
import React, { useState } from "react";
import axios from "axios";
import { FaCopy, FaInfoCircle } from "react-icons/fa";

import LevelsModal from "./LevelsModal";
import RuleAdvisor from "./RuleAdvisor";
import RiskAdvisor from "./RiskAdvisor";

import { useLang } from "../lang/LanguageContext";
import { useAuth } from "../auth/AuthContext";

const BACKEND = "https://ai-trading-vision-1.onrender.com";

export default function PredictPanel() {
  const { strings } = useLang();
  const { user } = useAuth();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [cnnResult, setCnnResult] = useState(null);
  const [llmLabel, setLlmLabel] = useState(null);
  const [levels, setLevels] = useState(null);

  const [mode, setMode] = useState("hybrid");
  const [loading, setLoading] = useState(false);

  const [showInfo, setShowInfo] = useState(false);
  const [infoMode, setInfoMode] = useState("simple");
  const [copyMsg, setCopyMsg] = useState("");

  const infoText = {
    simple: "Pixel-level screenshot similarity. Fast & strict.",
    smart: "CNN understands structure & pattern context.",
    hybrid: "Best of both: structure + screenshot similarity."
  };

  const copyText = (t) => {
    navigator.clipboard.writeText(t);
    setCopyMsg("Copied!");
    setTimeout(() => setCopyMsg(""), 1200);
  };

  const runAnalysis = async () => {
    if (!image) return alert("Upload a chart first");
    setLoading(true);

    const form = new FormData();
    form.append("image", image);

    try {
      const cnn = await axios.post(`${BACKEND}/api/predict`, form);
      setCnnResult(cnn.data);

      const llm = await axios.post(`${BACKEND}/api/llm/label`, form);
      setLlmLabel(llm.data);

      const lvl = await axios.post(`${BACKEND}/api/vision/levels`, form);
setLevels(lvl.data);

    } catch (e) {
      alert("Backend error");
    }
    setLoading(false);
  };

  return (
    <div className="glass p-6 rounded-3xl max-w-5xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Pattern Prediction & Comparisons</h2>

      {/* Vision mode */}
      <div className="flex gap-3 mb-4">
        {["simple", "smart", "hybrid"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-full border ${
              mode === m ? "bg-teal-500 text-black" : "border-white/20"
            }`}
          >
            {m.toUpperCase()}
            <FaInfoCircle
              className="inline ml-2 opacity-70 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setInfoMode(m);
                setShowInfo(true);
              }}
            />
          </button>
        ))}
      </div>

      {/* Upload */}
      <input type="file" accept="image/*"
        onChange={(e) => {
          setImage(e.target.files[0]);
          setPreview(URL.createObjectURL(e.target.files[0]));
        }}
      />

      <button
        onClick={runAnalysis}
        disabled={loading}
        className="btn-accent px-5 py-2 rounded-xl mt-4"
      >
        {loading ? "Analyzing…" : "Run Analysis"}
      </button>

      {/* SIDE BY SIDE */}
      {preview && cnnResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          <img src={preview}
            className="rounded-xl border border-white/10"
          />

          <div className="glass p-4 rounded-xl">
            <h3 className="font-bold mb-1">CNN Prediction</h3>
            <p>{cnnResult.label}</p>
            <p>Confidence: {(cnnResult.confidence * 100).toFixed(1)}%</p>
            <RuleAdvisor result={cnnResult} />
            <RiskAdvisor result={cnnResult} />
          </div>
        </div>
      )}

      {/* LLM */}
      {llmLabel && (
        <div className="glass p-4 rounded-xl mt-4 relative">
          <button
            onClick={() => copyText(llmLabel.reason)}
            className="absolute top-3 right-3"
          >
            <FaCopy />
          </button>
          <b>Pattern:</b> {llmLabel.pattern}
          <pre className="text-sm opacity-80 mt-2 whitespace-pre-wrap">
            {llmLabel.reason}
          </pre>
        </div>
      )}

      {/* LEVELS */}
      {levels && (
  <div className="mt-4 p-4 glass rounded-xl">
    <h3 className="title text-lg mb-2">Trade Levels (Visual)</h3>

    {["direction", "entry", "sl", "tp1", "tp2"].map((k) => (
      <div key={k} className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-80">
          {k.toUpperCase()}:
        </span>

        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {levels[k] ?? "—"}
          </span>

          {levels[k] && (
            <button
              onClick={() => copyText(String(levels[k]))}
              className="p-1 rounded bg-white/10 hover:bg-white/20"
            >
              <FaCopy size={12} />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
)}


      {/* INFO MODAL */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="glass p-5 rounded-xl max-w-md">
            <h3 className="font-bold mb-2">{infoMode.toUpperCase()}</h3>
            <p>{infoText[infoMode]}</p>
            <button onClick={() => setShowInfo(false)} className="mt-3 btn-accent">
              Close
            </button>
          </div>
        </div>
      )}

      {copyMsg && <div className="fixed bottom-6 right-6 glass px-4 py-2">{copyMsg}</div>}
    </div>
  );
}
