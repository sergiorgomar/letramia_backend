import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { PRIVATE_STORAGE } from '@/common/constants';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import {
  PublishedWorkEntity,
  WorksRepository,
} from '../repositories/works.repository';
import { WorkChaptersRepository } from '../repositories/work-chapters.repository';
import { WorkThemesRepository } from '../repositories/work-themes.repository';
import { WorkGenresRepository } from '../repositories/work-genres.repository';
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
    private readonly workThemesRepository: WorkThemesRepository,
    private readonly workGenresRepository: WorkGenresRepository,
    @Inject(PRIVATE_STORAGE)
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
    const themes = await this.workThemesRepository.findAll();
    return themes.map((theme) => ({
      id: theme.id,
      name: theme.name,
      slug: slugify(theme.name),
    }));
  }

  async findAllTypes(): Promise<PublishedCategoryResult[]> {
    const genres = await this.workGenresRepository.findAll();
    return genres.map((genre) => ({ id: genre.id, name: genre.name, slug: slugify(genre.name) }));
  }

  async findAllPublished(
    filters: ListPublishedWorks,
  ): Promise<PublishedWorkResult[]> {
    let themeId: string | undefined;
    let genreId: string | undefined;

    if (filters.themeSlug) {
      const theme = await this.findCategoryBySlug(filters.themeSlug);
      // Slug inexistente: no es un error, simplemente no hay resultados.
      if (!theme) return [];
      themeId = theme.id;
    }
    if (filters.genreSlug) {
      const genre = (await this.findAllTypes()).find((item) => item.slug === filters.genreSlug);
      if (!genre) return [];
      genreId = genre.id;
    }

    const works = await this.worksRepository.findAllPublished({
      themeId,
      genreId,
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
    if (work.genreName === 'Poema') {
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
      themeId: work.themeId,
      themeName: work.themeName,
      themeSlug: slugify(work.themeName),
      genreId: work.genreId,
      genreName: work.genreName,
      isPoem: work.genreName === 'Poema',
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
      // coverUrlExpiresAt: signed[0].expiresAt,
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
