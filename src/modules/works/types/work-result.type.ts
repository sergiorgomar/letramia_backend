export type WorkResult = {
  id: string;
  userId: string;
  workCategoryId: string;
  workTypeId: string;
  title: string;
  slug: string;
  synopsis: string | null;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};
