const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8787").replace(/\/$/, "");

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }
  return data;
}

const params = (values) =>
  new URLSearchParams(
    Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  ).toString();

export const api = {
  getYears: () => request("/api/resources/years"),
  getCourses: (year) => request(`/api/resources/courses?${params({ year })}`),
  getSemesters: (year) => request(`/api/resources/semesters?${params({ year })}`),
  getSubjects: (year, course, semester) =>
    request(`/api/resources/subjects?${params({ year, course, semester })}`),
  getUnits: (subjectId) =>
    request(`/api/resources/units?${params({ subjectId })}`),
  resolve: (type, filters) =>
    request(`/api/resources/resolve?${params({ type, ...filters })}`),
  list: (type, filters) =>
    request(`/api/resources/list?${params({ type, ...filters })}`),
};

export { API_URL };
