"use client";

import { signOut } from "next-auth/react";

import styles from "./logout-button.module.css";

export default function LogoutButton() {
  return (
    <button
      className={styles.logoutButton}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </button>
  );
}
