import pg from 'pg';


const { Pool } = pg;


const pool = new Pool({

  connectionString: import.meta.env.POSTGRES_URL,

})

export default pool