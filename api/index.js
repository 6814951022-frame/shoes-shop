const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

let databaseConnection;

module.exports = async (req, res) => {
  try {
    databaseConnection ||= connectDB().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
    await databaseConnection;
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error);
    return res.status(500).json({ message: "Database connection failed" });
  }
};
