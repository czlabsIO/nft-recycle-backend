require('express-async-errors');
require('winston-mongodb');
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.json(),
    format.metadata()
  ),
  transports: [
    new transports.Console(),
    new transports.MongoDB({
      db: process.env.DB_URL,
      options: {
        useUnifiedTopology: true,
      },
    }),
  ],
});

module.exports = { logger };
