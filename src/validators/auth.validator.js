const Joi = require('joi');

function validateAuth(body) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(7).required(),
  });
  return schema.validate(body);
}

function validateSocialAuth(body) {
  const schema = Joi.object({
    code: Joi.string().required(),
  });
  return schema.validate(body);
}

function validateWalletLogin(body) {
  const schema = Joi.object({
    blockchain: Joi.string().valid('ETHEREUM', 'SOLANA').required(),
    walletAddress: Joi.string().required(),
    signature: Joi.string().required(),
    isLedger: Joi.boolean().required(),
  });
  return schema.validate(body);
}

module.exports = {
  validateAuth,
  validateSocialAuth,
  validateWalletLogin,
};
