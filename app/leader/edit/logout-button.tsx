"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      className="btn"
      style={{ 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        height: 40,
        margin: 0,
        padding: "0 16px",
        fontSize: 14,
        background: "#FEE2E2",
        borderColor: "#FCA5A5",
        color: "#7F1D1D",
        borderRadius: 20,
        flexShrink: 0,
        cursor: "pointer",
        position: "relative",
        whiteSpace: "nowrap",
      }}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </button>
  );
}
