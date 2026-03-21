"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteClubButton({
  clubId,
  clubName,
}: {
  clubId: string;
  clubName?: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete() {
    const label = clubName ? `"${clubName}"` : "this club";
    const confirmed = window.confirm(
      `Delete ${label} and all associated data? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/leader/clubs/${encodeURIComponent(clubId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = String(data?.error ?? "Failed to delete community.");
        window.alert(msg);
        return;
      }

      try {
        localStorage.removeItem("leaderClubsCache_v1");
        localStorage.removeItem("clubEventsCache_v1");
      } catch {
        // ignore storage errors
      }

      const writeTs = Date.now();
      document.cookie = `leader_recent_write_at=${writeTs}; Max-Age=180; Path=/; SameSite=Lax`;
      router.push(`/leader/dashboard?refresh=${writeTs}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={isDeleting}
      style={{
        padding: "8px 16px",
        background: "#FEE2E2",
        border: "1px solid #FCA5A5",
        borderRadius: 20,
        color: "#7F1D1D",
        fontSize: 14,
        fontFamily: "Sarabun",
        fontWeight: 600,
        cursor: isDeleting ? "not-allowed" : "pointer",
        opacity: isDeleting ? 0.65 : 1,
      }}
    >
      {isDeleting ? "Deleting..." : "Delete Community"}
    </button>
  );
}
