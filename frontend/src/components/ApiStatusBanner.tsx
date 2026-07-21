import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export function ApiStatusBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { method: "GET" });
        if (!cancelled) setOnline(res.ok);
      } catch {
        if (!cancelled) setOnline(false);
      }
    };
    check();
    const id = setInterval(check, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (online) return null;

  return (
    <div className="no-print bg-red-600 px-4 py-2 text-center text-sm text-white">
      API is offline. Sales and data may not save until the server is back.
    </div>
  );
}
