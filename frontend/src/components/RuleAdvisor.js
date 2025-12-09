// src/components/RuleAdvisor.js
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function RuleAdvisor({ result }) {
  if (!result) return null;

  const isValid = result.label === "valid";
  const confidence = result.confidence || 0;

  let message = "";
  let color = "";

  if (isValid && confidence > 0.75) {
    message = "A-Setup (Trend-following, strong confirmation)";
    color = "text-green-400";
  } else if (isValid && confidence > 0.55) {
    message = "B-Setup (OK, but not perfect)";
    color = "text-yellow-300";
  } else if (!isValid && confidence > 0.6) {
    message = "Avoid — conflicting market structure";
    color = "text-red-400";
  } else {
    message = "Unclear setup — trade at your own risk";
    color = "text-orange-300";
  }

  return (
    <div className={`ml-2 text-xs flex items-center gap-1 ${color}`}>
      <FaExclamationTriangle />
      {message}
    </div>
  );
}
