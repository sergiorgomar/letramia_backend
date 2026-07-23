export const CATALOG_ERROR_CATALOG = {
  PUBLISHED_WORK_NOT_FOUND: {
    code: 'CAT-0001',
    status: 404,
    message: 'La obra que buscas no existe o todavía no está publicada.',
    internalMessage:
      'El slug no corresponde a ninguna obra con status = published',
  },
  PUBLISHED_CHAPTER_NOT_FOUND: {
    code: 'CAT-0002',
    status: 404,
    message: 'El capítulo que buscas no existe.',
    internalMessage:
      'El slug no corresponde a ningún capítulo de la obra publicada',
  },
} as const;
