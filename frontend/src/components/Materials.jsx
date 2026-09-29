import React, { useState } from "react";
import { CheckCircle2, Download, ExternalLink, FileText, Upload, X } from "lucide-react";
import { API_URL, api } from "../api";

export function Materials({ course, year, semester, subject, unit, resources, loading, onUploaded }) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile && !externalUrl.trim()) {
      setUploadError("Please provide a PDF file or an external reference URL.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess("");

      if (uploadFile) {
        if (!uploadFile.name.toLowerCase().endsWith(".pdf")) {
          setUploadError("Only PDF files are allowed.");
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("resourceType", "reference");
        formData.append("year", String(year.year));
        formData.append("course", course.code);
        formData.append("semester", String(semester.semester));
        formData.append("subjectId", String(subject.id));
        formData.append("unitId", String(unit.id));
        formData.append(
          "title",
          uploadTitle.trim() || `${subject.code} - ${unit.name} Reference Material`
        );
        formData.append("file", uploadFile);

        await api.uploadResource(formData);
      }

      setUploadSuccess("Reference material added successfully!");
      setUploadFile(null);
      setUploadTitle("");
      setExternalUrl("");
      setShowUpload(false);

      if (onUploaded) onUploaded();
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="materials-panel">
      <div className="materials-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="eyebrow">Available materials</div>
          <h2>
            {subject.code} — {subject.name}
          </h2>
          <p>
            {course.code} • {year.name} • {semester.name} • {unit.name}
          </p>
        </div>

        <button
          className="primary-action"
          type="button"
          onClick={() => setShowUpload((prev) => !prev)}
          style={{ cursor: "pointer" }}
        >
          <Upload size={17} />
          {showUpload ? "Close" : "Upload Reference PDF"}
        </button>
      </div>

      {uploadSuccess && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            padding: "8px 14px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 8,
            color: "#065f46",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} />
          {uploadSuccess}
        </div>
      )}

      {showUpload && (
        <form onSubmit={handleUploadSubmit} className="inline-upload-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f513f", display: "flex", alignItems: "center", gap: 8 }}>
              <Upload size={18} />
              Add Reference Material for {subject.code} ({unit.name})
            </div>
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              style={{ border: 0, background: "transparent", cursor: "pointer", color: "#64748b" }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Material Title</span>
              <input
                type="text"
                placeholder={`${subject.code} - ${unit.name} Reference Material`}
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 16,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Select Reference PDF</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  background: "#f8fafc",
                }}
              />
            </label>

            {uploadError && <div className="api-error">{uploadError}</div>}

            <div className="inline-upload-actions">
              <button
                className="primary-action"
                type="submit"
                disabled={uploading}
                style={{ cursor: "pointer" }}
              >
                <Upload size={17} />
                {uploading ? "Uploading..." : "Save Material"}
              </button>

              <button
                className="secondary-action"
                type="button"
                onClick={() => setShowUpload(false)}
                style={{ cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {!loading && !resources.length && !showUpload && (
        <div className="empty-state">
          No reference material has been added for this unit yet. Click "Upload Reference PDF" above to add one.
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

              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
