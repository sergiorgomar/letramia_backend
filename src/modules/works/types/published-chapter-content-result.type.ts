export type PublishedChapterContentResult = {
  id: string;
  title: string;
  slug: string;
  sequence: number;
  // HTML leído del bucket en tiempo de ejecución.
  content: string | null;
};
