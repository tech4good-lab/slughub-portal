export default function StatusPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();

  let label = "Draft";
  if (s === "pending") label = "Pending approval";
  if (s === "approved") label = "Approved (Live)";
  if (s === "rejected") label = "Rejected";

  const border =
    s === "approved"
      ? "2px solid rgba(34,197,94,0.45)"
      : s === "pending"
      ? "2px solid rgba(234,179,8,0.45)"
      : s === "rejected"
      ? "2px solid rgba(239,68,68,0.45)"
      : "2px solid rgba(148,163,184,0.35)";

  const dot =
    s === "approved"
      ? "rgb(34,197,94)"
      : s === "pending"
      ? "rgb(234,179,8)"
      : s === "rejected"
      ? "rgb(239,68,68)"
      : "rgb(148,163,184)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        border,
        background: "rgba(255,255,255,0.04)",
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
      title={`Status: ${label}`}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: dot }} />
      {label}
    </span>
  );
}
