export type PublishedWorkResult = {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  authorName: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  coverUrl: string | null;
  createdAt: Date;
};
