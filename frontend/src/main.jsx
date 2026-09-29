import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./App";
import "./styles.css";

const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  localStorage.getItem("rkhub_clerk_pub_key") ||
  "";

const rootElement = document.getElementById("root");

if (clerkPubKey) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={clerkPubKey}>
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
