// src/MainApp.js

import React, { useState } from "react";
import PredictPanel from "./components/PredictPanel";
import ComparisonPanel from "./components/ComparisonPanel";
import HistoryPanel from "./components/HistoryPanel";
import DatasetUploader from "./components/DatasetUploader";
import DatasetCleaner from "./components/DatasetCleaner";
import AboutSection from "./components/AboutSection.jsx";


import { useLang } from "./lang/LanguageContext";
import { useAccent } from "./context/AccentContext";
import { useAuth } from "./auth/AuthContext";

import { FaChevronDown } from "react-icons/fa";

export default function MainApp() {
  const { lang, setLang } = useLang();
  const { accent, setAccent, setCustom, presetColors } = useAccent();
  const { user, login, logout } = useAuth();

  const [showLang, setShowLang] = useState(false);
  const [showAccent, setShowAccent] = useState(false);

  return (
    <div className="min-h-screen px-4 py-6">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="title text-3xl">Timfx1</h1>

        <div className="flex items-center gap-4">

          {/* LANGUAGE DROPDOWN */}
          <div className="relative">
            <button
              className="btn-accent-outline px-3 py-1.5 rounded-lg flex items-center gap-1"
              onClick={() => setShowLang((v) => !v)}
            >
              {lang.toUpperCase()}
              <FaChevronDown size={12} />
            </button>

            {showLang && (
              <div className="absolute right-0 mt-2 glass p-2 rounded-lg w-32 z-[9999]">
                {["en", "de", "fr", "lg", "ar", "zh", "sw"].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setShowLang(false);
                    }}
                    className="w-full text-left px-2 py-1 hover:bg-white/10 rounded"
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* THEME DROPDOWN */}
          <div className="relative">
            <button
              className="btn-accent-outline px-3 py-1.5 rounded-lg flex items-center gap-1"
              onClick={() => setShowAccent((v) => !v)}
            >
              Theme
              <FaChevronDown size={12} />
            </button>

            {showAccent && (
              <div className="absolute right-0 mt-2 glass p-3 rounded-lg w-40 space-y-2 z-[9999]">

                {/* Preset colors */}
                {Object.keys(presetColors).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setAccent(key);
                      setCustom(null);
                      setShowAccent(false);
                    }}
                    className="w-full flex items-center gap-2 p-1 rounded hover:bg-white/10"
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ background: presetColors[key] }}
                    ></span>
                    {key.toUpperCase()}
                  </button>
                ))}

                {/* Custom color */}
                <div className="border-t border-white/10 pt-2">
                  <p className="text-xs mb-1 opacity-70">Custom</p>
                  <input
                    type="color"
                    onChange={(e) => {
                      setCustom(e.target.value);
                      setShowAccent(false);
                    }}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* LOGIN / LOGOUT */}
          {!user ? (
            <button
              className="btn-accent px-4 py-2 rounded-lg"
              onClick={login}
            >
              Login
            </button>
          ) : (
            <button
              className="btn-accent-outline px-4 py-2 rounded-lg"
              onClick={logout}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* MAIN PANELS */}
      <div className="flex flex-col gap-16 max-w-5xl mx-auto">
        <PredictPanel />
        <ComparisonPanel />
        <HistoryPanel />
        <DatasetUploader />
        <DatasetCleaner />
        <AboutSection/>
      </div>
    </div>
  );
}
