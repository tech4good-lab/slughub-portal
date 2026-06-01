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
        padding: "2px 6px",
        fontSize: 11,
        fontWeight: 700,
        minWidth: 18,
        textAlign: "center",
        lineHeight: "16px",
        boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
        pointerEvents: "none",
        animation: "pendingPulse 2s ease-in-out infinite",
      }}
    >
      {count}
      <style jsx>{`
        @keyframes pendingPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(0.95); }
        }
      `}</style>
    </span>
  );
}