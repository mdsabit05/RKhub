import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Library,
  Menu,
  Paperclip,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { createRoot } from "react-dom/client";
import { api } from "./api";
import "./styles.css";

const resourceMeta = {
  notes: {
    title: "College Notes",
    description: "Access official college notes unit by unit.",
    icon: FileText,
  },
  pyqs: {
    title: "Previous Year Questions",
    description: "Browse question papers by semester, subject and unit.",
    icon: Search,
  },
  syllabus: {
    title: "College Syllabus",
    description: "Find the syllabus for your course and subject.",
    icon: GraduationCap,
  },
  reference: {
    title: "Reference Material",
    description: "Find books, PDFs and useful links by unit.",
    icon: Library,
  },
};

const tones = ["green", "orange", "purple", "pink"];

function App() {
  const [page, setPage] = useState("home");
  const [menu, setMenu] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");

  const go = (nextPage) => {
    if (nextPage !== page) {
      window.history.pushState({ rkhubPage: nextPage }, "");
    }
    setPage(nextPage);
    setMenu(false);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPopState = (event) => {
      if (event.state?.rkhubPage) {
        setPage(event.state.rkhubPage);
      } else {
        setPage("home");
      }
      setMenu(false);
      setNotice("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!window.history.state?.rkhubPage) {
      window.history.replaceState({ rkhubPage: "home" }, "");
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const submit = () => {
    if (!prompt.trim()) {
      setNotice("Type what you need first.");
      return;
    }
    setNotice(`Demo request received: "${prompt.trim()}"`);
  };

  return (
    <div className="app-shell">
      <Header page={page} menu={menu} setMenu={setMenu} go={go} />
      {page === "home" ? (
        <Home
          prompt={prompt}
          setPrompt={setPrompt}
          notice={notice}
          submit={submit}
          go={go}
        />
      ) : (
        <ResourcePage type={page} go={go} />
      )}
      <footer className="footer">
        <span>RKhub</span>
        <span>Rajkumar College of IT and Management</span>
      </footer>
    </div>
  );
}

function Header({ page, menu, setMenu, go }) {
  return (
    <header className="header">
      <button className="brand brand-button" onClick={() => go("home")} type="button">
        <div className="brand-mark">
          <GraduationCap size={27} />
        </div>
        <div>
          <div className="brand-name">RKhub</div>
          <div className="brand-subtitle">
            Rajkumar College of IT and Management
          </div>
        </div>
      </button>

      <nav className={`nav ${menu ? "nav-open" : ""}`}>
        <button
          className={`nav-link ${page === "home" ? "active" : ""}`}
          onClick={() => go("home")}
          type="button"
        >
          Home
        </button>
        <button
          className={`nav-link ${page !== "home" ? "active" : ""}`}
          onClick={() => go("notes")}
          type="button"
        >
          Resources
        </button>
      </nav>

      <div className="profile">
        <div className="profile-avatar">S</div>
        <span>Hello, Student</span>
        <span className="chevron">⌄</span>
      </div>

      <button
        className="menu-button"
        onClick={() => setMenu((v) => !v)}
        type="button"
        aria-label="Toggle menu"
      >
        {menu ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
}

function Home({ prompt, setPrompt, notice, submit, go }) {
  const suggestions = [
    ["Give me BCA 2nd year DBMS Unit 1 notes", "notes"],
    ["Find the 2025 DBMS PYQ", "pyqs"],
    ["Show me BCA 2nd year DBMS syllabus", "syllabus"],
    ["Give me DBMS Unit 2 reference material", "reference"],
    ["Predict my upcoming DBMS exam questions", "predict"],
  ];

  const resources = [
    ["Notes", "College notes and study materials", FileText, "notes"],
    ["PYQs", "Previous year question papers", Search, "pyqs"],
    ["Syllabus", "Course and subject syllabus", GraduationCap, "syllabus"],
    ["Reference Material", "Additional reference materials", Library, "reference"],
  ];

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="assistant-pill">
            <Sparkles size={16} />
            <span>Your AI Academic Assistant</span>
          </div>

          <h1>
            What do u <span>want?</span>
          </h1>

          <p>
            Ask about your college notes, PYQs, syllabus, reference material,
            or predict your upcoming exam questions.
          </p>
        </div>

        <div className="ai-composer">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="What do u want?"
            aria-label="Ask RKhub"
          />

          <div className="composer-footer">
            <button className="attach-button" type="button">
              <Paperclip size={18} />
              <span>Attach (optional)</span>
            </button>

            <button className="ask-button" onClick={submit} type="button">
              <Send size={17} />
              <span>Ask</span>
            </button>
          </div>
        </div>

        {notice && <div className="demo-notice">{notice}</div>}

        <div className="suggestions">
          <div className="suggestion-label">
            <Sparkles size={17} />
            <span>Try asking</span>
          </div>

          <div className="suggestion-grid">
            {suggestions.map(([text, target], i) => {
              const Icon =
                i === 0
                  ? FileText
                  : i === 1
                    ? Search
                    : i === 2
                      ? GraduationCap
                      : i === 3
                        ? BookOpen
                        : Sparkles;

              return (
                <button
                  className="suggestion"
                  key={text}
                  onClick={() => {
                    if (target === "predict") {
                      setPrompt(text);
                    } else {
                      go(target);
                    }
                  }}
                  type="button"
                >
                  <span className={`suggestion-icon ${tones[i % tones.length]}`}>
                    <Icon size={17} />
                  </span>
                  <span className="suggestion-text">{text}</span>
                  <ArrowRight size={17} className="suggestion-arrow" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="resource-grid">
        {resources.map(([title, desc, Icon, target], i) => (
          <button
            className="resource-card"
            key={title}
            onClick={() => go(target)}
            type="button"
          >
            <span className={`resource-icon ${tones[i]}`}>
              <Icon size={28} />
            </span>
            <h2>{title}</h2>
            <p>{desc}</p>
            <span className={`resource-arrow ${tones[i]}`}>
              <ArrowRight size={19} />
            </span>
          </button>
        ))}
      </section>
    </main>
  );
}

function ResourcePage({ type, go }) {
  const meta = resourceMeta[type];
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

  // Browser-history based selection stack.
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

  const pushStep = (next) => {
    window.history.pushState({ rkhubResource: true, type, ...next }, "");
    applyState(next);
  };

  const applyState = (next) => {
    setStep(next.step);
    setYear(next.year ?? null);
    setCourse(next.course ?? null);
    setSemester(next.semester ?? null);
    setSubject(next.subject ?? null);
    setUnit(next.unit ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    if (!subject || type === "syllabus") return;

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

  useEffect(() => {
    if (!subject || !year || !course || !semester || !unit) return;
    if (type !== "reference") return;

    let active = true;
    setLoading(true);
    setError("");

    api
      .list("reference", { subjectId: subject.id, unitId: unit.id })
      .then((data) => active && setResources(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
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

  const chooseCourse = (value) => {
    if (type === "notes") {
      // Notes still use Year → Course → Semester → Subject → Unit.
      pushStep({
        step: "semester",
        year,
        course: value,
        semester: null,
        subject: null,
        unit: null,
      });
      return;
    }

    pushStep({
      step: "semester",
      year,
      course: value,
      semester: null,
      subject: null,
      unit: null,
    });
  };

  const chooseSemester = (value) =>
    pushStep({
      step: "subject",
      year,
      course,
      semester: value,
      subject: null,
      unit: null,
    });

  const chooseSubject = (value) =>
    pushStep({
      step: type === "syllabus" ? "document" : "unit",
      year,
      course,
      semester,
      subject: value,
      unit: null,
    });

  const chooseUnit = (value) =>
    pushStep({
      step: type === "reference" ? "materials" : "document",
      year,
      course,
      semester,
      subject,
      unit: value,
    });

  const reset = () =>
    pushStep({
      step: "year",
      year: null,
      course: null,
      semester: null,
      subject: null,
      unit: null,
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
    } else if (targetStep === "subject") {
      next.subject = null;
      next.unit = null;
    }

    pushStep(next);
  };

  const breadcrumb = useMemo(() => {
    const result = [{ label: "Start", step: "year" }];
    if (year) result.push({ label: year.name, step: "course" });
    if (course) result.push({ label: course.code, step: "semester" });
    if (semester) result.push({ label: semester.name, step: "subject" });
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
        <Selection
          title="Choose your year"
          sub="Select your academic year to continue."
        >
          <Choice
            items={years}
            labelKey="name"
            select={chooseYear}
            empty="No academic years available."
          />
        </Selection>
      )}

      {step === "course" && (
        <Selection title="Choose course" sub={`Courses available for ${year?.name}.`}>
          <Choice
            items={courses}
            labelKey="name"
            secondaryKey="code"
            select={chooseCourse}
            empty="No courses available for this year."
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
          />
        </Selection>
      )}

      {step === "subject" && (
        <Selection
          title="Choose subject"
          sub={`${course?.code} • ${year?.name} • ${semester?.name}`}
        >
          <SubjectList subjects={subjects} select={chooseSubject} />
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
          />
        </Selection>
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

      {step === "materials" && subject && unit && (
        <Materials
          course={course}
          year={year}
          semester={semester}
          subject={subject}
          unit={unit}
          resources={resources}
          loading={loading}
        />
      )}
    </main>
  );
}

function Selection({ title, sub, children }) {
  return (
    <section className="selection-section">
      <div className="selection-heading">
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {children}
    </section>
  );
}

function Choice({
  items,
  select,
  labelKey,
  secondaryKey,
  icon: Icon = ChevronRight,
  empty,
}) {
  if (!items?.length) return <div className="empty-state">{empty}</div>;

  return (
    <div className="choice-grid">
      {items.map((item) => (
        <button
          className="choice-card"
          key={item.id ?? item.code ?? item.name}
          onClick={() => select(item)}
          type="button"
        >
          <div className="choice-content">
            {secondaryKey && (
              <span className="choice-code">
                {item[secondaryKey]}
              </span>
            )}
            <span>{item[labelKey]}</span>
          </div>
          <Icon size={19} />
        </button>
      ))}
    </div>
  );
}

function SubjectList({ subjects, select }) {
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

function Document({ type, year, course, semester, subject, unit, onBack }) {
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

  const resourceUrl = resource?.fileUrl || resource?.externalUrl;

  return (
    <section className="document-panel">
      <div className="document-preview">
        <FileText size={48} />
        <span>PDF</span>
      </div>

      <div className="document-info">
        <div className="eyebrow">
          {type === "notes" ? "College Notes" : type === "pyqs" ? "Previous Year Question Paper" : "College Syllabus"}
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

function Materials({ course, year, semester, subject, unit, resources, loading }) {
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
          const url = resource.fileUrl || resource.externalUrl;
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

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
