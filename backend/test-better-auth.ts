import "dotenv/config";
import app from "./src/app.js";
import { pool, query } from "./src/db.js";

async function run() {
  console.log("==========================================");
  console.log("RKhub Better Auth Integration Test Suite");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      failed++;
    }
  }

  const testUserA = {
    name: "Student Alpha",
    email: `alpha_${Date.now()}@rkhub.test`,
    password: "Password123!",
  };

  const testUserB = {
    name: "Student Beta",
    email: `beta_${Date.now()}@rkhub.test`,
    password: "Password123!",
  };

  let tokenA = "";
  let userIdA = "";
  let tokenB = "";
  let userIdB = "";
  let createdResourceId = 0;

  try {
    // 1. Sign up User A
    console.log("\n1. Testing Better Auth Sign Up (User A)...");
    const signUpResA = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUserA),
    });
    assert(signUpResA.status === 200, `Sign-up HTTP status 200 (got ${signUpResA.status})`);
    const dataA = await signUpResA.json();
    tokenA = dataA?.token || "";
    userIdA = dataA?.user?.id || "";
    assert(Boolean(tokenA), "Received session token for User A");
    assert(Boolean(userIdA), `Created User A with ID: ${userIdA}`);

    // 2. Sign up User B
    console.log("\n2. Testing Better Auth Sign Up (User B)...");
    const signUpResB = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUserB),
    });
    assert(signUpResB.status === 200, `Sign-up HTTP status 200 (got ${signUpResB.status})`);
    const dataB = await signUpResB.json();
    tokenB = dataB?.token || "";
    userIdB = dataB?.user?.id || "";
    assert(Boolean(tokenB), "Received session token for User B");
    assert(Boolean(userIdB), `Created User B with ID: ${userIdB}`);

    // 3. Test get-session with Bearer token
    console.log("\n3. Testing Better Auth Session verification...");
    const sessionResA = await app.request("/api/auth/get-session", {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(sessionResA.status === 200, `get-session HTTP 200 (got ${sessionResA.status})`);
    const sessionDataA = await sessionResA.json();
    assert(sessionDataA?.user?.id === userIdA, "Session user ID matches User A");
    assert(sessionDataA?.user?.email === testUserA.email, "Session user email matches User A");

    // 4. Test Sign In with existing email & password
    console.log("\n4. Testing Better Auth Sign In...");
    const signInRes = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUserA.email,
        password: testUserA.password,
      }),
    });
    assert(signInRes.status === 200, `Sign-in HTTP status 200 (got ${signInRes.status})`);
    const signInData = await signInRes.json();
    assert(signInData?.user?.id === userIdA, "Signed in user matches User A");

    // 5. Create a test resource owned by User A
    console.log("\n5. Testing Resource Ownership Creation (User A)...");
    const courses = await query("SELECT id FROM courses LIMIT 1");
    const subjects = await query("SELECT id FROM subjects LIMIT 1");
    const units = await query("SELECT id FROM units LIMIT 1");

    const subjectId = subjects[0]?.id || 1;
    const unitId = units[0]?.id || 1;

    const resourceInsert = await query(
      `INSERT INTO resources (
        resource_type, subject_id, unit_id, year_no, semester_no,
        title, description, file_url, uploaded_by, file_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, title, uploaded_by`,
      [
        "notes",
        subjectId,
        unitId,
        1,
        1,
        "Better Auth Unit 1 Notes.pdf",
        "Test notes with Better Auth ownership",
        "/pdfs/notes/test-note.pdf",
        userIdA,
        102400,
      ]
    );

    createdResourceId = resourceInsert[0].id;
    assert(resourceInsert[0].uploaded_by === userIdA, "Resource created with uploaded_by = User A ID");

    // 6. User B tries to delete User A's resource -> MUST FAIL WITH 403 FORBIDDEN
    console.log("\n6. Testing Ownership Authorization (User B trying to delete User A's resource)...");
    const forbiddenDeleteRes = await app.request(`/api/resources/${createdResourceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(
      forbiddenDeleteRes.status === 403,
      `User B deletion rejected with 403 Forbidden (got ${forbiddenDeleteRes.status})`
    );
    const forbiddenJson = await forbiddenDeleteRes.json();
    assert(
      forbiddenJson?.error?.includes("only delete resources uploaded by you"),
      `Error message correctly informs: "${forbiddenJson?.error}"`
    );

    // 7. Unauthenticated delete attempt -> MUST FAIL WITH 401 UNAUTHORIZED
    console.log("\n7. Testing Unauthenticated Deletion...");
    const unauthDeleteRes = await app.request(`/api/resources/${createdResourceId}`, {
      method: "DELETE",
    });
    assert(
      unauthDeleteRes.status === 401,
      `Unauthenticated deletion rejected with 401 Unauthorized (got ${unauthDeleteRes.status})`
    );

    // 8. User A deletes their own resource -> MUST SUCCEED (200 OK)
    console.log("\n8. Testing Owner Deletion (User A deleting their own resource)...");
    const ownerDeleteRes = await app.request(`/api/resources/${createdResourceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(
      ownerDeleteRes.status === 200,
      `Owner deletion succeeded with 200 OK (got ${ownerDeleteRes.status})`
    );

    // Verify resource is gone from database
    const checkDeleted = await query("SELECT id FROM resources WHERE id = $1", [createdResourceId]);
    assert(checkDeleted.length === 0, "Resource record was permanently removed from database");

  } finally {
    // Cleanup test users and data
    console.log("\nCleaning up test data...");
    if (createdResourceId) {
      await query("DELETE FROM resources WHERE id = $1", [createdResourceId]);
    }
    if (userIdA) {
      await query("DELETE FROM users WHERE id = $1", [userIdA]);
    }
    if (userIdB) {
      await query("DELETE FROM users WHERE id = $1", [userIdB]);
    }
    await pool.end();
  }

  console.log("\n==========================================");
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
