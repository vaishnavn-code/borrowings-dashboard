import { useState, useEffect, useCallback } from 'react'
import { dashboardApi } from '../api/client'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://sap-borrowing-analytics-degga5g7htb9e3gf.centralindia-01.azurewebsites.net/api',
//   baseURL: 'http://127.0.0.1:8001',
  // Use a safer default for heavier backend computations.
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * useDashboardData — master hook.
 * Fetches the /data/query dashboard payload once on mount.
 * Returns { data, loading, error, refetch }.
 */
export function useDashboardData() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardApi.getDashboard()
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

/**
 * usePaginatedData — generic hook for paginated API endpoints.
 * @param {Function} fetcher   — e.g. (params) => dashboardApi.getGroups(params)
 * @param {Object}   defaults  — default query params
 */
export function usePaginatedData(fetcher, defaults = {}) {
  const [rows, setRows]         = useState([])
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [params, setParams]     = useState({ page: 1, per_page: 20, ...defaults })

  const load = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher(p)
      setRows(res.data)
      setTotal(res.total)
      setTotalPages(res.total_pages)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => { load(params) }, [params, load])

  const updateParams = useCallback((updates) => {
    setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }))
  }, [])

  return { rows, total, totalPages, loading, error, params, updateParams }
}

/**
 * useInsights — fetch AI insights on demand.
 */



async function getInsightsContext(sessionId, token) {
  const res = await api.post(
    "/data/ai",   // no localhost here
    {
    //   query_type: "cof_dashboard",
      session_id: sessionId,
    //   filters: {}
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,  // ✅ per-request header
      },
    }
  );
  console.log("Check");
  const result = res.data ;

  return result;
}

async function generateInsights(context) {
  const res = await fetch(
    "https://dashboard-insight-hrf3cpafhxgsf7fz.centralindia-01.azurewebsites.net/poc/insights/borrowings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body:  JSON.stringify(context),
    }
  );

  if (!res.ok) throw new Error("Insights API failed");

  return res.json();
}

const insightsCache = {
  key: null,
  insights: null,
  hasGenerated: false,
  loading: false,
  error: null,
  promise: null,
};
const insightsListeners = new Set();

function getInsightsAuth() {
  const params = new URLSearchParams(window.location.search);
  return {
    sessionId: params.get("session_id"),
    token: params.get("token"),
  };
}

function hydrateInsightsCache(sessionId) {
  const key = sessionId || null;

  if (insightsCache.key === key) return;

  insightsCache.key = key;
  insightsCache.insights = null;
  insightsCache.hasGenerated = false;
  insightsCache.loading = false;
  insightsCache.error = null;
  insightsCache.promise = null;
}

function getInsightsSnapshot() {
  return {
    insights: insightsCache.insights,
    hasGenerated: insightsCache.hasGenerated,
    loading: insightsCache.loading,
    error: insightsCache.error,
  };
}

function publishInsightsSnapshot() {
  const snapshot = getInsightsSnapshot();
  insightsListeners.forEach((listener) => listener(snapshot));
}

export function useInsights() {
  const [state, setState] = useState(() => {
    const { sessionId } = getInsightsAuth();
    hydrateInsightsCache(sessionId);
    return getInsightsSnapshot();
  });

  useEffect(() => {
    const { sessionId } = getInsightsAuth();
    hydrateInsightsCache(sessionId);
    setState(getInsightsSnapshot());

    insightsListeners.add(setState);
    return () => insightsListeners.delete(setState);
  }, []);

  const generate = useCallback(async () => {
    const { sessionId, token } = getInsightsAuth();

    hydrateInsightsCache(sessionId);

    if (!sessionId || !token) {
      insightsCache.loading = false;
      insightsCache.error = "Missing session or token";
      publishInsightsSnapshot();
      return;
    }

    insightsCache.loading = true;
    insightsCache.error = null;
    publishInsightsSnapshot();

    const promise = (async () => {
      const context = await getInsightsContext(sessionId, token);
      return generateInsights(context);
    })();

    insightsCache.promise = promise;

    try {
      const result = await promise;

      if (insightsCache.promise === promise) {
        insightsCache.insights = result;
        insightsCache.hasGenerated = true;
        insightsCache.loading = false;
        insightsCache.error = null;
        insightsCache.promise = null;

        publishInsightsSnapshot();
      }

      return result;
    } catch (e) {
      if (insightsCache.promise === promise) {
        insightsCache.loading = false;
        insightsCache.error = e.message;
        insightsCache.promise = null;
        publishInsightsSnapshot();
      }
    }
  }, []);

  return {
    insights: state.insights,
    loading: state.loading,
    error: state.error,
    generate,
    hasGenerated: state.hasGenerated,
  };
}
