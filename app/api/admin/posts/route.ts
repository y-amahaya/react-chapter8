import { prisma } from '@/app/_libs/prisma'
import { NextResponse } from 'next/server'

export type CreatePostRequestBody = {
  title: string
  content: string
  categories: { id: number }[]
  thumbnailUrl: string
}

export type CreatePostResponse = {
  id: number
}

export type PostIndexResponse = {
  posts: {
    id: number
    title: string
    content: string
    thumbnailUrl: string
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

export const GET = async () => {
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

export const POST = async (request: Request) => {
  try {
    const body: CreatePostRequestBody = await request.json()

    const { title, content, categories, thumbnailUrl } = body

    const data = await prisma.post.create({
      data: {
        title,
        content,
        thumbnailUrl,
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
