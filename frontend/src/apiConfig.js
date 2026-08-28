/**
 * Unified API Base URL Configuration for Multi-Device & Public Internet Access.
 * - When accessed locally (localhost): talks directly to http://localhost:8000
 * - When accessed from other networks / mobile data / public tunnel: routes via Vite proxy at /api
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? `${window.location.origin}/api`
    : 'http://localhost:8000');
