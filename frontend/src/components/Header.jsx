import React from "react";
import { GraduationCap, LogIn, Menu, UserPlus, X } from "lucide-react";

export function Header({ page, menu, setMenu, go }) {
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

        <div style={{ display: "none" }} className="mobile-auth-links">
          <button className="nav-link" onClick={() => go("login")} type="button">
            Sign In
          </button>
          <button className="nav-link" onClick={() => go("register")} type="button">
            Register
          </button>
        </div>
      </nav>

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
