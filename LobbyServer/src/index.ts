import { app, httpServer } from "./app";
import { CONFIG } from "./config/config";
import { sequelize } from "./config/DB.config";
import { RedisScripts } from "./redis/scriptsLoader";
import { initNotifySystem } from "./ws/Services/NotifySustem/NotifySystem";



async function startServer() {
  try {
    await RedisScripts.loadScripts();
    if (!RedisScripts.lobbyDisconnectSha) {
        throw new Error("LUA NOT LOADED");
    }
    await sequelize.authenticate();
    console.log("✅ DB connected");
    await sequelize.sync();

    await initNotifySystem()

    httpServer.listen(CONFIG.server.port, () => {
      console.log(`Server running on port ${CONFIG.server.port}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();