import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { signIn, signUp, signOut, useSession } from "../lib/auth-client";

export function AuthPage({ mode = "login", go }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const currentUser = session?.user;

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message || "Sign in failed. Check your email and password.");
      } else {
        setSuccess("Signed in successfully!");
        setTimeout(() => go("home"), 300);
      }
    } catch (err) {
      setError(err?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your college or personal email.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed. Please try again.");
      } else {
        setSuccess("Account created successfully!");
        setTimeout(() => go("home"), 300);
      }
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      go("home");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
            <span>Secured with Better Auth • Direct Database Session Authentication</span>
          </div>
        </div>

        {/* Right: Authentication Form Card */}
        <div className="auth-form-wrapper">
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 20,
              boxShadow: "0 10px 30px rgba(16, 24, 40, 0.08)",
              padding: "32px 28px",
            }}
          >
            {/* Account Profile View */}
            {mode === "account" ? (
              <div>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "#edf5ef",
                      color: "#0f766e",
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <User size={32} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>
                    {currentUser?.name || "Student"}
                  </h3>
                  <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>{currentUser?.email || "Signed In"}</p>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                    display: "grid",
                    gap: 10,
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Status</span>
                    <strong style={{ color: "#0f766e" }}>Active Student</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Account ID</span>
                    <span style={{ fontFamily: "monospace", color: "#334155" }}>
                      {currentUser?.id ? `${currentUser.id.substring(0, 12)}...` : "—"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={loading}
                    className="secondary-action"
                    style={{
                      width: "100%",
                      minHeight: 42,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      color: "#b42318",
                      borderColor: "#fecdd3",
                      background: "#fff5f5",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <LogOut size={16} />
                    <span>{loading ? "Signing out..." : "Sign Out"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => go("home")}
                    className="primary-action"
                    style={{
                      width: "100%",
                      minHeight: 42,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Back to Study Hub
                  </button>
                </div>
              </div>
            ) : mode === "login" ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn}>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#111827" }}>
                    Sign In
                  </h3>
                  <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                    Enter your email and password to access your account.
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      background: "#fff5f5",
                      border: "1px solid #fecdd3",
                      color: "#b42318",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      marginBottom: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      color: "#166534",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{success}</span>
                  </div>
                )}

                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label
                      htmlFor="signin-email"
                      style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}
                    >
                      Email Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="signin-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@rkhub.ac.in"
                        style={{
                          width: "100%",
                          height: 44,
                          padding: "0 14px 0 38px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          fontSize: 14,
                          color: "#1e293b",
                          background: "#f8fafc",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <Mail
                        size={16}
                        style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signin-password"
                      style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}
                    >
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="signin-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          height: 44,
                          padding: "0 14px 0 38px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          fontSize: 14,
                          color: "#1e293b",
                          background: "#f8fafc",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <Lock
                        size={16}
                        style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-action"
                    style={{
                      width: "100%",
                      height: 44,
                      marginTop: 8,
                      fontSize: 14,
                      fontWeight: 650,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: loading ? "wait" : "pointer",
                    }}
                  >
                    <LogIn size={16} />
                    <span>{loading ? "Signing in..." : "Sign In"}</span>
                  </button>
                </div>

                <div style={{ textAlign: "center", marginTop: 22 }}>
                  <span style={{ fontSize: 13.5, color: "#64748b" }}>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        go("register");
                      }}
                      style={{
                        background: "none",
                        border: 0,
                        color: "#0f766e",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 13.5,
                        padding: 0,
                      }}
                    >
                      Register
                    </button>
                  </span>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleSignUp}>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#111827" }}>
                    Create Account
                  </h3>
                  <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                    Join RKhub to access and share academic resources.
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      background: "#fff5f5",
                      border: "1px solid #fecdd3",
                      color: "#b42318",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      marginBottom: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      color: "#166534",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{success}</span>
                  </div>
                )}

                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <label
                      htmlFor="signup-name"
                      style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}
                    >
                      Full Name
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="signup-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sabit Raza"
                        style={{
                          width: "100%",
                          height: 44,
                          padding: "0 14px 0 38px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          fontSize: 14,
                          color: "#1e293b",
                          background: "#f8fafc",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <User
                        size={16}
                        style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}
                    >
                      Email Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="signup-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sabit@college.edu"
                        style={{
                          width: "100%",
                          height: 44,
                          padding: "0 14px 0 38px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          fontSize: 14,
                          color: "#1e293b",
                          background: "#f8fafc",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <Mail
                        size={16}
                        style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}
                    >
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="signup-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        style={{
                          width: "100%",
                          height: 44,
                          padding: "0 14px 0 38px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          fontSize: 14,
                          color: "#1e293b",
                          background: "#f8fafc",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <Lock
                        size={16}
                        style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirmpassword"
                      style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}
                    >
                      Confirm Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="signup-confirmpassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        style={{
                          width: "100%",
                          height: 44,
                          padding: "0 14px 0 38px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          fontSize: 14,
                          color: "#1e293b",
                          background: "#f8fafc",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <KeyRound
                        size={16}
                        style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-action"
                    style={{
                      width: "100%",
                      height: 44,
                      marginTop: 8,
                      fontSize: 14,
                      fontWeight: 650,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: loading ? "wait" : "pointer",
                    }}
                  >
                    <UserPlus size={16} />
                    <span>{loading ? "Creating account..." : "Create Account"}</span>
                  </button>
                </div>

                <div style={{ textAlign: "center", marginTop: 22 }}>
                  <span style={{ fontSize: 13.5, color: "#64748b" }}>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        go("login");
                      }}
                      style={{
                        background: "none",
                        border: 0,
                        color: "#0f766e",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 13.5,
                        padding: 0,
                      }}
                    >
                      Sign In
                    </button>
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthPage;
