"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      className="btn"
      style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: "#7F1D1D", borderRadius: 20 }}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </button>
  );
}
