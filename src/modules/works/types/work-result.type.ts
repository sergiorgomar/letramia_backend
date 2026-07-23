import { WorkStatus } from './work-status.enum';

export type WorkResult = {
  id: string;
  userId: string;
  workCategoryId: string;
  workTypeId: string;
  title: string;
  slug: string;
  synopsis: string | null;
  status: WorkStatus;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};
