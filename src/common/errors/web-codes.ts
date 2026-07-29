export const WEB_ERROR_CATALOG = {
  WEB_CONTENT_NOT_FOUND_FOR_SLUGS: {
    code: 'WEB-0001',
    status: 404,
    message: 'No existe contenido para esta obra.',
    internalMessage: 'Se han enviado slugs que no arrojaron resultados',
  },
} as const;
