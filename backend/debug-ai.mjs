import "dotenv/config";
import { handleAcademicChat } from "./src/services/ai.service.ts";

const cases = [
  "Give me DBMS PYQ",
  "I want BCA 2nd year DBMS Unit 1 notes",
  "Show me BCA 2nd year DBMS syllabus",
  "Give me DBMS Unit 1 reference material",
  "Predict upcoming BCA 2nd year DBMS question paper",
];

for (const msg of cases) {
  const res = await handleAcademicChat(msg, { course: "BCA", year: 2 });
  console.log("MESSAGE:", msg);
  console.log(JSON.stringify(res, null, 2));
  console.log("---");
}
