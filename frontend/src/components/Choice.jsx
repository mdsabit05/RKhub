import React from "react";
import { ChevronRight } from "lucide-react";

export function Choice({
  items,
  select,
  labelKey,
  secondaryKey,
  icon: Icon = ChevronRight,
  empty,
  loading,
}) {
  if (loading) {
    return (
      <div className="choice-loading">
        {[1, 2, 3].map((n) => (
          <div key={n} className="choice-skeleton" />
        ))}
      </div>
    );
  }
  if (!items?.length) return <div className="empty-state">{empty}</div>;

  return (
    <div className="choice-grid">
      {items.map((item) => (
        <button
          className="choice-card"
          key={item.id ?? item.code ?? item.name}
          onClick={() => select(item)}
          type="button"
        >
          <div className="choice-content">
            {secondaryKey && (
              <span className="choice-code">
                {item[secondaryKey]}
              </span>
            )}
            <span>{item[labelKey]}</span>
          </div>
          <Icon size={19} />
        </button>
      ))}
    </div>
  );
}
