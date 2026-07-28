import { PublishedWorkChapterResult } from './published-work-chapter-result.type';

export type PublishedWorkDetailResult = {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  authorName: string;
  themeId: string;
  themeName: string;
  themeSlug: string;
  genreId: string;
  genreName: string;
  isPoem: boolean;
  content: string | null;
  coverUrl: string | null;
  createdAt: Date;
  chapters: PublishedWorkChapterResult[];
};
