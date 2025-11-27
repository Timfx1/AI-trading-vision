import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api/summary";

export default function SummaryCards() {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    axios.get(API).then(res => setSummary(res.data)).catch(console.error);
  }, []);

  const stats = [
    { label: "Total Setups", value: summary.totalSetups },
    { label: "Valid Setups", value: summary.valid },
    { label: "Invalid Setups", value: summary.invalid },
    { label: "Win Rate", value: `${(summary.winRate * 100).toFixed(1)}%` },
    { label: "Recognition", value: `${(summary.recognition * 100).toFixed(1)}%` }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="glass p-4 text-center hover:scale-105 transition-transform">
          <h2 className="text-cyan-300 text-sm">{s.label}</h2>
          <p className="text-2xl font-semibold mt-2">{s.value || "..."}</p>
        </div>
      ))}
    </div>
  );
}
