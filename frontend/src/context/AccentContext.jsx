import React, { createContext, useContext, useState, useEffect } from "react";

const AccentContext = createContext();

export const AccentProvider = ({ children }) => {
  const presetColors = {
    teal: "#14B8A6",
    blue: "#3B82F6",
    purple: "#A855F7",
    red: "#EF4444",
    orange: "#F97316",
    yellow: "#EAB308",
  };

  const [accent, setAccent] = useState("teal");
  const [custom, setCustom] = useState(null);

  useEffect(() => {
    const color = custom || presetColors[accent] || presetColors.teal;
    document.documentElement.style.setProperty("--accent", color);
  }, [accent, custom]);

  return (
    <AccentContext.Provider
      value={{
        accent,
        setAccent,
        custom,
        setCustom,
        presetColors,    // <-- IMPORTANT!
      }}
    >
      {children}
    </AccentContext.Provider>
  );
};

export const useAccent = () => useContext(AccentContext);
