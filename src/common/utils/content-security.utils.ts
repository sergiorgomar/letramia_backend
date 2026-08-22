import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';

export interface SpamAnalysis {
  isSpam: boolean;
  reasons: string[];
}

export interface ContentSecurityOptions {
  /** Los enlaces solo se permiten en contenido de pago. */
  allowLinks?: boolean;
  allowImages?: boolean;
  allowedImageUrlPrefix?: string;
}

export interface SanitizedHtmlStats {
  html: string;
  wordCount: number;
  characterCount: number;
}

/**
 * Utilidades para limpiar y validar contenido enriquecido de manuscripts.
 * No sustituye la moderación humana: solo detecta señales mecánicas de spam.
 */
export class ContentSecurityUtils {
  private static readonly ALLOWED_TAGS = new Set([
    'p',
    'br',
    'span',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'del',
    'mark',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'img',
  ]);

  private static readonly DROP_WITH_CONTENT = new Set([
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'svg',
    'math',
  ]);

  /** Conserva únicamente HTML y estilos seguros para el editor de manuscripts. */
  static sanitizeHtml(
    html: string | null | undefined,
    options: ContentSecurityOptions = {},
  ): string {
    if (!html) return '';

    const $ = cheerio.load(html, undefined, false);
    return this.sanitizeDocument($, options);
  }

  /** Sanitiza y calcula estadísticas usando una única carga del documento HTML. */
  static sanitizeHtmlWithStats(
    html: string | null | undefined,
    options: ContentSecurityOptions = {},
  ): SanitizedHtmlStats {
    if (!html) return { html: '', wordCount: 0, characterCount: 0 };

    const $ = cheerio.load(html, undefined, false);
    const sanitizedHtml = this.sanitizeDocument($, options);
    const text = this.getTextFromDocument($);
    const wordSegmenter = new Intl.Segmenter('es-MX', { granularity: 'word' });
    const characterSegmenter = new Intl.Segmenter('es-MX', {
      granularity: 'grapheme',
    });

    let wordCount = 0;
    for (const segment of wordSegmenter.segment(text)) {
      if (segment.isWordLike) wordCount++;
    }

    let characterCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of characterSegmenter.segment(text)) characterCount++;

