import { query } from "./src/db.js";
import app from "./src/app.js";

async function runComprehensiveTests() {
  console.log("=== COMPREHENSIVE E2E VERIFICATION FOR NOTES, PYQ, AND REFERENCE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Get test academic metadata
    const years = await query("SELECT year_no FROM academic_years LIMIT 1");
    const courses = await query("SELECT code FROM courses LIMIT 1");
    const semesters = await query("SELECT semester_no FROM semesters WHERE year_no = $1 LIMIT 1", [years[0].year_no]);
    const subjects = await query("SELECT id, code FROM subjects WHERE year_no = $1 AND semester_no = $2 LIMIT 1", [years[0].year_no, semesters[0].semester_no]);
    const units = await query("SELECT id, unit_no FROM units WHERE subject_id = $1 LIMIT 1", [subjects[0].id]);

    const y = years[0].year_no;
    const c = courses[0].code;
    const s = semesters[0].semester_no;
    const sub = subjects[0];
    const u = units[0];

    console.log(`Testing with Course: ${c}, Year: ${y}, Semester: ${s}, Subject: ${sub.code}, Unit: ${u.unit_no}`);

    const userAToken = "test:user_a_sabit:Sabit Raza";
    const userBToken = "test:user_b_ankit:Ankit Kumar";

    const dummyPdf = "%PDF-1.4\n1 0 obj\n<< /Title (Notes PDF) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF";

    const typesToTest = ["notes", "pyq", "reference"];

    for (const rType of typesToTest) {
      console.log(`\n--- Testing Resource Type: ${rType.toUpperCase()} ---`);

      // 1. User A uploads PDF 1
      const form1 = new FormData();
      form1.append("resourceType", rType);
      form1.append("year", String(y));
      form1.append("course", c);
      form1.append("semester", String(s));
      form1.append("subjectId", String(sub.id));
      form1.append("unitId", String(u.id));
      form1.append("title", `${rType.toUpperCase()} - Complete Unit ${u.unit_no}`);
      form1.append("file", new Blob([dummyPdf], { type: "application/pdf" }), `${rType}-1.pdf`);

      const resUp1 = await app.request("/api/resources/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${userAToken}` },
        body: form1,
      });
      assert(resUp1.status === 201, `${rType} PDF 1 uploaded by User A (201)`);
      const data1 = await resUp1.json();
      const id1 = data1.resource.id;

      // 2. User B uploads PDF 2 for the same unit
      const form2 = new FormData();
      form2.append("resourceType", rType);
      form2.append("year", String(y));
      form2.append("course", c);
      form2.append("semester", String(s));
      form2.append("subjectId", String(sub.id));
      form2.append("unitId", String(u.id));
      form2.append("title", `${rType.toUpperCase()} - Handwritten Summary`);
      form2.append("file", new Blob([dummyPdf], { type: "application/pdf" }), `${rType}-2.pdf`);

      const resUp2 = await app.request("/api/resources/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${userBToken}` },
        body: form2,
      });
      assert(resUp2.status === 201, `${rType} PDF 2 uploaded by User B (201)`);
      const data2 = await resUp2.json();
      const id2 = data2.resource.id;

      // 3. Verify List returns both PDFs
      const resList = await app.request(`/api/resources/list?type=${rType}&subjectId=${sub.id}&unitId=${u.id}`);
      assert(resList.status === 200, `List ${rType} returns 200`);
      const listJson = await resList.json();
      const list = listJson.resources;
      assert(list.length >= 2, `List has multiple PDFs (count: ${list.length})`);

      const item1 = list.find(r => r.id === id1);
      const item2 = list.find(r => r.id === id2);
      assert(Boolean(item1), `PDF 1 found in ${rType} list`);
      assert(Boolean(item2), `PDF 2 found in ${rType} list`);

      assert(item1.uploadedBy === "user_a_sabit", `PDF 1 uploader is user_a_sabit`);
      assert(item1.uploaderName === "Sabit Raza", `PDF 1 uploader name is Sabit Raza`);
      assert(item2.uploadedBy === "user_b_ankit", `PDF 2 uploader is user_b_ankit`);
      assert(item2.uploaderName === "Ankit Kumar", `PDF 2 uploader name is Ankit Kumar`);
      assert(Number(item1.fileSize) > 0, `PDF 1 file size recorded: ${item1.fileSize} bytes`);

      // 4. Authorization check: User B tries to delete PDF 1 (owned by User A) -> 403
      const resDelForbidden = await app.request(`/api/resources/${id1}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      assert(resDelForbidden.status === 403, `User B forbidden from deleting User A's ${rType} PDF (403)`);

      // 5. User A deletes PDF 1 -> 200
      const resDelSuccess = await app.request(`/api/resources/${id1}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      assert(resDelSuccess.status === 200, `User A successfully deleted their own ${rType} PDF (200)`);

      // 6. User B deletes PDF 2 -> 200
      const resDelSuccess2 = await app.request(`/api/resources/${id2}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      assert(resDelSuccess2.status === 200, `User B successfully deleted their own ${rType} PDF (200)`);

      // 7. Verify both removed from DB
      const remaining = await query("SELECT id FROM resources WHERE id IN ($1, $2)", [id1, id2]);
      assert(remaining.length === 0, `Both test PDFs removed from database`);
    }

    console.log(`\n=== FINAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runComprehensiveTests();
