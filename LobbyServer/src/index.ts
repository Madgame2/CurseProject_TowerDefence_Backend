import { app, httpServer } from "./app";
import { CONFIG } from "./config/config";
import { sequelize } from "./config/DB.config";

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");
    await sequelize.sync();


    httpServer.listen(CONFIG.server.port, () => {
      console.log(`Server running on port ${CONFIG.server.port}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();