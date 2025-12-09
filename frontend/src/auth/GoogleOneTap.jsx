import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";

export default function GoogleOneTap() {
  const { login } = useAuth();

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // Load script FIRST
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => login(res.credential),
      });
      window.google.accounts.id.prompt();
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
