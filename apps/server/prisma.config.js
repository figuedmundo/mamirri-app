// Prisma 7 configuration file
// Using CommonJS to ensure it works in all node environments

let url = process.env.DATABASE_URL;

// If URL contains placeholders like ${...}, it means it wasn't expanded by the shell/compose
if (url && url.includes('${')) {
  url = url
    .replace(/\$\{POSTGRES_USER\}/g, process.env.POSTGRES_USER || 'postgres')
    .replace(
      /\$\{POSTGRES_PASSWORD\}/g,
      process.env.POSTGRES_PASSWORD || 'postgres',
    )
    .replace(/\$\{POSTGRES_PORT\}/g, process.env.POSTGRES_PORT || '5432')
    .replace(/\$\{POSTGRES_DB\}/g, process.env.POSTGRES_DB || 'mamirri');
}

module.exports = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: url,
  },
};
