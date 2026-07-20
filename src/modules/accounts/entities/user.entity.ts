import {
  pgTable,
  pgEnum,
  boolean,
  uuid,
  varchar,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { UserType } from '@/infrastructure/auth/types/user-type.enum';
import { ProviderName } from '@/infrastructure/auth/types/provider-name.enum';

export const userTypeEnum = pgEnum(
  'user_type',
  Object.values(UserType) as [UserType, ...UserType[]],
);

export const providerNameEnum = pgEnum(
  'provider_name',
  Object.values(ProviderName) as [ProviderName, ...ProviderName[]],
);

export const userEntity = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Fuente de la verdad del usuario: no cambia aunque cambie el proveedor de auth.
    email: varchar('email', { length: 255 }).notNull().unique(),
    // Con qué proveedor se autentica hoy. Nunca viene del request, lo decide el backend.
    providerName: providerNameEnum('provider_name').notNull(),
    // El id/uid que ese proveedor le asigna al usuario.
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    // Escritor y/o Lector: clasificación del usuario, no un permiso. Puede tener ambos.
    userTypes: userTypeEnum('user_types').array().notNull(),
    active: boolean().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.providerName, table.providerId)],
);
