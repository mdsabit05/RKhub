import React, { useState } from "react";
import { SignIn, SignUp, UserProfile, SignedIn, SignedOut } from "@clerk/clerk-react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Key,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

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

  const clerkAppearance = {
    variables: {
      colorPrimary: "#0f766e",
      colorTextOnPrimaryBackground: "#ffffff",
      colorText: "#111827",
      colorTextSecondary: "#64748b",
      colorBackground: "#ffffff",
      colorInputBackground: "#f8fafc",
      colorInputBorder: "#cbd5e1",
      borderRadius: "12px",
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
    },
    elements: {
      rootBox: {
        width: "100%",
        maxWidth: 440,
      },
      card: {
        boxShadow: "0 10px 30px rgba(16, 24, 40, 0.08)",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "28px 24px",
      },
      headerTitle: {
        fontSize: "22px",
        fontWeight: 800,
        color: "#111827",
      },
      headerSubtitle: {
        fontSize: "13.5px",
        color: "#64748b",
      },
      formButtonPrimary: {
        backgroundColor: "#0f766e",
        fontWeight: 650,
        fontSize: "14px",
        padding: "10px 16px",
        "&:hover": {
          backgroundColor: "#0d655f",
        },
      },
      // Hide Clerk's built-in cross-nav footer — we use our own below
      footer: { display: "none" },
    },
  };

  return (
    <main style={{ maxWidth: 1040, margin: "20px auto 60px", padding: "0 16px" }}>
      <button className="back-link" onClick={() => go("home")} type="button">
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div className="auth-split-layout">
        {/* Left Column: College Showcase & Benefits */}
        <div className="auth-showcase">
          <div className="brand" style={{ marginBottom: 20 }}>
            <div className="brand-mark">
              <GraduationCap size={28} />
            </div>
            <div>
              <div className="brand-name">RKhub</div>
              <div className="brand-subtitle">
                Rajkumar College of IT and Management
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#111827" }}>
            {mode === "login"
              ? "Welcome back to your academic workspace"
              : mode === "account"
              ? "Your student account"
              : "Create your student account to get started"}
          </h2>

          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.5, margin: "0 0 28px" }}>
            Access verified notes, previous year exam papers, curriculum syllabi, and AI-powered study assistance in one place.
          </p>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#edf5ef",
                  color: "#0f513f",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <BookOpen size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "#111827", display: "block" }}>
                  Curriculum-Aligned Notes
                </strong>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Official semester notes categorized by year, course, and unit.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#fff0df",
                  color: "#b54708",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <FileCheck size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "#111827", display: "block" }}>
                  University PYQs & Papers
                </strong>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Browse previous years' question papers to prepare for university exams.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#f0e9ff",
                  color: "#6d28d9",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "#111827", display: "block" }}>
                  AI Exam Prediction
                </strong>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Predict high-probability questions and get instant academic explanations.
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 32,
              padding: "12px 16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12.5,
              color: "#475467",
            }}
          >
            <ShieldCheck size={18} style={{ color: "#0f766e", flexShrink: 0 }} />
            <span>Secured with Clerk Authentication • Encrypted & Private</span>
          </div>
        </div>

        {/* Right Column: Embedded Clerk Component */}
        <div className="auth-form-wrapper">
          {hasClerkKey ? (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              {mode === "account" ? (
                <>
                  <SignedIn>
                    <UserProfile appearance={clerkAppearance} />
                  </SignedIn>
                  <SignedOut>
                    <div style={{ textAlign: "center", color: "#64748b", fontSize: 14 }}>
                      You are not signed in.{" "}
                      <button
                        onClick={() => go("login")}
                        type="button"
                        style={{ color: "#0f766e", fontWeight: 700, background: "none", border: 0, cursor: "pointer", fontSize: 14 }}
                      >
                        Sign In
                      </button>
                    </div>
                  </SignedOut>
                </>
              ) : mode === "login" ? (
                <>
                  <SignIn
                    routing="hash"
                    afterSignInUrl="/"
                    fallbackRedirectUrl="/"
                    appearance={clerkAppearance}
                  />
                  <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                    Don't have an account?{" "}
                    <button onClick={() => go("register")} type="button"
                      style={{ color: "#0f766e", fontWeight: 700, background: "none", border: 0, cursor: "pointer", fontSize: 13.5 }}>
                      Register
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <SignUp
                    routing="hash"
                    afterSignUpUrl="/"
                    afterSignInUrl="/"
                    fallbackRedirectUrl="/"
                    appearance={clerkAppearance}
                  />
                  <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                    Already have an account?{" "}
                    <button onClick={() => go("login")} type="button"
                      style={{ color: "#0f766e", fontWeight: 700, background: "none", border: 0, cursor: "pointer", fontSize: 13.5 }}>
                      Sign In
                    </button>
                  </p>
                </>
              )}
            </div>
          ) : (
            /* Setup Prompt if Key is Missing */
            <div
              style={{
                width: "100%",
                maxWidth: 440,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: 26,
                boxShadow: "0 10px 30px rgba(16, 24, 40, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#0f513f",
                  marginBottom: 8,
                }}
              >
                <Key size={18} />
                Connect Clerk Authentication
              </div>
              <p style={{ color: "#475467", fontSize: 13.5, lineHeight: 1.5, margin: "0 0 16px" }}>
                To activate login and registration, paste your Clerk Publishable Key from{" "}
                <a
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0f766e", fontWeight: 600 }}
                >
                  dashboard.clerk.com
                </a>:
              </p>

              <form onSubmit={handleSaveKey} style={{ display: "grid", gap: 12 }}>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: 14,
                    outline: "none",
                  }}
                />

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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
