/**
 * Transition state helper to coordinate the slug mascot exit animation
 * strictly when transitioning from the portal page ("/") to the about page ("/about").
 */

const PORTAL_TRANSITION_KEY = "slug_portal_to_about_time";
const MAX_VALID_DURATION_MS = 20000; // 20 seconds maximum between leaving portal and mounting about

// In-memory flag for instantaneous client-side SPA navigation
let inMemoryFromPortal = false;
let inMemoryTimestamp = 0;

export function markPortalTransition(): void {
  const now = Date.now();
  inMemoryFromPortal = true;
  inMemoryTimestamp = now;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(PORTAL_TRANSITION_KEY, String(now));
    } catch {
      // Ignore storage errors (e.g. private browsing)
    }
  }
}

export function clearPortalTransition(): void {
  inMemoryFromPortal = false;
  inMemoryTimestamp = 0;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(PORTAL_TRANSITION_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

export function checkAndConsumePortalTransition(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const now = Date.now();
  let isValid = false;

  // 1. Check in-memory flag (set during client-side route transition)
  if (inMemoryFromPortal && now - inMemoryTimestamp < MAX_VALID_DURATION_MS) {
    isValid = true;
  }

  // 2. Check sessionStorage
  try {
    const stored = sessionStorage.getItem(PORTAL_TRANSITION_KEY);
    if (stored) {
      const storedTime = parseInt(stored, 10);
      if (!isNaN(storedTime) && now - storedTime < MAX_VALID_DURATION_MS) {
        isValid = true;
      }
    }
  } catch {
    // Ignore storage errors
  }

  // Always consume and clear immediately so refreshing /about or navigating elsewhere won't re-trigger
  clearPortalTransition();
  return isValid;
}
