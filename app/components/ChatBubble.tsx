"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { markPortalTransition, checkAndConsumePortalTransition } from "@/lib/slugTransition";
import styles from "./ChatBubble.module.css";

const CHAT_MESSAGES = [
  "Need help figuring out the right club for you? Chat with SlugPath!",
  "Having some trouble searching? Ask SlugPath for some recommendations!",
  "Chat with SlugPath to find some communities to search up",
  "Ask SlugPath about any clubs that you find interesting",
  "Looking to get involved on campus? Ask SlugPath where to start",
  "Want to meet people with similar hobbies or majors? Chat with SlugPath!",
  "Not sure if any club events fit in your schedule? Ask SlugPath for help",
  "Curious about what clubs can help you achieve your goals? SlugPath has answers!",
  "Looking for opportunities related to your major? Ask SlugPath to guide you",
  "Tell SlugPath what you're passionate about and find your community",
  "Share your interests with SlugPath to get personalized recommendations",
];

const CHAT_URL = "https://chat.slughub.cc/";
const EMIT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const AUTO_DISMISS_MS = 14 * 1000; // 14 seconds display per emission
const BLINK_INTERVAL_MS = 5000; // Standardized to blink every 5 seconds
const BLINK_DURATION_MS = 150; // Natural blink duration (150ms)
const MAX_SESSION_EMISSIONS = 4; // Maximum messages emitted in one session
const SESSION_STORAGE_KEY = "slugpath_emission_count";

const getSessionCount = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const val = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

const setSessionCount = (count: number) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, String(count));
  } catch {}
};

interface ChatBubbleProps {
  mode?: "default" | "exit";
}

