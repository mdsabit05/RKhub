import React from "react";
import { GraduationCap, Menu, X } from "lucide-react";

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
          className={`nav-link ${page !== "home" && page !== "admin" ? "active" : ""}`}
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
      </nav>

      <div className="profile">
        <div className="profile-avatar">S</div>
        <span>Hello, Student</span>
        <span className="chevron">⌄</span>
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
