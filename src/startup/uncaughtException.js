const { logger } = require('../utils/logger');

const catchUnhandledError = () => {
  // catching uncaughtExceptions
  process.on('uncaughtException', (exception) => {
    console.log('we got an Uncaughted Exception');
    logger.error(exception);
  });

  // catching unhandledRejection
  process.on('unhandledRejection', (rejection) => {
    console.log('we got an Unhandled Rejection');
    logger.error(rejection);
  });

  // just incase warning are needed to be logged
  process.on('warning', (warning) => {
    console.log(warning.stack);
  });
};

module.exports = { catchUnhandledError };
