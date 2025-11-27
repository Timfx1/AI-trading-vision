import React from "react";
import { FaBell } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="glass flex justify-between items-center px-6 py-3 m-4">
      <h1 className="text-3xl italic font-bold text-cyan-400 drop-shadow-[0_0_8px_#00ffff]">
        Timfx1
      </h1>
      <FaBell className="text-cyan-300 text-2xl hover:text-cyan-400 transition-all" />
    </nav>
  );
}
