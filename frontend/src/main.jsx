import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./App";
import "./styles.css";

const ENV_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const LS_KEY = (() => {
  try { return localStorage.getItem("rkhub_clerk_pub_key") || ""; } catch { return ""; }
})();
// Hardcoded fallback — publishable key is safe to embed in client code
const FALLBACK_KEY = "pk_test_ZWxlZ2FudC1tYWNhdy05Mzg0LmNsZXJrLmFjY291bnRzLmRldiQ";

const clerkPubKey = ENV_KEY || LS_KEY || FALLBACK_KEY;

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App hasClerkKey={true} />
    </ClerkProvider>
  </React.StrictMode>
);
