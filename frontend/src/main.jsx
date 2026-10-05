import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./App";
import "./styles.css";

const ENV_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const LS_KEY = (() => {
  try { return localStorage.getItem("rkhub_clerk_pub_key") || ""; } catch { return ""; }
})();

const clerkPubKey = ENV_KEY || LS_KEY;
const hasClerkKey = Boolean(clerkPubKey);

const rootElement = document.getElementById("root");

if (hasClerkKey) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={clerkPubKey}
        afterSignInUrl="/"
        afterSignUpUrl="/"
        afterSignOutUrl="/"
      >
        <App hasClerkKey={true} />
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App hasClerkKey={false} />
    </React.StrictMode>
  );
}
