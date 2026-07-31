export type PageData = {
  sponsorBanner: Array<{
    imageUrl: string;
    title: string;
    slug: string;
    authorName: string;
    publishedAt: Date;
    synopsis: string;
    genreName: string;
    themeName: string;
  }>;
  themes: Array<{
    slug: string;
    name: string;
  }>;
  genres: Array<{
    slug: string;
    name: string;
  }>;
  lastWorks: Array<{
    slug: string;
    title: string;
    synopsis: string | null;
    coverUrl: string | null;
    authorName: string;
    genreName: string;
    themeName: string;
    publishedAt: Date;
  }>;
};
