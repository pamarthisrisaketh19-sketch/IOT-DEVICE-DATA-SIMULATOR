const API_BASE = typeof window !== 'undefined' && window.location.hostname.includes("onrender.com")
  ? "https://iot-device-data-simulator.onrender.com"
  : "http://localhost:5000";

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