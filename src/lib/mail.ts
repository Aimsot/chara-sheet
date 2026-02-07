import nodemailer from 'nodemailer';
console.log('Target Host:', process.env.EMAIL_SERVER_HOST);
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendSecurityEmail(subject: string, body: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.NOTIFICATION_TO,
      subject: subject,
      text: body,
      // 必要に応じて html: '<p>...</p>' も追加可能
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}
