import axios from "axios";
export async function timer(fn, label = "Timer") {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const ms = (performance.now() - start).toFixed(2);
    console.log(`[${label}] ${ms} ms`);
  }
}

export async function countRequests(fn, label = "Requests") {
  let count = 0;
  const axiosInterceptor = axios.interceptors.request.use((config) => {
    count++;
    return config;
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (...args) => {
    count++;
    return originalFetch(...args);
  };

  try {
    return await fn();
  } finally {
    axios.interceptors.request.eject(axiosInterceptor);
    globalThis.fetch = originalFetch;
    console.log(`[${label}] ${count} requête(s) envoyée(s)`);
  }
}

export async function debug(fn, label = "Benchmark") {
  const stats = { total: 0, methods: {} };
  const start = performance.now();

  const interceptor = axios.interceptors.request.use((config) => {
    const method = (config.method || "GET").toUpperCase();
    stats.total++;
    stats.methods[method] = (stats.methods[method] || 0) + 1;
    return config;
  });

  try {
    return await fn();
  } finally {
    axios.interceptors.request.eject(interceptor);
    const ms = (performance.now() - start).toFixed(2);
    console.log(`[${label}] ${ms} ms | ${stats.total} req`, stats.methods);
  }
}