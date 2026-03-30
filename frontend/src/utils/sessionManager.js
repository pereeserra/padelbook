export function handleSessionExpired() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.dispatchEvent(new Event("session-expired"));
}