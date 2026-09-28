import React, { useEffect, useState } from "react";
import { ArrowLeft, Lock, Send, ShieldCheck, Unlock } from "lucide-react";
import { api } from "../api";

export function AdminPage({ go }) {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem("rkhub_admin_key") || ""
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInput, setAuthInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
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
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          sessionStorage.removeItem("rkhub_admin_key");
          setAdminKey("");
          setIsAuthenticated(false);
        });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authInput.trim()) {
      setAuthError("Enter the admin key to continue.");
      return;
    }

    try {
      setVerifying(true);
      setAuthError("");
      await api.verifyAdmin(authInput.trim());
      sessionStorage.setItem("rkhub_admin_key", authInput.trim());
      setAdminKey(authInput.trim());
      setIsAuthenticated(true);
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
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getYears().then((data) => setYears(data)).catch((err) => setError(err.message));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!form.year) {
      setSemesters([]);
      return;
    }

    api.getSemesters(form.year)
      .then((data) => setSemesters(data))
      .catch((err) => setError(err.message));
  }, [form.year]);

  useEffect(() => {
    if (!form.year || !form.course || !form.semester) {
      setSubjects([]);
      return;
    }

    api.getSubjects(Number(form.year), form.course, Number(form.semester))
      .then((data) => setSubjects(data))
      .catch((err) => setError(err.message));
  }, [form.year, form.course, form.semester]);

  useEffect(() => {
    if (!form.subjectId) {
      setUnits([]);
      return;
    }

    api.getUnits(form.subjectId)
      .then((data) => setUnits(data))
      .catch((err) => setError(err.message));
  }, [form.subjectId]);

  const requiresUnit = ["notes", "pyq", "reference"].includes(form.resourceType);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "subjectId" ? { unitId: "" } : {}),
      ...(key === "year" ? { semester: "", subjectId: "" } : {}),
      ...(key === "course" ? { semester: "", subjectId: "" } : {}),
      ...(key === "semester" ? { subjectId: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.file) {
      setError("Select a PDF file first.");
      return;
    }

    if (requiresUnit && !form.unitId) {
      setError("Select a unit for this resource type.");
      return;
    }

    const formData = new FormData();
    formData.append("resourceType", form.resourceType);
    formData.append("year", form.year);
    formData.append("course", form.course);
    formData.append("semester", form.semester);
    formData.append("subjectId", form.subjectId);
    if (form.unitId) formData.append("unitId", form.unitId);
    formData.append("title", form.title || "Uploaded resource");
    formData.append("file", form.file);

    try {
      setError("");
      setStatus("Uploading resource...");
      const result = await api.uploadResource(formData, adminKey);
      setStatus(`Uploaded successfully (${result.storage || "local"}): ${result.fileUrl}`);
      setForm((prev) => ({ ...prev, title: "", file: null }));
      const fileInput = document.getElementById("admin-file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err.message || "Upload failed.");
      setStatus("");
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>
      <button className="back-link" onClick={() => go("home")} type="button">
        <ArrowLeft size={17} />
        Back
      </button>

      {!isAuthenticated ? (
        <section
          style={{
            marginTop: 20,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            padding: 32,
            boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#fef3c7",
                color: "#b45309",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Lock size={22} />
            </div>
            <div>
              <div className="eyebrow">Restricted Access</div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Admin Authorization Required</h2>
            </div>
          </div>

          <p style={{ color: "#64748b", fontSize: 15, margin: "8px 0 24px" }}>
            The admin resource portal allows adding notes, syllabus files, and PYQs to RKhub.
            Please enter the admin key to proceed.
          </p>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 16, maxWidth: 460 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Admin Key</span>
              <input
                type="password"
                value={authInput}
                onChange={(e) => setAuthInput(e.target.value)}
                placeholder="Enter admin passcode"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </label>

            {authError && <div className="api-error">{authError}</div>}

            <button
              className="ask-button"
              type="submit"
              disabled={verifying}
              style={{ justifySelf: "start", minWidth: 160 }}
            >
              <Unlock size={17} />
              <span>{verifying ? "Verifying..." : "Unlock Portal"}</span>
            </button>
          </form>
        </section>
      ) : (
        <>
          <section
            style={{
              background: "#111827",
              border: "1px solid #2b3748",
              borderRadius: 18,
              padding: 24,
              color: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
                  color: "#10b981",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 6,
                }}
              >
                <ShieldCheck size={16} />
                Admin Session Active
              </div>
              <h1 style={{ margin: "4px 0 8px", fontSize: 26, color: "#fff" }}>
                Upload academic resources
              </h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
                Upload notes, PYQs, syllabus, or reference material for the existing RKhub academic data.
              </p>
            </div>

            <button
              onClick={handleLogout}
              type="button"
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#1f2937",
                border: "1px solid #374151",
                color: "#e2e8f0",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </section>

          <form onSubmit={handleSubmit} style={{ marginTop: 24, display: "grid", gap: 18 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Resource Type</span>
              <select
                value={form.resourceType}
                onChange={(e) => handleChange("resourceType", e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #2b3748",
                  background: "#0f172a",
                  color: "#f8fafc",
                }}
              >
                <option value="notes">Notes</option>
                <option value="pyq">PYQ</option>
                <option value="syllabus">Syllabus</option>
                <option value="reference">Reference</option>
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
                <span>Year</span>
                <select
                  value={form.year}
                  onChange={(e) => handleChange("year", e.target.value)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #2b3748",
                    background: "#0f172a",
                    color: "#f8fafc",
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
                <span>Course</span>
                <select
                  value={form.course}
                  onChange={(e) => handleChange("course", e.target.value)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #2b3748",
                    background: "#0f172a",
                    color: "#f8fafc",
                  }}
                >
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span>Semester</span>
                <select
                  value={form.semester}
                  onChange={(e) => handleChange("semester", e.target.value)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #2b3748",
                    background: "#0f172a",
                    color: "#f8fafc",
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
                <span>Subject</span>
                <select
                  value={form.subjectId}
                  onChange={(e) => handleChange("subjectId", e.target.value)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #2b3748",
                    background: "#0f172a",
                    color: "#f8fafc",
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
                  <span>Unit</span>
                  <select
                    value={form.unitId}
                    onChange={(e) => handleChange("unitId", e.target.value)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid #2b3748",
                      background: "#0f172a",
                      color: "#f8fafc",
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
              <span>Title</span>
              <input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="CC-202 - Unit 1 Notes"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #2b3748",
                  background: "#0f172a",
                  color: "#f8fafc",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span>PDF File</span>
              <input
                id="admin-file-input"
                type="file"
                accept="application/pdf"
                onChange={(e) => handleChange("file", e.target.files?.[0] || null)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #2b3748",
                  background: "#0f172a",
                  color: "#f8fafc",
                }}
              />
            </label>

            {error && <div className="api-error">{error}</div>}
            {status && <div className="demo-notice">{status}</div>}

            <button className="ask-button" type="submit" style={{ justifySelf: "start" }}>
              <Send size={17} />
              <span>Upload PDF</span>
            </button>
          </form>
        </>
      )}
    </main>
  );
}
