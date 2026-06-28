export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://iot-device-data-simulator.onrender.com");
export async function apiHealthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  return await res.json();
}

export async function apiGetDevices() {
  const res = await fetch(`${API_BASE}/api/devices`);
  return await res.json();
}

export async function apiOnboardDevice(device) {
  const res = await fetch(`${API_BASE}/api/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(device),
  });

  return await res.json();
}

export async function apiUpdateDeviceStatus(id, status) {
  const res = await fetch(`${API_BASE}/api/devices/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return await res.json();
}

export async function apiDeleteDevice(id) {
  const res = await fetch(`${API_BASE}/api/devices/${id}`, {
    method: "DELETE",
  });

  return await res.json();
}