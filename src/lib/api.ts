import urls from "../../backend/func2url.json";

const STATS_URL = urls["bot-stats"];
const MANAGE_URL = urls["bot-manage"];
const BROADCAST_URL = urls["bot-broadcast"];

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  getStats: () => fetchJSON(STATS_URL),

  getBotInfo: () => fetchJSON(`${MANAGE_URL}?action=info`),

  getUsers: (page = 1, search = "") =>
    fetchJSON(`${MANAGE_URL}?action=users&page=${page}&search=${encodeURIComponent(search)}`),

  blockUser: (telegramId: number, block: boolean) =>
    fetchJSON(`${MANAGE_URL}?action=block_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId, block }),
    }),

  getSettings: () => fetchJSON(`${MANAGE_URL}?action=settings`),

  saveSettings: (settings: Record<string, string>) =>
    fetchJSON(`${MANAGE_URL}?action=settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }),

  getLogs: () => fetchJSON(`${MANAGE_URL}?action=logs`),

  sendMessage: (chatId: number, text: string) =>
    fetchJSON(`${MANAGE_URL}?action=send_message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, text }),
    }),

  getBroadcasts: () => fetchJSON(BROADCAST_URL),

  sendBroadcast: (text: string) =>
    fetchJSON(BROADCAST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
};

export default api;
