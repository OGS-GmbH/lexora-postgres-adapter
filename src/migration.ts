import type { PostgresSql } from "./types.js";

async function migrate(sql: PostgresSql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS locales (
      id bigserial NOT NULL PRIMARY KEY,
      name text NOT NULL UNIQUE,
      code text NOT NULL UNIQUE,
      is_default boolean NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS scopes (
      id bigserial NOT NULL PRIMARY KEY,
      name text NOT NULL UNIQUE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS translations (
      id bigserial NOT NULL PRIMARY KEY,
      token text NOT NULL,
      value text NOT NULL,
      scope_id bigint,
      locale_id bigint NOT NULL,
      CONSTRAINT unique_translations UNIQUE (token, scope_id, locale_id),
      CONSTRAINT fk_scopes
        FOREIGN KEY (scope_id)
        REFERENCES scopes(id),
      CONSTRAINT fk_locales
        FOREIGN KEY (locale_id)
        REFERENCES locales(id)
    );
  `;
}

export { migrate };
