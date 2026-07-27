export const WORKS_ERROR_CATALOG = {
  WORK_CATEGORY_NOT_FOUND: {
    code: 'WORK-0001',
    status: 404,
    message: 'El género seleccionado no existe.',
    internalMessage: 'workCategoryId no corresponde a ninguna categoría existente',
  },
  WORK_TYPE_NOT_FOUND: {
    code: 'WORK-0002',
    status: 404,
    message: 'El tipo de obra seleccionado no existe.',
    internalMessage: 'workTypeId no corresponde a ningún tipo de obra existente',
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
    message: 'Formato de imagen no soportado. Usá JPG, PNG o WEBP.',
    internalMessage: 'El mimetype del archivo no está en la whitelist de portadas',
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
} as const;
