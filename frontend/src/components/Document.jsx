import React, { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { API_URL, api } from "../api";

export function Document({ type, year, course, semester, subject, unit, onBack }) {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const filters = {
      year: year.year,
      course: course.code,
      semester: semester.semester,
      subjectCode: subject.code,
    };

    if (unit) filters.unitNo = unit.unitNo;

    api
      .resolve(type, filters)
      .then((data) => {
        if (active) setResource(data[0] ?? null);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [type, year, course, semester, subject, unit]);

  const rawUrl = resource?.fileUrl || resource?.externalUrl;
  const resourceUrl = rawUrl?.startsWith("/") ? `${API_URL}${rawUrl}` : rawUrl;

  return (
    <section className="document-panel">
      <div className="document-preview">
        <FileText size={48} />
        <span>PDF</span>
      </div>

      <div className="document-info">
        <div className="eyebrow">
          {type === "notes"
            ? "College Notes"
            : type === "pyq"
              ? "Previous Year Question Paper"
              : "College Syllabus"}
        </div>

        <h2>
          {subject.code} — {subject.name}
        </h2>

        <p>
          {course.code} • {year.name} • {semester.name}
          {unit ? ` • ${unit.name}` : ""}
        </p>

        {loading && <div className="loading-line">Finding the resource...</div>}
        {error && <div className="api-error">{error}</div>}
        {!loading && !error && !resource && (
          <div className="empty-state">
            No PDF has been uploaded for this selection yet.
          </div>
        )}

        {resource && (
          <div className="document-actions">
            <a
              className="primary-action"
              href={resourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={17} />
              Open PDF
            </a>

            <a
              className="secondary-action"
              href={resourceUrl}
              target="_blank"
              rel="noreferrer"
              download
            >
              <Download size={17} />
              Download
            </a>
          </div>
        )}

        <small>
          Resource is loaded from the RKhub PostgreSQL-backed API.
        </small>
      </div>

      <button className="inline-back" onClick={onBack} type="button">
        Choose another {type === "syllabus" ? "subject" : "unit"}
      </button>
    </section>
  );
}
