# Reglas obligatorias para implementar módulos

Estas reglas son restricciones de implementación. Deben cumplirse antes de
escribir código. Si una petición del usuario contradice una regla, se debe pedir
aclaración antes de continuar.

## 1. Capas y dependencias permitidas

El flujo permitido es siempre:

`Controller -> Service -> Repository`

- Un controller solo puede depender de su service padre.
- Un service solo puede depender de su repository padre.
- Un repository solo puede ser inyectado y usado por su service padre.
- Un service no puede inyectar, llamar ni reutilizar el repository de otro
  service.
- Un repository no puede llamar a otro repository.
- Si un service necesita validar información de otra entidad, la consulta debe
  vivir en su propio repository. Ese repository puede hacer los `join` de base
  de datos necesarios, pero no puede depender de otro repository.

Ejemplo válido para capítulos: `WorkChaptersController ->
WorkChaptersService -> WorkChaptersRepository`. Si el service de capítulos debe
validar que la obra pertenece al usuario, esa consulta se implementa en
`WorkChaptersRepository`; no se usa `WorksRepository` ni `WorksService`.

## 2. Alcance de cambios

- Solo se modifica el módulo solicitado.
- No se modifica otro controller, service, repository, entity, DTO o type sin
  permiso explícito.
- La única excepción es registrar en `src/common/errors/` los errores nuevos
  que necesite el módulo solicitado.
- Antes de reescribir una funcionalidad, se inventarían todos sus archivos,
  imports y consumidores. No se eliminan entidades o contratos compartidos sin
  confirmar que se reemplazarán en la misma tarea.

## 3. DTOs

- Los DTOs existen únicamente en controllers.
- Cada endpoint tiene sus DTOs propios de entrada y salida.
- Un DTO no se reutiliza en un segundo endpoint, aunque tenga la misma forma.
- Services y repositories nunca reciben, retornan ni importan DTOs.
- No se crean DTOs para services ni repositories.
- Los datos del DTO se pasan del controller al service mediante parámetros
  explícitos. No se propaga el objeto DTO completo.

## 4. Types

- No crear types para transportar datos entre controller, service y repository.
- Preferir inferencia de TypeScript en services y repositories.
- Crear un type solo si es estrictamente necesario para el repository o service
  que lo posee; no compartirlo entre capas ni módulos sin autorización.
- Si se reconstruye una funcionalidad, eliminar sus types antiguos antes de
  crear los necesarios.

## 5. Métodos de service y repetición de código

- No crear helpers privados, métodos internos, métodos utilitarios ni
  abstracciones de reutilización dentro de un service sin autorización previa.
- No extraer código repetido a un método privado.
- Si hay código repetido, mantenerlo explícito en cada flujo y agregar justo
  encima de la repetición:

  `//🔥 TODO: <explicar qué está repetido y que no se debe extraer sin aprobación>.`

- Un service debe contener únicamente sus métodos de caso de uso y la lógica
  explícita de esos casos.

## 6. Errores y trazabilidad

- Todo error usado por el módulo debe registrarse primero en
  `src/common/errors/` y después usarse mediante `AppException` o
  `@HandleErrors`.
- No usar errores genéricos como `DATABASE_ERROR` para operaciones de un
  repository del módulo.
- Cada método de cada repository debe tener su propio error registrado y su
  propio código único. No se comparte un error entre métodos.
- El nombre del error debe identificar repository y método. Ejemplo:
  `WORK_CHAPTERS_REPOSITORY_FIND_BY_ID_AND_WORK_ID_ERROR`.
- El `internalMessage` debe identificar exactamente el método que falló.
  Ejemplo: `Falló WorkChaptersRepository.findByIdAndWorkId`.
- Los códigos públicos también deben ser únicos en todo el catálogo. Antes de
  agregar uno, verificar que no exista otro con el mismo `code`.
- Los errores de dominio del flujo también deben pertenecer al catálogo del
  módulo. Un flujo de capítulos no debe lanzar `WORK_NOT_FOUND`; debe usar un
  error de capítulos registrado, por ejemplo `CHAPTER_WORK_NOT_FOUND`.

## 7. Proceso obligatorio antes de implementar

1. Leer las reglas del módulo y revisar su árbol de archivos.
2. Localizar todos los imports y consumidores de la funcionalidad objetivo.
3. Identificar los endpoints, sus DTOs exclusivos, casos de uso del service,
   métodos del repository y errores requeridos.
4. Registrar todos los errores antes de referenciarlos en código.
5. Implementar respetando las capas y el alcance permitido.
6. Verificar que cada `@HandleErrors` del repository use un error único del
   método correspondiente.
7. Ejecutar formato y comprobación de tipos o build sin modificar archivos fuera
   del alcance autorizado.

## 8. Cuando se solicita reescribir una funcionalidad

- Tratar la implementación existente de la funcionalidad como descartable.
- Eliminar primero los DTOs, types, métodos, endpoints y errores obsoletos de
  esa funcionalidad.
- Reescribir desde cero respetando estas reglas.
- Si la funcionalidad estaba acoplada a otro service o repository, eliminar ese
  acoplamiento durante la reescritura.
- Mantener entidades o contratos consumidos por otros módulos solo si son
  necesarios; reescribirlos en el mismo lugar sin cambiar su contrato externo,
  salvo permiso explícito.
