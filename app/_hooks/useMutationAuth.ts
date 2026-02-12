"use client";

import useSWRMutation from "swr/mutation";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

type UseMutationResult<TResult, TArg> = {
  trigger: (arg: TArg) => Promise<TResult>;
  isMutating: boolean;
  error: unknown;
  isReady: boolean;
};

export const useMutationAuth = <TResult, TArg>(
  endpoint: string | null,
  mutator: (url: string, token: string, arg: TArg) => Promise<TResult>
): UseMutationResult<TResult, TArg> => {
  const { token } = useSupabaseSession();

  const key: readonly [string, string] | null =
    token && endpoint ? [endpoint, token] : null;

  const { trigger: swrTrigger, isMutating, error } = useSWRMutation<
    TResult,
    unknown,
    readonly [string, string] | null,
    TArg
  >(key, async (k, { arg }) => {
    if (!k) throw new Error("Unexpected null key");
    const [url, t] = k;
    return mutator(url, t, arg);
  });

  const trigger = ((arg: TArg) =>
    (swrTrigger as unknown as (arg: TArg) => Promise<TResult>)(arg)) satisfies (
    arg: TArg
  ) => Promise<TResult>;

  return { trigger, isMutating, error, isReady: !!key };
};
