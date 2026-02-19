import urls from "../../backend/func2url.json";

const STATS_URL = urls["bot-stats"];
const MANAGE_URL = urls["bot-manage"];
const BROADCAST_URL = urls["bot-broadcast"];
const AUTH_URL = urls["auth"];

function getToken(): string {
  return localStorage.getItem("panel_token") || "";
}

function authHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", "X-Auth-Token": getToken() };
}

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    localStorage.removeItem("panel_token");
    localStorage.removeItem("panel_user");
    window.location.reload();
    throw new Error("Не авторизован");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  checkSetup: () => fetchJSON(`${AUTH_URL}?action=setup`),

  registerOwner: (login: string, password: string, name: string) =>
    fetchJSON(`${AUTH_URL}?action=register_owner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password, name }),
    }),

  login: (login: string, password: string) =>
    fetchJSON(`${AUTH_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    }),

  getMe: () =>
    fetchJSON(`${AUTH_URL}?action=me`, { headers: authHeaders() }),

  logout: () =>
    fetchJSON(`${AUTH_URL}?action=logout`, { method: "POST", headers: authHeaders() }),

  createAdmin: (login: string, password: string, name: string) =>
    fetchJSON(`${AUTH_URL}?action=create_admin`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ login, password, name }),
    }),

  listAdmins: () =>
    fetchJSON(`${AUTH_URL}?action=list_admins`, { headers: authHeaders() }),

  toggleAdmin: (adminId: number, active: boolean) =>
    fetchJSON(`${AUTH_URL}?action=toggle_admin`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ adminId, active }),
    }),

  getStats: () => fetchJSON(STATS_URL, { headers: authHeaders() }),

  getBotInfo: () => fetchJSON(`${MANAGE_URL}?action=info`, { headers: authHeaders() }),

  getUsers: (page = 1, search = "") =>
    fetchJSON(`${MANAGE_URL}?action=users&page=${page}&search=${encodeURIComponent(search)}`, { headers: authHeaders() }),

  blockUser: (telegramId: number, block: boolean) =>
    fetchJSON(`${MANAGE_URL}?action=block_user`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ telegramId, block }),
    }),

  getSettings: () =>
    fetchJSON(`${MANAGE_URL}?action=settings`, { headers: authHeaders() }),

  saveSettings: (settings: Record<string, string>) =>
    fetchJSON(`${MANAGE_URL}?action=settings`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(settings),
    }),

  getLogs: () =>
    fetchJSON(`${MANAGE_URL}?action=logs`, { headers: authHeaders() }),

  sendMessage: (chatId: number, text: string) =>
    fetchJSON(`${MANAGE_URL}?action=send_message`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ chatId, text }),
    }),

  getBroadcasts: () =>
    fetchJSON(BROADCAST_URL, { headers: authHeaders() }),

  sendBroadcast: (text: string) =>
    fetchJSON(BROADCAST_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    }),
};

export default api;
