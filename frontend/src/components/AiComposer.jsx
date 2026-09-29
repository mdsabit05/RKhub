import React from "react";
import { ExternalLink, Send, Sparkles } from "lucide-react";
import { API_URL } from "../api";

export function AiComposer({ prompt, setPrompt, notice, submit, go, aiResult }) {
  return (
    <>
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
          placeholder="What do u want? (e.g. 'BCA 2nd year DBMS notes' or 'Predict DBMS exam questions')"
          aria-label="Ask RKhub"
        />

        <div className="composer-footer" style={{ justifyContent: "flex-end" }}>
          <button className="ask-button" onClick={submit} type="button">
            <Send size={17} />
            <span>Ask</span>
          </button>
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
