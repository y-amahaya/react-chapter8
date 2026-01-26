"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Post } from "../../_types/Post";
import Image from "next/image";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetcher = async () => {
    setIsLoading(true);

    const res = await fetch(
      `https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/posts/${id}`
    );
    const data = await res.json();

    setPost(data.post);
    setIsLoading(false);
  };

  fetcher();
}, [id]);

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
        {post.thumbnailUrl && (
          <Image
            width={900}
            height={500}
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-auto block"
          />
        )}

        <div className="p-5">
          <div className="flex justify-between items-center">
            <p className="text-[#777] text-[14px] m-0">
              {new Date(post.createdAt).toLocaleDateString("ja-JP")}
            </p>

            <div className="flex gap-2">
              {post.categories.map((category) => (
                <span
                  key={`${post.id}-${category}`}
                  className="text-[#4c6ef5] border border-[#4c6ef5] px-2 py-1 text-[12px] rounded"
                >
                  {category}
                </span>
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
