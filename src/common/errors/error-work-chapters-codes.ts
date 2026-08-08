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
} as const;
