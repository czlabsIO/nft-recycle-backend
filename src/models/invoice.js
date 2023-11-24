const { default: mongoose } = require('mongoose');

const invoiceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    blockchain: {
      type: String,
    },
    fees: {
      type: String,
    },
    feesTxHash: {
      type: String,
    },
    fund: {
      type: String,
    },
    fundTxHash: {
      type: String,
    },
    key: {
      type: String,
    },
    assets: [
      {
        nft: {
          type: String,
        },
        collectionName: {
          type: String,
        },
        txHash: {
          type: String,
        },
        amount: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

invoiceSchema.virtual('user', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
