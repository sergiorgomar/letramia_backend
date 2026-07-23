import { PublishedWorkSort } from './published-work-sort.enum';

export type ListPublishedWorks = {
  search?: string;
  // Slug de la categoría (no el id): la web usa slugs en sus URLs.
  categorySlug?: string;
  sort?: PublishedWorkSort;
};
