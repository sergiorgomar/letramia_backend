export const WORK_CHAPTERS_ERROR_CATALOG = {
  WORK_CHAPTERS_REPOSITORY_FIND_WORK_BY_ID_AND_USER_ID_ERROR: {
    code: 'CHAP-0005',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.findWorkByIdAndUserId',
  },
  WORK_CHAPTERS_REPOSITORY_CREATE_ERROR: {
    code: 'CHAP-0006',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.create',
  },
  WORK_CHAPTERS_REPOSITORY_FIND_ALL_IDS_BY_WORK_ID_ERROR: {
    code: 'CHAP-0007',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.findAllIdsByWorkId',
  },
  WORK_CHAPTERS_REPOSITORY_FIND_BY_ID_AND_WORK_ID_ERROR: {
    code: 'CHAP-0008',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.findByIdAndWorkId',
  },
  WORK_CHAPTERS_REPOSITORY_FIND_BY_SLUG_AND_WORK_ID_ERROR: {
    code: 'CHAP-0009',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.findBySlugAndWorkId',
  },
  WORK_CHAPTERS_REPOSITORY_FIND_LAST_SEQUENCE_BY_WORK_ID_ERROR: {
    code: 'CHAP-0010',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.findLastSequenceByWorkId',
  },
  WORK_CHAPTERS_REPOSITORY_UPDATE_ORDER_ERROR: {
    code: 'CHAP-0011',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.updateOrder',
  },
  WORK_CHAPTERS_REPOSITORY_UPDATE_TITLE_ERROR: {
    code: 'CHAP-0013',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.updateTitle',
  },
  WORK_CHAPTERS_REPOSITORY_DELETE_AND_REORDER_ERROR: {
    code: 'CHAP-0014',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.deleteAndReorder',
  },
  WORK_CHAPTERS_REPOSITORY_MARK_AS_PUBLISHED_ERROR: {
    code: 'CHAP-0016',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.markAsPublished',
  },
  WORK_CHAPTERS_REPOSITORY_MARK_AS_REQUIRES_REVIEW_ERROR: {
    code: 'CHAP-0021',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.markAsRequiresReview',
  },
  WORK_CHAPTERS_REPOSITORY_MARK_AS_REJECTED_ERROR: {
    code: 'CHAP-0022',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.markAsRejected',
  },
  WORK_CHAPTERS_REPOSITORY_HAS_UNPUBLISHED_BEFORE_ERROR: {
    code: 'CHAP-0024',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Falló WorkChaptersRepository.hasUnpublishedBefore',
  },
  CHAPTER_WORK_NOT_FOUND: {
    code: 'CHAP-0004',
    status: 404,
    message: 'La obra solicitada no existe.',
    internalMessage:
      'No existe una obra con ese id que pertenezca al usuario al operar capítulos',
  },
  CHAPTER_NOT_FOUND: {
    code: 'CHAP-0001',
    status: 404,
    message: 'El capítulo solicitado no existe.',
    internalMessage:
      'El id no corresponde a ningún capítulo del libro indicado',
  },
  CHAPTER_TITLE_ALREADY_EXISTS: {
    code: 'CHAP-0002',
    status: 409,
    message: 'Ya existe un capítulo con ese nombre en este libro.',
    internalMessage:
      'El slug derivado del título ya está usado por otro capítulo del mismo libro',
  },
  CHAPTER_REORDER_MISMATCH: {
    code: 'CHAP-0003',
    status: 400,
    message: 'El nuevo orden debe incluir todos los capítulos del libro.',
    internalMessage:
      'La lista de ids recibida no coincide exactamente con los capítulos del libro',
  },
  CHAPTERS_NOT_SUPPORTED_FOR_WORK_GENRE: {
    code: 'CHAP-0012',
    status: 400,
    message: 'El género de esta obra no admite capítulos.',
    internalMessage:
      'Se intentó crear un capítulo para una obra con supportsChapters = false',
  },
  CHAPTER_HTML_DELETE_ERROR: {
    code: 'CHAP-0015',
    status: 500,
    message: 'No se pudo eliminar el contenido del capítulo.',
    internalMessage:
      'Falló la eliminación del HTML del capítulo en el almacenamiento privado',
  },
  CHAPTER_ALREADY_PUBLISHED: {
    code: 'CHAP-0017',
    status: 409,
    message: 'Este capítulo ya fue publicado.',
    internalMessage: 'Se intentó publicar un capítulo con status published',
  },
  CHAPTER_HAS_NOT_MANUSCRIPT_FOR_PUBLISH: {
    code: 'CHAP-0018',
    status: 409,
    message: 'Este capítulo no tiene manuscrito. No se puede publicar.',
    internalMessage: 'Se intentó publicar un capítulo sin manuscrito',
  },
  CHAPTER_IS_TOO_SHORT: {
    code: 'CHAP-0019',
    status: 409,
    message: 'Este capítulo es demasiado corto.',
    internalMessage:
      'Se intentó publicar un capítulo con menos de 300 caracteres.',
  },
  CHAPTER_NOT_MORE_PUBLISH_ATTEMPTS: {
    code: 'CHAP-0023',
    status: 409,
    message:
      'Este capítulo ha sido rechazado por políticas de Letramía y no podrá ser publicado.',
    internalMessage: 'Se excedió el límite de reintentos del capítulo',
  },
  CHAPTER_MUST_BE_PUBLISHED_IN_ORDER: {
    code: 'CHAP-0025',
    status: 409,
    message: 'Debes publicar los capítulos anteriores antes de publicar este.',
    internalMessage:
      'Se intentó publicar un capítulo con capítulos anteriores sin publicar',
  },
  CHAPTER_PUBLISHED_POSITION_CANNOT_CHANGE: {
    code: 'CHAP-0026',
    status: 409,
    message: 'No puedes cambiar la posición de un capítulo publicado.',
    internalMessage:
      'Se intentó reordenar una obra cambiando la posición de un capítulo publicado',
  },
} as const;
