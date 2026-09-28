import React from "react";
import { ArrowRight } from "lucide-react";

export function SubjectList({ subjects, select }) {
  if (!subjects?.length) {
    return (
      <div className="empty-state">
        No subjects configured for this selection yet.
      </div>
    );
  }

  return (
    <div className="subject-list-single">
      {subjects.map((subject) => (
        <button
          className="subject-card"
          key={subject.id}
          onClick={() => select(subject)}
          type="button"
        >
          <div className="subject-code">{subject.code}</div>
          <div className="subject-title">{subject.name}</div>
          <ArrowRight size={18} />
        </button>
      ))}
    </div>
  );
}
