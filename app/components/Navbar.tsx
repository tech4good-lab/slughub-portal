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
  const isDirectoryActive = pathname === "/" || (!isAboutActive && !pathname?.startsWith("/about"));

  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when navigating to another page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show near the top of the page
          if (currentScrollY < 40) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY.current + 6) {
            // Scrolling DOWN by more than 6px -> hide navbar
            setIsVisible(false);
            setIsMobileMenuOpen(false);
          } else if (currentScrollY < lastScrollY.current - 6) {
            // Scrolling UP by more than 6px -> show navbar
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
              isDirectoryActive ? styles.navLinkActive : ""
            }`}
            aria-current={isDirectoryActive ? "page" : undefined}
            suppressHydrationWarning
          >
            Directory
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
                  title="Leadership"
                >
                  Leadership
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
                <span>{isAdmin ? "Admin" : "Leadership"}</span>
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
                    <span>My Communities</span>
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
