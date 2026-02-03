export type Category = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoriesIndexResponse = {
  categories: Category[];
};

export type CreateCategoryRequestBody = {
  name: string;
};

export type CategoryShowResponse = {
  category: Category;
};

export type UpdateCategoryRequestBody = {
  name: string;
};
