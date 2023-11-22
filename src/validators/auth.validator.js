const Joi = require('joi');

function validateAuth(body) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(7).required(),
  });
  const result = schema.validate(body);
  return result;
}

function validateWalletLogin(body) {
  const schema = Joi.object({
    blockchain: Joi.string().valid('ETHEREUM', 'SOLANA').required(),
    walletAddress: Joi.string().required(),
    signature: Joi.string().required(),
    isLedger: Joi.boolean().required(),
  });
  const result = schema.validate(body);
  return result;
}

module.exports = {
  validateAuth,
  validateWalletLogin,
};
