const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const { DB_URL } = process.env;

module.exports = async function db() {
  mongoose.set('strictQuery', false);
  try {
    await mongoose.connect(DB_URL);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Error while connecting to database');
    logger.error(error);
    process.exit(1);
  }
};
