export type WorkChapterContentResult = {
  id: string;
  workId: string;
  title: string;
  slug: string;
  sequence: number;
  // HTML leído del bucket en tiempo de ejecución. null si aún no se subió.
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
};
