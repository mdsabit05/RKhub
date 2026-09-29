import React, { useRef, useState } from "react";
import {
  ExternalLink,
  FileText,
  GraduationCap,
  Paperclip,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { API_URL } from "../api";

export function AiComposer({ prompt, setPrompt, notice, submit, go, aiResult }) {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedContext, setAttachedContext] = useState({
    course: null,
    year: null,
    semester: null,
  });

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          text: event.target?.result || "",
        });
      };
      reader.readAsText(file);
    } else {
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    setShowAttachMenu(false);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearContext = () => {
    setAttachedContext({ course: null, year: null, semester: null });
  };

  const activeAttachmentCount =
    (attachedFile ? 1 : 0) +
    (attachedContext.course || attachedContext.year || attachedContext.semester ? 1 : 0);

  const handleSubmit = () => {
    submit({
      course: attachedContext.course,
      year: attachedContext.year,
      semester: attachedContext.semester,
      attachmentName: attachedFile?.name,
      attachmentText: attachedFile?.text,
    });
  };

  return (
    <>
      <div className="ai-composer">
        {/* Active Attachments Bar */}
        {(attachedFile || attachedContext.course || attachedContext.year || attachedContext.semester) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: "1px dashed #e2e8f0",
            }}
          >
            {attachedFile && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  background: "#edf5ef",
                  border: "1px solid #cce5d4",
                  borderRadius: 999,
                  color: "#0f513f",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <FileText size={13} />
                <span>
                  {attachedFile.name} ({(attachedFile.size / 1024).toFixed(0)} KB)
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#0f513f",
                    cursor: "pointer",
                    padding: 0,
                    display: "grid",
                    placeItems: "center",
                  }}
                  title="Remove file attachment"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {(attachedContext.course || attachedContext.year || attachedContext.semester) && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 999,
                  color: "#166534",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <GraduationCap size={13} />
                <span>
                  {[
                    attachedContext.course,
                    attachedContext.year && `${attachedContext.year} Year`,
                    attachedContext.semester && `Sem ${attachedContext.semester}`,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
                <button
                  type="button"
                  onClick={handleClearContext}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#166534",
                    cursor: "pointer",
                    padding: 0,
                    display: "grid",
                    placeItems: "center",
                  }}
                  title="Remove academic context filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}
          </div>
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="What do u want? (e.g. 'BCA 2nd year DBMS notes' or 'Predict DBMS exam questions')"
          aria-label="Ask RKhub"
        />

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.json,.md,.csv"
          style={{ display: "none" }}
        />

        <div className="composer-footer" style={{ position: "relative" }}>
          <button
            className="attach-button"
            type="button"
            onClick={() => setShowAttachMenu((prev) => !prev)}
            title="Attach a document or filter by academic context"
            style={{
              background: activeAttachmentCount > 0 ? "#edf5ef" : "#f8f8f6",
              borderColor: activeAttachmentCount > 0 ? "#0f766e" : "#dedfdc",
              color: activeAttachmentCount > 0 ? "#0f513f" : "#344054",
            }}
          >
            <Paperclip size={18} />
            <span>
              {activeAttachmentCount > 0
                ? `Attached (${activeAttachmentCount})`
                : "Attach (optional)"}
            </span>
          </button>

          <button className="ask-button" onClick={handleSubmit} type="button">
            <Send size={17} />
            <span>Ask</span>
          </button>

          {/* Attachment Context Modal / Popover */}
          {showAttachMenu && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 12px)",
                left: 0,
                width: "min(380px, 92vw)",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 14,
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.14)",
                padding: 16,
                zIndex: 60,
                display: "grid",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f513f", display: "flex", alignItems: "center", gap: 6 }}>
                  <Paperclip size={15} />
                  Attach File or Academic Context
                </div>
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(false)}
                  style={{ border: 0, background: "transparent", color: "#64748b", cursor: "pointer", padding: 2 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Option 1: File Upload */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#475467", marginBottom: 6 }}>
                  1. Document / Notes File
                </div>
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%",
                    minHeight: 40,
                    fontSize: 13,
                    justifyContent: "flex-start",
                    padding: "0 12px",
                  }}
                >
                  <Upload size={15} />
                  <span>Choose file (.pdf, .txt, .docx, images)</span>
                </button>
              </div>

              {/* Option 2: Target Academic Context */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#475467", marginBottom: 8 }}>
                  2. Target Academic Context (Optional)
                </div>

                {/* Course */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Course:</span>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    {["BCA", "BBA"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setAttachedContext((prev) => ({
                            ...prev,
                            course: prev.course === c ? null : c,
                          }))
                        }
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          border: "1px solid",
                          borderColor: attachedContext.course === c ? "#0f766e" : "#cbd5e1",
                          background: attachedContext.course === c ? "#edf5ef" : "#ffffff",
                          color: attachedContext.course === c ? "#0f513f" : "#334155",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Year:</span>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    {[1, 2, 3].map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() =>
                          setAttachedContext((prev) => ({
                            ...prev,
                            year: prev.year === y ? null : y,
                          }))
                        }
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          border: "1px solid",
                          borderColor: attachedContext.year === y ? "#0f766e" : "#cbd5e1",
                          background: attachedContext.year === y ? "#edf5ef" : "#ffffff",
                          color: attachedContext.year === y ? "#0f513f" : "#334155",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        {y === 1 ? "1st Yr" : y === 2 ? "2nd Yr" : "3rd Yr"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Semester:</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setAttachedContext((prev) => ({
                            ...prev,
                            semester: prev.semester === s ? null : s,
                          }))
                        }
                        style={{
                          padding: "4px 8px",
                          borderRadius: 8,
                          border: "1px solid",
                          borderColor: attachedContext.semester === s ? "#0f766e" : "#cbd5e1",
                          background: attachedContext.semester === s ? "#edf5ef" : "#ffffff",
                          color: attachedContext.semester === s ? "#0f513f" : "#334155",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Sem {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="primary-action"
                onClick={() => setShowAttachMenu(false)}
                style={{
                  minHeight: 38,
                  fontSize: 13,
                  marginTop: 6,
                  cursor: "pointer",
                }}
              >
                Apply Attachments
              </button>
            </div>
          )}
        </div>
      </div>

      {notice && <div className="demo-notice">{notice}</div>}

      {aiResult && (
        <div
          style={{
            marginTop: 16,
            padding: 20,
            borderRadius: 16,
            background: "#fbfaf7",
            border: "1px solid #dfe4dc",
            boxShadow: "0 8px 24px rgba(17, 24, 39, 0.05)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, color: "#0f513f", marginBottom: 10 }}>
            {aiResult.message}
          </div>

          {aiResult.resource && (
            <div style={{ display: "grid", gap: 8, color: "#334155", marginTop: 8 }}>
              {aiResult.resource.title && (
                <div>
                  <strong>Title:</strong> {aiResult.resource.title}
                </div>
              )}
              {aiResult.resource.subjectName && (
                <div>
                  <strong>Subject:</strong> {aiResult.resource.subjectCode} — {aiResult.resource.subjectName}
                </div>
              )}
              {aiResult.resource.unitName && (
                <div>
                  <strong>Unit:</strong> {aiResult.resource.unitName}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {aiResult.resource.fileUrl && (
                  <a
                    className="primary-action"
                    href={
                      aiResult.resource.fileUrl.startsWith("/")
                        ? `${API_URL}${aiResult.resource.fileUrl}`
                        : aiResult.resource.fileUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />
                    Open PDF
                  </a>
                )}
                {aiResult.resource.externalUrl && (
                  <a
                    className="primary-action"
                    href={aiResult.resource.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />
                    Open Link
                  </a>
                )}
              </div>
            </div>
          )}

          {aiResult.prediction && (
            <div style={{ marginTop: 14, display: "grid", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
              <div>
                <strong>Predicted Subject:</strong> {aiResult.prediction.subject}
              </div>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                <strong>Basis:</strong> {aiResult.prediction.basis}
              </div>

              {aiResult.prediction.aiAnalysis && (
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    fontSize: 14,
                    color: "#1e293b",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#0f766e", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={16} />
                    AI Academic Exam Forecast
                  </div>
                  {aiResult.prediction.aiAnalysis}
                </div>
              )}

              {aiResult.prediction.questions?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Core Predicted Topics / Questions:</div>
                  <ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 6, color: "#334155" }}>
                    {aiResult.prediction.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
