// src/components/AboutSection.js

import React from "react";
import { motion } from "framer-motion";
import { useAccent } from "../context/AccentContext";
import { useLang } from "../lang/LanguageContext";

export default function AboutSection() {
  const { accent, custom } = useAccent();
  const { strings } = useLang();
  const color = custom || accent;

  const { about } = strings;

  return (
    <motion.section
      className="w-full glass rounded-3xl shadow-2xl p-8 mt-10 text-center"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2
        className="text-3xl sm:text-4xl font-extrabold mb-4"
        style={{ color }}
      >
        {about.title}
      </h2>

      <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto text-base sm:text-lg">
        <strong>Timfx1 Pattern AI</strong> {about.intro}{" "}
        <span className="font-semibold" style={{ color }}>
          Wasswa Timothy Kambazza
        </span>{" "}
        {about.introEnd}
      </p>

      <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto mt-4 text-base sm:text-lg">
        {about.goal}
      </p>

      <p className="text-gray-400 text-sm mt-6 italic">
        “{about.quote}”
      </p>

      {/* LINKS */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="https://www.youtube.com/@fxmasterytim5024"
          target="_blank"
          rel="noreferrer"
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition"
        >
          {about.youtube}
        </a>

        <a
          href="https://chat.whatsapp.com/Bm3vdPalYVQEHQOxmCpWA5?mode=hqrc"
          className="bg-white/10 hover:bg-white/20 text-teal-300 font-semibold px-6 py-3 rounded-full shadow-lg transition"
        >
          {about.contact}
        </a>
      </div>

      {/* SUPPORT */}
      <div className="mt-10">
        <a
          href="https://www.paypal.com/donate/?hosted_button_id=6GWTAYCP9CR8N"
          target="_blank"
          rel="noreferrer"
          className="inline-block px-7 py-3 rounded-full font-bold shadow-lg transition"
          style={{ background: "#FFDD00", color: "#000" }}
        >
          ☕ {about.support}
        </a>
      </div>
    </motion.section>
  );
}
