"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return res.json();
};

export function usePendingClubs() {
  const { data, error, mutate, isValidating } = useSWR(
    "/api/admin/clubs/pending",
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    clubs: data?.clubs ?? [],
    loading: !data && !error,
    error,
    mutate,
    isValidating,
  };
}
