import React from "react";
import {
  ArrowRight,
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
