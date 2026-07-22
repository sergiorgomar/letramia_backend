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
} as const;
