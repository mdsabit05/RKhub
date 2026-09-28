import "dotenv/config";
import app from "./src/app.js";

async function runTests() {
  console.log("=== RUNNING RKHUB E2E TEST SUITE ===");

  // 1. Health check
  const healthRes = await app.request("/health");
  const healthData = await healthRes.json();
  console.log("1. Health check:", healthRes.status, healthData);
  if (!healthData.ok) throw new Error("Health check failed");

  // 2. Years
  const yearsRes = await app.request("/api/resources/years");
  const yearsData = await yearsRes.json();
  console.log("2. Years fetched:", yearsData.length, "years");

  // 3. Admin verify with wrong key
  const badAuthRes = await app.request("/api/admin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "wrong-passcode" }),
  });
  console.log("3. Admin wrong key status:", badAuthRes.status, "(expected 401)");
  if (badAuthRes.status !== 401) throw new Error("Expected 401 for wrong admin key");

  // 4. Admin verify with correct key
  const goodAuthRes = await app.request("/api/admin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "rkhub-admin-2026" }),
  });
  const goodAuthData = await goodAuthRes.json();
  console.log("4. Admin correct key status:", goodAuthRes.status, goodAuthData);
  if (!goodAuthData.ok) throw new Error("Expected ok: true for correct admin key");

  // 5. Upload without admin key (must reject 401)
  const fakeFormData = new FormData();
  fakeFormData.append("resourceType", "notes");
  fakeFormData.append("year", "2");
  fakeFormData.append("course", "BCA");
  fakeFormData.append("semester", "3");
  fakeFormData.append("subjectId", "1");
  fakeFormData.append("unitId", "1");
  fakeFormData.append("title", "Test Upload");
  fakeFormData.append("file", new Blob(["%PDF-1.4 test"], { type: "application/pdf" }), "test.pdf");

  const unauthUploadRes = await app.request("/api/resources/upload", {
    method: "POST",
    body: fakeFormData,
  });
  console.log("5. Upload without admin key:", unauthUploadRes.status, "(expected 401)");
  if (unauthUploadRes.status !== 401) throw new Error("Expected 401 for unauthenticated upload");

  // 6. Upload with admin key
  const authUploadRes = await app.request("/api/resources/upload", {
    method: "POST",
    headers: {
      "x-admin-key": "rkhub-admin-2026",
    },
    body: fakeFormData,
  });
  const authUploadData = await authUploadRes.json();
  console.log("6. Upload with admin key:", authUploadRes.status, authUploadData.message, authUploadData.fileUrl);
  if (authUploadRes.status !== 201) throw new Error("Expected 201 for authenticated upload");

  // 7. AI Chat: notes lookup
  const notesAiRes = await app.request("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Give me BCA 2nd year DBMS Unit 1 notes" }),
  });
  const notesAiData = await notesAiRes.json();
  console.log("7. AI Notes query found:", notesAiData.found, "title:", notesAiData.resource?.title);
  if (!notesAiData.found) throw new Error("AI query for notes failed");

  // 8. AI Chat: question paper prediction
  const predictAiRes = await app.request("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Predict upcoming BCA 2nd year DBMS question paper" }),
  });
  const predictAiData = await predictAiRes.json();
  console.log("8. AI Predict query found:", predictAiData.found, "subject:", predictAiData.prediction?.subject);
  if (!predictAiData.found) throw new Error("AI prediction query failed");

  console.log("=== ALL 8 E2E TESTS PASSED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