    return { html: sanitizedHtml, wordCount, characterCount };
  }

  private static sanitizeDocument(
    $: CheerioAPI,
    options: ContentSecurityOptions,
  ): string {
    $(Array.from(this.DROP_WITH_CONTENT).join(',')).remove();

    $('*').each((_, element) => {
      if (element.type !== 'tag') return;

      const htmlElement = element as typeof element & {
        tagName: string;
        attribs: Record<string, string>;
      };
      const tagName = htmlElement.tagName.toLowerCase();

      if (
        !this.ALLOWED_TAGS.has(tagName) ||
        (tagName === 'a' && !options.allowLinks) ||
        (tagName === 'img' && !options.allowImages)
      ) {
        $(htmlElement).replaceWith($(htmlElement).contents());
        return;
      }

      const attributes = { ...htmlElement.attribs };
      for (const [name, value] of Object.entries(attributes) as [
        string,
        string,
      ][]) {
        const attribute = name.toLowerCase();

        if (attribute.startsWith('on')) {
          $(element).removeAttr(name);
          continue;
        }

        if (attribute === 'style') {
          const safeStyle = this.sanitizeStyle(value);
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          safeStyle
            ? $(element).attr('style', safeStyle)
            : $(element).removeAttr(name);
          continue;
        }

        if (tagName === 'a' && attribute === 'href') {
          if (!this.isSafeUrl(value)) $(element).removeAttr(name);
          continue;
        }

        if (tagName === 'a' && attribute === 'target') {
          if (value !== '_blank' && value !== '_self')
            $(element).removeAttr(name);
          continue;
        }

        if (tagName === 'img' && attribute === 'src') {
          if (!this.isSafeImageUrl(value, options.allowedImageUrlPrefix)) {
            $(element).remove();
            return;
          }
          continue;
        }

        if (tagName === 'img' && attribute === 'alt') {
          $(element).attr('alt', value.slice(0, 300));
          continue;
        }

        if (tagName !== 'a' || !['href', 'target', 'rel'].includes(attribute)) {
          $(element).removeAttr(name);
        }
      }

      if (tagName === 'a' && $(element).attr('target') === '_blank') {
        $(element).attr('rel', 'noopener noreferrer');
      }

      if (tagName === 'img' && !$(element).attr('src')) {
        $(element).remove();
      }
    });

    return $.root().html().trim();
  }

  /** Convierte HTML a texto normalizado para validaciones y búsquedas. */
  static htmlToPlainText(html: string | null | undefined): string {
    if (!html) return '';

    const $ = cheerio.load(this.sanitizeHtml(html), undefined, false);
    return this.getTextFromDocument($);
  }

  private static getTextFromDocument($: CheerioAPI): string {
    $('br').replaceWith(' ');
    $('p, blockquote, li, h1, h2, h3, h4, h5, h6').each((_, element) => {
      $(element).append(' ');
    });
    return $.text().replace(/\s+/g, ' ').trim();
  }

  /** Devuelve señales de spam; una palabra o tema por sí solo no marca spam. */
  static analyzeSpam(
    content: string | null | undefined,
    options: ContentSecurityOptions = {},
  ): SpamAnalysis {
    const text = this.htmlToPlainText(content);
    const normalized = text.toLocaleLowerCase('es-MX');
    const reasons: string[] = [];
    const words: string[] = text.match(/[\p{L}\p{N}_]+/gu) ?? [];

    let score = 0;

    // menos de 300 caracteres es conenido pobre
    if (text.length < 300) {
      score += 3;
      reasons.push('El contenido es demasiado corto.');
    }

    // Si tiene links
    const hasLinks = this.hasLinks(content);
    if (hasLinks && !options.allowLinks) {
      score += 10;
      reasons.push('Los enlaces solo están permitidos en contenido de pago.');
    }

    // Si se repita una misma letra 7 veces o mas -> aaaaaaa
    if (/(.)\1{7,}/iu.test(text)) {
      score += 5;
      reasons.push('El contenido tiene caracteres repetidos en exceso.');
    }

    // que la palabra se repita 5 veces o mas separada por espacios
    // -> hola hola hola hola -> test TesT TeSt TesT
    if (/\b([\p{L}\p{N}_]+)\b(?:\s+\1\b){4,}/iu.test(text)) {
      score += 5;
      reasons.push('El contenido tiene palabras repetidas en exceso.');
    }

    // evita frases repetidas muchas veces
    if (this.hasRepeatedPhrase(text)) {
      score += 5;
      reasons.push('El contenido tiene frases repetidas en exceso.');
    }

    // texto asd, qwe, test, lorem ipsum, prohibido
    if (/\b(?:(?:asd)+|(?:qwe)+|test(?:ing)?|lorem ipsum)\b/iu.test(text)) {
      score += 5;
      reasons.push('El contenido parece incluir texto de prueba.');
    }

    // validar spam de promociones
    const promotionalPatterns = [
      /\bcompra\s+ahora\b/iu,
      /\breg[ií]strate\s+ahora\b/iu,
      /\bhaz\s+clic(?:k)?\s+(?:aqu[ií]|ahora)\b/iu,
      /\boferta\s+(?:exclusiva|especial|limitada)\b/iu,
      /\btiempo\s+limitado\b/iu,
      /\b[uú]ltima\s+oportunidad\b/iu,
      /\bact[uú]a\s+ahora\b/iu,
      /\bgana(?:r)?\s+dinero\s+r[aá]pido\b/iu,
      /\bdinero\s+gratis\b/iu,
      /\bingresos\s+(?:garantizados|desde\s+casa)\b/iu,
      /\bresultados\s+garantizados\b/iu,
      /\bsin\s+riesgo\b/iu,
      /\bbono\s+(?:gratis|exclusivo|especial)\b/iu,
      /\bdescuento\s+(?:especial|exclusivo|del\s+\d+%?)\b/iu,
      /\bcupos?\s+limitados?\b/iu,
    ];

    let promotionalHits = 0;

    for (const pattern of promotionalPatterns) {
      if (pattern.test(normalized)) promotionalHits++;
    }

    if (promotionalHits >= 3) {
      score += promotionalHits * 2;
      reasons.push(
        'El contenido contiene múltiples señales de promoción o publicidad no solicitada.',
      );
    }

    // validar tasa de mayusculas, si mas del 35% son mayusculas
    const uppercaseLetters = [...text].filter((char) =>
      /\p{Lu}/u.test(char),
    ).length;

    const letters = [...text].filter((char) => /\p{L}/u.test(char)).length;

    if (letters >= 50 && uppercaseLetters / letters > 0.35) {
      score += 2;
      reasons.push('El contenido usa mayúsculas de forma excesiva.');
    }

    // tasa arriba del 3% de signos.
    const exclamations = (text.match(/[!¡]/g) ?? []).length;
    const exclamationRate = exclamations / Math.max(words.length, 1);
    if (words.length >= 100 && exclamationRate > 0.03) {
      score += 2;
      reasons.push('El contenido usa signos de exclamación en exceso.');
    }

    // Mas de 4 signos seguidos.
    if (/[!¡]{4,}/u.test(text)) {
      score += 2;
      reasons.push(
        'El contenido contiene una secuencia excesiva de signos de exclamación.',
      );
    }

    // detecta cosas que no tengan vocales, si el 10% sin palabras son sentido
    const gibberishWords = words.filter((word) => {
      if (word.length < 8) return false;
      const vowels = (word.match(/[aeiouáéíóúü]/giu) ?? []).length;
      return vowels / word.length < 0.2;
    });

    const gibberishRate = gibberishWords.length / Math.max(words.length, 1);
    if (gibberishRate >= 0.1) {
      score += 5;
      reasons.push(
        'El contenido parece contener texto aleatorio o sin sentido.',
      );
    }

    console.log({ score });

    return { isSpam: score >= 6, reasons };
  }

  static isSpam(
    content: string | null | undefined,
    options: ContentSecurityOptions = {},
  ): boolean {
    return this.analyzeSpam(content, options).isSpam;
  }

  private static hasLinks(content: string | null | undefined): boolean {
    if (!content) return false;

    const $ = cheerio.load(content, undefined, false);
    return $('a[href]').length > 0 || /https?:\/\/\S+/iu.test($.text());
  }

  private static hasRepeatedPhrase(text: string): boolean {
    const words = text.toLocaleLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? [];

    for (let phraseLength = 2; phraseLength <= 8; phraseLength++) {
      for (let start = 0; start + phraseLength * 4 <= words.length; start++) {
        const phrase = words.slice(start, start + phraseLength).join(' ');
        let repetitions = 1;

        while (
          words
            .slice(
              start + repetitions * phraseLength,
              start + (repetitions + 1) * phraseLength,
            )
            .join(' ') === phrase
        ) {
          repetitions++;
        }

        if (repetitions >= 4) return true;
      }
    }

    return false;
  }

  private static sanitizeStyle(style: string): string {
    return style
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const [property, ...valueParts] = declaration.split(':');
        return [
          property?.trim().toLowerCase(),
          valueParts.join(':').trim(),
        ] as const;
      })
      .filter(([property, value]) => {
        if (!property || !value) return false;
        if (property === 'text-align')
          return /^(left|center|right|justify)$/i.test(value);
        if (property === 'font-size') return /^\d{1,3}px$/i.test(value);
        if (property === 'line-height')
          return /^(?:1(?:\.\d)?|2(?:\.0)?)$/.test(value);
        if (property === 'color' || property === 'background-color') {
          return /^(#[0-9a-f]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\))$/i.test(
            value,
          );
        }
        return false;
      })
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
  }

  private static isSafeUrl(url: string): boolean {
    try {
      const parsed = new URL(url, 'https://letramia.local');
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  private static isSafeImageUrl(url: string, allowedPrefix?: string): boolean {
    if (!allowedPrefix) return false;
    try {
      const parsedUrl = new URL(url);
      const parsedPrefix = new URL(allowedPrefix);
      return (
        parsedUrl.origin === parsedPrefix.origin &&
        url.startsWith(allowedPrefix)
      );
    } catch {
      return false;
    }
  }
}
