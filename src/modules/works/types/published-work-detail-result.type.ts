import { PublishedWorkChapterResult } from './published-work-chapter-result.type';

export type PublishedWorkDetailResult = {
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
  content: string | null;
  coverUrl: string | null;
  createdAt: Date;
  chapters: PublishedWorkChapterResult[];
};