export default function ChatBubble({ mode = "default" }: ChatBubbleProps) {
  const isExitMode = mode === "exit";
  const [shouldAnimateExit] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (!isExitMode) return false;
    return checkAndConsumePortalTransition();
  });
  const [hasExited, setHasExited] = useState<boolean>(false);

  // When on portal page, register transition timestamp so going to /about triggers exit animation
  useEffect(() => {
    if (!isExitMode) {
      markPortalTransition();
      return () => {
        markPortalTransition();
      };
    }
  }, [isExitMode]);

  // When in exit mode and legitimately coming from portal, wait for backwards wriggle animation (1.8s) to complete, then unmount
  useEffect(() => {
    if (isExitMode && shouldAnimateExit) {
      const exitTimer = setTimeout(() => {
        setHasExited(true);
      }, 1900);
      return () => clearTimeout(exitTimer);
    }
  }, [isExitMode, shouldAnimateExit]);

  const [currentMessage, setCurrentMessage] = useState<string>(() => {
    return CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIndexRef = useRef<number>(-1);
  const autoEmissionCountRef = useRef<number>(0);

  const emitRandomMessage = useCallback((force: boolean = false): boolean => {
    if (isExitMode) return false;
    if (!force && autoEmissionCountRef.current >= MAX_SESSION_EMISSIONS) {
      return false; // Limit reached for automatic background popups
    }

    let nextIndex = Math.floor(Math.random() * CHAT_MESSAGES.length);
    if (CHAT_MESSAGES.length > 1 && nextIndex === lastMessageIndexRef.current) {
      nextIndex = (nextIndex + 1) % CHAT_MESSAGES.length;
    }
    lastMessageIndexRef.current = nextIndex;

    setCurrentMessage(CHAT_MESSAGES[nextIndex]);
    setIsOpen(true);
    if (!force) {
      autoEmissionCountRef.current += 1;
    }

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, AUTO_DISMISS_MS);

    return autoEmissionCountRef.current < MAX_SESSION_EMISSIONS;
  }, [isExitMode]);

  // Automatic message emission (capped at 4 per session so it doesn't spam)
  useEffect(() => {
    if (isExitMode) return;

    // Clear any stale sessionStorage lock from previous buggy version
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
    }

    // Initial greeting as slug finishes entering
    const initialTimer = setTimeout(() => {
      emitRandomMessage();
    }, 1800);

    const intervalTimer = setInterval(() => {
      const canEmitMore = emitRandomMessage();
      if (!canEmitMore) {
        clearInterval(intervalTimer);
      }
    }, EMIT_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [emitRandomMessage, isExitMode]);

  // Standardized blink cycle: blinks every 5 seconds for 150ms in both idle and text-bubble states
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout | null = null;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
      }, BLINK_DURATION_MS);
    }, BLINK_INTERVAL_MS);

    return () => {
      clearInterval(blinkInterval);
      if (blinkTimeout) {
        clearTimeout(blinkTimeout);
      }
    };
  }, []);

  // Pause auto-dismiss timer on hover
  useEffect(() => {
    if (!isOpen) return;

    if (isHovered) {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    } else {
      if (!dismissTimerRef.current) {
        dismissTimerRef.current = setTimeout(() => {
          setIsOpen(false);
        }, AUTO_DISMISS_MS);
      }
    }
  }, [isHovered, isOpen]);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };

  const handleSlugClick = (e: React.MouseEvent) => {
    if (!isOpen) {
      // If the speech bubble is closed, clicking the slug opens it immediately
      e.preventDefault();
      emitRandomMessage(true);
    }
  };

  if (hasExited || (isExitMode && !shouldAnimateExit)) {
    return null;
  }

  return (
    <aside className={styles.container} aria-label="SlugPath Chat Assistant">
      {/* Speech Text Bubble (only in default mode) */}
      {!isExitMode && isOpen && (
        <div
          className={`${styles.textBubble} ${styles.interactive}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close notification"
            title="Dismiss"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <p className={styles.bubbleMessage}>{currentMessage}</p>

          <div className={styles.bubbleActions}>
            <Link
              href="/about"
              className={styles.bubbleLink}
              title="About SlugPath"
              onClick={() => {
                markPortalTransition();
              }}
            >
              About SlugPath
            </Link>
            <span className={styles.linkSeparator} aria-hidden="true">
              •
            </span>
            <a
              href={CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.bubbleLink} ${styles.chatLink}`}
              title="Chat with SlugPath"
            >
              <span>Chat</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Main Slug Mascot Container */}
      <div className={`${styles.slugWrapper} ${isExitMode ? "" : styles.interactive}`}>
        {isExitMode ? (
          <div className={styles.slugButtonExit} aria-hidden="true">
            <div className={styles.imageLayerContainer}>
              <Image
                src="/clear_slugpath-icon.png"
                alt="SlugPath Icon"
                fill
                unoptimized
                priority
                className={styles.baseFace}
                draggable={false}
              />
            </div>
          </div>
        ) : (
          <a
            href={CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.slugButton}
            onClick={handleSlugClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Open SlugPath Chat"
            title={isOpen ? "Click to chat with SlugPath" : "Click to show tip from SlugPath"}
          >
            <div className={styles.imageLayerContainer}>
              {/* 1. Base regular face (idle, eyes open) */}
              <Image
                src="/clear_slugpath-icon.png"
                alt="SlugPath Icon"
                fill
                unoptimized
                priority
                className={styles.baseFace}
                draggable={false}
              />

              {/* 2. Idle blinking overlay (idle, eyes blinking) */}
              <Image
                src="/blink_clear_slugpath-icon.png"
                alt="SlugPath Blinking"
                fill
                unoptimized
                priority
                className={`${styles.logoImage} ${styles.blinkClearLayer} ${!isOpen && isBlinking ? styles.activeFace : styles.hiddenFace
                  }`}
                draggable={false}
              />

              {/* 3. Talking mouth face (text bubble open, eyes open) */}
              <Image
                src="/mouth_slugpath-icon.png"
                alt="SlugPath Talking"
                fill
                unoptimized
                priority
                className={`${styles.logoImage} ${styles.mouthLayer} ${isOpen ? styles.activeFace : styles.hiddenFace
                  }`}
                draggable={false}
              />

              {/* 4. Talking + blinking mouth face (text bubble open, eyes blinking) */}
              <Image
                src="/blink_mouth_slugpath-icon.png"
                alt="SlugPath Talking & Blinking"
                fill
                unoptimized
                priority
                className={`${styles.logoImage} ${styles.blinkMouthLayer} ${isOpen && isBlinking ? styles.activeFace : styles.hiddenFace
                  }`}
                draggable={false}
              />
            </div>
          </a>
        )}
      </div>
    </aside>
  );
}
