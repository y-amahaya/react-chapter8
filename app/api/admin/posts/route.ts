import { prisma } from '@/app/_libs/prisma'
import { supabase } from "@/app/_libs/supabase";
import { NextRequest, NextResponse } from "next/server";

export type CreatePostRequestBody = {
  title: string
  content: string
  categories: { id: number }[]
  thumbnailImageKey: string
}

export type CreatePostResponse = {
  id: number
}

export type PostIndexResponse = {
  posts: {
    id: number
    title: string
    content: string
    thumbnailImageKey: string
    createdAt: Date
    updatedAt: Date
    postCategories: {
      category: {
        id: number
        name: string
      }
    }[]
  }[]
}

const authorize = async (request: NextRequest) => {
  const token = request.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);

  if (error) {
    return NextResponse.json({ status: error.message }, { status: 400 });
  }

  return null;
};

export const GET = async (request: NextRequest) => {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;

  try {
    const posts = await prisma.post.findMany({
      include: {
        postCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ posts }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

export const POST = async (request: NextRequest) => {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;

  try {
    const body: CreatePostRequestBody = await request.json()

    const { title, content, categories, thumbnailImageKey } = body

    const data = await prisma.post.create({
      data: {
        title,
        content,
        thumbnailImageKey,
      },
    })

    for (const category of categories) {
      await prisma.postCategory.create({
        data: {
          categoryId: category.id,
          postId: data.id,
        },
      })
    }

    return NextResponse.json<CreatePostResponse>({
      id: data.id,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}
