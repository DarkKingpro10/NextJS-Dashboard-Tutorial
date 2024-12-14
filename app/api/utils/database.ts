import { Pool } from 'pg';
import { env } from 'process';

export const connectionPool = new Pool({
  connectionString: env.POSTGRES_URL,
  user: env.POSTGRES_USER,
  host: env.POSTGRES_HOST,
  database: env.POSTGRES_DATABASE,
  password: env.POSTGRES_PASSWORD,
  port: 5432,
});