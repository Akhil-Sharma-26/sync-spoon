import { Pool, type PoolConfig } from 'pg';

// Create pool configuration
const poolConfig: PoolConfig = {
  connectionString: import.meta.env.POSTGRES_URL,
  ssl: import.meta.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
  // connectionTimeoutMillis: 2000, // how long to wait when connecting to a new client
};

// Create a new pool using the configuration
const pool = new Pool(poolConfig);

// Optional: Error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;