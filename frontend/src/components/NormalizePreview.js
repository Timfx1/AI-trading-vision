import React, { useState } from "react";

export default function NormalizePreview() {
  const BACKEND = "http://127.0.0.1:5000";

  const [file, setFile] = useState(null);
  const [orig, setOrig] = useState(null);
  const [norm, setNorm] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setOrig(URL.createObjectURL(f));
    setNorm(null);
  };

  const generatePreview = async () => {
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    const res = await fetch(`${BACKEND}/api/normalize/preview`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setNorm("data:image/png;base64," + data.normalized);
  };

  return (
    <div className="bg-white/10 border border-white/20 p-6 rounded-2xl 
                    backdrop-blur-xl shadow-xl w-full max-w-3xl mt-10">
      <h2 className="text-xl font-bold text-teal-300 mb-3">
        🎛 TradingView Color Normalization Preview
      </h2>

      <input type="file" accept="image/*" onChange={handleFile} />

      <button
        onClick={generatePreview}
        className="mt-3 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg"
      >
        Generate Preview
      </button>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {orig && (
          <div>
            <p className="text-center mb-2 text-white/70 text-sm">Original</p>
            <img src={orig} className="rounded-xl border border-white/20" />
          </div>
        )}

        {norm && (
          <div>
            <p className="text-center mb-2 text-white/70 text-sm">Normalized</p>
            <img src={norm} className="rounded-xl border border-white/20" />
          </div>
        )}
      </div>
    </div>
  );
}
