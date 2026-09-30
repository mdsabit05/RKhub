import { query } from "./src/db.js";
import app from "./src/app.js";

async function runTests() {
  console.log("=== STARTING OWNERSHIP AND DELETE E2E TESTS ===");
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
    // 1. Fetch academic year, course, semester, subject, unit
    const years = await query("SELECT year_no FROM academic_years LIMIT 1");
    const courses = await query("SELECT code FROM courses LIMIT 1");
    const semesters = await query("SELECT semester_no FROM semesters WHERE year_no = $1 LIMIT 1", [years[0].year_no]);
    const subjects = await query("SELECT id, code FROM subjects WHERE year_no = $1 AND semester_no = $2 LIMIT 1", [years[0].year_no, semesters[0].semester_no]);
    const units = await query("SELECT id FROM units WHERE subject_id = $1 LIMIT 1", [subjects[0].id]);

    const testSubject = subjects[0];
    const testUnit = units[0];
    const testYear = years[0].year_no;
    const testSem = semesters[0].semester_no;
    const testCourse = courses[0].code;

    console.log(`Testing with Course: ${testCourse}, Year: ${testYear}, Sem: ${testSem}, Subject: ${testSubject.code}, Unit: ${testUnit?.id}`);

    // Create mock PDF
    const dummyPdfContent = "%PDF-1.4\n1 0 obj\n<< /Title (Test Unit Notes) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF";
    
    // User A and User B tokens
    const userAToken = "test:user_a_123:Sabit Raza";
    const userBToken = "test:user_b_456:Ankit Kumar";

    // Test 1: Upload without auth fails (or requires admin/user)
    const formAnon = new FormData();
    formAnon.append("resourceType", "notes");
    formAnon.append("year", String(testYear));
    formAnon.append("course", testCourse);
    formAnon.append("semester", String(testSem));
    formAnon.append("subjectId", String(testSubject.id));
    if (testUnit) formAnon.append("unitId", String(testUnit.id));
    formAnon.append("title", "Anonymous Upload Attempt");
    formAnon.append("file", new Blob([dummyPdfContent], { type: "application/pdf" }), "test-anon.pdf");

    const resAnon = await app.request("/api/resources/upload", {
      method: "POST",
      body: formAnon,
    });
    assert(resAnon.status === 401, "Upload without authentication returns 401 Unauthorized");

    // Test 2: User A uploads a PDF
    const formUserA = new FormData();
    formUserA.append("resourceType", "notes");
    formUserA.append("year", String(testYear));
    formUserA.append("course", testCourse);
    formUserA.append("semester", String(testSem));
    formUserA.append("subjectId", String(testSubject.id));
    if (testUnit) formUserA.append("unitId", String(testUnit.id));
    formUserA.append("title", "Unit 1 Notes by User A");
    // Attempt to fake uploaded_by from frontend to ensure it gets ignored
    formUserA.append("uploaded_by", "fake_user_id");
    formUserA.append("file", new Blob([dummyPdfContent], { type: "application/pdf" }), "unit-1-notes.pdf");

    const resUploadA = await app.request("/api/resources/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
      body: formUserA,
    });

    assert(resUploadA.status === 201, `User A upload returns 201 Created (got ${resUploadA.status})`);
    const uploadDataA = await resUploadA.json();
    const resourceA = uploadDataA.resource;
    assert(resourceA && resourceA.id, "Resource ID is returned");
    assert(resourceA.uploadedBy === "user_a_123", `uploaded_by is User A's ID (expected user_a_123, got ${resourceA.uploadedBy})`);
    assert(Number(resourceA.fileSize) > 0, `file_size is recorded (${resourceA.fileSize} bytes)`);

    // Verify in database directly
    const dbRows = await query("SELECT id, title, uploaded_by, file_size, file_url FROM resources WHERE id = $1", [resourceA.id]);
    assert(dbRows.length === 1, "Resource found in PostgreSQL");
    assert(dbRows[0].uploaded_by === "user_a_123", "PostgreSQL accurately saved uploaded_by = user_a_123");

    // Test 3: List endpoint returns uploadedBy, uploaderName, fileSize
    const resList = await app.request(`/api/resources/list?type=notes&subjectId=${testSubject.id}&unitId=${testUnit.id}`);
    assert(resList.status === 200, "GET /api/resources/list returns 200 OK");
    const listJson = await resList.json();
    const foundInList = listJson.resources.find(r => r.id === resourceA.id);
    assert(Boolean(foundInList), "Resource appears in list");
    assert(foundInList?.uploadedBy === "user_a_123", "List item has uploadedBy = user_a_123");
    assert(foundInList?.uploaderName === "Sabit Raza", `List item has uploaderName = Sabit Raza (got ${foundInList?.uploaderName})`);

    // Test 4: User B attempts to delete User A's resource -> 403 Forbidden
    const resDeleteByB = await app.request(`/api/resources/${resourceA.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userBToken}`,
      },
    });
    assert(resDeleteByB.status === 403, `User B deleting User A's resource returns 403 Forbidden (got ${resDeleteByB.status})`);
    const deleteByBJson = await resDeleteByB.json();
    assert(deleteByBJson.error === "You can only delete resources uploaded by you.", "Correct error message returned");

    // Test 5: Verify resource still exists in DB
    const checkAfterB = await query("SELECT id FROM resources WHERE id = $1", [resourceA.id]);
    assert(checkAfterB.length === 1, "Resource still exists in database after forbidden attempt");

    // Test 6: Attempting to fake userId via query or body does NOT bypass check
    const resFakeQuery = await app.request(`/api/resources/${resourceA.id}?userId=user_a_123`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ userId: "user_a_123", uploaded_by: "user_a_123" }),
    });
    assert(resFakeQuery.status === 403, "Query parameter / body userId spoofing blocked with 403 Forbidden");

    // Test 7: Anonymous user attempts DELETE -> 401 Unauthorized
    const resDeleteAnon = await app.request(`/api/resources/${resourceA.id}`, {
      method: "DELETE",
    });
    assert(resDeleteAnon.status === 401, "Unauthenticated delete returns 401 Unauthorized");

    // Test 8: User A deletes their own resource -> 200 OK
    const resDeleteByA = await app.request(`/api/resources/${resourceA.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(resDeleteByA.status === 200, `User A deleting own resource returns 200 OK (got ${resDeleteByA.status})`);

    // Test 9: Verify PostgreSQL record is removed
    const checkAfterA = await query("SELECT id FROM resources WHERE id = $1", [resourceA.id]);
    assert(checkAfterA.length === 0, "Resource record removed from PostgreSQL");

    // Test 10: Deleting already deleted / non-existent resource returns 404
    const resDeleteAgain = await app.request(`/api/resources/${resourceA.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(resDeleteAgain.status === 404, "Deleting non-existent resource returns 404 Not Found");

    // Test 11: Legacy resources without uploader cannot be deleted by students
    const legacyInsert = await query(
      `INSERT INTO resources (resource_type, subject_id, unit_id, year_no, semester_no, title, file_url, uploaded_by)
       VALUES ('notes', $1, $2, $3, $4, 'Legacy Notes', 'https://example.com/legacy.pdf', NULL)
       RETURNING id`,
      [testSubject.id, testUnit.id, testYear, testSem]
    );
    const legacyId = legacyInsert[0].id;

    const resDeleteLegacy = await app.request(`/api/resources/${legacyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userAToken}`,
      },
    });
    assert(resDeleteLegacy.status === 403, "Student attempting to delete legacy resource returns 403 Forbidden");

    // Clean up legacy test row
    await query("DELETE FROM resources WHERE id = $1", [legacyId]);

    console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  }
}

runTests();
