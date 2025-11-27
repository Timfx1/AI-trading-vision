import React, { useState } from "react";
import { FaQuestionCircle, FaTimes } from "react-icons/fa";

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full shadow-lg 
                   transition-all duration-300 hover:scale-110 border border-teal-300/40 z-50"
      >
        <FaQuestionCircle size={22} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md mx-4 text-white relative shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-xl font-semibold text-teal-300 mb-3 text-center">
              Welcome to Timfx1 Pattern AI
            </h2>

            <p className="text-sm text-gray-200 mb-4 leading-relaxed">
              🔹 <strong>Hybrid AI Mode</strong> blends Smart and Simple Vision to deliver 
              fast yet accurate chart analysis.
              <br /><br />
              🔹 <strong>Smart Vision</strong> uses deep AI models for advanced pattern recognition.
              <br /><br />
              🔹 <strong>Simple Vision</strong> runs lightweight, pixel-based comparisons 
              — ideal for speed testing.
              <br /><br />
              📈 You can experiment in the <strong>Pattern Comparison Lab</strong> below 
              to see how both versions differ on your uploaded charts.
            </p>

            <div className="text-center">
              <button
                onClick={() => setOpen(false)}
                className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg text-white mt-2"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
