const nodemailer = require('nodemailer');

/**
 * Send email with attachment
 */
const sendEmailWithAttachment = async ({
  to,
  subject,
  text,
  attachmentPath
}) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, // e.g. reports@company.com
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Unicharm Reports" <${process.env.EMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    text,
    attachments: [
      {
        filename: attachmentPath.split('/').pop(),
        path: attachmentPath
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmailWithAttachment
};
