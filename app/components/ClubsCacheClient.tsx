"use client";

import { useEffect } from "react";

type ClubCacheItem = {
  recordId: string;
  clubId?: string;
  name?: string;
  description?: string;
  status?: string;
  updatedAt?: string;
};

type Props = {
  clubs: ClubCacheItem[];
};

const CACHE_KEY = "leaderClubsCache_v1";

export default function ClubsCacheClient({ clubs }: Props) {
  useEffect(() => {
    try {
      const payload = {
        ts: Date.now(),
        clubs,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [clubs]);

  return null;
}
