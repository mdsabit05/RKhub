import React from "react";
import { GraduationCap, LogIn, Menu, UserPlus, X } from "lucide-react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";

function ClerkUserProfile() {
  const { user } = useUser();
  const displayName = user?.firstName || user?.username || "Student";

  return (
    <div className="profile">
      <UserButton afterSignOutUrl="/" />
      <span>Hello, {displayName}</span>
    </div>
  );
}

export function Header({ page, menu, setMenu, go, hasClerkKey }) {
  return (
    <header className="header">
      <button className="brand brand-button" onClick={() => go("home")} type="button">
        <div className="brand-mark">
          <GraduationCap size={27} />
        </div>
        <div>
          <div className="brand-name">RKhub</div>
          <div className="brand-subtitle">
            Rajkumar College of IT and Management
          </div>
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
          className={`nav-link ${page !== "home" && page !== "admin" && page !== "login" && page !== "register" ? "active" : ""}`}
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

        {/* Mobile auth buttons inside nav drawer */}
        <div style={{ display: "none" }} className="mobile-auth-links">
          {hasClerkKey ? (
            <>
              <SignedIn>
                <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <UserButton afterSignOutUrl="/" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Account Profile</span>
                </div>
              </SignedIn>
              <SignedOut>
                <button className="nav-link" onClick={() => go("login")} type="button">
                  Sign In
                </button>
                <button className="nav-link" onClick={() => go("register")} type="button">
                  Register
                </button>
              </SignedOut>
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

      {/* Desktop Profile / Auth buttons */}
      {hasClerkKey ? (
        <>
          <SignedIn>
            <ClerkUserProfile />
          </SignedIn>
          <SignedOut>
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
          </SignedOut>
        </>
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
