import React from "react";
import { useLang } from "./LanguageContext";

export default function LanguageSelector() {
  const { lang, setLang } = useLang();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="p-2 rounded-lg bg-white/10 border border-white/20"
    >
      <option value="en">EN</option>
      <option value="de">DE</option>
      <option value="fr">FR</option>
      <option value="lg">LG</option>
      <option value="ar">AR</option>
      <option value="zh">ZH</option>
      <option value="sw">SW</option>
    </select>
  );
}
