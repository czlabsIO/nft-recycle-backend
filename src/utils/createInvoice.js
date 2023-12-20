const _ = require('lodash');
const PDFDocument = require('pdfkit');
const { SOLANA_CLUSTER, NODE_ENV } = process.env;
const path = require('path');

const headerText =
  "Thanks for using NFT Recycle! Below is a detailed summary of your transaction Your summary (along with your sold assets original cost basis) will help you optimize your taxes:";
const footerText =
  "Have some degen friends that could use some NFT Write-Offs? Do them a solid and share this tool on Twitter! (plus you'll be helping out the three scrappy entrepreneurs that built this!)";

function createInvoice(invoice) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.on('pageAdded', () => doc.fillColor('#444444').fontSize(10));
  doc.lineGap(3);
  generateHeader(doc);
  generateInvoiceTable(doc, invoice);
  doc.x = 50;
  doc.moveDown(3)
  generateMiddle(doc);
  doc.moveDown(1)
  generateImage(doc);
  doc.moveDown(1)
  generateFooter(doc);
  doc.end();
  return doc;
}

function generateHeader(doc) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Hi there,', 50, 70)
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
  const invoiceTableTop = 180;
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
    invoiceTableTop + 50,
    formatDate(new Date()),
    'Funds Received',
    'You received',
    invoice.fund,
    fundTx
  );
  let invoiceItems = invoiceTableTop + 50;

  const firstPage = invoice.assets.slice(0, 26);
  const items = _.chunk(invoice.assets.slice(26), 36);
  for (let i = 0; i < firstPage.length; i++) {
    const item = firstPage[i];
    const position = invoiceItems + (i + 1) * 20;
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
    for (let j = 0; j < items[i].length; j++) {
      const item = items[i][j];
      const position = invoiceItems + (j + 1) * 20;
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

function generateMiddle(doc) {

  doc.fontSize(10)
  .text('Note: All dates are in UTC', {
    align: 'left',
    width: 500,
  })
  .moveDown(4)
  .text(`${footerText}`,{
    align: 'left',
    width: 500,
  })
}

function generateFooter(doc) {

  doc.fontSize(10)
  .text('Have more NFTs to Sell? Sell \'em ', { continued: true })
  .fillColor('blue') 
  .text('here', {
    link: "https://nftrecycle.io",
    underline: true,
    continued: true
  })
  .text('!')
  .fillColor('#444444') 
  .moveDown(5)
  .text(`Keep Doing it for the Write-Off.`, {
    align: 'left',
    width: 500,
  })
  .text(`The NFT Recycle Team`,{
    align: 'left',
    width: 500,
  });
}

function generateImage(doc) {
  const imagePath = path.join(__dirname, '../assets/twitter.png');

  doc
  .image(`${imagePath}`, 250, doc.y,{
    fit: [100, 100],
    align: 'center',
    link: "https://twitter.com/home"
  })
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
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short', 
    day: '2-digit',  
    year: 'numeric', 
    timeZone: 'UTC'
  }).format(date);
  
  return formattedDate;
}

module.exports = {
  createInvoice,
};
