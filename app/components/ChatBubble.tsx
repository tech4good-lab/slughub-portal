"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
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
const ABOUT_URL = "https://chat.slughub.cc/about";
const EMIT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const AUTO_DISMISS_MS = 14 * 1000; // 14 seconds display per emission

export default function ChatBubble() {
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIndexRef = useRef<number>(-1);

  const emitRandomMessage = useCallback(() => {
    let nextIndex = Math.floor(Math.random() * CHAT_MESSAGES.length);
    if (CHAT_MESSAGES.length > 1 && nextIndex === lastMessageIndexRef.current) {
      nextIndex = (nextIndex + 1) % CHAT_MESSAGES.length;
    }
    lastMessageIndexRef.current = nextIndex;

    setCurrentMessage(CHAT_MESSAGES[nextIndex]);
    setIsOpen(true);

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, AUTO_DISMISS_MS);
  }, []);

  // Periodic 2-minute message emission & initial prompt
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      emitRandomMessage();
    }, 2500);

    const intervalTimer = setInterval(() => {
      emitRandomMessage();
    }, EMIT_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [emitRandomMessage]);

  // Handle eyes & mouth states (idle blink vs talking animation)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;

    const runBlinkCycle = () => {
      const nextDelay = 2200 + Math.random() * 2600;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          runBlinkCycle();
        }, 150);
      }, nextDelay);
    };

    runBlinkCycle();

    return () => {
      clearTimeout(blinkTimer);
    };
  }, [isOpen]);

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

  return (
    <aside className={styles.container} aria-label="SlugPath Chat Assistant">
      {/* Speech Text Bubble */}
      {isOpen && (
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
            <a
              href={ABOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bubbleLink}
              title="Learn about SlugPath"
            >
              About
            </a>
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

      {/* Main Slug Mascot Container (borderless, boxless avatar) */}
      <div className={`${styles.slugWrapper} ${styles.interactive}`}>
        <a
          href={CHAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.slugButton}
          aria-label="Open SlugPath Chat"
          title="Click to chat with SlugPath"
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
      </div>
    </aside>
  );
}
