import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Plus,
  Upload,
  User,
  X,
} from "lucide-react";
import { useSession } from "../lib/auth-client";
import { API_URL, api } from "../api";

export function SyllabusList({ year, course, semester, onBack }) {
  const { data: session } = useSession();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchResources = () => {
    setLoading(true);
    setError("");
    api
      .list("syllabus", { year: year.year, semester: semester.semester })
      .then((data) => setResources(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources();
  }, [year.year, semester.semester]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) { setUploadError("Please select a PDF file."); return; }
    if (!uploadFile.name.toLowerCase().endsWith(".pdf")) { setUploadError("Only PDF files are allowed."); return; }

    try {
      setUploading(true);
      setUploadError("");
      const formData = new FormData();
      formData.append("resourceType", "syllabus");
      formData.append("year", String(year.year));
      formData.append("course", course.code);
      formData.append("semester", String(semester.semester));
      formData.append("title", `${course.code} Semester ${semester.semester} Syllabus`);
      formData.append("file", uploadFile);
      const token = session?.session?.token || localStorage.getItem("rkhub_auth_token") || null;
      await api.uploadResource(formData, token);
      setStatusMessage("Syllabus uploaded successfully!");
      setUploadFile(null);
      setShowUpload(false);
      fetchResources();
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="resource-pdf-panel">
      {/* Header */}
      <div className="pdf-view-header">
        <div>
          <div className="eyebrow">College Syllabus</div>
          <h2 className="pdf-subject-title">{course.code} — {semester.name}</h2>
          <p className="pdf-subject-meta">{course.code} • {year.name} • {semester.name}</p>
        </div>
        <button
          className="primary-action"
          type="button"
          onClick={() => setShowUpload((p) => !p)}
          style={{ cursor: "pointer", gap: 8 }}
        >
          {showUpload ? <X size={17} /> : <Plus size={17} />}
          <span>{showUpload ? "Cancel" : "Upload Syllabus"}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="pdf-alert-success">
          <CheckCircle2 size={17} />
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage("")}
            style={{ marginLeft: "auto", background: "none", border: 0, cursor: "pointer", color: "inherit" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && <div className="api-error">{error}</div>}

      {/* Upload Drawer */}
      {showUpload && (
        <form onSubmit={handleUpload} className="inline-upload-card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f513f", display: "flex", alignItems: "center", gap: 8 }}>
              <Upload size={18} />
              Upload Syllabus PDF
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
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Select PDF Document</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#f8fafc" }}
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
                {uploading ? "Uploading..." : "Upload & Save PDF"}
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

      {/* Syllabus Table */}
      <div className="pdf-table-container">
        <div className="pdf-table-toolbar">
          <div className="pdf-table-title-area">
            <h3>Syllabus PDFs</h3>
            <span className="pdf-count-badge">
              {resources.length} {resources.length === 1 ? "PDF" : "PDFs"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="pdf-loading-state">
            <div className="loading-line">Loading syllabus PDFs...</div>
          </div>
        ) : resources.length === 0 ? (
          <div className="pdf-empty-state">
            <div className="pdf-empty-icon"><FileText size={40} /></div>
            <h4>No syllabus PDFs available yet.</h4>
            <p>Be the first to upload a syllabus for this semester.</p>
            <button
              className="primary-action"
              onClick={() => setShowUpload(true)}
              type="button"
              style={{ cursor: "pointer", marginTop: 8 }}
            >
              <Upload size={16} />
              Upload Syllabus PDF
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="pdf-table-wrapper desktop-only">
              <table className="pdf-data-table">
                <thead>
                  <tr>
                    <th style={{ width: 50, textAlign: "center" }}>SL.NO</th>
                    <th>SUBJECT</th>
                    <th>TITLE</th>
                    <th>UPLOADED BY</th>
                    <th style={{ textAlign: "right", minWidth: 160 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((res, index) => {
                    const rawUrl = res.fileUrl || res.externalUrl;
                    const url = rawUrl?.startsWith("/")
                      ? `${API_URL}${rawUrl}`
                      : `${API_URL}/api/resources/${res.id}/file`;
                    return (
                      <tr key={res.id} className="pdf-table-row">
                        <td style={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>{index + 1}</td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f513f" }}>{res.subjectCode}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{res.subjectName}</div>
                        </td>
                        <td>
                          <div className="pdf-cell-title">
                            <div className="pdf-row-icon"><FileText size={18} /></div>
                            <div className="pdf-title-text">{res.title}</div>
                          </div>
                        </td>
                        <td>
                          <div className="pdf-uploader-cell">
                            <User size={14} className="pdf-user-icon" />
                            <span>{res.uploaderName || "RKhub College"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="pdf-row-actions">
                            <a className="action-btn action-view" href={url} target="_blank" rel="noreferrer" title="View PDF">
                              <ExternalLink size={14} /><span>View</span>
                            </a>
                            <a className="action-btn action-download" href={url} target="_blank" rel="noreferrer" download title="Download PDF">
                              <Download size={14} /><span>Download</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="pdf-mobile-cards mobile-only">
              {resources.map((res) => {
                const rawUrl = res.fileUrl || res.externalUrl;
                const url = rawUrl?.startsWith("/")
                  ? `${API_URL}${rawUrl}`
                  : `${API_URL}/api/resources/${res.id}/file`;
                return (
                  <div key={res.id} className="pdf-card-mobile">
                    <div className="pdf-card-mobile-top">
                      <div className="pdf-row-icon"><FileText size={20} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#0f513f" }}>
                          {res.subjectCode} — {res.subjectName}
                        </div>
                        <div className="pdf-title-text">{res.title}</div>
                      </div>
                    </div>
                    <div className="pdf-card-mobile-actions">
                      <a className="action-btn action-view" href={url} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} /><span>View</span>
                      </a>
                      <a className="action-btn action-download" href={url} target="_blank" rel="noreferrer" download>
                        <Download size={14} /><span>Download</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <button className="inline-back" onClick={onBack} type="button" style={{ marginTop: 22 }}>
        Choose another semester
      </button>
    </section>
  );
}
