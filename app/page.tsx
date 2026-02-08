"use client";

import useSWR from "swr";
import Link from "next/link";
import type { PostsIndexResponse } from "@/app/api/posts/route";

type ClientPost = Omit<PostsIndexResponse["posts"][number], "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export default function PostsPage() {
  const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const data: PostsIndexResponse = await res.json();
    return data.posts as unknown as ClientPost[];
  };

  const { data: posts, error, isLoading } = useSWR<ClientPost[]>("/api/posts", fetcher);

    if (isLoading) {
      return (
        <main className="max-w-[900px] p-4 mx-auto">
          <p>読み込み中...</p>
        </main>
      );
    }

  return (
    <main className="max-w-[900px] p-4 mx-auto">
      {(posts ?? []).map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="block border border-[#ddd] p-5 m-6 no-underline text-[inherit] hover:no-underline visited:text-[inherit]"
        >
          <div className="flex justify-between items-center">
            <p className="text-[#777] text-[14px] m-0">
              {new Date(post.createdAt).toLocaleDateString("ja-JP")}
            </p>

            <div className="flex gap-2">
              {(post.postCategories ?? []).map((pc) => (
                <span
                  key={pc.category.id}
                  className="text-[#4c6ef5] border border-[#4c6ef5] px-2 py-1 text-[12px] rounded"
                >
                  {pc.category.name}
                </span>
              ))}
            </div>
          </div>

          <h2 className="my-4 mx-auto font-normal">{post.title}</h2>

          <div
            className="text-[15px] m-0 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Link>
      ))}
    </main>
  );
}
