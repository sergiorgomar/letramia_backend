export type PageData = {
  sponsorBanner: Array<{
    imageUrl: string;
    title: string;
    slug: string;
  }>;
  themes: Array<{
    id: string;
    name: string;
  }>;
  genres: Array<{
    id: string;
    name: string;
  }>;
  lastWorks: Array<{
    slug: string;
    title: string;
    synopsis: string | null;
    thumbCoverUrl: string | null;
  }>;
};
