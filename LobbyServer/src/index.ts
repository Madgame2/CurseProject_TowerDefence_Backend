import app from "./app"
import {CONFIG} from "./config/config"
import { sequelize } from "./config/DB.config";


async function startServer() {
  try {
    // Подключаемся к базе
    await sequelize.authenticate();
    console.log("✅ DB connected");

    // Синхронизация моделей (если нужно)
    await sequelize.sync({ force: true, match: /^(?!.*email).*$/ }); // или sync({ alter: true }) для автообновления схемы

    // Запускаем сервер
    app.listen(CONFIG.server.port, () => {
      console.log(`Server running on port ${CONFIG.server.port}`);
    });
  } catch (err) {

    console.error("❌ Failed to start server:", err);
    process.exit(1); // аварийный выход
  }
}

// Запуск
startServer();