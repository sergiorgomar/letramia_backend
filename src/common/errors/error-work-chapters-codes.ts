export const WORK_CHAPTERS_ERROR_CATALOG = {
  CHAPTER_NOT_FOUND: {
    code: 'CHAP-0001',
    status: 404,
    message: 'El capítulo solicitado no existe.',
    internalMessage:
      'El id no corresponde a ningún capítulo del libro indicado',
  },
  CHAPTER_CONTENT_FILE_MISSING: {
    code: 'CHAP-0002',
    status: 400,
    message: 'Debes adjuntar un archivo HTML con el contenido del capítulo.',
    internalMessage: 'No llegó ningún archivo en el campo "file" del multipart',
  },
  CHAPTER_CONTENT_UNSUPPORTED_TYPE: {
    code: 'CHAP-0003',
    status: 400,
    message: 'El contenido del capítulo debe ser un archivo HTML.',
    internalMessage: 'El mimetype del archivo no es text/html',
  },
  CHAPTER_TITLE_ALREADY_EXISTS: {
    code: 'CHAP-0004',
    status: 409,
    message: 'Ya existe un capítulo con ese nombre en este libro.',
    internalMessage:
      'El slug derivado del título ya está usado por otro capítulo del mismo libro',
  },
  CHAPTER_REORDER_MISMATCH: {
    code: 'CHAP-0005',
    status: 400,
    message: 'El nuevo orden debe incluir todos los capítulos del libro.',
    internalMessage:
      'La lista de ids recibida no coincide exactamente con los capítulos del libro',
  },
} as const;
