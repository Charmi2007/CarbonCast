// Central configuration for API URL mapping
let baseApiUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000';
if (baseApiUrl.endsWith('/')) {
  baseApiUrl = baseApiUrl.slice(0, -1);
}
if (baseApiUrl.endsWith('/api/v1')) {
  baseApiUrl = baseApiUrl.slice(0, -7);
}
export const API_BASE_URL = baseApiUrl;
