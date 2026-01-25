"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Post } from "./_types/Post";

type PostsResponse = {
  posts: Post[];
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetcher = async () => {
      setIsLoading(true);

      const res = await fetch("https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/posts")

      const data: PostsResponse = await res.json()

      setPosts(data.posts)
      setIsLoading(false);
    }

    fetcher()
  }, [])

if (isLoading) {
  return (
    <main className="max-w-[900px] p-4 mx-auto">
      <p>読み込み中...</p>
    </main>
  );
}

  return (
    <main className="max-w-[900px] p-4 mx-auto">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="block border border-[#ddd] p-5 m-6 no-underline text-[inherit] hover:no-underline visited:text-[inherit]"
        >
          <div className="flex justify-between items-center">
            <p className="text-[#777] text-[14px] m-0">
              {new Date(post.createdAt).toLocaleDateString('ja-JP')}
            </p>

            <div className="flex gap-2">
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="text-[#4c6ef5] border border-[#4c6ef5] px-2 py-1 text-[12px] rounded"
                >
                  {category}
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
  )
}
