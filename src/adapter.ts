import {
  type AdapterOperationFnArgs,
  type AsyncAdapterFnReturn,
  type AsyncAdapterLangsFnReturn,
  type AsyncAdapterOperationFnReturn,
  type ScopedTranslationsByToken
} from "@ogs-gmbh/lexora";
import postgres from "postgres";
import { migrate } from "./migration.js";
import type {
  ExtendedPostgresAdapterOptions,
  LocaleQueryResult,
  TranslatableQueryResult,
  TranslatableQueryResultWithScopeName
} from "./types.js";

/**
 * Adapter for using Postgres as data source for Lexora
 *
 * @param options - {@link ExtendedPostgresAdapterOptions} for configuring the adapter
 * @returns A `AsyncAdapterFnReturn` that'll be picked up by lexora
 *
 * @author Simon Kovtyk
 * @since 1.0.0
 * @category Adapter
 */
async function postgresAdapter<T extends Record<string, postgres.PostgresType>>(
  options?: ExtendedPostgresAdapterOptions<T>
): AsyncAdapterFnReturn;
/**
 * Adapter for using Postgres as data source for Lexora
 *
 * @param url - `string` as connection
 * @param options - {@link ExtendedPostgresAdapterOptions} for configuring the adapter
 * @returns A `AsyncAdapterFnReturn` that'll be picked up by lexora
 *
 * @author Simon Kovtyk
 * @since 1.0.0
 * @category Adapter
 */
async function postgresAdapter<T extends Record<string, postgres.PostgresType>>(
  url: string,
  options?: ExtendedPostgresAdapterOptions<T>
): AsyncAdapterFnReturn;
/**
 * Adapter for using Postgres as data source for Lexora
 *
 * @param url - `string` as connection or {@link ExtendedPostgresAdapterOptions}
 * @param options - {@link ExtendedPostgresAdapterOptions} for configuring the adapter
 * @returns A `AsyncAdapterFnReturn` that'll be picked up by lexora
 *
 * @author Simon Kovtyk
 * @since 1.0.0
 * @category Adapter
 */
async function postgresAdapter<T extends Record<string, postgres.PostgresType>>(
  urlOrOptions?: string | ExtendedPostgresAdapterOptions<T>,
  options?: ExtendedPostgresAdapterOptions<T>
): AsyncAdapterFnReturn {
  let sql;
  let resolvedOptions;

  if (typeof urlOrOptions === "string") {
    sql = postgres(urlOrOptions, options);
    resolvedOptions = options;
  } else {
    sql = postgres(urlOrOptions);
    resolvedOptions = urlOrOptions;
  }

  if (options?.autoMigration) {
    options.migrationStatement
      ? await Promise.resolve(options.migrationStatement(sql))
      : await migrate(sql);
  }

  return {
    getTranslatables: async (
      operationArgs: AdapterOperationFnArgs
    ): AsyncAdapterOperationFnReturn => {
      if (resolvedOptions?.getTranslatablesStatement !== undefined)
        return await resolvedOptions.getTranslatablesStatement(sql);

      const result = await sql<
        typeof operationArgs.scopes extends undefined
          ? TranslatableQueryResult[]
          : TranslatableQueryResultWithScopeName[]
      >`
        SELECT translatables.* ${operationArgs.scopes ? sql`, scopes.name as scope_name` : sql``}
        FROM translatables
        RIGHT JOIN locales
        ON translatables.locale_id = locales.id
        RIGHT JOIN scopes
        ON translatables.scope_id = scopes.id
        WHERE locales.code = ${operationArgs.lang}
        AND scopes.name = ANY(${operationArgs.scopes})
      `;

      const translatables: ScopedTranslationsByToken = {};

      for (const resultItem of result) {
        translatables[resultItem.scope_name] = {
          ...translatables[resultItem.scope_name],
          [resultItem.token]: resultItem.value
        };
      }

      return translatables;
    },
    getLangs: async (): AsyncAdapterLangsFnReturn => {
      if (resolvedOptions?.getLangsStatement !== undefined)
        return await resolvedOptions.getLangsStatement(sql);

      const result = await sql<LocaleQueryResult>`
        SELECT locales.name, locales.code
        FROM locales
      `;

      return result;
    }
  };
}

export { postgresAdapter };
