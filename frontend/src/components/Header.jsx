import React from "react";
import { GraduationCap, LogIn, LogOut, Menu, UserPlus, X } from "lucide-react";
import { Show, useClerk, useUser } from "@clerk/react";

function UserNav({ go }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const name = user?.firstName || user?.username || "Account";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        className="secondary-action"
        type="button"
        onClick={() => go("account")}
        style={{ minHeight: 36, padding: "0 13px", fontSize: 13, cursor: "pointer" }}
      >
        {name}
      </button>
      <button
        className="secondary-action"
        type="button"
        onClick={() => signOut(() => go("home"))}
        style={{
          minHeight: 36,
          padding: "0 13px",
          fontSize: 13,
          cursor: "pointer",
          color: "#b42318",
          borderColor: "#fecdd3",
          background: "#fff5f5",
        }}
      >
        <LogOut size={14} />
        <span>Sign Out</span>
      </button>
    </div>
  );
}

export function Header({ page, menu, setMenu, go }) {
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
        <div className="mobile-auth-links" style={{ display: "none" }}>
          <Show when="signed-in">
            <button className="nav-link" onClick={() => go("account")} type="button">
              My Account
            </button>
          </Show>
          <Show when="signed-out">
            <button className="nav-link" onClick={() => go("login")} type="button">
              Sign In
            </button>
            <button className="nav-link" onClick={() => go("register")} type="button">
              Register
            </button>
          </Show>
        </div>
      </nav>

      {/* Desktop auth area */}
      <Show when="signed-in">
        <UserNav go={go} />
      </Show>
      <Show when="signed-out">
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
      </Show>

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
