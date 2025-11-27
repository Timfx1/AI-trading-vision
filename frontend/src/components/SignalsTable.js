import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api/signals";

export default function SignalsTable() {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    const load = () => axios.get(API).then(res => setSignals(res.data)).catch(console.error);
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-4">
      <h2 className="text-xl mb-3 text-cyan-300 font-semibold">Active Signals</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/20 text-cyan-200">
            <th>Symbol</th>
            <th>Timeframe</th>
            <th>Direction</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((s, i) => (
            <tr key={i} className="hover:bg-white/5">
              <td>{s.symbol}</td>
              <td>{s.timeframe}</td>
              <td className={s.direction === "LONG" ? "text-green-400" : "text-red-400"}>
                {s.direction}
              </td>
              <td>{(s.confidence * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
