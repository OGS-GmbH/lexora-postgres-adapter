import {
  type AdapterOperationFnArgs,
  type AsyncAdapterFnReturn,
  type AsyncAdapterOperationFnReturn,
  type Translatables
} from "@ogs-gmbh/lexora";
import postgres from "postgres";
import { migrate } from "./migration.js";
import type {
  ExtendedPostgresAdapterOptions,
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
    get: async (operationArgs: AdapterOperationFnArgs): AsyncAdapterOperationFnReturn => {
      if (resolvedOptions?.getStatement !== undefined)
        return await resolvedOptions.getStatement(sql);

      const result = await sql<
        typeof operationArgs.scopes extends undefined
          ? TranslatableQueryResult[]
          : TranslatableQueryResultWithScopeName[]
      >`
        SELECT translatables.* ${operationArgs.scopes ? sql`, scopes.name as scope_name` : sql``}
        FROM translatables
        RIGHT JOIN locales
        ON translatables.locale_id = locales.id
        ${
          operationArgs.scopes
            ? sql`
              RIGHT JOIN scopes
              ON translatables.scope_id = scopes.id
            `
            : sql``
        }
        WHERE locales.code = ${operationArgs.locale}
        ${operationArgs.scopes ? sql`AND scopes.name = ANY(${operationArgs.scopes})` : sql``}
      `;

      if (operationArgs.scopes === undefined)
        return Object.fromEntries(result.map(({ token, value }) => [token, value]));

      const translatables: Translatables = {};

      for (const resultItem of result) {
        translatables[resultItem.scope_name] = {
          // @ts-expect-error
          ...translatables[resultItem.scope_name],
          [resultItem.token]: resultItem.value
        };
      }

      return translatables;
    }
  };
}

export { postgresAdapter };
