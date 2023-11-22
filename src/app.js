require('./startup/env');
const { catchUnhandledError } = require('./startup/uncaughtException');
const express = require('express');
require('express-async-errors');
const db = require('./startup/db');
const cors = require('cors');
const error = require('./middleware/error.middleware');
const { logger } = require('./utils/logger');
const { connectMoralis } = require('./utils/moralis');
const routes = require('./routes/routes');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', routes);
app.use(error);

async function main() {
  catchUnhandledError();
  await db();
  await connectMoralis();

  const { PORT } = process.env;

  app.listen(PORT, () => {
    logger.info(`Listening on ${PORT}`);
  });
}

main();
