import React, { useEffect, useState } from "react";
import { CheckCircle2, Download, ExternalLink, FileText, Upload, X } from "lucide-react";
import { API_URL, api } from "../api";

export function Document({ type, year, course, semester, subject, unit, onBack }) {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload modal/drawer state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const fetchResource = () => {
    setLoading(true);
    setError("");

    const filters = {
      year: year.year,
      course: course.code,
      semester: semester.semester,
      subjectCode: subject.code,
    };

    if (unit) filters.unitNo = unit.unitNo;

    return api
      .resolve(type, filters)
      .then((data) => {
        setResource(data[0] ?? null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResource();
  }, [type, year, course, semester, subject, unit]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a PDF file to upload.");
      return;
    }

    if (!uploadFile.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess("");

      const formData = new FormData();
      formData.append("resourceType", type);
      formData.append("year", String(year.year));
      formData.append("course", course.code);
      formData.append("semester", String(semester.semester));
      formData.append("subjectId", String(subject.id));
      if (unit) formData.append("unitId", String(unit.id));
      formData.append(
        "title",
        uploadTitle.trim() || `${subject.code} - ${unit ? unit.name : "Syllabus"}`
      );
      formData.append("file", uploadFile);

      await api.uploadResource(formData);

      setUploadSuccess("PDF uploaded successfully!");
      setUploadFile(null);
      setUploadTitle("");
      setShowUpload(false);

      // Refresh resource immediately
      await fetchResource();
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const rawUrl = resource?.fileUrl || resource?.externalUrl;
  const resourceUrl = rawUrl?.startsWith("/") ? `${API_URL}${rawUrl}` : rawUrl;

  const defaultTitle = `${subject.code} - ${unit ? unit.name : "Syllabus"} ${
    type === "notes" ? "Notes" : type === "pyq" ? "PYQ" : "Syllabus"
  }`;

  return (
    <section className="document-panel">
      <div className="document-card-layout">
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
          {uploadSuccess && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 10,
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

          {!loading && !error && !resource && (
            <div
              className="empty-state"
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span>No PDF has been uploaded for this selection yet.</span>
              <button
                className="primary-action"
                onClick={() => setShowUpload(true)}
                type="button"
                style={{ cursor: "pointer" }}
              >
                <Upload size={17} />
                Upload PDF Now
              </button>
            </div>
          )}

          {resource && (
            <div className="document-actions" style={{ flexWrap: "wrap", gap: 10, marginTop: 16 }}>
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

              <button
                className="secondary-action"
                onClick={() => setShowUpload((prev) => !prev)}
                type="button"
                style={{ cursor: "pointer" }}
                title="Upload or update this resource PDF"
              >
                <Upload size={17} />
                {showUpload ? "Cancel Upload" : "Upload / Replace PDF"}
              </button>
            </div>
          )}

          <small style={{ display: "block", marginTop: 12 }}>
            Resource is loaded from the RKhub PostgreSQL-backed API.
          </small>
        </div>
      </div>

      {showUpload && (
        <form onSubmit={handleUploadSubmit} className="inline-upload-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f513f", display: "flex", alignItems: "center", gap: 8 }}>
              <Upload size={18} />
              Upload PDF for {subject.code} {unit ? `(${unit.name})` : "(Syllabus)"}
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
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Resource Title</span>
              <input
                type="text"
                placeholder={defaultTitle}
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
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Select PDF Document</span>
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
                {uploading ? "Uploading PDF..." : "Upload & Save PDF"}
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

      <button className="inline-back" onClick={onBack} type="button" style={{ marginTop: 18 }}>
        Choose another {type === "syllabus" ? "subject" : "unit"}
      </button>
    </section>
  );
}
