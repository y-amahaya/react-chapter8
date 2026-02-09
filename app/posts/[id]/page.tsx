"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import type { PostShowResponse } from "@/app/api/posts/[id]/route";
import Image from "next/image";
import { supabase } from "@/app/_libs/supabase";

type ClientPost = PostShowResponse["post"];

const fetcher = async (url: string): Promise<PostShowResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading } = useSWR<PostShowResponse>(
    id ? `/api/posts/${id}` : null,
    fetcher
  );

  const post: ClientPost | null = data?.post ?? null;

  const thumbnailImageUrl =
    post?.thumbnailImageKey
      ? supabase.storage
          .from("post_thumbnail")
          .getPublicUrl(post.thumbnailImageKey).data.publicUrl
      : null;

  if (isLoading) {
    return (
      <main className="max-w-[900px] p-4 mx-auto">
        <p>読み込み中...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-[900px] p-4 mx-auto">
        <p>記事が見つかりませんでした</p>
      </main>
    );
  }

  return (
    <main className="max-w-[900px] p-4 mx-auto">
      <div className="m-6 border border-[#ddd]">
        {thumbnailImageUrl && (
          <div className="w-full max-h-[400px] overflow-hidden">
            <Image
              width={900}
              height={500}
              src={thumbnailImageUrl}
              alt={post.title}
              className="w-full h-auto block"
            />
          </div>
        )}

        <div className="p-5">
          <div className="flex justify-between items-center">
            <p className="text-[#777] text-[14px] m-0">
              {new Date(post.createdAt).toLocaleDateString("ja-JP")}
            </p>

            <div className="flex gap-2">
              {post.postCategories.map((pc) => (
                <span key={pc.category.id}>{pc.category.name}</span>
              ))}
            </div>
          </div>

          <h2 className="my-4 mx-auto font-normal">{post.title}</h2>

          <div
            className="text-[15px] m-0 overflow-visible"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </main>
  );
}
