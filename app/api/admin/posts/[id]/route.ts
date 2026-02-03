import { prisma } from '@/app/_libs/prisma'
import { NextRequest, NextResponse } from 'next/server'

export type Category = {
  id: number
  name: string
}

export type PostShowResponse = {
  post: {
    id: number
    title: string
    content: string
    thumbnailUrl: string
    createdAt: Date
    updatedAt: Date
    postCategories: {
      category: Category
    }[]
  }
}

export type UpdatePostRequestBody = {
  title: string
  content: string
  categories: { id: number }[]
  thumbnailUrl: string
}

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        postCategories: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { message: '記事が見つかりません。' },
        { status: 404 },
      )
    }

    return NextResponse.json<PostShowResponse>({ post }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params

  const { title, content, categories, thumbnailUrl }: UpdatePostRequestBody =
    await request.json()

  try {
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { title, content, thumbnailUrl },
    })

    await prisma.postCategory.deleteMany({
      where: { postId: parseInt(id) },
    })

    for (const category of categories) {
      await prisma.postCategory.create({
        data: {
          postId: post.id,
          categoryId: category.id,
        },
      })
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params

  try {
    await prisma.post.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}
