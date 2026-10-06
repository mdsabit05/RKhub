import React from "react";
import { ArrowLeft, GraduationCap } from "lucide-react";

export function AuthPage({ mode = "login", go }) {
  return (
    <main style={{ maxWidth: 480, margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
      <button className="back-link" onClick={() => go("home")} type="button">
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div className="brand-mark" style={{ width: 56, height: 56 }}>
            <GraduationCap size={32} />
          </div>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>
          {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "My Account"}
        </h2>

        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.6, margin: "0 0 28px" }}>
          Authentication is being set up. Please check back soon.
        </p>

        <div
          style={{
            padding: "20px 24px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            color: "#166534",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          A new authentication system is coming. Resources are still fully accessible in the meantime.
        </div>
      </div>
    </main>
  );
}
