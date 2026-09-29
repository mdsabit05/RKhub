import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";
import { api } from "../api";
import { Choice } from "../components/Choice";
import { Document } from "../components/Document";
import { Materials } from "../components/Materials";
import { Selection } from "../components/Selection";
import { SubjectList } from "../components/SubjectList";
import { resourceMeta } from "../constants/resources";

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

  const fetchMaterials = () => {
    if (!subject || !year || !course || !semester || !unit) return;
    if (type !== "reference") return;

    setLoading(true);
    setError("");

    api
      .list("reference", { subjectId: subject.id, unitId: unit.id })
      .then((data) => setResources(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
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
          onUploaded={fetchMaterials}
        />
      )}
    </main>
  );
}
