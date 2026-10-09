import React from "react";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  GraduationCap,
  Library,
  Search,
  Sparkles,
} from "lucide-react";
import { AiComposer } from "../components/AiComposer";
import { tones } from "../constants/resources";

export function Home({ prompt, setPrompt, notice, submit, go, aiResult }) {
  const resources = [
    ["Notes", "College notes and study materials", FileText, "notes"],
    ["PYQs", "Previous year question papers", Search, "pyq"],
    ["Syllabus", "Course and subject syllabus", GraduationCap, "syllabus"],
    ["Reference Material", "Additional reference materials", Library, "reference"],
  ];

  return (
    <main>
      <a
        className="academiq-strip"
        href="https://academiq-6ch.pages.dev/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="academiq-strip-left">
          <GraduationCap size={16} aria-hidden="true" />
          <span className="academiq-strip-title">Study smarter with <strong>AcademIQ</strong></span>
          <span className="academiq-strip-divider" aria-hidden="true" />
          <span className="academiq-strip-sub">Upload your study materials, learn with AI, and test your knowledge.</span>
        </span>
        <span className="academiq-strip-link">
          Visit AcademIQ <ExternalLink size={12} aria-hidden="true" />
        </span>
      </a>

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

        <AiComposer
          prompt={prompt}
          setPrompt={setPrompt}
          notice={notice}
          submit={submit}
          go={go}
          aiResult={aiResult}
        />
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
              <Icon size={26} />
            </span>
            <div className="resource-card-content">
              <h2>{title}</h2>
              <p>{desc}</p>
            </div>
            <span className={`resource-arrow ${tones[i]}`}>
              <ArrowRight size={18} />
            </span>
          </button>
        ))}
      </section>
    </main>
  );
}
