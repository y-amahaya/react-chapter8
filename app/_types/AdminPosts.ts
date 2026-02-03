export type AdminPostCategory = {
  category: {
    id: number;
    name: string;
  };
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
