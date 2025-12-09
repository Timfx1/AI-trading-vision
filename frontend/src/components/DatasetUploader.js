import React, { useState } from "react";
import axios from "axios";

export default function DatasetUploader() {
  const BACKEND = "http://127.0.0.1:5000";

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [label, setLabel] = useState("valid");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMessage(null);
  };

  const upload = async () => {
    if (!file) return alert("Choose an image first!");

    setUploading(true);
    setMessage(null);

    const form = new FormData();
    form.append("image", file);
    form.append("label", label);

    try {
      const res = await axios.post(`${BACKEND}/api/dataset/upload`, form);
      setMessage(res.data.message || "Uploaded!");

    } catch (err) {
      console.error(err);
      setMessage("Upload failed — check backend.");
    }

    setUploading(false);
  };

  return (
    <div className="bg-white/10 border border-white/20 p-6 rounded-3xl backdrop-blur-xl shadow-xl w-full max-w-3xl mt-10">
      <h2 className="text-xl font-bold text-teal-300 mb-4">
        📤 Upload Setup to Dataset
      </h2>

      {/* Label Choice */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            value="valid"
            checked={label === "valid"}
            onChange={() => setLabel("valid")}
          />
          Valid Setup
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            value="invalid"
            checked={label === "invalid"}
            onChange={() => setLabel("invalid")}
          />
          Invalid Setup
        </label>
      </div>

      {/* Upload Input */}
      <input type="file" accept="image/*" onChange={handleFile} />

      {/* Preview */}
      {preview && (
        <img
          src={preview}
          className="mt-3 rounded-xl border border-white/20 max-h-56 object-contain"
        />
      )}

      {/* Upload Button */}
      <button
        onClick={upload}
        disabled={uploading}
        className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-xl shadow-lg"
      >
        {uploading ? "Uploading…" : "Upload to Dataset"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-teal-300">{message}</p>
      )}
    </div>
  );
}
