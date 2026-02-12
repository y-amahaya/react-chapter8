"use client";

import useSWR, { type KeyedMutator } from "swr";

type UseFetchResult<T> = {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  mutate: KeyedMutator<T>;
};

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const maybe = await res.json().catch(() => null);
    const msg = maybe?.message ?? `取得に失敗しました (${res.status})`;
    throw new Error(msg);
  }

  return res.json();
};

export const useFetchPublic = <T>(endpoint: string | null): UseFetchResult<T> => {
  const key = endpoint ?? null;
  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher);
  return { data, error, isLoading, mutate };
};
