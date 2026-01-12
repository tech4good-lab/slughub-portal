"use client";

import { useEffect, useState } from "react";

export default function PendingBadge() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/admin/clubs/pending/count", {
          cache: "no-store",
        });
        
        if (res.ok) {
          const data = await res.json();
          setCount(data.count ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch pending count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || count === null || count === 0) {
    return null;
  }

  return (
    <span
      style={{
        position: "absolute",
        top: -8,
        right: -8,
        background: "rgb(239,68,68)",
        color: "white",
        borderRadius: 999,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 700,
        minWidth: 20,
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
        animation: "pulse 2s ease-in-out infinite",
      }}
    >
      {count}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </span>
  );
}