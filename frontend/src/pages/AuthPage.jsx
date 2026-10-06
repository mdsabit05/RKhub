import React from "react";
import { ArrowLeft, BookOpen, FileCheck, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { SignIn, SignUp, UserProfile, SignedIn, SignedOut } from "@clerk/clerk-react";

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
    rootBox: { width: "100%", maxWidth: 440 },
    card: {
      boxShadow: "0 10px 30px rgba(16, 24, 40, 0.08)",
      border: "1px solid #e2e8f0",
      borderRadius: "18px",
      padding: "28px 24px",
    },
    headerTitle: { fontSize: "22px", fontWeight: 800, color: "#111827" },
    headerSubtitle: { fontSize: "13.5px", color: "#64748b" },
    formButtonPrimary: {
      backgroundColor: "#0f766e",
      fontWeight: 650,
      fontSize: "14px",
      padding: "10px 16px",
    },
    // Hide Clerk's built-in footer — we render our own cross-nav links
    footer: { display: "none" },
  },
};

export function AuthPage({ mode = "login", go }) {
  return (
    <main style={{ maxWidth: 1040, margin: "20px auto 60px", padding: "0 16px" }}>
      <button className="back-link" onClick={() => go("home")} type="button">
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div className="auth-split-layout">
        {/* Left: branding & feature list */}
        <div className="auth-showcase">
          <div className="brand" style={{ marginBottom: 20 }}>
            <div className="brand-mark">
              <GraduationCap size={28} />
            </div>
            <div>
              <div className="brand-name">RKhub</div>
              <div className="brand-subtitle">Rajkumar College of IT and Management</div>
            </div>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#111827" }}>
            {mode === "login"
              ? "Welcome back to your academic workspace"
              : mode === "account"
              ? "Your student account"
              : "Create your student account"}
          </h2>

          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.5, margin: "0 0 28px" }}>
            Access verified notes, previous year exam papers, curriculum syllabi, and AI-powered study assistance.
          </p>

          <div style={{ display: "grid", gap: 16 }}>
            {[
              {
                icon: <BookOpen size={18} />,
                bg: "#edf5ef",
                color: "#0f513f",
                title: "Curriculum-Aligned Notes",
                desc: "Official semester notes categorized by year, course, and unit.",
              },
              {
                icon: <FileCheck size={18} />,
                bg: "#fff0df",
                color: "#b54708",
                title: "University PYQs & Papers",
                desc: "Browse previous years' question papers to prepare for exams.",
              },
              {
                icon: <Sparkles size={18} />,
                bg: "#f0e9ff",
                color: "#6d28d9",
                title: "AI Exam Prediction",
                desc: "Predict high-probability questions and get instant explanations.",
              },
            ].map(({ icon, bg, color, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: bg,
                    color,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <strong style={{ fontSize: 14, color: "#111827", display: "block" }}>{title}</strong>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{desc}</span>
                </div>
              </div>
            ))}
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

        {/* Right: Clerk embedded component */}
        <div className="auth-form-wrapper">
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {mode === "account" ? (
              <>
                <SignedIn>
                  <UserProfile appearance={clerkAppearance} />
                </SignedIn>
                <SignedOut>
                  <p style={{ fontSize: 14, color: "#64748b" }}>
                    You are not signed in.{" "}
                    <button
                      onClick={() => go("login")}
                      type="button"
                      style={{ color: "#0f766e", fontWeight: 700, background: "none", border: 0, cursor: "pointer", fontSize: 14 }}
                    >
                      Sign In
                    </button>
                  </p>
                </SignedOut>
              </>
            ) : mode === "login" ? (
              <>
                <SignIn routing="hash" signUpUrl="/" fallbackRedirectUrl="/" appearance={clerkAppearance} />
                <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                  Don't have an account?{" "}
                  <button
                    onClick={() => go("register")}
                    type="button"
                    style={{ color: "#0f766e", fontWeight: 700, background: "none", border: 0, cursor: "pointer", fontSize: 13.5 }}
                  >
                    Register
                  </button>
                </p>
              </>
            ) : (
              <>
                <SignUp routing="hash" signInUrl="/" fallbackRedirectUrl="/" appearance={clerkAppearance} />
                <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                  Already have an account?{" "}
                  <button
                    onClick={() => go("login")}
                    type="button"
                    style={{ color: "#0f766e", fontWeight: 700, background: "none", border: 0, cursor: "pointer", fontSize: 13.5 }}
                  >
                    Sign In
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
