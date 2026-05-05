const BASE = "http://localhost:5000";

export async function api(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  } catch (err) {
    if (err.message === "Failed to fetch")
      throw new Error("Cannot connect to server. Please try again.");
    throw err;
  }
}
