---
prev: false
next: false
---

# Getting started

## Installation

### Prerequisites

- Node.js version 18 or higher.
- A package manager: e.g. npm, pnpm, ...

::: code-group

```sh [npm]
$ npm add @ogs-gmbh/lexora-postgres-adapter
```

```sh [pnpm]
$ pnpm add @ogs-gmbh/lexora-postgres-adapter
```

```sh [yarn]
$ yarn add @ogs-gmbh/lexora-postgres-adapter
```

```sh [bun]
$ bun add @ogs-gmbh/lexora-postgres-adapter
```

:::

### Usage

`lexora-postgres-adapter` uses [`postgres.js`](https://www.npmjs.com/package/postgres) under the hood. Here is a simple example integration for `lexora`. For a deeper understanding, checkout our [`reference`](/reference).

```tsx [layout.tsx]
import { getTranslations } from "@ogs-gmbh/lexora/server";
import { LexoraProvider } from "@ogs-gmbh/lexora/client";
import { postgresAdapter } from "@ogs-gmbh/lexora-postgres-adapter";

function RootLayout() {
  const translations = await getTranslations({
    locale: "de",
    autoMigrations: true,
    adapters: [postgresAdapter("postgres://admin:root@127.0.0.1:5432/default")]
  });

  return (
    <html>
      <body>
        <LexoraProvider data={translations}>{children}</LexoraProvider>
      </body>
    </html>
  );
}

export default RootLayout;
```
