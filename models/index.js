const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const config = require("../config/config.js");

const environment = process.env.NODE_ENV || "development";
const envConfig = config[environment] || {};
const urlFromEnvVariable = envConfig.use_env_variable
  ? process.env[envConfig.use_env_variable]
  : undefined;
const connectionString = urlFromEnvVariable || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL не задан. Установите переменную окружения DATABASE_URL."
  );
}

const sequelize = new Sequelize(connectionString, {
  dialect: envConfig.dialect || "postgres",
  dialectOptions: envConfig.dialectOptions,
  logging: envConfig.logging,
});

const db = {
  sequelize,
  Sequelize,
  DataTypes,
};

const Category = require("./category")(sequelize, DataTypes);
const Task = require("./task")(sequelize, DataTypes);

Category.hasMany(Task, { foreignKey: "categoryId", onDelete: "SET NULL" });
Task.belongsTo(Category, { foreignKey: "categoryId" });

db.Category = Category;
db.Task = Task;

module.exports = db;
