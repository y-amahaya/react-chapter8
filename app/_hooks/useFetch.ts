"use client";

import useSWR, { type KeyedMutator } from "swr";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

type UseFetchResult<T> = {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  mutate: KeyedMutator<T>;
};

const fetcherWithToken = async <T>(url: string, token: string): Promise<T> => {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  if (!res.ok) {
    const maybe = await res.json().catch(() => null);
    const msg = maybe?.message ?? `取得に失敗しました (${res.status})`;
    throw new Error(msg);
  }

  return res.json();
};

export const useFetch = <T>(endpoint: string | null): UseFetchResult<T> => {
  const { token } = useSupabaseSession();

  const key: readonly [string, string] | null =
    token && endpoint ? [endpoint, token] : null;

  const { data, error, isLoading, mutate } = useSWR<
    T,
    unknown,
    readonly [string, string] | null
  >(
    key,
    (k) => {
      if (!k) throw new Error("Unexpected null key");
      const [url, t] = k;
      return fetcherWithToken<T>(url, t);
    }
  );

  return { data, error, isLoading, mutate };
};
