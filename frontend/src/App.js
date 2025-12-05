import React, { useState, useEffect } from "react";
import PredictPanel from "./components/PredictPanel";
import ComparisonsPanel from "./components/ComparisonPanel";
import { FaMoon, FaSun, FaQuestionCircle } from "react-icons/fa";
import HistoryPanel from "./components/HistoryPanel";
import HelpWidget from "./components/HelpWidget";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between items-center transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white"
          : "bg-gradient-to-br from-white via-gray-100 to-gray-300 text-gray-900"
      }`}
    >
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-4 border-b border-white/10 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-teal-400">Timfx1</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHelp(true)}
            className="text-xl hover:text-teal-300 transition"
          >
            <FaQuestionCircle />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xl hover:text-teal-300 transition"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 py-10">
        <PredictPanel />

        {/* Comparisons panel right under prediction */}
        <div className="mt-12 w-full">
          <ComparisonsPanel />
        </div>

        <HistoryPanel />
        <HelpWidget />
      </main>

      {/* Über mich / About & Footer */}
      <footer className="w-full text-center text-gray-300 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-semibold text-teal-300 mb-3">
            Über mich
          </h2>
          <p className="text-gray-200 text-sm leading-relaxed mb-3">
            <strong>Wasswa Timothy Kambazza</strong> — 6 years and counting in
            the markets. I’ve traded across different instruments but ultimately
            found my edge in forex. The truth is, the principles and psychology
            you learn from one instrument apply everywhere — discipline,
            patience, and risk control are universal. Never stop sharpening your
            trading mind.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            <strong>Why Timfx1:</strong> To help traders self-analyze their own
            setups using functional, AI-powered pattern comparison — giving you
            insight into what works and what doesn’t, by learning from both
            success and mistakes.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            <strong>Future Goals:</strong> AI-driven insights, pattern
            recognition training, and smarter visualization tools for retail and
            professional traders alike.
          </p>

          <div className="border-t border-white/10 my-4"></div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} <strong>Timfx1</strong> — Created by
            Wasswa Timothy Kambazza.
            <br />
            Built with ❤️ using Flask + React + TensorFlow. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Help Widget */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 w-[90%] md:w-[450px] text-center">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">
              Welcome to Timfx1
            </h3>
            <p className="text-gray-200 text-sm leading-relaxed">
              This platform helps traders analyze their own charts using two
              AI-powered approaches:
              <br />
              <br />
              <strong>Simple Vision</strong> — Fast image similarity based on
              visual match.
              <br />
              <strong>Smart Vision</strong> — Deep-learning pattern detection
              trained from historical setups.
              <br />
              <br />
              You can toggle Smart Prediction on or off in the upload area. Save
              your results, compare similar charts, and improve your trading
              psychology through pattern recognition.
            </p>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-700 text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
