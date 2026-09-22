const API_URL = localStorage.getItem("apiUrl") || "http://localhost:5000/api";
const statusElement = document.querySelector("#status");
const authArea = document.querySelector("#auth-area");
const profile = document.querySelector("#profile");

const setStatus = (message, type = "") => { statusElement.textContent = message; statusElement.className = `status ${type}`; };
const callApi = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");
  return data;
};
const showProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const { user } = await callApi("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    authArea.hidden = true; profile.hidden = false;
    document.querySelector("#welcome").textContent = `ยินดีต้อนรับ, ${user.name}`;
    document.querySelector("#role").textContent = `สิทธิ์: ${user.role}`;
    if (user.role === "admin") {
      const dashboard = await callApi("/auth/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } });
      const message = document.querySelector("#admin-message"); message.textContent = dashboard.message; message.hidden = false;
    }
  } catch (_) { localStorage.removeItem("token"); }
};
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab, .form").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active"); document.querySelector(`#${tab.dataset.panel}`).classList.add("active"); setStatus("");
}));
["login", "register"].forEach((formId) => document.querySelector(`#${formId}`).addEventListener("submit", async (event) => {
  event.preventDefault(); setStatus("กำลังดำเนินการ...");
  const body = Object.fromEntries(new FormData(event.currentTarget));
  try { const data = await callApi(`/auth/${formId}`, { method: "POST", body: JSON.stringify(body) }); localStorage.setItem("token", data.token); setStatus("สำเร็จ", "success"); await showProfile(); }
  catch (error) { setStatus(error.message, "error"); }
}));
document.querySelector("#logout").addEventListener("click", () => { localStorage.removeItem("token"); profile.hidden = true; authArea.hidden = false; setStatus("ออกจากระบบแล้ว", "success"); });
showProfile();
