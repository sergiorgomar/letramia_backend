export type PublishedWorkResult = {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  authorName: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  typeId: string;
  typeName: string;
  isPoem: boolean;
  coverUrl: string | null;
  createdAt: Date;
};
