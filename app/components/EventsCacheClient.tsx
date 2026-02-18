"use client";

import { useEffect } from "react";

type EventCacheItem = {
  recordId: string;
  clubId?: string;
  eventTitle?: string;
  name?: string;
  eventDate?: string;
  eventLocation?: string;
  eventDescription?: string;
  iceBreakers?: string;
};

type Props = {
  events: EventCacheItem[];
};

const CACHE_KEY = "clubEventsCache_v1";

export default function EventsCacheClient({ events }: Props) {
  useEffect(() => {
    try {
      const payload = {
        ts: Date.now(),
        events,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [events]);

  return null;
}
