import React from "react";
import { GraduationCap, LogIn, LogOut, Menu, UserPlus, X } from "lucide-react";
import { useSession, signOut } from "../lib/auth-client";

function UserNav({ user, go }) {

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("rkhub_auth_token");
      localStorage.removeItem("rkhub_user");
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    go("home");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        className="secondary-action"
        type="button"
        onClick={handleSignOut}
        style={{
          minHeight: 36,
          padding: "0 13px",
          fontSize: 13,
          cursor: "pointer",
          color: "#b42318",
          borderColor: "#fecdd3",
          background: "#fff5f5",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <LogOut size={14} />
        <span>Sign Out</span>
      </button>
    </div>
  );
}

export function Header({ page, menu, setMenu, go }) {
  const { data: session } = useSession();
  const cachedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("rkhub_user") || "null");
    } catch {
      return null;
    }
  })();
  const user = session?.user || cachedUser;

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("rkhub_auth_token");
      localStorage.removeItem("rkhub_user");
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    setMenu(false);
    go("home");
  };

  return (
    <header className="header">
      <button className="brand brand-button" onClick={() => go("home")} type="button">
        <div className="brand-mark">
          <GraduationCap size={27} />
        </div>
        <div>
          <div className="brand-name">RKhub</div>
          <div className="brand-subtitle">Rajkumar College of IT and Management</div>
        </div>
      </button>

      <nav className={`nav ${menu ? "nav-open" : ""}`}>
        <button
          className={`nav-link ${page === "home" ? "active" : ""}`}
          onClick={() => go("home")}
          type="button"
        >
          Home
        </button>
        <button
          className={`nav-link ${
            page !== "home" && page !== "admin" && page !== "login" && page !== "register" && page !== "account"
              ? "active"
              : ""
          }`}
          onClick={() => go("notes")}
          type="button"
        >
          Resources
        </button>
        <button
          className={`nav-link ${page === "admin" ? "active" : ""}`}
          onClick={() => go("admin")}
          type="button"
        >
          Admin
        </button>

        {/* Mobile auth links inside drawer */}
        <div className="mobile-auth-links">
          {user ? (
            <>
              <button className="nav-link" onClick={() => go("account")} type="button">
                My Account ({user.name || user.email})
              </button>
              <button className="nav-link" onClick={handleSignOut} type="button" style={{ color: "#b42318" }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => go("login")} type="button">
                Sign In
              </button>
              <button className="nav-link" onClick={() => go("register")} type="button">
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Desktop auth area */}
      <div className="desktop-auth-area">
        {user ? (
          <UserNav user={user} go={go} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="secondary-action"
              type="button"
              onClick={() => go("login")}
              style={{ minHeight: 38, padding: "0 14px", fontSize: 13, cursor: "pointer" }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              className="primary-action"
              type="button"
              onClick={() => go("register")}
              style={{ minHeight: 38, padding: "0 16px", minWidth: 0, fontSize: 13, cursor: "pointer" }}
            >
              <UserPlus size={15} />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>

      <button
        className="menu-button"
        onClick={() => setMenu((v) => !v)}
        type="button"
        aria-label="Toggle menu"
      >
        {menu ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
}
