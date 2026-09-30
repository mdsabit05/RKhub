const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8787").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
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
  list: async (type, filters) => {
    const data = await request(`/api/resources/list?${params({ type, ...filters })}`);
    return Array.isArray(data) ? data : (data?.resources || []);
  },
  verifyAdmin: (key) =>
    request("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    }),
  uploadResource: (formData, token) => {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const adminKey = sessionStorage.getItem("rkhub_admin_key");
    if (adminKey && !token) {
      headers["x-admin-key"] = adminKey;
    }
    return request("/api/resources/upload", {
      method: "POST",
      headers,
      body: formData,
    });
  },
  deleteResource: (id, token) => {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return request(`/api/resources/${id}`, {
      method: "DELETE",
      headers,
    });
  },
  chat: (message, context = {}) =>
    request("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context }),
    }),
};

export { API_URL };
