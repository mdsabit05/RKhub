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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const targetOrigin = window.location.origin;
      await signIn.social({
        provider: "google",
        callbackURL: `${targetOrigin}/`,
        errorCallbackURL: `${targetOrigin}/`,
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err?.message || "Failed to start Google sign-in.");
      setLoading(false);
    }
  };

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
        console.error("Sign-in error:", result.error);
        setError(result.error.message || result.error.statusText || "Sign in failed. Check your email and password.");
      } else {
        if (result.data?.token) {
          localStorage.setItem("rkhub_auth_token", result.data.token);
        }
        if (result.data?.user) {
          localStorage.setItem("rkhub_user", JSON.stringify(result.data.user));
        }
        setSuccess("Signed in successfully!");
        setTimeout(() => go("home"), 200);
      }
    } catch (err) {
      console.error("Sign-in exception:", err);
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
        console.error("Registration error:", result.error);
        setError(result.error.message || result.error.statusText || "Registration failed. Please try again.");
      } else {
        if (result.data?.token) {
          localStorage.setItem("rkhub_auth_token", result.data.token);
        }
        if (result.data?.user) {
          localStorage.setItem("rkhub_user", JSON.stringify(result.data.user));
        }
        setSuccess("Account created successfully!");
        setTimeout(() => go("home"), 200);
      }
    } catch (err) {
      console.error("Registration exception:", err);
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("rkhub_auth_token");
      localStorage.removeItem("rkhub_user");
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

                <div
                  style={{
                    background: "#f0fdfa",
                    border: "1px solid #99f6e4",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "#0f766e",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#115e59" }}>
                        Admin Portal
                      </div>
                      <div style={{ fontSize: 12, color: "#0d9488" }}>
                        Manage & delete all uploaded PDFs
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => go("admin")}
                    className="primary-action"
                    style={{
                      minHeight: 36,
                      padding: "0 14px",
                      fontSize: 13,
                      fontWeight: 650,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Enter Admin
                  </button>
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

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1e293b",
                    cursor: loading ? "wait" : "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    marginBottom: 16,
                  }}
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", marginBottom: 18, color: "#94a3b8" }}>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                  <span style={{ padding: "0 10px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    or continue with email
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>

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

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1e293b",
                    cursor: loading ? "wait" : "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    marginBottom: 16,
                  }}
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", marginBottom: 18, color: "#94a3b8" }}>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                  <span style={{ padding: "0 10px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    or register with email
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>

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
