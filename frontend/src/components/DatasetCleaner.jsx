import React, { useState } from "react";
import axios from "axios";

export default function DatasetCleaner() {
  const BACKEND = "http://127.0.0.1:5000";
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(null);

  const scan = async () => {
    const res = await axios.post(`${BACKEND}/api/cleaner/scan`);
    setItems(res.data.items);
    setCount(res.data.count);
  };

  return (
    <div className="mt-10 max-w-3xl w-full">
      <h2 className="text-teal-300 font-bold mb-3">Dataset Cleaner</h2>

      <button
        onClick={scan}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg"
      >
        Scan Dataset
      </button>

      {count !== null && (
        <p className="mt-3 text-white/70">{count} images found.</p>
      )}
    </div>
  );
}
