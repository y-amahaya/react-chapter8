import type { Category } from "@/app/_types/Category";

export type AdminPostCategory = {
  category: Pick<Category, "id" | "name">;
};

export type AdminPost = {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  postCategories: AdminPostCategory[];
};

export type AdminPostsIndexResponse = {
  posts: AdminPost[];
};

export type PostShowResponse = {
  post: {
    id: number;
    title: string;
    content: string;
    thumbnailUrl: string;
    createdAt: string;
    updatedAt: string;
    postCategories: {
      category: Category;
    }[];
  };
};