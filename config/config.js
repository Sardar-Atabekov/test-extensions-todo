require("dotenv").config();

const buildDialectOptions = (sslByDefault) => {
  const useSsl = process.env.DB_SSL
    ? process.env.DB_SSL === "true"
    : sslByDefault;
  return useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {};
};

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
    dialectOptions: buildDialectOptions(false),
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
    dialectOptions: buildDialectOptions(true),
  },
  test: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
    dialectOptions: buildDialectOptions(false),
  },
};
