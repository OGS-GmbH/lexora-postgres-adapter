import type { Translatables } from "@ogs-gmbh/lexora";
import type postgres from "postgres";

/**
 * Utility type, that makes a type an optional promise.
 *
 * @since 1.0.0
 * @category Types
 * @author Simon Kovtyk
 */
type MaybePromise<T> = T | Promise<T>;

/**
 * Alias for `postgre.js` sql fn
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 * @category Types
 */
type PostgresSql = postgres.ISql;

/**
 * Options for this adapter
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 * @category Types
 */
type PostgresAdapterOptions = Partial<{
  /**
   * Callback, that enables to override the get statement
   * @param sql - sql fn from `postgres.js`
   * @returns A async/sync result of translatables
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  getStatement: (sql: PostgresSql) => MaybePromise<Translatables>;
  /**
   * Callback, that enables to override the auto migration statement
   * @param sql - sql fn from `postgres.js`
   * @returns A async/sync `Promise`
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  migrationStatement: (sql: PostgresSql) => MaybePromise<void>;
  /**
   * Flag to enable or disable automatic database migrations
   * @default `false`
   *
   * @since 1.0.0
   * @author Simon Kovtyk
   */
  autoMigration: boolean;
}>;

/**
 * Option combined with `postgres.js`
 *
 * @since 1.0.0
 * @category Types
 * @author Simon Kovtyk
 */
type ExtendedPostgresAdapterOptions<T extends Record<string, postgres.PostgresType>> =
  | (postgres.Options<T> & PostgresAdapterOptions)
  | undefined;

/**
 * Default model of a translatable relation
 *
 * @since 1.0.0
 * @category Types
 * @author Simon Kovtyk
 */
type TranslatableModel = {
  id: number;
  scope_id: number;
  token: string;
  value: string;
};

/**
 * Default model of a scope relation
 *
 * @since 1.0.0
 * @category Types
 * @author Simon Kovtyk
 */
type ScopeModel = {
  id: number;
  name: string;
};

/**
 * Default model of a locale relation
 *
 * @since 1.0.0
 * @category Types
 * @author Simon Kovtyk
 */
type LocaleModel = {
  id: number;
  name: string;
  code: string;
};

/**
 * Default query result when looking up translatables
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 * @category Types
 */
type TranslatableQueryResult = TranslatableModel;

/**
 * Default query result based on {@link TranslatableQueryResult} with an additional scope name
 *
 * @since 1.0.0
 * @author Simon Kovtyk
 * @category Types
 */
type TranslatableQueryResultWithScopeName = TranslatableQueryResult & {
  scope_name: string;
};

export type {
  MaybePromise,
  PostgresSql,
  PostgresAdapterOptions,
  ExtendedPostgresAdapterOptions,
  TranslatableModel,
  TranslatableQueryResult,
  TranslatableQueryResultWithScopeName,
  ScopeModel,
  LocaleModel
};
