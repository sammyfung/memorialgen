import type { Config } from 'drizzle-kit'

const dialect = (process.env.NUXT_DB_DIALECT || process.env.DB_DIALECT || 'sqlite') as string

const configs: Record<string, Config> = {
  sqlite: {
    schema: './server/db/schema.ts',
    out: './server/db/migrations',
    dialect: 'sqlite',
    dbCredentials: {
      url: process.env.NUXT_DB_URL || process.env.DB_URL || './data/memorial.db',
    },
  } as Config,
  postgres: {
    schema: './server/db/schema.ts',
    out: './server/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.NUXT_DB_URL || process.env.DB_URL || 'postgres://localhost:5432/memorial',
    },
  } as Config,
  mariadb: {
    schema: './server/db/schema.ts',
    out: './server/db/migrations',
    dialect: 'mysql',
    dbCredentials: {
      url: process.env.NUXT_DB_URL || process.env.DB_URL || 'mysql://root:@localhost:3306/memorial',
    },
  } as Config,
}

export default configs[dialect] ?? configs.sqlite
