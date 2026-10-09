import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Download, ExternalLink, FileText, Upload, X } from "lucide-react";
import { useSession } from "../lib/auth-client";
import { API_URL, api } from "../api";
import { Choice } from "../components/Choice";
import { Document } from "../components/Document";
import { Materials } from "../components/Materials";
import { ResourcePdfList } from "../components/ResourcePdfList";
import { Selection } from "../components/Selection";
import { SubjectList } from "../components/SubjectList";
import { SyllabusList } from "../components/SyllabusList";
import { resourceMeta } from "../constants/resources";

function CompleteSyllabusCard() {
  const { data: session } = useSession();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchResource = () => {
    setLoading(true);
    api.list("complete_syllabus", {}).then((data) => setResource(data[0] ?? null)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchResource(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) { setUploadError("Please select a PDF file."); return; }
    if (!uploadFile.name.toLowerCase().endsWith(".pdf")) { setUploadError("Only PDF files are allowed."); return; }
    try {
      setUploading(true);
      setUploadError("");
      const formData = new FormData();
      formData.append("resourceType", "complete_syllabus");
      formData.append("title", "Complete 4-Year Syllabus");
      formData.append("file", uploadFile);
      const token = session?.session?.token || localStorage.getItem("rkhub_auth_token") || null;
      await api.uploadResource(formData, token);
      setSuccess("Complete syllabus uploaded!");
      setUploadFile(null);
      setShowUpload(false);
      fetchResource();
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const rawUrl = resource?.fileUrl || resource?.externalUrl;
  const url = rawUrl?.startsWith("/") ? `${API_URL}${rawUrl}` : resource ? `${API_URL}/api/resources/${resource.id}/file` : null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
      border: "1.5px solid #86efac",
      borderRadius: 16,
      padding: "20px 24px",
      marginBottom: 28,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dcfce7", color: "#16a34a", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <FileText size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#14532d" }}>Complete 4-Year Syllabus</div>
          <div style={{ fontSize: 13, color: "#166534", marginTop: 2 }}>
            {loading ? "Loading..." : resource ? resource.title : "No complete syllabus uploaded yet"}
          </div>
          {success && <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, marginTop: 4 }}>{success}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {url && (
            <>
              <a className="action-btn action-view" href={url} target="_blank" rel="noreferrer" title="View complete syllabus">
                <ExternalLink size={14} /><span>View</span>
              </a>
              <a className="action-btn action-download" href={url} target="_blank" rel="noreferrer" download title="Download complete syllabus">
                <Download size={14} /><span>Download</span>
              </a>
            </>
          )}
          <button
            className="action-btn"
            type="button"
            onClick={() => { setShowUpload((p) => !p); setUploadError(""); }}
            style={{ cursor: "pointer", background: "#dcfce7", border: "1px solid #86efac", color: "#15803d" }}
          >
            <Upload size={14} />
            <span>{showUpload ? "Cancel" : resource ? "Replace PDF" : "Upload PDF"}</span>
          </button>
        </div>
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>Select Complete Syllabus PDF</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #86efac", fontSize: 14, background: "#f0fdf4" }}
            />
          </label>
          {uploadError && <div className="api-error">{uploadError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-action" type="submit" disabled={uploading} style={{ cursor: "pointer" }}>
              <Upload size={15} />{uploading ? "Uploading..." : "Upload & Save"}
            </button>
            <button className="secondary-action" type="button" onClick={() => setShowUpload(false)} style={{ cursor: "pointer" }}>
              <X size={15} />Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function ResourcePage({ type, go }) {
  const meta = resourceMeta[type] || resourceMeta.notes;
  const [step, setStep] = useState("year");
  const [year, setYear] = useState(null);
  const [course, setCourse] = useState(null);
  const [semester, setSemester] = useState(null);
  const [subject, setSubject] = useState(null);
  const [unit, setUnit] = useState(null);

  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const applyState = (next) => {
    setStep(next.step);
    setYear(next.year ?? null);
    setCourse(next.course ?? null);
    setSemester(next.semester ?? null);
    setSubject(next.subject ?? null);
    setUnit(next.unit ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pushStep = (next) => {
    window.history.pushState({ rkhubResource: true, type, ...next }, "");
    applyState(next);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api
      .getYears()
      .then((data) => {
        if (active) setYears(data);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [type]);

  useEffect(() => {
    const onPopState = (event) => {
      const state = event.state;

      if (state?.rkhubResource && state.type === type) {
        applyState(state);
        return;
      }

      go("home");
    };

    const initial = {
      step: "year",
      year: null,
      course: null,
      semester: null,
      subject: null,
      unit: null,
    };

    if (!window.history.state?.rkhubResource || window.history.state.type !== type) {
      window.history.pushState(
        { rkhubResource: true, type, ...initial },
        ""
      );
    }
    applyState(initial);

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [type]);

  useEffect(() => {
    if (!year) return;

    let active = true;
    setLoading(true);
    setError("");

    api
      .getCourses(year.year)
      .then((data) => active && setCourses(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    api
      .getSemesters(year.year)
      .then((data) => active && setSemesters(data))
      .catch((err) => active && setError(err.message));

    return () => {
      active = false;
    };
  }, [year, type]);

  useEffect(() => {
    if (!year || !course || !semester) return;

    let active = true;
    setLoading(true);
    setError("");

    api
      .getSubjects(year.year, course.code, semester.semester)
      .then((data) => active && setSubjects(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [year, course, semester]);

  useEffect(() => {
    if (!subject || type === "syllabus" || type === "pyq") return;

    let active = true;
    setLoading(true);
    setError("");

    api
      .getUnits(subject.id)
      .then((data) => active && setUnits(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [subject, type]);

  const fetchResources = () => {
    if (!subject || !year || !course || !semester) return;
    if (type === "syllabus") return;
    if (type !== "pyq" && !unit) return;

    setLoading(true);
    setError("");

    const listParams = { subjectId: subject.id };
    if (unit) listParams.unitId = unit.id;

    api
      .list(type, listParams)
      .then((data) => setResources(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources();
  }, [subject, unit, type, year, course, semester]);

  const chooseYear = (value) =>
    pushStep({
      step: "course",
      year: value,
      course: null,
      semester: null,
      subject: null,
      unit: null,
    });

  const chooseCourse = (value) =>
    pushStep({
      step: "semester",
      year,
      course: value,
      semester: null,
      subject: null,
      unit: null,
    });

  const chooseSemester = (value) =>
    pushStep({
      step: type === "syllabus" ? "syllabus-list" : "subject",
      year,
      course,
      semester: value,
      subject: null,
      unit: null,
    });

  const chooseSubject = (value) =>
    pushStep({
      step: type === "syllabus" ? "document" : type === "pyq" ? "pdf-list" : "unit",
      year,
      course,
      semester,
      subject: value,
      unit: null,
    });

  const chooseUnit = (value) =>
    pushStep({
      step: type === "syllabus" ? "document" : "pdf-list",
      year,
      course,
      semester,
      subject,
      unit: value,
    });

  const chooseBreadcrumb = (targetStep) => {
    const next = {
      step: targetStep,
      year,
      course,
      semester,
      subject,
      unit,
    };

    if (targetStep === "year") {
      next.year = null;
      next.course = null;
      next.semester = null;
      next.subject = null;
      next.unit = null;
    } else if (targetStep === "course") {
      next.course = null;
      next.semester = null;
      next.subject = null;
      next.unit = null;
    } else if (targetStep === "semester") {
      next.semester = null;
      next.subject = null;
      next.unit = null;
    } else if (targetStep === "subject" || targetStep === "syllabus-list") {
      next.subject = null;
      next.unit = null;
    }

    pushStep(next);
  };

  const breadcrumb = useMemo(() => {
    const result = [{ label: "Start", step: "year" }];
    if (year) result.push({ label: year.name, step: "course" });
    if (course) result.push({ label: course.code, step: "semester" });
    if (semester) result.push({ label: semester.name, step: type === "syllabus" ? "syllabus-list" : "subject" });
    if (subject) result.push({ label: subject.code, step: "unit" });
    if (unit) result.push({ label: unit.name, step: "unit" });
    return result;
  }, [year, course, semester, subject, unit]);

  return (
    <main className="resource-page">
      <button className="back-link" onClick={() => window.history.back()} type="button">
        <ArrowLeft size={17} />
        Back
      </button>

      <section className="page-heading">
        <div className={`page-icon ${type}`}>
          <meta.icon size={28} />
        </div>
        <div>
          <div className="eyebrow">RKhub Resources</div>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
      </section>

      <div className="breadcrumb">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight size={15} />}
            <button onClick={() => chooseBreadcrumb(item.step)} type="button">
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {error && <div className="api-error">{error}</div>}
      {loading && <div className="loading-line">Loading...</div>}

      {step === "year" && (
        <>
          {type === "syllabus" && <CompleteSyllabusCard />}
          <Selection
            title="Choose your year"
            sub="Select your academic year to continue."
          >
            <Choice
              items={years}
              labelKey="name"
              select={chooseYear}
              empty="No academic years available."
              loading={loading}
            />
          </Selection>
        </>
      )}

      {step === "course" && (
        <Selection title="Choose course" sub={`Courses available for ${year?.name}.`}>
          <Choice
            items={courses}
            labelKey="name"
            secondaryKey="code"
            select={chooseCourse}
            empty="No courses available for this year."
            loading={loading}
          />
        </Selection>
      )}

      {step === "semester" && (
        <Selection
          title="Choose semester"
          sub={`Select a semester for ${course?.code} • ${year?.name}.`}
        >
          <Choice
            items={semesters}
            labelKey="name"
            secondaryKey="semester"
            select={chooseSemester}
            empty="No semesters available."
            loading={loading}
          />
        </Selection>
      )}

      {step === "subject" && (
        <Selection
          title="Choose subject"
          sub={`${course?.code} • ${year?.name} • ${semester?.name}`}
        >
          {loading ? (
            <div className="choice-loading">
              {[1, 2, 3, 4].map((n) => <div key={n} className="choice-skeleton" />)}
            </div>
          ) : (
            <SubjectList subjects={subjects} select={chooseSubject} />
          )}
        </Selection>
      )}

      {step === "unit" && subject && (
        <Selection
          title="Choose unit"
          sub={`${subject.code} — ${subject.name}`}
        >
          <Choice
            items={units}
            labelKey="name"
            secondaryKey="unitNo"
            select={chooseUnit}
            icon={FileText}
            empty="No units available."
            loading={loading}
          />
        </Selection>
      )}

      {(step === "pdf-list" || step === "materials") && subject && (unit || type === "pyq") && (
        <ResourcePdfList
          resourceType={type}
          resources={resources}
          year={year}
          course={course}
          semester={semester}
          subject={subject}
          unit={unit}
          loading={loading}
          error={error}
          onUploaded={fetchResources}
          onBack={() => window.history.back()}
        />
      )}

      {step === "document" && subject && (
        <Document
          type={type}
          year={year}
          course={course}
          semester={semester}
          subject={subject}
          unit={unit}
          onBack={() => window.history.back()}
        />
      )}

      {step === "syllabus-list" && year && course && semester && (
        <SyllabusList
          year={year}
          course={course}
          semester={semester}
          subjects={subjects}
          onBack={() => window.history.back()}
        />
      )}
    </main>
  );
}
