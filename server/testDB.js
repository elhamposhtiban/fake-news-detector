const pool = require('./db/index'); 

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', res.rows[0]);
    process.exit();
  } catch (err) {
    console.error('❌ Error connecting to DB:', err);
    process.exit(1);
  }
})();
