"use client";

import useSWR from "swr";
import { supabase } from "@/app/_libs/supabase";

export const useThumbnailPublicUrl = (thumbnailImageKey: string) => {
  return useSWR<string | null>(
    thumbnailImageKey ? thumbnailImageKey : null,
    async (key: string) => {
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from("post_thumbnail")
        .getPublicUrl(key);

      return publicUrl ?? null;
    }
  );
};
