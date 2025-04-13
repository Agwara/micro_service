const dotEnv = require("dotenv");

// Load environment variables from config.env
dotEnv.config({ path: "./config.env" });

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  EXCHANGE_NAME: "ONLINE_SHOPPING",
  SHOPPING_BIND_KEY: "SHOPPING_SERVICE",
  CUSTOMER_BINDING_KEY: "CUSTOMER_SERVICE",
  QUEUE_NAME: "SHOPPING_QUEUE",
};