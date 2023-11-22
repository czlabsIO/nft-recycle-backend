const handlebars = require('handlebars');
const { logger } = require('./logger');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { EMAIL_ID, SENDGRID_API_KEY } = process.env;
const MAIL_SETTINGS = {
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: SENDGRID_API_KEY,
  },
};
const transporter = nodemailer.createTransport(MAIL_SETTINGS);

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const day = ('0' + today.getDate()).slice(-2);
  return `${year}/${month}/${day}`;
};

const sendMailWithTemplate = async (params) => {
  try {
    const suPath = path.join(__dirname, '../views/template.html');
    let htmlTemplate = fs.readFileSync(suPath, 'utf8');
    const currentDate = getCurrentDate();
    htmlTemplate = htmlTemplate.replace('{{currentDate}}', currentDate);
    let subject = 'NFT Recycle Invoice';

    let info = await transporter.sendMail({
      from: EMAIL_ID,
      to: params.to,
      subject,
      html: htmlTemplate,
      attachments: [
        {
          filename: 'Invoice.pdf',
          href: params.receipt,
        },
      ],
    });
  } catch (error) {
    logger.error('Error in sending email >> %O', error);
  }
};

module.exports = { sendMailWithTemplate };
