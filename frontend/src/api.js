// Central API client connecting React frontend to Spring Boot backend and PostgreSQL database
// In-memory token storage (NO local storage)

const API_BASE = "http://localhost:8080/api";

let inMemoryToken = "";
let inMemoryUser = null;

export const setAuthSession = (token, user) => {
  inMemoryToken = token || "";
  inMemoryUser = user || null;
};

export const getAuthToken = () => inMemoryToken;
export const getAuthUser = () => inMemoryUser;

export const clearAuthSession = () => {
  inMemoryToken = "";
  inMemoryUser = null;
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(inMemoryToken ? { Authorization: `Bearer ${inMemoryToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      errorMsg = data.message || data.error || errorMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) errorMsg = text;
      } catch {}
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ================= AUTH API =================
export const authApi = {
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.token) {
      setAuthSession(data.token, data.user);
    }
    return data;
  },

  register: async ({ name, email, password, phone = "", role = "USER" }) => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone, role }),
    });
  },
};

// ================= USERS API =================
export const userApi = {
  getAllUsers: () => request("/users"),
  getUserById: (id) => request(`/users/${id}`),
  getCurrentUser: () => request("/users/me"),
  updateProfile: (id, profileData) =>
    request(`/users/${id}/profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

// ================= CANTEEN MENU API =================
export const menuApi = {
  getAvailableMenu: () => request("/canteen/menu/available"),
  getAllMenuItems: () => request("/canteen/menu"),
  addMenuItem: (item) =>
    request("/canteen/menu", {
      method: "POST",
      body: JSON.stringify(item),
    }),
  updateMenuItem: (id, item) =>
    request(`/canteen/menu/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    }),
  deleteMenuItem: (id) =>
    request(`/canteen/menu/${id}`, {
      method: "DELETE",
    }),
};

// ================= ORDERS API =================
export const orderApi = {
  getAllOrders: () => request("/orders"),
  getMyOrders: () => request("/orders/my"),
  getOrderById: (id) => request(`/orders/${id}`),
  createOrder: (orderData) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ================= ATTENDANCE API =================
export const attendanceApi = {
  getSessions: (activeOnly = false) =>
    request(`/attendance/sessions${activeOnly ? "?activeOnly=true" : ""}`),
  createSession: (sessionData) =>
    request("/attendance/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    }),
  closeSession: (id) =>
    request(`/attendance/sessions/${id}/close`, {
      method: "PATCH",
    }),
  checkIn: (payload) =>
    request("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getRecords: (studentId) =>
    request(`/attendance/records${studentId ? `?studentId=${studentId}` : ""}`),
};

// ================= CAMPUS HUB (LOST & FOUND) API =================
export const hubApi = {
  getLostFound: () => request("/hub/lost-found"),
  createLostFound: (item) =>
    request("/hub/lost-found", {
      method: "POST",
      body: JSON.stringify(item),
    }),
  resolveLostFound: (id) =>
    request(`/hub/lost-found/${id}/resolve`, {
      method: "PATCH",
    }),
};
