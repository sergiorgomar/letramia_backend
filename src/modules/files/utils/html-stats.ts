import { load } from 'cheerio';

export function getHtmlStats(html: string) {
  const $ = load(html);

  $('script, style, noscript').remove();

  const text = $('body')
    .text()
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wordSegmenter = new Intl.Segmenter('es-MX', {
    granularity: 'word',
  });

  const characterSegmenter = new Intl.Segmenter('es-MX', {
    granularity: 'grapheme',
  });

  let wordCount = 0;

  for (const segment of wordSegmenter.segment(text)) {
    if (segment.isWordLike) wordCount++;
  }

  let characterCount = 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of characterSegmenter.segment(text)) {
    characterCount++;
  }

  return {
    wordCount,
    characterCount,
  };
}
