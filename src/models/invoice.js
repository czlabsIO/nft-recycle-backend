const { default: mongoose } = require('mongoose');
const { AWS_BUCKET_NAME, AWS_REGION } = process.env;

const invoiceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    walletAddress: {
      type: String,
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

invoiceSchema.post('find', async function (docs) {
  for (const doc of docs) {
    doc.invoice = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${doc.key}`;
  }
});

invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
