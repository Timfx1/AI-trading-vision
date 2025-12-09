import React, { useEffect, useState } from "react";

export default function DatasetBrowser() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/dataset/list")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, []);

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mt-8 shadow-xl">
      <h2 className="text-teal-300 font-bold text-xl mb-3">Dataset Browser</h2>
      <p className="text-xs text-white/60 mb-4">Browse all saved labeled setups</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="bg-black/30 border border-white/10 rounded-xl p-2"
          >
            <img
              src={`http://127.0.0.1:5000/images/${it.id}/img.png`}
              alt=""
              className="rounded-md mb-2"
            />
            <p className="text-xs text-white/70">{it.pattern}</p>
            <p className="text-[10px] text-white/40">
              {it.validity} — {it.trend}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
