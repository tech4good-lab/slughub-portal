"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return res.json();
};

export function usePendingAccessRequests() {
  const { data, error, mutate, isValidating } = useSWR(
    "/api/admin/access-requests/pending",
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    requests: data?.requests ?? [],
    loading: !data && !error,
    error,
    mutate,
    isValidating,
  };
}
