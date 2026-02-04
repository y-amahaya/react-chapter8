"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPostsIndexResponse } from "../../_types/AdminPosts";

export default function PostsPage() {
  const [posts, setPosts] = useState<AdminPostsIndexResponse["posts"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/admin/posts");

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data: AdminPostsIndexResponse = await res.json();
        setPosts(data.posts);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetcher();
  }, []);

  if (isLoading) {
    return (
      <main className="max-w-[900px] p-4 mx-auto">
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="max-w-[900px] p-4 mx-auto">

    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">記事一覧</h1>

      <Link
        href="/admin/posts/new"
        className="bg-[#4c6ef5] text-white px-4 py-2 rounded text-sm hover:opacity-90"
      >
        新規作成
      </Link>
    </div>

      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/admin/posts/${post.id}`}
          className="block border border-[#ddd] p-5 m-6 no-underline text-[inherit] hover:no-underline visited:text-[inherit]"
        >
          <div className="flex justify-between items-center">
            <p className="text-[#777] text-[14px] m-0">
              {new Date(post.createdAt).toLocaleDateString("ja-JP")}
            </p>

            <div className="flex gap-2">
              {post.postCategories.map((pc) => (
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
