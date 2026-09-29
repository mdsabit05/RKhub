import React, { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { ArrowLeft, CheckCircle2, GraduationCap, Key, Lock, Sparkles } from "lucide-react";

export function AuthPage({ mode = "login", go, hasClerkKey }) {
  const [keyInput, setKeyInput] = useState("");
  const [savedKey, setSavedKey] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    localStorage.setItem("rkhub_clerk_pub_key", keyInput.trim());
    setSavedKey(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <main style={{ maxWidth: 520, margin: "24px auto 60px", padding: "0 16px" }}>
      <button className="back-link" onClick={() => go("home")} type="button">
        <ArrowLeft size={16} />
        Back to Home
      </button>

      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: 24, marginTop: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "#edf5ef",
            display: "inline-grid",
            placeItems: "center",
            color: "#0f513f",
            marginBottom: 10,
          }}
        >
          <GraduationCap size={28} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#111827" }}>
          {mode === "login" ? "Welcome Back to RKhub" : "Join RKhub College Portal"}
        </h1>
        <p style={{ color: "#667085", fontSize: 14, margin: 0 }}>
          {mode === "login"
            ? "Sign in to access your notes, PYQs, and academic tools"
            : "Create an account to save syllabus materials and track exams"}
        </p>

        {/* Toggle Login / Register */}
        <div
          style={{
            display: "inline-flex",
            background: "#f1f5f9",
            padding: 4,
            borderRadius: 12,
            marginTop: 18,
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => go("login")}
            style={{
              padding: "7px 22px",
              borderRadius: 9,
              border: 0,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: mode === "login" ? "#ffffff" : "transparent",
              color: mode === "login" ? "#0f513f" : "#64748b",
              boxShadow: mode === "login" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => go("register")}
            style={{
              padding: "7px 22px",
              borderRadius: 9,
              border: 0,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: mode === "register" ? "#ffffff" : "transparent",
              color: mode === "register" ? "#0f513f" : "#64748b",
              boxShadow: mode === "register" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Register
          </button>
        </div>
      </div>

      {/* Render Clerk Component if configured */}
      {hasClerkKey ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {mode === "login" ? (
            <SignIn
              routing="hash"
              appearance={{
                elements: {
                  rootBox: { width: "100%" },
                  card: { boxShadow: "0 8px 30px rgba(0,0,0,0.08)", borderRadius: 16 },
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={{
                elements: {
                  rootBox: { width: "100%" },
                  card: { boxShadow: "0 8px 30px rgba(0,0,0,0.08)", borderRadius: 16 },
                },
              }}
            />
          )}
        </div>
      ) : (
        /* Setup / Key Prompt Card if VITE_CLERK_PUBLISHABLE_KEY is not yet added */
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 8px 24px rgba(16, 24, 40, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: 15,
              color: "#0f513f",
              marginBottom: 8,
            }}
          >
            <Key size={18} />
            Connect Your Clerk Authentication Key
          </div>
          <p style={{ color: "#475467", fontSize: 13.5, lineHeight: 1.5, margin: "0 0 16px" }}>
            Clerk powers authentication with Google, GitHub, and Email/Password.
            To activate sign-in on RKhub, obtain your free key from{" "}
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0f766e", fontWeight: 600 }}
            >
              dashboard.clerk.com
            </a>{" "}
            and paste it below:
          </p>

          <form onSubmit={handleSaveKey} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                Clerk Publishable Key (pk_test_...)
              </span>
              <input
                type="text"
                placeholder="pk_test_..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </label>

            {savedKey && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#166534",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} />
                Key saved! Reloading application...
              </div>
            )}

            <button
              className="primary-action"
              type="submit"
              style={{ width: "100%", marginTop: 4, cursor: "pointer" }}
            >
              <Sparkles size={16} />
              Enable Clerk Authentication
            </button>
          </form>

          <div
            style={{
              marginTop: 18,
              padding: 12,
              background: "#f8fafc",
              borderRadius: 10,
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.5,
            }}
          >
            <strong>Or configure in `.env`:</strong>
            <pre style={{ margin: "6px 0 0", padding: "6px 8px", background: "#f1f5f9", borderRadius: 6, overflowX: "auto" }}>
              VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
