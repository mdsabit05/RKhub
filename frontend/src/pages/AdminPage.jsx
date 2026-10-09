import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  FileCheck,
  FileText,
  Filter,
  FolderOpen,
  HardDrive,
  Layers,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  Upload,
  User,
  X,
} from "lucide-react";
import { api } from "../api";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function AdminPage({ go }) {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem("rkhub_admin_key") || ""
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInput, setAuthInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Tab: 'pdfs' or 'upload'
  const [activeTab, setActiveTab] = useState("pdfs");

  // PDF Management state
  const [allResources, setAllResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  // Deletion modal / state
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);
  const [alertNotice, setAlertNotice] = useState(null);

  // Manage Units tab state
  const [unitMgmtSubjectId, setUnitMgmtSubjectId] = useState("");
  const [unitMgmtSubjects, setUnitMgmtSubjects] = useState([]);
  const [unitMgmtYear, setUnitMgmtYear] = useState("");
  const [unitMgmtCourse, setUnitMgmtCourse] = useState("BCA");
  const [unitMgmtSemester, setUnitMgmtSemester] = useState("");
  const [unitMgmtSemesters, setUnitMgmtSemesters] = useState([]);
  const [unitMgmtList, setUnitMgmtList] = useState([]);
  const [unitMgmtLoading, setUnitMgmtLoading] = useState(false);
  const [unitMgmtError, setUnitMgmtError] = useState("");
  const [newUnitNo, setNewUnitNo] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [addingUnit, setAddingUnit] = useState(false);
  const [deletingUnitId, setDeletingUnitId] = useState(null);

  // Upload Form state
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [form, setForm] = useState({
    resourceType: "notes",
    year: "",
    course: "BCA",
    semester: "",
    subjectId: "",
    unitId: "",
    title: "",
    file: null,
  });

  // Verify stored key on mount
  useEffect(() => {
    if (adminKey) {
      api
        .verifyAdmin(adminKey)
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          sessionStorage.removeItem("rkhub_admin_key");
          setAdminKey("");
          setIsAuthenticated(false);
        });
    }
  }, [adminKey]);

  // Load all resources when admin session is active
  const fetchAllResources = async (key = adminKey) => {
    if (!key) return;
    try {
      setLoadingResources(true);
      setResourceError("");
      const res = await api.getAdminResources(key);
      if (res && Array.isArray(res.resources)) {
        setAllResources(res.resources);
      } else {
        setAllResources([]);
      }
    } catch (err) {
      console.error("Failed to load admin resources:", err);
      setResourceError(err.message || "Failed to load platform resources.");
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllResources(adminKey);
      api
        .getYears()
        .then((data) => setYears(data))
        .catch(() => {});
    }
  }, [isAuthenticated, adminKey]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authInput.trim()) {
      setAuthError("Please enter the admin passcode.");
      return;
    }

    try {
      setVerifying(true);
      setAuthError("");
      await api.verifyAdmin(authInput.trim());
      sessionStorage.setItem("rkhub_admin_key", authInput.trim());
      setAdminKey(authInput.trim());
      setIsAuthenticated(true);
      fetchAllResources(authInput.trim());
    } catch (err) {
      setAuthError(err.message || "Invalid admin key. Access denied.");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("rkhub_admin_key");
    setAdminKey("");
    setIsAuthenticated(false);
    setAuthInput("");
    setAuthError("");
    setAllResources([]);
  };

  // Upload cascading dropdowns
  useEffect(() => {
    if (!form.year) {
      setSemesters([]);
      return;
    }
    api
      .getSemesters(form.year)
      .then((data) => setSemesters(data))
      .catch((err) => setUploadError(err.message));
  }, [form.year]);

  useEffect(() => {
    if (!form.year || !form.course || !form.semester) {
      setSubjects([]);
      return;
    }
    api
      .getSubjects(Number(form.year), form.course, Number(form.semester))
      .then((data) => setSubjects(data))
      .catch((err) => setUploadError(err.message));
  }, [form.year, form.course, form.semester]);

  useEffect(() => {
    if (!form.subjectId) {
      setUnits([]);
      return;
    }
    api
      .getUnits(form.subjectId)
      .then((data) => setUnits(data))
      .catch((err) => setUploadError(err.message));
  }, [form.subjectId]);

  // Unit management cascading selectors
  useEffect(() => {
    if (!unitMgmtYear) { setUnitMgmtSemesters([]); return; }
    api.getSemesters(unitMgmtYear).then(setUnitMgmtSemesters).catch(() => {});
  }, [unitMgmtYear]);

  useEffect(() => {
    if (!unitMgmtYear || !unitMgmtCourse || !unitMgmtSemester) { setUnitMgmtSubjects([]); return; }
    api.getSubjects(Number(unitMgmtYear), unitMgmtCourse, Number(unitMgmtSemester))
      .then(setUnitMgmtSubjects).catch(() => {});
  }, [unitMgmtYear, unitMgmtCourse, unitMgmtSemester]);

  const fetchUnitMgmtList = async (subjectId = unitMgmtSubjectId) => {
    if (!subjectId) { setUnitMgmtList([]); return; }
    try {
      setUnitMgmtLoading(true);
      setUnitMgmtError("");
      const res = await api.getAdminUnits(subjectId, adminKey);
      setUnitMgmtList(res.units || []);
    } catch (err) {
      setUnitMgmtError(err.message || "Failed to load units.");
    } finally {
      setUnitMgmtLoading(false);
    }
  };

  useEffect(() => { fetchUnitMgmtList(unitMgmtSubjectId); }, [unitMgmtSubjectId]);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!unitMgmtSubjectId || !newUnitNo || !newUnitName.trim()) {
      setUnitMgmtError("Select a subject and fill unit number + name.");
      return;
    }
    try {
      setAddingUnit(true);
      setUnitMgmtError("");
      await api.addAdminUnit(Number(unitMgmtSubjectId), Number(newUnitNo), newUnitName.trim(), adminKey);
      setNewUnitNo("");
      setNewUnitName("");
      await fetchUnitMgmtList();
      setAlertNotice({ type: "success", message: `Unit ${newUnitNo} added successfully.` });
    } catch (err) {
      setUnitMgmtError(err.message || "Failed to add unit.");
    } finally {
      setAddingUnit(false);
    }
  };

  const handleDeleteUnit = async (unit) => {
    try {
      setDeletingUnitId(unit.id);
      setUnitMgmtError("");
      await api.deleteAdminUnit(unit.id, adminKey);
      setUnitMgmtList((prev) => prev.filter((u) => u.id !== unit.id));
      setAlertNotice({ type: "success", message: `Unit ${unit.unitNo} "${unit.name}" deleted.` });
    } catch (err) {
      setUnitMgmtError(err.message || "Failed to delete unit.");
    } finally {
      setDeletingUnitId(null);
    }
  };

  const requiresUnit = ["notes", "pyq", "reference"].includes(form.resourceType);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "subjectId" ? { unitId: "" } : {}),
      ...(key === "year" ? { semester: "", subjectId: "" } : {}),
      ...(key === "course" ? { semester: "", subjectId: "" } : {}),
      ...(key === "semester" ? { subjectId: "" } : {}),
    }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      setUploadError("Select a PDF file to upload.");
      return;
    }

    if (requiresUnit && !form.unitId) {
      setUploadError("Select a unit for this resource type.");
      return;
    }

    const formData = new FormData();
    formData.append("resourceType", form.resourceType);
    formData.append("year", form.year);
    formData.append("course", form.course);
    formData.append("semester", form.semester);
    formData.append("subjectId", form.subjectId);
    if (form.unitId) formData.append("unitId", form.unitId);
    formData.append("title", form.title || "Academic Resource");
    formData.append("file", form.file);

    try {
      setUploadLoading(true);
      setUploadError("");
      setUploadStatus("Uploading PDF to Backblaze B2 storage...");

      const result = await api.uploadResource(formData, null);
      setUploadStatus(
        `Uploaded successfully (${result.storage || "cloud storage"}): ${result.fileUrl}`
      );
      setForm((prev) => ({ ...prev, title: "", file: null }));
      const fileInput = document.getElementById("admin-pdf-input");
      if (fileInput) fileInput.value = "";

      // Refresh platform resources so it immediately appears in the PDF list
      fetchAllResources(adminKey);
      setAlertNotice({
        type: "success",
        message: "New PDF uploaded and published successfully!",
      });
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please check form inputs.");
      setUploadStatus("");
    } finally {
      setUploadLoading(false);
    }
  };

  // Admin delete resource
  const handleDeleteResource = async (resource) => {
    try {
      setDeletingId(resource.id);
      await api.adminDeleteResource(resource.id, adminKey);

      setAllResources((prev) => prev.filter((item) => item.id !== resource.id));
      setAlertNotice({
        type: "success",
        message: `Successfully deleted "${resource.title}". File removed from cloud storage.`,
      });
      setConfirmDeleteTarget(null);
    } catch (err) {
      console.error("Admin delete failed:", err);
      setAlertNotice({
        type: "error",
        message: err.message || "Failed to delete resource. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered resources
  const filteredResources = useMemo(() => {
    return allResources.filter((item) => {
      // Type filter
      if (typeFilter !== "all" && item.resourceType !== typeFilter) {
        return false;
      }
      // Course filter
      if (courseFilter !== "all" && item.courseCode !== courseFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesSubject =
          item.subjectCode?.toLowerCase().includes(q) ||
          item.subjectName?.toLowerCase().includes(q);
        const matchesUploader =
          item.uploaderName?.toLowerCase().includes(q) ||
          item.uploaderEmail?.toLowerCase().includes(q);
        const matchesCourse = item.courseCode?.toLowerCase().includes(q);
        return matchesTitle || matchesSubject || matchesUploader || matchesCourse;
      }
      return true;
    });
  }, [allResources, typeFilter, courseFilter, searchQuery]);

  // Overall platform statistics
  const stats = useMemo(() => {
    const total = allResources.length;
    const totalBytes = allResources.reduce((acc, r) => acc + (Number(r.fileSize) || 0), 0);
    const notesCount = allResources.filter((r) => r.resourceType === "notes").length;
    const pyqCount = allResources.filter((r) => r.resourceType === "pyq").length;
    const syllabusCount = allResources.filter((r) => r.resourceType === "syllabus").length;
    return {
      total,
      totalBytes,
      notesCount,
      pyqCount,
      syllabusCount,
    };
  }, [allResources]);

  return (
    <main style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 20px 80px" }}>
      {/* Top Navigation Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <button
          className="back-link"
          onClick={() => go("account")}
          type="button"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Account</span>
        </button>

        {isAuthenticated && (
          <button
            onClick={handleLogout}
            type="button"
            className="secondary-action"
            style={{
              minHeight: 34,
              padding: "0 12px",
              fontSize: 12.5,
              cursor: "pointer",
              color: "#b42318",
              borderColor: "#fecdd3",
              background: "#fff5f5",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LogOut size={13} />
            <span>Lock Admin</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              maxWidth: 480,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 30px rgba(0,0,0,0.2)",
              border: "1px solid #fee2e2",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "#111827", fontWeight: 700 }}>
                  Delete PDF Resource?
                </h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>
                  Are you sure you want to permanently delete{" "}
                  <strong>"{confirmDeleteTarget.title}"</strong>?
                </p>
                <div
                  style={{
                    margin: "12px 0",
                    padding: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  <div>
                    <strong>Uploader:</strong>{" "}
                    {confirmDeleteTarget.uploaderName || confirmDeleteTarget.uploaderEmail || "Admin"}
                  </div>
                  <div>
                    <strong>Course & Subject:</strong>{" "}
                    {confirmDeleteTarget.courseCode || "General"} • {confirmDeleteTarget.subjectCode}
                  </div>
                  <div>
                    <strong>Size:</strong> {formatBytes(confirmDeleteTarget.fileSize)}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>
                  This will permanently delete the file from Backblaze B2 cloud storage and the database.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(null)}
                disabled={deletingId === confirmDeleteTarget.id}
                className="secondary-action"
                style={{ minHeight: 38, padding: "0 16px", fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteResource(confirmDeleteTarget)}
                disabled={deletingId === confirmDeleteTarget.id}
                style={{
                  minHeight: 38,
                  padding: "0 16px",
                  fontSize: 13,
                  fontWeight: 650,
                  background: "#dc2626",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: 8,
                  cursor: deletingId === confirmDeleteTarget.id ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Trash2 size={14} />
                <span>
                  {deletingId === confirmDeleteTarget.id ? "Deleting..." : "Permanently Delete"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passcode Login Card (When locked) */}
      {!isAuthenticated ? (
        <section
          style={{
            maxWidth: 500,
            margin: "30px auto",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: 36,
            boxShadow: "0 15px 35px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "#f0fdfa",
                border: "1px solid #99f6e4",
                color: "#0f766e",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#0f766e",
                  letterSpacing: "0.8px",
                }}
              >
                RKhub Administration
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                Admin Portal Gate
              </h2>
            </div>
          </div>

          <p style={{ color: "#64748b", fontSize: 14, margin: "10px 0 24px", lineHeight: 1.5 }}>
            Access administrative management for all platform PDFs, cloud storage files, and institutional resource uploads.
          </p>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 650, fontSize: 13.5, color: "#334155" }}>
                Admin Passcode
              </span>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  value={authInput}
                  onChange={(e) => setAuthInput(e.target.value)}
                  placeholder="Enter passcode"
                  autoFocus
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 14px 0 38px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <Lock
                  size={16}
                  style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }}
                />
              </div>
            </label>

            {authError && (
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fecdd3",
                  color: "#b42318",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {authError}
              </div>
            )}

            <button
              className="primary-action"
              type="submit"
              disabled={verifying}
              style={{
                width: "100%",
                height: 44,
                fontSize: 14,
                fontWeight: 650,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: verifying ? "wait" : "pointer",
                marginTop: 4,
              }}
            >
              <Unlock size={16} />
              <span>{verifying ? "Verifying Passcode..." : "Unlock Admin Portal"}</span>
            </button>
          </form>
        </section>
      ) : (
        /* Authenticated Admin Dashboard */
        <div style={{ display: "grid", gap: 24 }}>
          {/* Top Admin Banner */}
          <section
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              border: "1px solid #334155",
              borderRadius: 20,
              padding: "24px 28px",
              color: "#f8fafc",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: 999,
                    color: "#34d399",
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 8,
                  }}
                >
                  <ShieldCheck size={14} />
                  Admin Superuser Active
                </div>
                <h1 style={{ margin: "4px 0 6px", fontSize: 26, fontWeight: 800, color: "#ffffff" }}>
                  Platform Resource Control Center
                </h1>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 14, maxWidth: 650 }}>
                  Manage, inspect, and delete any uploaded PDF across all users, or publish verified college resources.
                </p>
              </div>

              {/* Tab Switcher Pills */}
              <div
                style={{
                  display: "flex",
                  background: "#090d16",
                  padding: 4,
                  borderRadius: 12,
                  border: "1px solid #334155",
                  gap: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("pdfs")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 650,
                    cursor: "pointer",
                    border: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: activeTab === "pdfs" ? "#0f766e" : "transparent",
                    color: activeTab === "pdfs" ? "#ffffff" : "#94a3b8",
                    transition: "all 0.15s ease",
                  }}
                >
                  <FolderOpen size={15} />
                  <span>All Uploaded PDFs ({stats.total})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 650,
                    cursor: "pointer",
                    border: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: activeTab === "upload" ? "#0f766e" : "transparent",
                    color: activeTab === "upload" ? "#ffffff" : "#94a3b8",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Upload size={15} />
                  <span>Upload Resource</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("units")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 650,
                    cursor: "pointer",
                    border: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: activeTab === "units" ? "#0f766e" : "transparent",
                    color: activeTab === "units" ? "#ffffff" : "#94a3b8",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Layers size={15} />
                  <span>Manage Units</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                marginTop: 22,
                paddingTop: 18,
                borderTop: "1px solid #334155",
              }}
            >
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Total Uploaded PDFs</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>
                  {stats.total} files
                </div>
              </div>

              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Cloud Storage Usage</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8", marginTop: 2 }}>
                  {formatBytes(stats.totalBytes)}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Notes Uploaded</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#34d399", marginTop: 2 }}>
                  {stats.notesCount}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <div style={{ fontSize: 12, color: "#94a3b8" }}>PYQs & Syllabus</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24", marginTop: 2 }}>
                  {stats.pyqCount + stats.syllabusCount}
                </div>
              </div>
            </div>
          </section>

          {/* Feedback Notice Banner */}
          {alertNotice && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderRadius: 12,
                fontSize: 13.5,
                background: alertNotice.type === "success" ? "#f0fdf4" : "#fff5f5",
                border:
                  alertNotice.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecdd3",
                color: alertNotice.type === "success" ? "#166534" : "#991b1b",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {alertNotice.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
                <span>{alertNotice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setAlertNotice(null)}
                style={{
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  color: "inherit",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* TAB 1: ALL UPLOADED PDFS */}
          {activeTab === "pdfs" && (
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              }}
            >
              {/* Filter and Search Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {/* Search */}
                <div style={{ position: "relative", minWidth: 280, flex: 1 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, subject, or student name/email..."
                    style={{
                      width: "100%",
                      height: 40,
                      padding: "0 14px 0 36px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      fontSize: 13.5,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <Search
                    size={16}
                    style={{ position: "absolute", left: 12, top: 12, color: "#94a3b8" }}
                  />
                </div>

                {/* Filters & Refresh */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                      height: 40,
                      padding: "0 12px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      fontSize: 13,
                      background: "#f8fafc",
                      color: "#334155",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="notes">Notes</option>
                    <option value="pyq">PYQs</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="reference">Reference</option>
                  </select>

                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    style={{
                      height: 40,
                      padding: "0 12px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      fontSize: 13,
                      background: "#f8fafc",
                      color: "#334155",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="all">All Courses</option>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => fetchAllResources(adminKey)}
                    disabled={loadingResources}
                    className="secondary-action"
                    style={{
                      height: 40,
                      padding: "0 14px",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: loadingResources ? "wait" : "pointer",
                    }}
                    title="Reload PDF list"
                  >
                    <RefreshCw
                      size={14}
                      style={{
                        animation: loadingResources ? "spin 1s linear infinite" : "none",
                      }}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {resourceError && (
                <div
                  style={{
                    background: "#fff5f5",
                    border: "1px solid #fecdd3",
                    color: "#b42318",
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 16,
                    fontSize: 13.5,
                  }}
                >
                  {resourceError}
                </div>
              )}

              {/* Table / List View */}
              {loadingResources ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                  <RefreshCw
                    size={28}
                    style={{ animation: "spin 1s linear infinite", marginBottom: 12 }}
                  />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                    Loading platform PDFs from database...
                  </p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 14,
                    color: "#64748b",
                  }}
                >
                  <FileText size={36} style={{ color: "#94a3b8", marginBottom: 10 }} />
                  <h4 style={{ margin: "0 0 4px", fontSize: 16, color: "#334155" }}>
                    No PDFs Found
                  </h4>
                  <p style={{ margin: 0, fontSize: 13.5 }}>
                    {searchQuery
                      ? "No uploaded PDFs match your current search criteria."
                      : "No academic PDFs have been uploaded to the platform yet."}
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {filteredResources.map((item) => {
                    const isNotes = item.resourceType === "notes";
                    const isPyq = item.resourceType === "pyq";
                    const isSyllabus = item.resourceType === "syllabus";

                    const badgeColor = isNotes
                      ? { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" }
                      : isPyq
                      ? { bg: "#fefce8", text: "#854d0e", border: "#fef08a" }
                      : isSyllabus
                      ? { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" }
                      : { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" };

                    return (
                      <div
                        key={item.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 16,
                          flexWrap: "wrap",
                          background: "#ffffff",
                          transition: "box-shadow 0.15s ease",
                        }}
                      >
                        {/* Left: Info */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 280 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              background: "#fee2e2",
                              color: "#dc2626",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            <FileText size={20} />
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                                {item.title}
                              </h4>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  background: badgeColor.bg,
                                  color: badgeColor.text,
                                  border: `1px solid ${badgeColor.border}`,
                                }}
                              >
                                {item.resourceType}
                              </span>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                flexWrap: "wrap",
                                fontSize: 12.5,
                                color: "#64748b",
                                marginTop: 4,
                              }}
                            >
                              <span>
                                <strong>Course:</strong> {item.courseCode || "BCA"} • Sem {item.semester}
                              </span>
                              <span>
                                <strong>Subject:</strong> {item.subjectCode} ({item.subjectName})
                              </span>
                              {item.unitNo && (
                                <span>
                                  <strong>Unit:</strong> {item.unitNo}
                                </span>
                              )}
                              <span>
                                <strong>Size:</strong> {formatBytes(item.fileSize)}
                              </span>
                              <span>
                                <strong>Date:</strong> {formatDate(item.createdAt)}
                              </span>
                            </div>

                            {/* Uploader Attribution */}
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 8,
                                padding: "3px 8px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 6,
                                fontSize: 11.5,
                                color: "#475569",
                              }}
                            >
                              <User size={12} style={{ color: "#0f766e" }} />
                              <span>
                                <strong>Uploaded by:</strong>{" "}
                                {item.uploaderName
                                  ? `${item.uploaderName} (${item.uploaderEmail || "student"})`
                                  : item.uploaderEmail || "Admin / College Portal"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {item.fileUrl && (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="secondary-action"
                              style={{
                                minHeight: 36,
                                padding: "0 12px",
                                fontSize: 12.5,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                textDecoration: "none",
                              }}
                            >
                              <ExternalLink size={13} />
                              <span>View PDF</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTarget(item)}
                            disabled={deletingId === item.id}
                            style={{
                              minHeight: 36,
                              padding: "0 13px",
                              fontSize: 12.5,
                              fontWeight: 650,
                              color: "#b42318",
                              borderColor: "#fecdd3",
                              background: "#fff5f5",
                              border: "1px solid #fecdd3",
                              borderRadius: 8,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.15s ease",
                            }}
                            title="Delete this PDF as Admin"
                          >
                            <Trash2 size={13} />
                            <span>Delete PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: MANAGE UNITS */}
          {activeTab === "units" && (
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: 28,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ marginBottom: 22 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                  Manage Units
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                  Add or remove units for any subject.
                </p>
              </div>

              {/* Cascading selectors */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 16 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Year</span>
                  <select
                    value={unitMgmtYear}
                    onChange={(e) => { setUnitMgmtYear(e.target.value); setUnitMgmtSemester(""); setUnitMgmtSubjectId(""); }}
                    style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "#f8fafc" }}
                  >
                    <option value="">Select year</option>
                    {years.map((y) => <option key={y.year} value={y.year}>{y.name}</option>)}
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Course</span>
                  <select
                    value={unitMgmtCourse}
                    onChange={(e) => { setUnitMgmtCourse(e.target.value); setUnitMgmtSubjectId(""); }}
                    style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "#f8fafc" }}
                  >
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Semester</span>
                  <select
                    value={unitMgmtSemester}
                    onChange={(e) => { setUnitMgmtSemester(e.target.value); setUnitMgmtSubjectId(""); }}
                    style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "#f8fafc" }}
                  >
                    <option value="">Select semester</option>
                    {unitMgmtSemesters.map((s) => <option key={s.semester} value={s.semester}>{s.name}</option>)}
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Subject</span>
                  <select
                    value={unitMgmtSubjectId}
                    onChange={(e) => setUnitMgmtSubjectId(e.target.value)}
                    style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "#f8fafc" }}
                  >
                    <option value="">Select subject</option>
                    {unitMgmtSubjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
                  </select>
                </label>
              </div>

              {unitMgmtError && (
                <div style={{ background: "#fff5f5", border: "1px solid #fecdd3", color: "#b42318", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  {unitMgmtError}
                </div>
              )}

              {unitMgmtSubjectId && (
                <>
                  {/* Current units list */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>
                      Current Units {unitMgmtLoading ? "(loading...)" : `(${unitMgmtList.length})`}
                    </div>
                    {unitMgmtList.length === 0 && !unitMgmtLoading ? (
                      <div style={{ padding: "18px 16px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 10, color: "#64748b", fontSize: 13.5 }}>
                        No units found for this subject.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: 8 }}>
                        {unitMgmtList.map((unit) => (
                          <div
                            key={unit.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 16px",
                              border: "1px solid #e2e8f0",
                              borderRadius: 10,
                              background: "#ffffff",
                              gap: 12,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", color: "#0f766e", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                                {unit.unitNo}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>Unit {unit.unitNo}</div>
                                <div style={{ fontSize: 12.5, color: "#64748b" }}>{unit.name}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteUnit(unit)}
                              disabled={deletingUnitId === unit.id}
                              style={{
                                minHeight: 32,
                                padding: "0 12px",
                                fontSize: 12.5,
                                fontWeight: 650,
                                color: "#b42318",
                                background: "#fff5f5",
                                border: "1px solid #fecdd3",
                                borderRadius: 7,
                                cursor: deletingUnitId === unit.id ? "wait" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <Trash2 size={13} />
                              <span>{deletingUnitId === unit.id ? "Deleting..." : "Remove"}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add unit form */}
                  <form onSubmit={handleAddUnit} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, display: "grid", gap: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", display: "flex", alignItems: "center", gap: 7 }}>
                      <Plus size={16} />
                      Add New Unit
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 10, alignItems: "end" }}>
                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 12.5, color: "#334155" }}>Unit No.</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newUnitNo}
                          onChange={(e) => setNewUnitNo(e.target.value)}
                          placeholder="e.g. 4"
                          required
                          style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff" }}
                        />
                      </label>
                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 12.5, color: "#334155" }}>Unit Name</span>
                        <input
                          type="text"
                          value={newUnitName}
                          onChange={(e) => setNewUnitName(e.target.value)}
                          placeholder="e.g. Advanced Topics in DBMS"
                          required
                          style={{ height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff" }}
                        />
                      </label>
                      <button
                        className="primary-action"
                        type="submit"
                        disabled={addingUnit}
                        style={{ height: 40, padding: "0 18px", display: "flex", alignItems: "center", gap: 6, cursor: addingUnit ? "wait" : "pointer", whiteSpace: "nowrap" }}
                      >
                        <Plus size={15} />
                        <span>{addingUnit ? "Adding..." : "Add Unit"}</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>
          )}

          {/* TAB 2: UPLOAD ACADEMIC RESOURCE FORM */}
          {activeTab === "upload" && (
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: 28,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ marginBottom: 22 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                  Upload Academic PDF
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                  Select the target curriculum scope and upload notes, syllabus, or past questions directly to Backblaze cloud storage.
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} style={{ display: "grid", gap: 18 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: "#334155" }}>
                    Resource Type
                  </span>
                  <select
                    value={form.resourceType}
                    onChange={(e) => handleFormChange("resourceType", e.target.value)}
                    style={{
                      height: 44,
                      padding: "0 14px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      fontSize: 14,
                      color: "#1e293b",
                    }}
                  >
                    <option value="notes">Notes</option>
                    <option value="pyq">Previous Year Questions (PYQ)</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="reference">Reference Material</option>
                  </select>
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 16,
                  }}
                >
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: "#334155" }}>Year</span>
                    <select
                      value={form.year}
                      onChange={(e) => handleFormChange("year", e.target.value)}
                      required
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        fontSize: 14,
                        color: "#1e293b",
                      }}
                    >
                      <option value="">Select year</option>
                      {years.map((item) => (
                        <option key={item.year} value={item.year}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: "#334155" }}>Course</span>
                    <select
                      value={form.course}
                      onChange={(e) => handleFormChange("course", e.target.value)}
                      required
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        fontSize: 14,
                        color: "#1e293b",
                      }}
                    >
                      <option value="BCA">BCA</option>
                      <option value="BBA">BBA</option>
                    </select>
                  </label>

                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: "#334155" }}>Semester</span>
                    <select
                      value={form.semester}
                      onChange={(e) => handleFormChange("semester", e.target.value)}
                      required
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        fontSize: 14,
                        color: "#1e293b",
                      }}
                    >
                      <option value="">Select semester</option>
                      {semesters.map((item) => (
                        <option key={item.semester} value={item.semester}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                  }}
                >
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: "#334155" }}>Subject</span>
                    <select
                      value={form.subjectId}
                      onChange={(e) => handleFormChange("subjectId", e.target.value)}
                      required
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        fontSize: 14,
                        color: "#1e293b",
                      }}
                    >
                      <option value="">Select subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.code} — {subject.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {requiresUnit && (
                    <label style={{ display: "grid", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5, color: "#334155" }}>Unit</span>
                      <select
                        value={form.unitId}
                        onChange={(e) => handleFormChange("unitId", e.target.value)}
                        required
                        style={{
                          height: 44,
                          padding: "0 14px",
                          borderRadius: 10,
                          border: "1px solid #cbd5e1",
                          background: "#f8fafc",
                          fontSize: 14,
                          color: "#1e293b",
                        }}
                      >
                        <option value="">Select unit</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            Unit {unit.unitNo}: {unit.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: "#334155" }}>
                    Resource Title
                  </span>
                  <input
                    value={form.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="e.g., CC-202 Database Systems Complete Notes"
                    required
                    style={{
                      height: 44,
                      padding: "0 14px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      fontSize: 14,
                      color: "#1e293b",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: "#334155" }}>
                    PDF Document File
                  </span>
                  <input
                    id="admin-pdf-input"
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={(e) => handleFormChange("file", e.target.files?.[0] || null)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "1px dashed #cbd5e1",
                      background: "#f8fafc",
                      fontSize: 13.5,
                      cursor: "pointer",
                    }}
                  />
                </label>

                {uploadError && (
                  <div
                    style={{
                      background: "#fff5f5",
                      border: "1px solid #fecdd3",
                      color: "#b42318",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  >
                    {uploadError}
                  </div>
                )}

                {uploadStatus && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      color: "#166534",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  >
                    {uploadStatus}
                  </div>
                )}

                <button
                  className="primary-action"
                  type="submit"
                  disabled={uploadLoading}
                  style={{
                    justifySelf: "start",
                    minWidth: 160,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: uploadLoading ? "wait" : "pointer",
                  }}
                >
                  <Send size={15} />
                  <span>{uploadLoading ? "Uploading to Cloud..." : "Upload PDF"}</span>
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

export default AdminPage;
