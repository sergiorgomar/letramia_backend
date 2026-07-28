export type PublishedWorkResult = {
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
  coverUrl: string | null;
  createdAt: Date;
};
