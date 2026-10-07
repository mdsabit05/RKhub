import { createAuthClient } from "better-auth/react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8787").replace(/\/$/, "");

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("rkhub_auth_token") || "",
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response?.headers?.get("set-auth-token");
      if (authToken) {
        localStorage.setItem("rkhub_auth_token", authToken);
      }
    },
  },
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  getSession,
} = authClient;
