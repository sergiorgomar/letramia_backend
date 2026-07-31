export const WORKS_ERROR_CATALOG = {
  WORK_THEME_NOT_FOUND: {
    code: 'WORK-0001',
    status: 404,
    message: 'La temática seleccionada no existe.',
    internalMessage: 'workThemeId no corresponde a ninguna temática existente',
  },
  WORK_GENRE_NOT_FOUND: {
    code: 'WORK-0002',
    status: 404,
    message: 'El género literario no existe.',
    internalMessage:
      'workGenreId no corresponde a ningún tipo de obra literaria existente',
  },
  WORK_NOT_FOUND: {
    code: 'WORK-0003',
    status: 404,
    message: 'La obra solicitada no existe.',
    internalMessage:
      'El id no corresponde a ninguna obra, o no pertenece al usuario autenticado',
  },
  WORK_COVER_FILE_MISSING: {
    code: 'WORK-0004',
    status: 400,
    message: 'Debes adjuntar un archivo de imagen.',
    internalMessage: 'No llegó ningún archivo en el campo "file" del multipart',
  },
  WORK_COVER_UNSUPPORTED_TYPE: {
    code: 'WORK-0005',
    status: 400,
    message: 'Formato de imagen no soportado.',
    internalMessage:
      'El mimetype del archivo no está en la whitelist de portadas',
  },
  WORK_COVER_INVALID_ASPECT_RATIO: {
    code: 'WORK-0006',
    status: 400,
    message:
      'La imagen debe tener proporción de portada de libro (vertical, entre 3:5 y 4:5).',
    internalMessage:
      'El ratio ancho/alto de la imagen está fuera del rango permitido para portadas',
  },
  WORK_CANNOT_PUBLISH_WITHOUT_CONTENT: {
    code: 'WORK-0007',
    status: 400,
    message: 'Agrega contenido a la obra antes de publicarla.',
    internalMessage: 'La obra no tiene capítulos o el poema no tiene poem.html',
  },
  WORK_CONTENT_FILE_MISSING: {
    code: 'WORK-0008',
    status: 400,
    message: 'No se ha agregado contenido.',
    internalMessage: 'No se ha agregado un documento de contenido par ala obra',
  },
  WORK_CONTENT_UNSUPPORTED_TYPE: {
    code: 'WORK-0009',
    status: 400,
    message: 'Formato de contenido no soportadp.',
    internalMessage: 'El mimetype del archivo de contenido no es HTML',
  },
  WORK_CONTENT_INFO_FILE_MISSING: {
    code: 'WORK-0010',
    status: 400,
    message: 'No se ha agregado información.',
    internalMessage:
      'No se ha agregado informacion del documento para el contenido',
  },
  WORK_CONTENT_INFO_NOT_CORRECT: {
    code: 'WORK-0011',
    status: 400,
    message: 'Fromato incorrecto.',
    internalMessage: '',
  },
  WORK_GENRE_NOT_UUID: {
    code: 'WORK-0012',
    status: 400,
    message: 'Formato incorrecto.',
    internalMessage: '',
  },
  WORK_CONTENT_UPLOAD_NOT_IMPLEMENTED_YET: {
    code: 'WORK-0012',
    status: 500,
    message: 'Lo sentimos, esta funcion no esta disponible',
    internalMessage: '',
  },
  WORK_CHAPTER_NOT_UUID: {
    code: 'WORK-0013',
    status: 400,
    message: 'Formato incorrecto.',
    internalMessage: '',
  },
  WORK_CHAPTER_DOES_NOT_EXIST: {
    code: 'WORK-0014',
    status: 400,
    message: 'El capitulo no existe.',
    internalMessage: '',
  },
} as const;
