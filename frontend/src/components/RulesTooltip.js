import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

const rules = `
● Only A setups (trend-following)
● No trades in zones — only at levels
● Break & retest only
● Max 2 trades/day
● No emotional trades
● Let trades run to TP or SL
● Double risk only on A setups
● Accept losses if plan was followed
● Closing losing trade? Reverse allowed
`;

export default function RulesTooltip() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <FaInfoCircle
        className="text-teal-400 text-2xl cursor-pointer"
        onClick={() => setShow(!show)}
      />

      {show && (
        <div className="absolute right-0 mt-2 w-72 p-4 bg-black/80 border border-white/20 rounded-xl text-sm text-white shadow-xl z-50 backdrop-blur-md">
          <h3 className="font-bold text-teal-300 mb-2">Trading Rules</h3>
          <pre className="whitespace-pre-wrap text-xs opacity-80">{rules}</pre>
        </div>
      )}
    </div>
  );
}
