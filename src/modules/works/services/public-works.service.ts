import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import {
  PublishedWorkEntity,
  WorksRepository,
} from '../repositories/works.repository';
import { WorkChaptersRepository } from '../repositories/work-chapters.repository';
import { WorkCategoriesRepository } from '../repositories/work-categories.repository';
import { WorkTypesRepository } from '../repositories/work-types.repository';
import { ListPublishedWorks } from '../types/list-published-works.type';
import { PublishedWorkSort } from '../types/published-work-sort.enum';
import { PublishedWorkResult } from '../types/published-work-result.type';
import { PublishedWorkDetailResult } from '../types/published-work-detail-result.type';
import { PublishedChapterContentResult } from '../types/published-chapter-content-result.type';
import { PublishedCategoryResult } from '../types/published-category-result.type';
import { slugify } from '../utils/slugify';
import { ConfigService } from '@nestjs/config';

// Margen de seguridad: se re-firma un poco antes de que venza de verdad,
// para no arriesgarse a servir una URL que expira a mitad de un request.
const COVER_URL_REFRESH_MARGIN_MS = 5 * 60 * 1000;

type CoverVariant = 'thumb' | 'small' | 'medium' | 'large';

// Las tarjetas del catálogo (grillas chicas) piden el thumbnail; la ficha de
// detalle y el destacado del banner necesitan más resolución.
const CATALOG_COVER_VARIANT: CoverVariant = 'thumb';
const DETAIL_COVER_VARIANT: CoverVariant = 'medium';

const CACHED_COVER_FIELD = {
  thumb: 'coverThumbUrl',
  small: 'coverSmallUrl',
  medium: 'coverMediumUrl',
  large: 'coverLargeUrl',
} as const satisfies Record<CoverVariant, keyof PublishedWorkEntity>;

@Injectable()
export class PublicWorksService {
  constructor(
    private readonly worksRepository: WorksRepository,
    private readonly workChaptersRepository: WorkChaptersRepository,
    private readonly workCategoriesRepository: WorkCategoriesRepository,
    private readonly workTypesRepository: WorkTypesRepository,
    private readonly supabaseStorageProvider: SupabaseStorageProvider,
    private readonly configService: ConfigService,
  ) {}

