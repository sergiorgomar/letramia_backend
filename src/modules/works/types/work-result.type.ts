import { WorkStatus } from './work-status.enum';

export type WorkResult = {
  id: string;
  userId: string;
  workThemeId: string;
  workGenreId: string;
  title: string;
  slug: string;
  synopsis: string | null;
  status: WorkStatus;
  isPoem: boolean;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};
