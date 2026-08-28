/**
 * Unified API Base URL Configuration for Multi-Device & Public Internet Access.
 * - Defaults to '/api' which leverages Vite's dev proxy locally and Vercel/production serverless routing.
 * - Falls back to VITE_API_URL if explicitly overridden.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || '/api';
