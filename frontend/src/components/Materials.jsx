import React from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { API_URL } from "../api";

export function Materials({ course, year, semester, subject, unit, resources, loading }) {
  return (
    <section className="materials-panel">
      <div className="materials-heading">
        <div className="eyebrow">Available materials</div>
        <h2>
          {subject.code} — {subject.name}
        </h2>
        <p>
          {course.code} • {year.name} • {semester.name} • {unit.name}
        </p>
      </div>

      {!loading && !resources.length && (
        <div className="empty-state">
          No reference material has been added for this unit yet.
        </div>
      )}

      <div className="material-list">
        {resources.map((resource) => {
          const rawUrl = resource.fileUrl || resource.externalUrl;
          const url = rawUrl?.startsWith("/") ? `${API_URL}${rawUrl}` : rawUrl;
          const isExternal = !resource.fileUrl && Boolean(resource.externalUrl);

          return (
            <div className="material-row" key={resource.id}>
              <div className="material-file">
                {isExternal ? <ExternalLink size={22} /> : <FileText size={22} />}
              </div>

              <div className="material-main">
                <strong>{resource.title}</strong>
                <span>{resource.description || (isExternal ? "External link" : "PDF")}</span>
              </div>

              <a
                className="secondary-action"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                {isExternal ? <ExternalLink size={16} /> : <Download size={16} />}
                {isExternal ? "Open Link" : "Open PDF"}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
