"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      className="btn"
      style={{ background: "#fdf0a6", borderColor: "#fdf0a6", color: "#000" }}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </button>
  );
}
