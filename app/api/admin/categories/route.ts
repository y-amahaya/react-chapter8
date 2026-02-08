import { prisma } from '@/app/_libs/prisma'
import { authorize } from "@/app/_libs/authorize";
import { NextRequest, NextResponse } from "next/server";

export type CategoriesIndexResponse = {
  categories: {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
  }[]
}

export type CreateCategoryRequestBody = {
  name: string
}

export type CreateCategoryResponse = {
  id: number
}

export const GET = async (request: NextRequest) => {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;

  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json<CategoriesIndexResponse>(
      { categories },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}

export const POST = async (request: NextRequest) => {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;

  try {
    const body: CreateCategoryRequestBody = await request.json()
    const { name } = body

    const data = await prisma.category.create({
      data: { name },
    })

    return NextResponse.json<CreateCategoryResponse>(
      { id: data.id },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}
