
const sql = require("mssql");

async function test() {
  try {
    await sql.connect({
      user: "sa",
      password: "Sfnaf2014",
      server: "127.0.0.1",
      port: 1433,
      database: "TowerDefenceDB",
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    });

    console.log("✅ CONNECTED TO DB");
  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

test();