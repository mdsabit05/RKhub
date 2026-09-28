import React from "react";

export function Selection({ title, sub, children }) {
  return (
    <section className="selection-section">
      <div className="selection-heading">
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {children}
    </section>
  );
}
