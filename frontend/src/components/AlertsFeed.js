import React, { useEffect, useState } from "react";

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const evt = new EventSource("http://127.0.0.1:5000/api/alerts/stream");
    evt.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.signal) {
        setAlerts(prev => [data.signal, ...prev].slice(0, 10));
      }
    };
    return () => evt.close();
  }, []);

  return (
    <div className="glass p-4 max-h-[85vh] overflow-y-auto">
      <h2 className="text-xl mb-3 text-cyan-300 font-semibold">Live Alerts</h2>
      <ul className="space-y-2">
        {alerts.map((a, i) => (
          <li key={i} className="p-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            <div className="flex justify-between">
              <span className="font-semibold">{a.symbol}</span>
              <span className={a.direction === "LONG" ? "text-green-400" : "text-red-400"}>
                {a.direction}
              </span>
            </div>
            <div className="text-sm text-gray-300">
              {a.timeframe} • {(a.confidence * 100).toFixed(1)}%
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
