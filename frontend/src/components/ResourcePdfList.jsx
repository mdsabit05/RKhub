import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/react";
import { API_URL, api } from "../api";

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return "—";
  const num = Number(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function ResourcePdfList({
  resources = [],
  resourceType = "notes",
  year,
  course,
  semester,
  subject,
  unit,
  loading = false,
  error = "",
  onUploaded,
  onBack,
}) {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Delete modal state
  const [deletingResource, setDeletingResource] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const filteredResources = useMemo(() => {
    if (!searchTerm.trim()) return resources;
    const term = searchTerm.toLowerCase();
    return resources.filter(
      (r) =>
        (r.title && r.title.toLowerCase().includes(term)) ||
        (r.uploaderName && r.uploaderName.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term))
    );
  }, [resources, searchTerm]);

  const defaultTitle = `${subject.code} - ${unit ? unit.name : "Syllabus"} ${
    resourceType === "notes" ? "Notes" : resourceType === "pyq" ? "PYQ" : "Reference"
  }`;

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
      setStatusMessage("");

      const formData = new FormData();
      formData.append("resourceType", resourceType);
      formData.append("year", String(year.year));
      formData.append("course", course.code);
      formData.append("semester", String(semester.semester));
      formData.append("subjectId", String(subject.id));
      if (unit) formData.append("unitId", String(unit.id));
      formData.append("title", uploadTitle.trim() || defaultTitle);
      formData.append("file", uploadFile);

      let token = null;
      try {
        if (getToken) {
          token = await getToken();
        }
      } catch {
        // Clerk token fallback
      }

      await api.uploadResource(formData, token);

      setStatusMessage("PDF uploaded successfully!");
      setUploadFile(null);
      setUploadTitle("");
      setShowUpload(false);

      if (onUploaded) {
        await onUploaded();
      }
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingResource) return;

    try {
      setIsDeleting(true);
      setDeleteError("");

      let token = null;
      try {
        if (getToken) {
          token = await getToken();
        }
      } catch {
        // token fallback
      }

      await api.deleteResource(deletingResource.id, token);

      setStatusMessage(`"${deletingResource.title}" was permanently removed.`);
      setDeletingResource(null);

      if (onUploaded) {
        await onUploaded();
      }
    } catch (err) {
      setDeleteError(err.message || "Failed to delete resource.");
    } finally {
      setIsDeleting(false);
    }
  };

  const headingText =
    resourceType === "notes"
      ? "Available Notes PDFs"
      : resourceType === "pyq"
        ? "Available PYQ PDFs"
        : "Available Reference Materials";

  return (
    <section className="resource-pdf-panel">
      {/* Subject & Selection Header */}
      <div className="pdf-view-header">
        <div>
          <div className="eyebrow">
            {resourceType === "notes"
              ? "College Notes"
              : resourceType === "pyq"
                ? "Previous Year Questions"
                : "Reference Material"}
          </div>
          <h2 className="pdf-subject-title">
            {subject.code} — {subject.name}
          </h2>
          <p className="pdf-subject-meta">
            {course.code} • {year.name} • {semester.name}
            {unit ? ` • ${unit.name}` : ""}
          </p>
        </div>

        <button
          className="primary-action"
          type="button"
          onClick={() => setShowUpload((prev) => !prev)}
          style={{ cursor: "pointer", gap: 8 }}
        >
          {showUpload ? <X size={17} /> : <Plus size={17} />}
          <span>{showUpload ? "Cancel Upload" : "Upload PDF"}</span>
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

      {/* Inline Upload Drawer */}
      {showUpload && (
        <form onSubmit={handleUploadSubmit} className="inline-upload-card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f513f", display: "flex", alignItems: "center", gap: 8 }}>
              <Upload size={18} />
              Upload PDF for {subject.code} {unit ? `(${unit.name})` : ""}
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
                placeholder={defaultTitle}
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 15,
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

      {/* Main Table / List Card */}
      <div className="pdf-table-container">
        <div className="pdf-table-toolbar">
          <div className="pdf-table-title-area">
            <h3>{headingText}</h3>
            <span className="pdf-count-badge">
              {resources.length} {resources.length === 1 ? "PDF" : "PDFs"}
            </span>
          </div>

          {resources.length > 0 && (
            <div className="pdf-search-wrapper">
              <Search size={16} className="pdf-search-icon" />
              <input
                type="text"
                placeholder="Search by title or uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pdf-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="pdf-search-clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="pdf-loading-state">
            <div className="loading-line">Loading PDF materials...</div>
          </div>
        ) : resources.length === 0 ? (
          <div className="pdf-empty-state">
            <div className="pdf-empty-icon">
              <FileText size={40} />
            </div>
            <h4>No PDF materials available yet.</h4>
            <p>Be the first to upload material for this unit.</p>
            <button
              className="primary-action"
              onClick={() => setShowUpload(true)}
              type="button"
              style={{ cursor: "pointer", marginTop: 8 }}
            >
              <Upload size={16} />
              Upload PDF
            </button>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="pdf-empty-state">
            <h4>No PDF materials found.</h4>
            <p>Try searching for a different title or student name.</p>
            <button
              className="secondary-action"
              onClick={() => setSearchTerm("")}
              type="button"
              style={{ cursor: "pointer", marginTop: 6 }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="pdf-table-wrapper desktop-only">
              <table className="pdf-data-table">
                <thead>
                  <tr>
                    <th style={{ width: 60, textAlign: "center" }}>SL.NO</th>
                    <th>TITLE</th>
                    <th>UPLOADED BY</th>
                    <th>UPLOADED ON</th>
                    <th style={{ textAlign: "right" }}>SIZE</th>
                    <th style={{ textAlign: "right", minWidth: 200 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((res, index) => {
                    const rawUrl = res.fileUrl || res.externalUrl;
                    const url = rawUrl?.startsWith("/") ? `${API_URL}${rawUrl}` : rawUrl;
                    const isOwner = Boolean(user && res.uploadedBy && res.uploadedBy === user.id);
                    const uploaderDisplay =
                      res.uploaderName ||
                      (isOwner ? user.firstName || "You" : res.uploadedBy ? "Student" : "RKhub College");

                    return (
                      <tr key={res.id} className="pdf-table-row">
                        <td style={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                          {index + 1}
                        </td>
                        <td>
                          <div className="pdf-cell-title">
                            <div className="pdf-row-icon">
                              <FileText size={18} />
                            </div>
                            <div>
                              <div className="pdf-title-text">{res.title}</div>
                              {res.description && (
                                <div className="pdf-desc-text">{res.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="pdf-uploader-cell">
                            <User size={14} className="pdf-user-icon" />
                            <span>{uploaderDisplay}</span>
                          </div>
                        </td>
                        <td style={{ color: "#64748b", fontSize: 13 }}>
                          {formatDate(res.createdAt)}
                        </td>
                        <td style={{ textAlign: "right", color: "#64748b", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                          {formatFileSize(res.fileSize)}
                        </td>
                        <td>
                          <div className="pdf-row-actions">
                            <a
                              className="action-btn action-view"
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              title="View PDF in browser"
                            >
                              <ExternalLink size={14} />
                              <span>View</span>
                            </a>

                            <a
                              className="action-btn action-download"
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              download
                              title="Download PDF file"
                            >
                              <Download size={14} />
                              <span>Download</span>
                            </a>

                            {isOwner && (
                              <button
                                className="action-btn action-delete"
                                onClick={() => setDeletingResource(res)}
                                type="button"
                                title="Delete this PDF"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards Layout */}
            <div className="pdf-mobile-cards mobile-only">
              {filteredResources.map((res) => {
                const rawUrl = res.fileUrl || res.externalUrl;
                const url = rawUrl?.startsWith("/") ? `${API_URL}${rawUrl}` : rawUrl;
                const isOwner = Boolean(user && res.uploadedBy && res.uploadedBy === user.id);
                const uploaderDisplay =
                  res.uploaderName ||
                  (isOwner ? user.firstName || "You" : res.uploadedBy ? "Student" : "RKhub College");

                return (
                  <div key={res.id} className="pdf-card-mobile">
                    <div className="pdf-card-mobile-top">
                      <div className="pdf-row-icon">
                        <FileText size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="pdf-title-text">{res.title}</div>
                        {res.description && (
                          <div className="pdf-desc-text">{res.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="pdf-card-mobile-meta">
                      <div className="pdf-uploader-cell">
                        <User size={13} className="pdf-user-icon" />
                        <span>Uploaded by: <strong>{uploaderDisplay}</strong></span>
                      </div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>
                        {formatDate(res.createdAt)} • {formatFileSize(res.fileSize)}
                      </div>
                    </div>

                    <div className="pdf-card-mobile-actions">
                      <a
                        className="action-btn action-view"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={14} />
                        <span>View</span>
                      </a>

                      <a
                        className="action-btn action-download"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>

                      {isOwner && (
                        <button
                          className="action-btn action-delete"
                          onClick={() => setDeletingResource(res)}
                          type="button"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingResource && (
        <div className="pdf-modal-backdrop">
          <div className="pdf-modal-box">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: "#111827" }}>Delete this material?</h3>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
                  This will permanently remove the PDF from RKhub.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 16,
              }}
            >
              {deletingResource.title}
            </div>

            {deleteError && (
              <div className="api-error" style={{ marginBottom: 14 }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setDeletingResource(null);
                  setDeleteError("");
                }}
                disabled={isDeleting}
                style={{ cursor: "pointer" }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                style={{
                  minHeight: 38,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "1px solid #dc2626",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
              >
                <Trash2 size={15} />
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {onBack && (
        <button
          className="inline-back"
          onClick={onBack}
          type="button"
          style={{ marginTop: 22 }}
        >
          Choose another {unit ? "unit" : "subject"}
        </button>
      )}
    </section>
  );
}
