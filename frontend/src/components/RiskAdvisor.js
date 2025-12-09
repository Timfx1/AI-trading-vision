// src/components/RiskAdvisor.js
import React from "react";

export default function RiskAdvisor({ result }) {
  if (!result) return null;

  const conf = result.confidence || 0;
  let risk = 0.5;
  let msg = "";

  if (conf > 0.8) {
    risk = 1;
    msg = "Strong confidence — consider 1% risk.";
  } else if (conf > 0.6) {
    risk = 0.75;
    msg = "Moderate confidence — consider 0.75% risk.";
  } else if (conf > 0.5) {
    risk = 0.5;
    msg = "Weak confidence — consider 0.5% risk.";
  } else {
    risk = 0.25;
    msg = "Low confidence — reduce to 0.25% risk.";
  }

  return (
    <div className="mt-2 text-xs opacity-80">
      <strong>Risk Suggestion:</strong> {risk}% — {msg}
    </div>
  );
}
