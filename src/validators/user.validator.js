const Joi = require('joi');

function validateGenerateInvoice(body) {
  const schema = Joi.object({
    txHashes: Joi.array().required().items(Joi.string()),
    blockchain: Joi.string().valid('ETHEREUM', 'SOLANA').required(),
    assets: Joi.array()
      .required()
      .items(
        Joi.object({
          nft: Joi.string().required(),
          collection: Joi.string().required(),
        })
      ),
  });
  const result = schema.validate(body);
  return result;
}

function validateAddEmail(body) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    key: Joi.string().required(),
  });
  const result = schema.validate(body);
  return result;
}

function validateSearchByName(query) {
  const schema = Joi.object({
    blockchain: Joi.string().valid('ETHEREUM', 'SOLANA').required(),
    key: Joi.string().required(),
  });
  const result = schema.validate(query);
  return result;
}

module.exports = {
  validateGenerateInvoice,
  validateAddEmail,
  validateSearchByName,
};