  async buildSitemap(): Promise<string> {
    const [works, chapters, categories, types] = await Promise.all([
      this.worksRepository.findSitemapWorks(),
      this.worksRepository.findSitemapChapters(),
      this.findAllCategories(),
      this.findAllTypes(),
    ]);
    const baseUrl = 'https://letramia.com';
    const entries: { path: string; lastModified?: Date }[] = [
      { path: '/' },
      { path: '/categoria/todos' },
      ...works.map((work) => ({
        path: `/${work.slug}`,
        lastModified: work.updatedAt,
      })),
      ...chapters.map((chapter) => ({
        path: `/${chapter.workSlug}/${chapter.chapterSlug}`,
        lastModified: chapter.updatedAt,
      })),
      ...categories.map((category) => ({
        path: `/categoria/${category.slug}`,
      })),
      ...types.map((type) => ({ path: `/tipo-obra/${type.slug}` })),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
      .map(
        (entry) =>
          `\n  <url><loc>${escapeXml(`${baseUrl}${entry.path}`)}</loc>${entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : ''}</url>`,
      )
      .join('')}\n</urlset>`;
  }

  // Las categorías no tienen columna slug: se deriva del nombre. Es un
  // catálogo chico y curado, así que alcanza para tener URLs legibles sin
  // sumar una migración. Si algún día dos categorías colisionan, toca
  // persistir el slug de verdad.
  async findAllCategories(): Promise<PublishedCategoryResult[]> {
    const categories = await this.workCategoriesRepository.findAll();
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: slugify(category.name),
    }));
  }

  async findAllTypes(): Promise<PublishedCategoryResult[]> {
    const types = await this.workTypesRepository.findAll();
    return types.map((type) => ({ id: type.id, name: type.name, slug: slugify(type.name) }));
  }

  async findAllPublished(
    filters: ListPublishedWorks,
  ): Promise<PublishedWorkResult[]> {
    let categoryId: string | undefined;
    let typeId: string | undefined;

    if (filters.categorySlug) {
      const category = await this.findCategoryBySlug(filters.categorySlug);
      // Slug inexistente: no es un error, simplemente no hay resultados.
      if (!category) return [];
      categoryId = category.id;
    }
    if (filters.typeSlug) {
      const type = (await this.findAllTypes()).find((item) => item.slug === filters.typeSlug);
      if (!type) return [];
      typeId = type.id;
    }

    const works = await this.worksRepository.findAllPublished({
      categoryId,
      typeId,
      search: filters.search,
      orderBy:
        filters.sort === PublishedWorkSort.ALPHABETICAL
          ? 'alphabetical'
          : 'recent',
    });

    return Promise.all(
      works.map((work) => this.toPublishedWork(work, CATALOG_COVER_VARIANT)),
    );
  }

  async findPublishedBySlug(slug: string): Promise<PublishedWorkDetailResult> {
    const work = await this.worksRepository.findPublishedBySlug(slug);
    if (!work) {
      throw new AppException('PUBLISHED_WORK_NOT_FOUND', { slug });
    }

    const chapters = await this.workChaptersRepository.findAllByWorkId(work.id);
    const base = await this.toPublishedWork(work, DETAIL_COVER_VARIANT);
    const isPoem = base.isPoem && chapters.length === 0;
    const content = isPoem
      ? await this.supabaseStorageProvider.downloadText(`works/${work.id}/poem.html`)
      : null;

    return {
      ...base,
      isPoem,
      content,
      chapters: chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        slug: chapter.slug,
        sequence: chapter.sequence,
      })),
    };
  }

  async findPublishedChapter(
    workSlug: string,
    chapterSlug: string,
  ): Promise<PublishedChapterContentResult> {
    const work = await this.worksRepository.findPublishedBySlug(workSlug);
    if (!work) {
      throw new AppException('PUBLISHED_WORK_NOT_FOUND', { slug: workSlug });
    }
    if (work.typeName === 'Poema') {
      throw new AppException('PUBLISHED_CHAPTER_NOT_FOUND', { workSlug, chapterSlug });
    }

    const chapter = await this.workChaptersRepository.findByWorkIdAndSlug(
      work.id,
      chapterSlug,
    );
    if (!chapter) {
      throw new AppException('PUBLISHED_CHAPTER_NOT_FOUND', {
        workSlug,
        chapterSlug,
      });
    }

    const content = await this.supabaseStorageProvider.downloadText(
      `works/${work.id}/chapters/${chapter.id}.html`,
    );

    return {
      id: chapter.id,
      title: chapter.title,
      slug: chapter.slug,
      sequence: chapter.sequence,
      content,
    };
  }

  private async findCategoryBySlug(slug: string) {
    const categories = await this.findAllCategories();
    return categories.find((category) => category.slug === slug);
  }

  // Mismo cache-aside que el módulo privado: si la signed URL guardada sigue
  // vigente se reutiliza, y si venció se vuelve a firmar y se persiste.
  private async toPublishedWork(
    work: PublishedWorkEntity,
    variant: CoverVariant,
  ): Promise<PublishedWorkResult> {
    return {
      id: work.id,
      title: work.title,
      slug: work.slug,
      synopsis: work.synopsis,
      authorName: work.authorName,
      categoryId: work.categoryId,
      categoryName: work.categoryName,
      categorySlug: slugify(work.categoryName),
      typeId: work.typeId,
      typeName: work.typeName,
      isPoem: work.typeName === 'Poema',
      coverUrl: await this.resolveCoverUrl(work, variant),
      createdAt: work.createdAt,
    };
  }

  private async resolveCoverUrl(
    work: PublishedWorkEntity,
    variant: CoverVariant,
  ): Promise<string | null> {
    if (!work.coverMediumUrl) return null;

    const stillValid =
      work.coverUrlExpiresAt &&
      work.coverUrlExpiresAt.getTime() - COVER_URL_REFRESH_MARGIN_MS >
        Date.now();
    if (stillValid) return work[CACHED_COVER_FIELD[variant]];

    const signed = await Promise.all(
      (['thumb', 'small', 'medium', 'large'] as const).map(async (name) => {
        const { url, expiresAt } =
          await this.supabaseStorageProvider.getSignedUrl(
            `works/${work.id}/cover/${name}.webp`,
          );
        return { name, url, expiresAt };
      }),
    );

    const urlByVariant = Object.fromEntries(
      signed.map(({ name, url }) => [name, url]),
    ) as Record<CoverVariant, string>;

    await this.worksRepository.updateCoverUrls(work.id, {
      coverThumbUrl: urlByVariant.thumb,
      coverSmallUrl: urlByVariant.small,
      coverMediumUrl: urlByVariant.medium,
      coverLargeUrl: urlByVariant.large,
      coverUrlExpiresAt: signed[0].expiresAt,
    });

    return urlByVariant[variant];
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
