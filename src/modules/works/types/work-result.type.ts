export type WorkResult = {
  id: string;
  title: string;
  workCategoryId: string;
  workTypeId: string;
  synopsis: string | null;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};
