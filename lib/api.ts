const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://8hq03t4v7j.execute-api.eu-north-1.amazonaws.com";

export function apiUrl(path: `/api/${string}`): string {
  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
}
