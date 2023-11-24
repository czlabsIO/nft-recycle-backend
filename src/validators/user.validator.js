const Joi = require('joi');

function validateGenerateInvoice(body) {
  const schema = Joi.object({
    blockchain: Joi.string().valid('ETHEREUM', 'SOLANA').required(),
    fees: Joi.string().required(),
    feesTxHash: Joi.string().required(),
    fund: Joi.string().required(),
    fundTxHash: Joi.string().required(),
    assets: Joi.array()
      .required()
      .items(
        Joi.object({
          nft: Joi.string().required(),
          collectionName: Joi.string().required(),
          txHash: Joi.string().required(),
          amount: Joi.string().required(),
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

module.exports = {
  validateGenerateInvoice,
  validateAddEmail,
};
