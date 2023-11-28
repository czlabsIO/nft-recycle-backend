const _ = require('lodash');
const PDFDocument = require('pdfkit');
const { SOLANA_CLUSTER, NODE_ENV } = process.env;

const headerText =
  "Thanks for rolling with NFT Recycle! Dropping below is the deets of your epic transaction. With your summary and the original cost basis of those sold assets, you're set to mint some serious tax optimization. Let's get those gains! #NFTLife";
const footerText =
  "Got any degen pals craving some NFT tax hacks? Hook them up by blasting this tool on Twitter! Hook your buddies up with killer write-offs and score a shot at snagging an epic rug straight from our stash. We're selecting a lucky tweeter every month. Join the fun! #NFTLootDrop #ShareTheWealth #NFTCommunity";

function createInvoice(invoice) {
  let doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.on('pageAdded', () => doc.fillColor('#444444').fontSize(10));

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  // generateFooter(doc);
  doc.x = 50;
  doc.moveDown(3).text(footerText, { align: 'center', width: 500 });

  doc.end();
  return doc;
}

function generateHeader(doc) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Yo,', 50, 70)
    .fontSize(11)
    .font('Helvetica')
    .text(headerText, 50, 100);
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text('Invoice Date:', 50, customerInformationTop)
    .text(formatDate(new Date()), 150, customerInformationTop)
    .text('Blockchain:', 50, customerInformationTop + 15)
    .text(invoice.blockchain, 150, customerInformationTop + 15)
    .text('Number of NFTs:', 50, customerInformationTop + 30)
    .text(invoice.assets.length, 150, customerInformationTop + 30)
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 300;
  const solBaseUrl = 'https://solscan.io/tx/';
  const ethBaseUrl =
    NODE_ENV === 'production'
      ? 'https://etherscan.io/tx/'
      : 'https://sepolia.etherscan.io/tx/';
  const feesTx =
    invoice.blockchain === 'SOLANA'
      ? solBaseUrl + `${invoice.feesTxHash}?cluster=${SOLANA_CLUSTER}`
      : ethBaseUrl + invoice.feesTxHash;
  const fundTx =
    invoice.blockchain === 'SOLANA'
      ? solBaseUrl + `${invoice.fundTxHash}?cluster=${SOLANA_CLUSTER}`
      : ethBaseUrl + invoice.fundTxHash;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Date',
    'Transaction',
    'Type',
    'Amount'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  generateTableRow(
    doc,
    invoiceTableTop + 30,
    formatDate(new Date()),
    'Service Fees',
    'You paid',
    invoice.fees,
    feesTx
  );
  generateTableRow(
    doc,
    invoiceTableTop + 60,
    formatDate(new Date()),
    'Funds Recieved',
    'You received',
    invoice.fund,
    fundTx
  );
  let invoiceItems = invoiceTableTop + 60;

  const firstPage = invoice.assets.slice(0, 14);
  const items = _.chunk(invoice.assets.slice(14), 24);
  for (i = 0; i < firstPage.length; i++) {
    const item = firstPage[i];
    const position = invoiceItems + (i + 1) * 30;
    const tx =
      invoice.blockchain === 'SOLANA'
        ? solBaseUrl + `${item.txHash}?cluster=${SOLANA_CLUSTER}`
        : ethBaseUrl + item.txHash;
    generateTableRow(
      doc,
      position,
      formatDate(new Date()),
      item.nft,
      'You received',
      item.amount,
      tx
    );
  }
  for (let i = 0; i < items.length; i++) {
    doc.addPage();
    invoiceItems = 50;
    for (j = 0; j < items[i].length; j++) {
      const item = items[i][j];
      const position = invoiceItems + (j + 1) * 30;
      const tx =
        invoice.blockchain === 'SOLANA'
          ? solBaseUrl + `${item.txHash}?cluster=${SOLANA_CLUSTER}`
          : ethBaseUrl + item.txHash;
      generateTableRow(
        doc,
        position,
        formatDate(new Date()),
        item.nft,
        'You received',
        item.amount,
        tx
      );
    }
  }
}

function generateFooter(doc) {
  doc.fontSize(10).text('This is a system generated receipt', 50, 780, {
    align: 'center',
    width: 500,
  });
}

function generateTableRow(doc, y, date, nft, type, amount, transaction = null) {
  let obj = { width: 250 };
  if (nft !== 'Transaction') {
    obj = { link: transaction, underline: true, width: 250 };
  }
  doc
    .fontSize(10)
    .text(date, 50, y)
    .text(nft, 130, y, obj)
    .text(type, 400, y, { width: 90 })
    .text(amount, 500, y)
    .moveDown();
}

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + '/' + month + '/' + day;
}

module.exports = {
  createInvoice,
};
