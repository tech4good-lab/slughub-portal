"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import PendingBadge from "@/app/components/PendingBadge";
import LogoutButton from "@/app/leader/edit/logout-button";
import { markPortalTransition } from "@/lib/slugTransition";
import styles from "./Navbar.module.css";

interface NavbarProps {
  session?: any;
  isAdmin?: boolean;
  isLeader?: boolean;
}

export default function Navbar({
  session,
  isAdmin = false,
  isLeader = false,
}: NavbarProps) {
  const pathname = usePathname();
  const isAboutActive = pathname === "/about";
  const isPortalActive = pathname === "/" || (!isAboutActive && !pathname?.startsWith("/about"));

  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when navigating to another page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Click outside and Escape key listener for mobile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Smooth Hide on Scroll Down / Show on Scroll Up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show when near the top of the page
      if (currentScrollY <= 25) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY.current + 8) {
        setIsVisible(false);
        setIsMobileMenuOpen(false); // also collapse open dropdown on scroll down
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAuthenticated = Boolean(session) && (isAdmin || isLeader);

  return (
    <header
      className={`${styles.navHeader} ${
        isVisible ? styles.navVisible : styles.navHidden
      }`}
    >
      <nav className={styles.navPill} aria-label="Main Navigation">
        {/* Left: Navigation Links */}
        <div className={styles.navLinks}>
          <Link
            href="/"
            className={`${styles.navLink} ${
              isPortalActive ? styles.navLinkActive : ""
            }`}
            aria-current={isPortalActive ? "page" : undefined}
            suppressHydrationWarning
          >
            Portal
          </Link>
          <Link
            href="/about"
            className={`${styles.navLink} ${
              isAboutActive ? styles.navLinkActive : ""
            }`}
            aria-current={isAboutActive ? "page" : undefined}
            suppressHydrationWarning
            onClick={() => {
              if (pathname === "/") {
                markPortalTransition();
              }
            }}
          >
            About SlugPath
          </Link>
        </div>

        {/* Right Desktop Actions (>= 768px) */}
        <div className={styles.desktopActions}>
          {session ? (
            <>
              {isAdmin && (
                <>
                  <Link
                    className={styles.actionBtn}
                    href="/admin/review"
                    title="Community Approvals"
                  >
                    <span className={styles.labelFull}>Community Approvals</span>
                    <span className={styles.labelShort}>Approvals</span>
                    <PendingBadge />
                  </Link>

                  <Link
                    className={styles.actionBtn}
                    href="/admin/access"
                    title="Access Requests"
                  >
                    <span className={styles.labelFull}>Access Requests</span>
                    <span className={styles.labelShort}>Access</span>
                    <PendingBadge endpoint="/api/admin/access-requests/pending/count" />
                  </Link>
                </>
              )}

              {(isAdmin || isLeader) && (
                <Link
                  className={styles.actionBtn}
                  href="/leader/dashboard"
                  title="Leader Dashboard"
                >
                  Dashboard
                </Link>
              )}

              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className={styles.actionBtn}
              title="Community Lead Login"
            >
              Community Lead Login
            </Link>
          )}
        </div>

        {/* Right Mobile Actions (< 768px) */}
        <div className={styles.mobileActions} ref={menuRef}>
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className={`${styles.menuTriggerBtn} ${
                  isMobileMenuOpen ? styles.menuTriggerBtnActive : ""
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-dropdown"
                aria-label="Toggle navigation menu"
              >
                <span>{isAdmin ? "Admin" : "Dashboard"}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isMobileMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {isAdmin && <PendingBadge />}
              </button>

              {isMobileMenuOpen && (
                <div id="mobile-nav-dropdown" className={styles.mobileDropdown}>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/review"
                        className={styles.dropdownItem}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>Community Approvals</span>
                        <div style={{ position: "relative", width: 20, height: 20 }}>
                          <PendingBadge />
                        </div>
                      </Link>

                      <Link
                        href="/admin/access"
                        className={styles.dropdownItem}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>Access Requests</span>
                        <div style={{ position: "relative", width: 20, height: 20 }}>
                          <PendingBadge endpoint="/api/admin/access-requests/pending/count" />
                        </div>
                      </Link>
                    </>
                  )}

                  <Link
                    href="/leader/dashboard"
                    className={styles.dropdownItem}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Leader Dashboard</span>
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <span>Log Out</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className={styles.actionBtn}
              title="Community Lead Login"
            >
              <span className={styles.labelFull}>Community Lead Login</span>
              <span className={styles.labelShort}>Lead Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
