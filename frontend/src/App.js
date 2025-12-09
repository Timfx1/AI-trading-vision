// src/App.js

import React from "react";
import MainApp from "./MainApp";

import { LanguageProvider } from "./lang/LanguageContext";
import { AuthProvider } from "./auth/AuthContext";
import { AccentProvider } from "./context/AccentContext";

import GoogleOneTap from "./auth/GoogleOneTap";

export default function App() {
  return (
    <LanguageProvider>
      <AccentProvider>
        <AuthProvider>

          {/* Google One Tap system always mounted globally */}
          <GoogleOneTap />

          <MainApp />

        </AuthProvider>
      </AccentProvider>
    </LanguageProvider>
  );
}
