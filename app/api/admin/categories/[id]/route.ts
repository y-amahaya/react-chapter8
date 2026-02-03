import { prisma } from '@/app/_libs/prisma'
import { NextRequest, NextResponse } from 'next/server'

const parseId = async (params: Promise<{ id: string }>) => {
  const { id } = await params
  return parseInt(id, 10)
}

export type CategoryShowResponse = {
  category: {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
  }
}

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const id = await parseId(params)

    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json(
        { message: 'カテゴリーが見つかりません。' },
        { status: 404 },
      )
    }

    return NextResponse.json<CategoryShowResponse>(
      { category },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}

export type UpdateCategoryRequestBody = {
  name: string
}

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const id = await parseId(params)
    const { name }: UpdateCategoryRequestBody = await request.json()

    await prisma.category.update({
      where: { id },
      data: { name },
    })

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
  try {
    const id = await parseId(params)

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}
