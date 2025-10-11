const pool = require("./index");
const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  try {
    console.log("🔧 Setting up database tables...");

    const sqlPath = path.join(__dirname, "create_tables.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    await pool.query(sql);

    console.log("✅ Database tables created successfully!");

    console.log("📊 Testing database setup...");

    // Test if tables exist
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('analyses', 'budget_tracking', 'statistics')
      ORDER BY table_name
    `);
    console.log(
      "📋 Created tables:",
      tablesCheck.rows.map((row) => row.table_name)
    );

    // Test statistics function
    const result = await pool.query("SELECT * FROM get_analysis_stats()");
    console.log("📈 Current stats:", result.rows[0]);

    console.log("🧪 Testing insert...");
    const testInsert = await pool.query(
      `
      INSERT INTO analyses (text_content, is_fake, confidence, explanation, recommendations)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
      [
        "This is a test news article about fake news detection.",
        false,
        0.85,
        "Test record - no red flags detected",
        "This appears to be legitimate content with no suspicious elements.",
      ]
    );

    console.log("✅ Test record inserted with ID:", testInsert.rows[0].id);

    await pool.query("DELETE FROM analyses WHERE id = $1", [
      testInsert.rows[0].id,
    ]);
    console.log("🧹 Test record cleaned up");

    console.log("🎉 Database setup complete!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    throw error;
  }
}

if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("Setup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
