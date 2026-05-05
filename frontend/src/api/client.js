const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("ttm_token");

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.errors;
    throw error;
  }

  return data;
}

export const api = {
  signup: (payload) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    changePassword: (payload) =>
  apiRequest("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(payload)
  }),

  me: () => apiRequest("/auth/me"),
  users: () => apiRequest("/users"),
  dashboard: () => apiRequest("/dashboard"),
  projects: () => apiRequest("/projects"),
  project: (id) => apiRequest(`/projects/${id}`),
  createProject: (payload) =>
    apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateProject: (id, payload) =>
    apiRequest(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  deleteProject: (id) =>
    apiRequest(`/projects/${id}`, {
      method: "DELETE"
    }),
  tasks: (query = "") => apiRequest(`/tasks${query}`),
  task: (id) => apiRequest(`/tasks/${id}`),
  createTask: (payload) =>
    apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateTask: (id, payload) =>
    apiRequest(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  deleteTask: (id) =>
    apiRequest(`/tasks/${id}`, {
      method: "DELETE"
    })
};
