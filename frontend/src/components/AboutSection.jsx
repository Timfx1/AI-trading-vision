import React from "react";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <motion.section
      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 mt-10 text-center"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-400 mb-4">
        About Timfx1 Pattern AI
      </h2>

      <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto text-base sm:text-lg">
        <strong>Timfx1 Pattern AI</strong> was developed by{" "}
        <span className="text-teal-400 font-semibold">
          Wasswa Timothy Kambazza
        </span>{" "}
        — a trader and technologist passionate about empowering others to see
        the market more clearly through data-driven insights and visual pattern
        recognition.
      </p>

      <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto mt-4 text-base sm:text-lg">
        The goal of this project is to help traders analyze their own setups by
        comparing them with historically validated patterns. Using advanced
        computer vision and AI, Timfx1 identifies structural similarities
        between your uploaded chart and proven setups, enhancing your ability to
        recognize opportunity, manage risk, and trade with confidence.
      </p>

      <p className="text-gray-400 text-sm mt-6 italic">
        “We learn from the past to master the present — and prepare for the
        trade ahead.”
      </p>

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition"
        >
          View Project on GitHub
        </a>
        <a
          href="mailto:your.email@domain.com"
          className="bg-white/10 hover:bg-white/20 text-teal-300 font-semibold px-6 py-3 rounded-full shadow-lg transition"
        >
          Contact Developer
        </a>
      </div>
    </motion.section>
  );
}
