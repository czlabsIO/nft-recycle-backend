const _ = require('lodash');
const path = require('path');
const PDFDocument = require('pdfkit');
const { SOLANA_CLUSTER, NODE_ENV } = process.env;

function createInvoice(invoice) {
  let doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.on('pageAdded', () => doc.fillColor('#444444').fontSize(10));

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  // generateFooter(doc);

  doc.end();
  return doc;
}

function generateHeader(doc) {
  doc
    .image(path.join(__dirname, '../assets/czlogo.png'), 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(20)
    .text('Cz Labs', 110, 57)
    .fontSize(10)
    .text('123 Main Street', 200, 65, { align: 'right' })
    .text('New York, NY, 10025', 200, 80, { align: 'right' })
    .moveDown();
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

  const firstPage = invoice.assets.splice(0, 14);
  const items = _.chunk(invoice.assets, 24);
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
