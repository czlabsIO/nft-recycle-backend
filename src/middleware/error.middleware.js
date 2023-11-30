const { isHttpError } = require('http-errors');
const { logger } = require('../utils/logger');
const { isAxiosError } = require('axios');

module.exports = function (err, req, res, next) {
  if (isHttpError(err)) {
    return res.status(err.status).send({ error: err });
  }

  logger.error(err);

  if (isAxiosError(err)) {
    return res.status(500).send({
      message: 'Internal Server Error',
      description: err.response.data,
    });
  }

  return res.status(500).send({
    error: { message: 'Internal Server Error', description: err.message },
  });
};
