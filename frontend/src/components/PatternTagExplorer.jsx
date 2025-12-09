import React, { useEffect, useState } from "react";

export default function PatternTagExplorer() {
  const [tags, setTags] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/dataset/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags || []));
  }, []);

  const selectTag = (t) => {
    fetch(`http://127.0.0.1:5000/api/dataset/filter?tag=${t}`)
      .then((r) => r.json())
      .then((d) => setFiltered(d.items || []));
  };

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mt-8 shadow-xl">
      <h2 className="text-teal-300 font-bold text-xl mb-3">Pattern Tag Explorer</h2>
      <p className="text-xs text-white/60 mb-4">Click a tag to filter dataset</p>

      <div className="flex flex-wrap gap-2">
        {tags.map((t, idx) => (
          <button
            key={idx}
            onClick={() => selectTag(t)}
            className="px-3 py-1 rounded-full bg-slate-700 text-xs text-white hover:bg-slate-600"
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {filtered.map((it, idx) => (
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
      )}
    </div>
  );
}
