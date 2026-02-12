"use client";

import useSWRMutation from "swr/mutation";

type UseMutationResult<TResult, TArg> = {
  trigger: (arg: TArg) => Promise<TResult>;
  isMutating: boolean;
  error: unknown;
  isReady: boolean;
};

const asArgTrigger = <TResult, TArg>(
  trigger: unknown
): ((arg: TArg) => Promise<TResult>) =>
  trigger as (arg: TArg) => Promise<TResult>;

export const useMutationPublic = <TResult, TArg>(
  endpoint: string | null,
  mutator: (url: string, arg: TArg) => Promise<TResult>
): UseMutationResult<TResult, TArg> => {
  const key: string | null = endpoint ? endpoint : null;

  const { trigger: swrTrigger, isMutating, error } = useSWRMutation<
    TResult,
    unknown,
    string | null,
    TArg
  >(key, async (url, { arg }) => {
    if (!url) throw new Error("Unexpected null key");
    return mutator(url, arg);
  });

  const trigger = (arg: TArg) => asArgTrigger<TResult, TArg>(swrTrigger)(arg);

  return { trigger, isMutating, error, isReady: !!key };
};
